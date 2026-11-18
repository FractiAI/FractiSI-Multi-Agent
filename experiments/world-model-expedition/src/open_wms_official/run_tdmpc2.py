#!/usr/bin/env python3
"""Run UPSTREAM TD-MPC2 (nicklashansen/tdmpc2) on CPU with an OFFICIAL pretrained checkpoint.

Nothing here is a re-implementation: the agent class, world model, MPPI/MPC planner, DMControl env
wrapper are imported from the upstream clone. Upstream hard-codes `cuda:0`; this script makes a
throwaway copy of upstream's `tdmpc2/` package under /tmp and applies a mechanical CPU patch
(cuda:0 -> cpu, drop `capturable=True`, no torch.compile). No upstream repo file is modified.

Usage (see INSTALL_NOTES.md):
  OMP_NUM_THREADS=2 MUJOCO_GL=disable /tmp/wm_official/venv_tdmpc2/bin/python run_tdmpc2.py
"""
import json, os, re, shutil, subprocess, sys, time
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("MKL_NUM_THREADS", "2")
os.environ["MUJOCO_GL"] = "disable"  # no EGL/OSMesa on this VM; rendering not needed for state obs

import numpy as np
import torch

torch.set_num_threads(2)
torch.set_default_device("cpu")

ROOT = Path("/tmp/wm_official")
UPSTREAM = ROOT / "tdmpc2"
PATCHED = ROOT / "tdmpc2_cpu_patched"
HERE = Path(__file__).resolve()
EXP = HERE.parents[2]
OUT = EXP / "results" / "open_wm_official" / "tdmpc2.json"
HF_REPO = "nicklashansen/tdmpc2"
TASKS = os.environ.get("TDMPC2_TASKS", "cartpole-swingup,walker-walk").split(",")
EPISODES = int(os.environ.get("TDMPC2_EPISODES", "3"))
RANDOM_EPISODES = int(os.environ.get("TDMPC2_RANDOM_EPISODES", "3"))
CKPT_ID = os.environ.get("TDMPC2_CKPT_SEED", "1")


INSTALL_COMMANDS = [
    "python3 -m venv --system-site-packages --without-pip /tmp/wm_official/venv_tdmpc2   # ensurepip missing on this VM",
    "git clone https://github.com/nicklashansen/tdmpc2 /tmp/wm_official/tdmpc2   # HEAD 332f19e4aba4bffe2dc736f45ea7f7bdc585903a",
    "pip --python /tmp/wm_official/venv_tdmpc2/bin/python install torch==2.7.1 --index-url https://download.pytorch.org/whl/cpu",
    "pip --python /tmp/wm_official/venv_tdmpc2/bin/python install tensordict==0.8.3 torchrl==0.8.1 mujoco==3.1.2 dm-control==1.0.16 gymnasium==0.29.1 numpy==1.26.4 hydra-core omegaconf termcolor tqdm pandas imageio h5py huggingface_hub",
    "huggingface-hub: hf_hub_download('nicklashansen/tdmpc2', 'dmcontrol/<task>-1.pt')   # model repo sha 8fb2a82efb3bae96941da440128fe1332e4394fd",
    "OMP_NUM_THREADS=2 MUJOCO_GL=disable /tmp/wm_official/venv_tdmpc2/bin/python src/open_wms_official/run_tdmpc2.py"
]


def sh(cmd, cwd=None):
    return subprocess.check_output(cmd, shell=True, cwd=cwd, text=True).strip()


