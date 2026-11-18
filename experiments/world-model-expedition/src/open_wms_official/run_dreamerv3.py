#!/usr/bin/env python3
"""Run UPSTREAM DreamerV3 (github.com/danijar/dreamerv3, JAX) on CartPole-v1, CPU only.

Nothing in the upstream checkout is modified. We only:
  * register a gymnasium CartPole-v1 `embodied.Env` (upstream FromGym uses the legacy gym API),
  * subclass `dreamerv3.agent.Agent` to expose one-step *prior* predictions of the next
    observation from the posterior state (the decoder/RSSM that upstream trains),
  * call upstream `dreamerv3.main.main` -> `embodied.run.train` (size1m config) to train.

Evaluation of the trained agent (same process):
  (a) one-step next-observation MSE on cartpole_eval.npz test_* (teacher-forced posterior
      context along each held-out episode, then RSSM prior step with the dataset action,
      decoded by the trained decoder; single stochastic sample, as upstream imagines);
  (b) mean return of the upstream stochastic policy over 10 fresh CartPole-v1 episodes.

Usage (see README_official.md):
  OMP_NUM_THREADS=2 /tmp/wm_official/venv_dreamer/bin/python run_dreamerv3.py --steps 6000
"""
import argparse
import json
import os
import pathlib
import platform
import subprocess
import sys
import time

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("MKL_NUM_THREADS", "2")
os.environ.setdefault(
    "XLA_FLAGS",
    "--xla_cpu_multi_thread_eigen=false intra_op_parallelism_threads=2",
)
os.environ.setdefault("JAX_PLATFORMS", "cpu")

ROOT = pathlib.Path(__file__).resolve().parents[2]
UPSTREAM = pathlib.Path(os.environ.get("DREAMERV3_DIR", "/tmp/wm_official/dreamerv3"))
DATA = ROOT / "data" / "cartpole_eval.npz"
OUT = ROOT / "results" / "open_wm_official" / "dreamerv3.json"
IDENTITY_MSE = 0.0310864

sys.path.insert(0, str(UPSTREAM))
sys.path.insert(1, str(UPSTREAM.parent))

import elements  # noqa: E402
import embodied  # noqa: E402
import gymnasium as gym  # noqa: E402
import jax  # noqa: E402
import jax.numpy as jnp  # noqa: E402
import numpy as np  # noqa: E402
import embodied.jax.nets as nn  # noqa: E402
import dreamerv3.agent as dagent  # noqa: E402
import dreamerv3.main as dmain  # noqa: E402


class CartPole(embodied.Env):
  def __init__(self, seed=0):
    self._env = gym.make("CartPole-v1")
    self._seed = seed
    self._done = True
    self._n = 0

  @property
  def obs_space(self):
    return {
        "vector": elements.Space(np.float32, (4,)),
        "reward": elements.Space(np.float32),
        "is_first": elements.Space(bool),
        "is_last": elements.Space(bool),
        "is_terminal": elements.Space(bool),
    }

  @property
  def act_space(self):
    return {
        "action": elements.Space(np.int32, (), 0, 2),
        "reset": elements.Space(bool),
    }

  def step(self, action):
    if action["reset"] or self._done:
      self._done = False
      o, _ = self._env.reset(seed=self._seed + self._n)
      self._n += 1
      return self._obs(o, 0.0, first=True)
    o, r, term, trunc, _ = self._env.step(int(action["action"]))
    self._done = bool(term or trunc)
    return self._obs(o, r, last=self._done, terminal=bool(term))

  def _obs(self, o, r, first=False, last=False, terminal=False):
    return dict(
        vector=np.asarray(o, np.float32), reward=np.float32(r),
        is_first=first, is_last=last, is_terminal=terminal)

  def close(self):
    self._env.close()


class EvalAgent(dagent.Agent):
  """Upstream agent + extra outputs in mode='eval' (one-step prior predictions)."""

  def policy(self, carry, obs, mode="train"):
    if mode != "eval":
      return super().policy(carry, obs, mode)
    (enc_carry, dyn_carry, dec_carry, prevact) = carry
    kw = dict(training=False, single=True)
    reset = obs["is_first"]
    enc_carry, _, tokens = self.enc(enc_carry, obs, reset, **kw)
    dyn_carry, _, feat = self.dyn.observe(dyn_carry, tokens, prevact, reset, **kw)
    _, _, recons = self.dec(dec_carry, feat, reset, **kw)
    out = {"recon_vector": nn.symexp(recons["vector"].pred())}
    policy = self.pol(self.feat2tensor(feat), bdims=1)
    act = dagent.sample(policy)
    B = reset.shape[0]
    for a in (0, 1):
      action = {"action": jnp.full((B,), a, jnp.int32)}
      _, (nfeat, _) = self.dyn.imagine(dyn_carry, action, 1, False, single=True)
      _, _, nrec = self.dec(dec_carry, nfeat, jnp.zeros_like(reset), **kw)
      out[f"next_a{a}"] = nn.symexp(nrec["vector"].pred())
    carry = (enc_carry, dyn_carry, dec_carry, act)
    return carry, act, out


