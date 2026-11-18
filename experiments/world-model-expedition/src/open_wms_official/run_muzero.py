#!/usr/bin/env python3
"""Run UPSTREAM MuZero (github.com/werner-duvaud/muzero-general, PyTorch + Ray) on CartPole-v1, CPU only.

The upstream checkout is not modified. We only override config fields (public `config.update`)
and call upstream `MuZero("cartpole").train()` (which includes its own greedy-MCTS seeded
evaluation, `evaluate()`), then inspect the trained network's `initial_inference` /
`recurrent_inference` on cartpole_eval.npz.

MuZero does NOT predict observations: its dynamics function maps (latent, action) -> (latent', reward)
and the prediction function maps latent -> (policy, value). So `predict_next_obs_mse` is null.
What we report instead:
  * reward MSE of dynamics reward head vs dataset reward,
  * value MSE of initial_inference vs discounted Monte-Carlo return-to-go inside each test episode
    (off-policy: data are random-policy episodes, value head models the MuZero policy),
  * latent value-consistency MSE: v(dynamics(h(o_t), a_t)) vs v(h(o_{t+1})) on real next obs,
  * clearly-labelled DIAGNOSTIC ridge probes (not part of MuZero): latent -> next obs.

Usage: OMP_NUM_THREADS=1 /tmp/wm_official/venv_muzero/bin/python run_muzero.py
"""
import argparse
import json
import os
import pathlib
import platform
import subprocess
import sys
import time

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

ROOT = pathlib.Path(__file__).resolve().parents[2]
UPSTREAM = pathlib.Path(os.environ.get("MUZERO_DIR", "/tmp/wm_official/muzero-general"))
DATA = ROOT / "data" / "cartpole_eval.npz"
OUT = ROOT / "results" / "open_wm_official" / "muzero.json"
IDENTITY_MSE = 0.0310864

sys.path.insert(0, str(UPSTREAM))
os.chdir(UPSTREAM)

import numpy as np  # noqa: E402
import ray  # noqa: E402
import torch  # noqa: E402

torch.set_num_threads(1)

import models  # noqa: E402
import muzero as muzero_mod  # noqa: E402


def git(args):
  return subprocess.check_output(["git", *args], cwd=UPSTREAM, text=True).strip()


def episode_starts(obs, nxt, done):
  starts = [0]
  for i in range(1, len(obs)):
    if done[i - 1] > 0.5 or np.abs(obs[i] - nxt[i - 1]).max() > 1e-6:
      starts.append(i)
  starts.append(len(obs))
  return [(starts[i], starts[i + 1]) for i in range(len(starts) - 1)]


def mc_returns(rew, eps, discount):
  g = np.zeros(len(rew), np.float32)
  for s, e in eps:
    run = 0.0
    for i in range(e - 1, s - 1, -1):
      run = rew[i] + discount * run
      g[i] = run
  return g


def ridge_fit(X, Y, lam=1e-3):
  Xb = np.concatenate([X, np.ones((len(X), 1))], 1)
  A = Xb.T @ Xb + lam * np.eye(Xb.shape[1])
  return np.linalg.solve(A, Xb.T @ Y)


def ridge_pred(W, X):
  return np.concatenate([X, np.ones((len(X), 1))], 1) @ W


@torch.no_grad()
def net_features(net, cfg, obs, nxt, act):
  sc = cfg.observation_scale
  o = torch.tensor(obs, dtype=torch.float32).reshape(-1, 1, 1, 4) / sc
  n = torch.tensor(nxt, dtype=torch.float32).reshape(-1, 1, 1, 4) / sc
  a = torch.tensor(act, dtype=torch.long).reshape(-1, 1)
  v0, _, _, h0 = net.initial_inference(o)
  v1d, r1, _, h1 = net.recurrent_inference(h0, a)
  v1r, _, _, hn = net.initial_inference(n)
  S = cfg.support_size
  dec = lambda x: models.support_to_scalar(x, S).squeeze(1).numpy()
  return dict(v0=dec(v0), r1=dec(r1), v1_dyn=dec(v1d), v1_real=dec(v1r),
              h0=h0.numpy(), h1=h1.numpy(), hn=hn.numpy())