def make_cpu_patched_copy():
    if PATCHED.exists():
        shutil.rmtree(PATCHED)
    shutil.copytree(UPSTREAM / "tdmpc2", PATCHED)
    for p in PATCHED.rglob("*.py"):
        s = p.read_text()
        s0 = s
        s = s.replace("torch.device('cuda:0')", "torch.device('cpu')")
        s = s.replace("device='cuda:0'", "device='cpu'")
        s = s.replace("'cuda:0'", "'cpu'")
        s = s.replace(", capturable=True", "")
        s = s.replace("torch.compiler.cudagraph_mark_step_begin()", "pass")
        s = s.replace("torch.cuda.manual_seed_all(seed)", "pass")
        if s != s0:
            p.write_text(s)
    diff = subprocess.run(["diff", "-ru", str(UPSTREAM / "tdmpc2"), str(PATCHED)],
                          capture_output=True, text=True).stdout
    (EXP / "src" / "open_wms_official" / "tdmpc2_cpu_patch.diff").write_text(diff)



def convert_legacy_2023_layout(sd):
    """Official HF checkpoints (metadata date 2023-06-03) store MLPs as flat Sequential(Linear,LN,Mish,...);
    upstream HEAD builds them from NormedLinear (Linear+`.ln`). Pure key re-layout, no tensor values changed.
    Q-ensemble keys are converted by upstream's own `api_model_conversion` afterwards."""
    out = {}
    def put(dst_prefix, src_prefix, linear_idx, ln_idx):
        for k in ("weight", "bias"):
            out[f"{dst_prefix}.{k}"] = sd[f"{src_prefix}.{linear_idx}.{k}"] if linear_idx is not None else None
    def flat(dst, src, n_layers, final_ln_key=None):
        # src layers at indices 0,3,6 (Linear) with LN at 1,4,(7)
        for i in range(n_layers):
            li = 3 * i
            for k in ("weight", "bias"):
                out[f"{dst}.{i}.{k}"] = sd[f"{src}.{li}.{k}"]
            ln_key = f"{src}.{li+1}.weight"
            if ln_key in sd and i < n_layers - 1:
                for k in ("weight", "bias"):
                    out[f"{dst}.{i}.ln.{k}"] = sd[f"{src}.{li+1}.{k}"]
    # encoder.state: Linear at 1,4 ; LN at 2,5
    for i, (li, ni) in enumerate([(1, 2), (4, 5)]):
        for k in ("weight", "bias"):
            out[f"_encoder.state.{i}.{k}"] = sd[f"_encoder.state.{li}.{k}"]
            out[f"_encoder.state.{i}.ln.{k}"] = sd[f"_encoder.state.{ni}.{k}"]
    # dynamics: [0]=flat MLP(L,LN,Mish,L,LN,Mish,L), [1]=final LN (then SimNorm)
    flat("_dynamics", "_dynamics.0", 3)
    for k in ("weight", "bias"):
        out[f"_dynamics.2.ln.{k}"] = sd[f"_dynamics.1.{k}"]
    flat("_reward", "_reward", 3)
    flat("_pi", "_pi", 3)
    for k, v in sd.items():
        if k.startswith(("_Qs.", "_target_Qs.")):
            out[k] = v
    return out

def load_cfg(task):
    from omegaconf import OmegaConf
    cfg = OmegaConf.load(PATCHED / "config.yaml")
    cfg.pop("defaults", None)
    cfg.task = task
    cfg.model_size = 5
    cfg.compile = False
    cfg.enable_wandb = False
    cfg.save_video = False
    cfg.checkpoint = "unused"
    cfg.data_dir = "/tmp/wm_official/data"
    cfg.wandb_project = "x"
    cfg.wandb_entity = "x"
    cfg.exp_name = "cpu_eval"
    cfg.seed = 1
    return cfg


