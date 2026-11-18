# Official upstream world models, executed on CPU

Real upstream code, CPU-only Linux VM (4 cores shared, no GPU), threads limited to 2.
Upstream checkouts and venvs live under `/tmp/wm_official/` (nothing is installed into this repo).
`python3-venv`/ensurepip is not available on the VM, so venvs are made with
`pip install --target /tmp/vtool virtualenv && PYTHONPATH=/tmp/vtool python3 -m virtualenv <dir>`.

## Pinned upstream commits

| Model | Repo | Commit |
|---|---|---|
| DreamerV3 (JAX) | https://github.com/danijar/dreamerv3 | `e01491fad6434b2245a3b8ca201dd7faedcc458c` |
| MuZero | https://github.com/werner-duvaud/muzero-general | `8c65818f917fa6b601c013e0ca65e19c472f8c35` |

(Fetched with `git clone --depth 1`; the commits above are the HEAD at fetch time, 2026-11-18.)

## DreamerV3

```bash
git clone --depth 1 https://github.com/danijar/dreamerv3 /tmp/wm_official/dreamerv3
PYTHONPATH=/tmp/vtool python3 -m virtualenv /tmp/wm_official/venv_dreamer
/tmp/wm_official/venv_dreamer/bin/pip install 'jax[cpu]==0.4.33' 'numpy<2' chex einops 'elements>=3.19.1' \
  'granular>=0.20.3' jaxtyping ninjax optax 'portal>=3.5.0' 'scope>=0.4.4' tqdm colored_traceback \
  gymnasium 'google-resumable-media>=2.7.2' ruamel.yaml
OMP_NUM_THREADS=2 /tmp/wm_official/venv_dreamer/bin/python src/open_wms_official/run_dreamerv3.py \
  --steps 5000 --train_ratio 256
```

`requirements.txt` upstream pins `jax[cuda12]==0.4.33`; the CPU wheel of the same JAX version is used.
`run_dreamerv3.py` calls upstream `dreamerv3.main.main` (`--configs size1m`, float32, CPU) and
upstream `embodied.run.train`. Two small shims, upstream tree untouched:
a gymnasium CartPole-v1 `embodied.Env` (upstream `FromGym` uses the legacy `gym` API) and an `Agent`
subclass whose `policy(mode="eval")` additionally returns one RSSM prior step decoded by the trained
decoder, so next-observation prediction can be measured.

Evaluation: (a) teacher-forced posterior context along each held-out test episode, one prior step with
the dataset action, decoded next obs vs `test_next` (single stochastic sample); trained online in
CartPole, `test_*` never used for training. (b) upstream stochastic policy, 10 fresh CartPole-v1 episodes.

## MuZero

```bash
git clone --depth 1 https://github.com/werner-duvaud/muzero-general /tmp/wm_official/muzero-general
PYTHONPATH=/tmp/vtool python3 -m virtualenv /tmp/wm_official/venv_muzero
/tmp/wm_official/venv_muzero/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
/tmp/wm_official/venv_muzero/bin/pip install ray nevergrad tensorboard seaborn graphviz 'gymnasium[classic-control]' numpy matplotlib
/tmp/wm_official/venv_muzero/bin/python src/open_wms_official/run_muzero.py \
  --training_steps 3000 --num_simulations 25 --bootstrap_episodes 300 --bootstrap_steps 300 --eval_episodes 10
```

Uses upstream `MuZero("cartpole")` with config overrides only (1 self-play worker, 25 simulations,
300 random bootstrap episodes, no validation) and upstream `evaluate()` (greedy MCTS, seeds 1000000..).
MuZero has no observation decoder, so `predict_next_obs_mse` is `null`; the JSON reports reward/value
error and latent-consistency instead, plus clearly labelled ridge probes (not native MuZero outputs).

## Outputs

`results/open_wm_official/dreamerv3.json`, `results/open_wm_official/muzero.json`.
Identity-baseline next-obs MSE on the shared test set: 0.0310864.
