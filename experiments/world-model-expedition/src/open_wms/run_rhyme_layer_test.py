"""
Same world model, two deployments.

Non-rhyming: four private copies of the world model, each agent sees one CartPole
dimension and the collective votes by summing per-agent predicted costs.
Rhyming shared world: agents write their dimension into one shared world and a single
model reads the merged state.

Each world model drives its own controller: exhaustive short-horizon rollouts through
its learned next-observation predictor, scored by pole angle and angular velocity.
No hand-written balancing rule is used for any model arm.
"""
from __future__ import annotations

import importlib.util
import itertools
import json
import time
from pathlib import Path

import gymnasium as gym
import numpy as np
import torch

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
spec = importlib.util.spec_from_file_location("lab", HERE / "run_open_wm_lab.py")
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)

torch.set_num_threads(2)
OUT = ROOT / "results" / "open_wm"
EPISODES = 20
HORIZON = 4
N_AGENTS = 4


def load_transitions():
    d = np.load(ROOT / "data" / "cartpole_eval.npz")
    tr = [
        {"obs": d["train_obs"][i], "act": int(d["train_act"][i]), "reward": float(d["train_rew"][i]),
         "next_obs": d["train_next"][i], "done": bool(d["train_done"][i])}
        for i in range(len(d["train_obs"]))
    ]
    te = [
        {"obs": d["test_obs"][i], "act": int(d["test_act"][i]), "next_obs": d["test_next"][i]}
        for i in range(len(d["test_obs"]))
    ]
    return tr, te


def cost(state):
    return float(state[2] ** 2 + 0.1 * state[3] ** 2 + 0.01 * state[0] ** 2)


SEQS = list(itertools.product((0, 1), repeat=HORIZON))


def mpc_costs(predict, state):
    """Cost of the best H-step rollout starting with each first action."""
    best = {0: float("inf"), 1: float("inf")}
    for seq in SEQS:
        s = state.astype(np.float32)
        total = 0.0
        for a in seq:
            s = predict(s, a)
            total += cost(s)
        best[seq[0]] = min(best[seq[0]], total)
    return best


def run_episode(policy, seed, log=None):
    env = gym.make("CartPole-v1")
    obs, _ = env.reset(seed=seed)
    ret, steps, done, trunc = 0.0, 0, False, False
    while not (done or trunc) and steps < 200:
        a = policy(obs, steps, log)
        obs, r, done, trunc, _ = env.step(a)
        ret += r
        steps += 1
    env.close()
    return ret


def make_policies(predict):
    def shared(obs, t, log):
        if log is not None:
            for i in range(N_AGENTS):
                log.append({"t": t, "agent": i, "dim": ["cart_position", "cart_velocity", "pole_angle", "pole_angular_velocity"][i], "value": round(float(obs[i]), 4)})
        c = mpc_costs(predict, obs)
        return 0 if c[0] <= c[1] else 1

    def private(obs, t, log):
        total = {0: 0.0, 1: 0.0}
        for i in range(N_AGENTS):
            seen = np.zeros(4, dtype=np.float32)
            seen[i] = obs[i]
            c = mpc_costs(predict, seen)
            total[0] += c[0]
            total[1] += c[1]
        return 0 if total[0] <= total[1] else 1

    return shared, private


def partial_mse(predict, te, n=400):
    shared_errs, private_errs = [], []
    for tr in te[:n]:
        full = predict(tr["obs"], tr["act"])
        shared_errs.append(float(np.mean((full - tr["next_obs"]) ** 2)))
        per_dim = []
        for i in range(N_AGENTS):
            seen = np.zeros(4, dtype=np.float32)
            seen[i] = tr["obs"][i]
            own = predict(seen, tr["act"])
            per_dim.append((own[i] - tr["next_obs"][i]) ** 2)
        private_errs.append(float(np.mean(per_dim)))
    return {"shared_world_mse": float(np.mean(shared_errs)), "private_worlds_mse": float(np.mean(private_errs)), "n": n}


def main():
    lab.set_seed()
    tr, te = load_transitions()
    t0 = time.perf_counter()
    rssm, _ = lab.train_rssm(tr, steps=800)
    tdmpc, _ = lab.train_tdmpc(tr, steps=600)
    dec = lab.attach_tdmpc_decoder(tdmpc, tr, steps=400)
    muzero, _ = lab.train_muzero(tr, steps=800)
    train_s = time.perf_counter() - t0

    arms = {
        "dreamer_family_rssm": lambda o, a: lab.rssm_predict(rssm, o, a),
        "tdmpc_lite": lambda o, a: lab.tdmpc_predict_obs(tdmpc, dec, o, a),
        "muzero_lite": lambda o, a: lab.muzero_predict(muzero, o, a),
    }
    seeds = [90000 + i for i in range(EPISODES)]
    rng = np.random.default_rng(0)
    rand = [run_episode(lambda o, t, l: int(rng.integers(0, 2)), s) for s in seeds]
    result = {
        "documentId": "RHYME-LAYER-WM-TEST-2026-11-18",
        "design": "same world model, private copies vs rhyming shared world",
        "episodes": EPISODES, "horizon": HORIZON, "agents": N_AGENTS, "train_seconds": train_s,
        "random_baseline": {"mean_return": float(np.mean(rand)), "std_return": float(np.std(rand))},
        "models": {},
    }
    traffic = []
    for name, predict in arms.items():
        shared, private = make_policies(predict)
        log = []
        t1 = time.perf_counter()
        sh = []
        for k, s in enumerate(seeds):
            sh.append(run_episode(shared, s, log if k < 4 else None))
        pr = [run_episode(private, s) for s in seeds]
        result["models"][name] = {
            "non_rhyming_private_worlds": {"mean_return": float(np.mean(pr)), "std_return": float(np.std(pr))},
            "rhyming_shared_world": {"mean_return": float(np.mean(sh)), "std_return": float(np.std(sh))},
            "next_state_mse_under_partial_observation": partial_mse(predict, te),
            "seconds": time.perf_counter() - t1,
        }
        if not traffic:
            traffic = log
        print(name, json.dumps(result["models"][name]), flush=True)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "rhyme_layer_wm_test.json").write_text(json.dumps(result, indent=2))
    (OUT / "rhyme_layer_traffic.json").write_text(json.dumps(traffic[:400]))
    print("done")


if __name__ == "__main__":
    main()