def run_task(task, ckpt_path):
    from hydra import initialize_config_dir
    import hydra.utils
    hydra.utils.get_original_cwd = lambda: str(ROOT)  # no @hydra.main context; only used for work_dir
    from common.parser import parse_cfg
    from common.seed import set_seed
    from common import math as tmath
    from envs import make_env
    from tdmpc2 import TDMPC2
    from omegaconf import OmegaConf

    import gymnasium as gym
    if not hasattr(gym.logger, 'set_level'):  # gymnasium 1.x compat shim (upstream pins 0.29.1)
        gym.logger.set_level = lambda *_: None
    cfg = load_cfg(task)
    cfg = OmegaConf.create(OmegaConf.to_container(cfg))
    cfg = parse_cfg(cfg)
    set_seed(cfg.seed)
    env = make_env(cfg)
    cfg.episode_length = env.max_episode_steps if hasattr(env, "max_episode_steps") else 500
    cfg.episode_lengths = [cfg.episode_length]
    agent = TDMPC2(cfg)
    ck = torch.load(ckpt_path, map_location="cpu", weights_only=False)
    agent.load(convert_legacy_2023_layout(ck['model']))
    n_params = sum(p.numel() for p in agent.model.parameters())

    def rollout(policy, collect_transitions=False):
        obs, done, ep_r, t = env.reset(), False, 0.0, 0
        trans, t_plan = [], 0.0
        while not done:
            t0 = time.perf_counter()
            a = policy(obs, t)
            t_plan += time.perf_counter() - t0
            nobs, r, done, info = env.step(a)
            if collect_transitions:
                trans.append((obs.clone(), a.clone(), float(r), nobs.clone()))
            ep_r += float(r)
            obs = nobs
            t += 1
        return ep_r, t, t_plan, trans

    def mpc_policy(obs, t):
        return agent.act(obs, t0=(t == 0), eval_mode=True)

    rng = np.random.default_rng(0)
    def random_policy(obs, t):
        return torch.from_numpy(rng.uniform(-1, 1, size=cfg.action_dim).astype(np.float32))

    # torch.no_grad is applied inside agent.act
    mpc_returns, mpc_trans, plan_s = [], [], []
    for ep in range(EPISODES):
        r, steps, tp, tr = rollout(mpc_policy, collect_transitions=True)
        mpc_returns.append(r); plan_s.append(tp / steps); mpc_trans += tr
        print(f"[{task}] MPC ep{ep}: return={r:.2f} steps={steps} plan_ms/step={1000*tp/steps:.1f}", flush=True)
    rand_returns, rand_trans = [], []
    for ep in range(RANDOM_EPISODES):
        r, steps, _, tr = rollout(random_policy, collect_transitions=True)
        rand_returns.append(r); rand_trans += tr
        print(f"[{task}] random ep{ep}: return={r:.2f}", flush=True)

    # One-step prediction error of the learned world model on real env transitions
    def one_step_error(trans):
        with torch.no_grad():
            O = torch.stack([x[0] for x in trans]); A = torch.stack([x[1] for x in trans])
            R = torch.tensor([x[2] for x in trans]); N = torch.stack([x[3] for x in trans])
            z = agent.model.encode(O, None); zn = agent.model.encode(N, None)
            zp = agent.model.next(z, A, None)
            rp = tmath.two_hot_inv(agent.model.reward(z, A, None), cfg).squeeze(-1)
            lat_mse = float(((zp - zn) ** 2).mean())
            lat_ident = float(((z - zn) ** 2).mean())
            lat_var = float(zn.var(dim=0).mean())
            rew_mse = float(((rp - R) ** 2).mean())
            rew_var = float(R.var())
            rew_mean_base = float(((R.mean() - R) ** 2).mean())
            return dict(n=len(trans), latent_next_mse=lat_mse, latent_identity_mse=lat_ident,
                        latent_target_variance=lat_var, latent_rel_to_identity=lat_mse / max(lat_ident, 1e-12),
                        reward_mse=rew_mse, reward_variance=rew_var, reward_mean_baseline_mse=rew_mean_base)

    return dict(
        task=task, checkpoint=str(ckpt_path), obs_dim=int(cfg.obs_shape["state"][0]), action_dim=int(cfg.action_dim),
        model_params=int(n_params), episode_len=int(cfg.episode_length),
        mpc_returns=mpc_returns, mpc_mean_return=float(np.mean(mpc_returns)), mpc_std_return=float(np.std(mpc_returns)),
        random_returns=rand_returns, random_mean_return=float(np.mean(rand_returns)),
        planner_seconds_per_step=float(np.mean(plan_s)),
        one_step_error_on_mpc_transitions=one_step_error(mpc_trans),
        one_step_error_on_random_transitions=one_step_error(rand_trans),
        planner=dict(mpc=cfg.mpc, iterations=cfg.iterations, num_samples=cfg.num_samples, horizon=cfg.horizon,
                     num_pi_trajs=cfg.num_pi_trajs, num_elites=cfg.num_elites),
    )