def run_git(args, cwd):
  return subprocess.check_output(["git", *args], cwd=cwd, text=True).strip()


def split_episodes(obs, nxt, done):
  starts = [0]
  for i in range(1, len(obs)):
    if done[i - 1] > 0.5 or np.abs(obs[i] - nxt[i - 1]).max() > 1e-6:
      starts.append(i)
  starts.append(len(obs))
  return [(starts[i], starts[i + 1]) for i in range(len(starts) - 1)]


def score_one_step(agent, obs, act, nxt, rew, done):
  """Teacher-forced posterior context -> prior step with dataset action -> decode."""
  eps = split_episodes(obs, nxt, done)
  pred = np.zeros_like(nxt)
  recon = np.zeros_like(obs)
  for (s, e) in eps:
    carry = agent.init_policy(1)
    for i in range(s, e):
      o = {
          "vector": obs[i][None].astype(np.float32),
          "reward": np.zeros(1, np.float32),
          "is_first": np.array([i == s]),
          "is_last": np.array([False]),
          "is_terminal": np.array([False]),
      }
      carry, _, outs = agent.policy(carry, o, mode="eval")
      a = int(act[i])
      pred[i] = np.asarray(outs[f"next_a{a}"])[0]
      recon[i] = np.asarray(outs["recon_vector"])[0]
      ref = carry[3]["action"][0]
      forced = jax.device_put(np.asarray(a, np.int32), ref.sharding)
      carry = (carry[0], carry[1], carry[2], {"action": [forced]})
  mse = float(np.mean((pred - nxt) ** 2))
  return {
      "next_obs_mse": mse,
      "per_dim_mse": np.mean((pred - nxt) ** 2, 0).tolist(),
      "posterior_recon_mse": float(np.mean((recon - obs) ** 2)),
      "n_transitions": int(len(obs)),
      "n_episodes": len(eps),
  }


def eval_policy(agent, episodes=10, seed=1000, max_steps=500):
  env = CartPole(seed=seed)
  rets = []
  for _ in range(episodes):
    carry = agent.init_policy(1)
    act = {"action": np.zeros((), np.int32), "reset": np.array(True)}
    ret, t = 0.0, 0
    while True:
      o = env.step(act)
      if o["is_first"] is False:
        ret += float(o["reward"])
      batch = {k: np.asarray(v)[None] for k, v in o.items()}
      carry, a, _ = agent.policy(carry, batch, mode="eval")
      act = {"action": np.asarray(a["action"])[0], "reset": np.array(False)}
      t += 1
      if o["is_last"] or t >= max_steps:
        break
    rets.append(ret)
  env.close()
  return rets