def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--training_steps", type=int, default=3000)
  ap.add_argument("--num_simulations", type=int, default=25)
  ap.add_argument("--bootstrap_episodes", type=int, default=300)
  ap.add_argument("--bootstrap_steps", type=int, default=300)
  ap.add_argument("--eval_episodes", type=int, default=10)
  ap.add_argument("--results", default="/tmp/wm_official/muzero_results/run")
  args = ap.parse_args()

  ray.init(num_cpus=2, include_dashboard=False, ignore_reinit_error=True,
           runtime_env={"env_vars": {k: "1" for k in ("OMP_NUM_THREADS", "MKL_NUM_THREADS", "OPENBLAS_NUM_THREADS")}})

  overrides = dict(
      num_workers=1, num_threads=1, num_simulations=args.num_simulations,
      training_steps=args.training_steps,
      random_bootstrap_episodes=args.bootstrap_episodes,
      random_bootstrap_training_steps=args.bootstrap_steps,
      validation_interval=0, checkpoint_selection="last",
      evaluation_episodes=args.eval_episodes, save_model=False,
      results_path=args.results, selfplay_on_gpu=False, train_on_gpu=False,
      reanalyse_on_gpu=False, max_num_gpus=0,
  )
  mz = muzero_mod.MuZero("cartpole", overrides)
  cfg = mz.config
  t0 = time.time()
  report = mz.train(log_in_tensorboard=True)
  train_seconds = time.time() - t0
  ck = mz.checkpoint
  steps_done = int(ck.get("training_steps_completed", ck["training_step"]))
  played_steps = int(ck["num_played_steps"])
  played_games = int(ck["num_played_games"])
  print(f"TRAIN DONE {train_seconds:.1f}s grad_steps={steps_done} env_steps={played_steps} games={played_games}", flush=True)
  print("EVAL REPORT keys:", list(report) if report else None, flush=True)

  net = models.MuZeroNetwork(cfg)
  net.set_weights(ck["weights"])
  net.eval()

  d = np.load(DATA)
  te = {k: d["test_" + k] for k in ("obs", "act", "next", "rew", "done")}
  tr = {k: d["train_" + k] for k in ("obs", "act", "next", "rew", "done")}
  fte = net_features(net, cfg, te["obs"], te["next"], te["act"])
  ftr = net_features(net, cfg, tr["obs"], tr["next"], tr["act"])
  eps = episode_starts(te["obs"], te["next"], te["done"])
  G = mc_returns(te["rew"], eps, cfg.discount)

  mse = lambda a, b: float(np.mean((a - b) ** 2))
  reward_mse = mse(fte["r1"], te["rew"])
  value_mse = mse(fte["v0"], G)
  value_baseline = mse(np.full_like(G, G.mean()), G)
  consistency = mse(fte["v1_dyn"], fte["v1_real"])

  W = ridge_fit(ftr["h1"], tr["next"])
  probe_dyn = mse(ridge_pred(W, fte["h1"]), te["next"])
  Wn = ridge_fit(ftr["hn"], tr["next"])
  probe_repr = mse(ridge_pred(Wn, fte["hn"]), te["next"])

  rets = [e["reward"] for e in report["episodes"]] if report and "episodes" in report else None
  mean_ret = float(report["mean_reward"]) if report else None

  res = {
      "model": "MuZero (upstream muzero-general, cartpole config, fullyconnected net, MCTS)",
      "upstream_repo": "https://github.com/werner-duvaud/muzero-general",
      "commit": git(["rev-parse", "HEAD"]),
      "install_commands": [
          "git clone https://github.com/werner-duvaud/muzero-general /tmp/wm_official/muzero-general",
          "python3 -m virtualenv /tmp/wm_official/venv_muzero  # python3-venv/ensurepip unavailable on VM",
          "/tmp/wm_official/venv_muzero/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu",
          "/tmp/wm_official/venv_muzero/bin/pip install ray nevergrad tensorboard seaborn graphviz 'gymnasium[classic-control]' numpy matplotlib",
          "OMP_NUM_THREADS=1 /tmp/wm_official/venv_muzero/bin/python src/open_wms_official/run_muzero.py --training_steps %d --num_simulations %d" % (args.training_steps, args.num_simulations),
      ],
      "executable": True,
      "blocker": None,
      "hardware": {
          "cpu_only": True, "cores_available": os.cpu_count(),
          "threads_limited_to": 2, "ray_num_cpus": 2, "torch": torch.__version__,
          "ray": ray.__version__, "platform": platform.platform(),
      },
      "train_steps": steps_done,
      "train_steps_unit": "gradient updates (includes %d random-data warmup updates)" % args.bootstrap_steps,
      "env_steps_collected": played_steps,
      "games_collected": played_games,
      "train_seconds": round(train_seconds, 1),
      "config_overrides": {k: (str(v) if k == "results_path" else v) for k, v in overrides.items()},
      "predict_next_obs_mse": None,
      "predict_next_obs_mse_null_reason": (
          "MuZero is a value-equivalent model: dynamics(latent, action) -> (latent', reward); the "
          "prediction function gives (policy, value). It has no observation decoder, so next-observation "
          "MSE is not defined for the upstream model."),
      "identity_baseline_mse": IDENTITY_MSE,
      "what_it_predicts": {
          "reward_mse_dynamics_head_vs_dataset_reward_test": reward_mse,
          "reward_note": "CartPole reward is constant 1.0 so this is a trivially-learnable target",
          "value_mse_vs_discounted_mc_return_test": value_mse,
          "value_mse_mean_return_baseline_test": value_baseline,
          "value_note": "off-policy: dataset is random-policy episodes; value head estimates MuZero-policy return",
          "value_mean_pred": float(fte["v0"].mean()),
          "value_mean_target": float(G.mean()),
          "latent_value_consistency_mse_test": consistency,
          "latent_value_consistency_note": "v(dynamics(h(o_t),a_t)) vs v(h(o_{t+1})) with real o_{t+1}",
          "discount": cfg.discount,
      },
      "diagnostic_probes_not_part_of_muzero": {
          "ridge_probe_dynamics_latent_to_next_obs_mse_test": probe_dyn,
          "ridge_probe_repr_latent_of_real_next_obs_to_next_obs_mse_test": probe_repr,
          "note": ("Linear ridge regression fit on train_* latents -> next obs, scored on test_*. This is an "
                   "external probe of how much observation info the latent keeps; it is NOT a MuZero "
                   "prediction and not comparable to a decoder-based world model's native MSE."),
      },
      "policy_mean_return": mean_ret,
      "policy_returns": rets,
      "policy_episodes": int(report["episode_count"]) if report and "episode_count" in report else (len(rets) if rets else None),
      "policy_note": "upstream evaluate(): greedy MCTS (%d simulations), no root noise, seeds %d.., cap %d moves" % (cfg.num_simulations, cfg.evaluation_seed, cfg.max_moves),
      "upstream_evaluation_report": report,
      "capabilities": {
          "predict": True,
          "simulate": True,
          "share": False,
          "merge": False,
          "multi_agent_shared_world": False,
      },
      "notes": (
          "Actual upstream training (Ray actors: trainer, replay buffer, self-play) executed on CPU. "
          "predict = reward/value/policy in latent space only (no observation prediction); simulate = "
          "latent rollouts for MCTS planning. No model sharing/merging or multi-agent shared-world "
          "mechanism in upstream. Short training so results reflect an under-trained model."),
  }
  OUT.parent.mkdir(parents=True, exist_ok=True)
  OUT.write_text(json.dumps(res, indent=2, default=str))
  print("WROTE", OUT, flush=True)
  mz.terminate_workers() if mz.shared_storage_worker else None
  ray.shutdown()


if __name__ == "__main__":
  main()