def main():
    result = dict(
        model="TD-MPC2 (5M params, official single-task pretrained checkpoint, seed %s)" % CKPT_ID,
        upstream_repo="https://github.com/nicklashansen/tdmpc2",
        commit_or_revision=None, executable=False, blocker=None,
        install_commands=INSTALL_COMMANDS, hardware={}, identity_baseline_mse=0.0310864,
        capabilities=dict(predict=True, simulate=True, share=False, merge=False, multi_agent_shared_world=False),
        notes=[],
    )
    try:
        import hf_xet  # noqa
    except Exception:
        pass
    try:
        result["commit_or_revision"] = dict(
            github=sh("git rev-parse HEAD", cwd=UPSTREAM),
            hf_model_repo=HF_REPO,
            hf_model_sha=__import__("huggingface_hub").HfApi().model_info(HF_REPO).sha,
        )
        result["hardware"] = dict(device="cpu", gpu=False, cores_visible=os.cpu_count(), torch_threads=2,
                                  torch=torch.__version__, python=sys.version.split()[0],
                                  mujoco=__import__("mujoco").__version__,
                                  dm_control=__import__("importlib.metadata").metadata.version("dm_control"))
        make_cpu_patched_copy()
        sys.path.insert(0, str(PATCHED))
        os.chdir(PATCHED)
        from huggingface_hub import hf_hub_download
        per_task = []
        for task in TASKS:
            ck = hf_hub_download(HF_REPO, f"dmcontrol/{task}-{CKPT_ID}.pt", local_dir=str(ROOT / "ckpt"))
            t0 = time.time()
            res = run_task(task, ck)
            res["wall_seconds"] = time.time() - t0
            per_task.append(res)
        result["per_task"] = per_task
        result["executable"] = True
        result["measured"] = {t["task"]: dict(mpc_mean_return=t["mpc_mean_return"], random_mean_return=t["random_mean_return"],
                                              planner_seconds_per_step=t["planner_seconds_per_step"])
                              for t in per_task}
        result["notes"] += [
            "Real upstream TD-MPC2 agent/world-model/MPPI planner executed on CPU; official HF checkpoint; real dm_control (MuJoCo) physics.",
            "Upstream hard-codes cuda:0 and asserts CUDA in evaluate.py; evaluated via own loop on a mechanically CPU-patched COPY (see tdmpc2_cpu_patch.diff). Planner/model math unmodified.",
            "Env stack differs from upstream pins (torch 2.15 / tensordict 0.15 / mujoco 4.0.1 / dm_control 1.0.52 vs upstream torch 2.7.1 / mujoco 3.1.2 / dm-control 1.0.16).",
            "Eval-mode planning (mean of elite distribution), few episodes only (small n; not a benchmark claim).",
            "TD-MPC2 is a single-agent latent world model: predicts+plans in its own latent; no share/merge/multi-agent shared world interface. It does NOT use the shared CartPole-v1 eval set (different obs/action spaces: DMControl continuous), so identity_baseline_mse 0.0310864 is not applicable to its latent errors; latent error is compared against its own identity baseline instead.",
            "Reward one-step error: reward head decoded from two-hot bins; env reward = sum over action-repeat 2.",
        ]
    except Exception as e:
        import traceback
        result["executable"] = False
        result["blocker"] = f"{type(e).__name__}: {e}"
        result["notes"].append(traceback.format_exc())
        print(traceback.format_exc(), file=sys.stderr)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2, default=str))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