def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--steps", type=int, default=6000)
  ap.add_argument("--train_ratio", type=float, default=256)
  ap.add_argument("--logdir", default="/tmp/wm_official/dreamer_logdir")
  ap.add_argument("--seed", type=int, default=0)
  ap.add_argument("--batch_size", type=int, default=16)
  ap.add_argument("--batch_length", type=int, default=64)
  args = ap.parse_args()

  dmain.make_env = lambda config, index, **kw: dmain.wrap_env(
      CartPole(seed=1 + 100 * index), config)
  dagent.Agent = EvalAgent

  captured = {}
  orig_make_agent = dmain.make_agent

  def make_agent(config):
    agent = orig_make_agent(config)
    captured["agent"] = agent
    return agent

  dmain.make_agent = make_agent

  logdir = pathlib.Path(args.logdir)
  if logdir.exists():
    import shutil
    shutil.rmtree(logdir)
  argv = [
      "--configs", "size1m",
      "--task", "gym_CartPole-v1",
      "--logdir", str(logdir),
      "--seed", str(args.seed),
      "--batch_size", str(args.batch_size),
      "--batch_length", str(args.batch_length),
      "--jax.platform", "cpu",
      "--jax.compute_dtype", "float32",
      "--jax.prealloc", "False",
      "--run.envs", "1",
      "--run.steps", str(args.steps),
      "--run.train_ratio", str(args.train_ratio),
      "--run.log_every", "20",
      "--run.report_every", "100000",
      "--run.save_every", "100000",
      "--run.usage.nvsmi", "False",
      "--replay.size", "1e5",
      "--logger.outputs", "jsonl",
      "--agent.report", "False",
  ]
  t0 = time.time()
  dmain.main(argv)
  train_seconds = time.time() - t0
  agent = captured["agent"]
  print(f"TRAIN DONE in {train_seconds:.1f}s", flush=True)

  d = np.load(DATA)
  te = score_one_step(agent, d["test_obs"], d["test_act"], d["test_next"],
                      d["test_rew"], d["test_done"])
  tr = score_one_step(agent, d["train_obs"], d["train_act"], d["train_next"],
                      d["train_rew"], d["train_done"])
  print("one-step test:", te, flush=True)
  rets = eval_policy(agent, 10)
  print("returns:", rets, flush=True)

  scores = []
  sp = logdir / "scores.jsonl"
  if sp.exists():
    scores = [json.loads(l)["episode/score"] for l in sp.read_text().splitlines() if l.strip()]
  commit = run_git(["rev-parse", "HEAD"], UPSTREAM)

  res = {
      "model": "DreamerV3 (upstream JAX, size1m config)",
      "upstream_repo": "https://github.com/danijar/dreamerv3",
      "commit": commit,
      "install_commands": [
          "git clone https://github.com/danijar/dreamerv3 /tmp/wm_official/dreamerv3",
          "python3 -m virtualenv /tmp/wm_official/venv_dreamer  # python3-venv/ensurepip unavailable on VM",
          "/tmp/wm_official/venv_dreamer/bin/pip install 'jax[cpu]==0.4.33' 'numpy<2' chex einops 'elements>=3.19.1' 'granular>=0.20.3' jaxtyping ninjax optax 'portal>=3.5.0' 'scope>=0.4.4' tqdm colored_traceback gymnasium 'google-resumable-media>=2.7.2' ruamel.yaml",
          "OMP_NUM_THREADS=2 /tmp/wm_official/venv_dreamer/bin/python src/open_wms_official/run_dreamerv3.py --steps %d --train_ratio %g" % (args.steps, args.train_ratio),
      ],
      "executable": True,
      "blocker": None,
      "hardware": {
          "cpu_only": True, "cores_available": os.cpu_count(),
          "threads_limited_to": 2, "jax_devices": [str(x) for x in jax.devices()],
          "jax": jax.__version__, "platform": platform.platform(),
      },
      "train_steps": int(args.steps),
      "train_seconds": round(train_seconds, 1),
      "train_config": {
          "configs": "size1m", "train_ratio": args.train_ratio,
          "batch_size": args.batch_size, "batch_length": args.batch_length,
          "compute_dtype": "float32", "online_envs": 1, "seed": args.seed,
          "gradient_updates_approx": int(args.steps * args.train_ratio / (args.batch_size * args.batch_length)),
      },
      "predict_next_obs_mse": te["next_obs_mse"],
      "predict_next_obs_mse_method": (
          "teacher-forced posterior context along each held-out test episode, then one RSSM prior "
          "step with the dataset action, decoded by the trained decoder (upstream imagine+decode, "
          "single stochastic sample). Trained ONLINE in CartPole; test_* never used for training."),
      "predict_next_obs_per_dim_mse": te["per_dim_mse"],
      "posterior_recon_mse_test": te["posterior_recon_mse"],
      "train_split_next_obs_mse": tr["next_obs_mse"],
      "test_transitions": te["n_transitions"],
      "test_episodes": te["n_episodes"],
      "identity_baseline_mse": IDENTITY_MSE,
      "beats_identity_baseline": bool(te["next_obs_mse"] < IDENTITY_MSE),
      "policy_mean_return": float(np.mean(rets)),
      "policy_std_return": float(np.std(rets)),
      "policy_returns": rets,
      "policy_episodes": len(rets),
      "policy_note": "upstream stochastic policy (sampled), CartPole-v1 seeds 1000-1009, cap 500 steps",
      "online_training_episode_scores_first10": scores[:10],
      "online_training_episode_scores_last10": scores[-10:],
      "online_training_episodes": len(scores),
      "capabilities": {
          "predict": True,
          "simulate": True,
          "share": False,
          "merge": False,
          "multi_agent_shared_world": False,
      },
      "notes": (
          "Actual upstream code executed (embodied.run.train + dreamerv3.agent.Agent subclass for "
          "eval hooks only; upstream tree unmodified). Short training (a few thousand env steps) so "
          "numbers reflect an under-trained smallest-size model. Capabilities: predict/simulate "
          "(latent imagination) are native; DreamerV3 has no model sharing/merging or multi-agent "
          "shared world protocol (single-agent, per-run checkpoint)."),
  }
  OUT.parent.mkdir(parents=True, exist_ok=True)
  OUT.write_text(json.dumps(res, indent=2))
  print("WROTE", OUT)


if __name__ == "__main__":
  main()
