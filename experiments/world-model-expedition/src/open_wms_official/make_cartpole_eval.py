"""Shared CartPole-v1 transition set so every open world model is scored on identical data."""
import json, sys
from pathlib import Path
import gymnasium as gym
import numpy as np

OUT = Path(__file__).resolve().parents[2] / "data" / "cartpole_eval.npz"

def collect(episodes, seed, max_steps=200):
    env = gym.make("CartPole-v1")
    rng = np.random.default_rng(seed)
    O, A, N, R, D = [], [], [], [], []
    for ep in range(episodes):
        o, _ = env.reset(seed=int(seed * 1000 + ep))
        for _ in range(max_steps):
            a = int(rng.integers(0, 2))
            n, r, term, trunc, _ = env.step(a)
            O.append(o); A.append(a); N.append(n); R.append(r); D.append(term)
            o = n
            if term or trunc:
                break
    return [np.array(x, dtype=np.float32) for x in (O, A, N, R, D)]

if __name__ == "__main__":
    tr = collect(120, 1)
    te = collect(40, 2)
    np.savez(OUT, train_obs=tr[0], train_act=tr[1], train_next=tr[2], train_rew=tr[3], train_done=tr[4],
             test_obs=te[0], test_act=te[1], test_next=te[2], test_rew=te[3], test_done=te[4])
    ident = float(np.mean((te[0] - te[2]) ** 2))
    print(json.dumps({"out": str(OUT), "train": int(len(tr[0])), "test": int(len(te[0])), "identity_mse": ident}))
