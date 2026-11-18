# Official open world models on CPU: install notes and pins

All work lives under `/tmp/wm_official` (venvs, upstream clone, checkpoints). Nothing was installed into the repo.
Hardware: 4 shared vCPU, ~15 GB RAM, no GPU. `OMP_NUM_THREADS=2`, `torch.set_num_threads(2)`.

## TD-MPC2 (`run_tdmpc2.py`)

- Upstream: https://github.com/nicklashansen/tdmpc2 at `332f19e4aba4bffe2dc736f45ea7f7bdc585903a`
- Checkpoint: HF model repo `nicklashansen/tdmpc2` at sha `8fb2a82efb3bae96941da440128fe1332e4394fd`, files `dmcontrol/cartpole-swingup-1.pt`, `dmcontrol/cartpole-balance-1.pt` (5M params, metadata date 2023-06-03).
- Venv: `python3 -m venv --system-site-packages --without-pip /tmp/wm_official/venv_tdmpc2` (the `venv` module has no ensurepip here), then `pip --python <venv>/bin/python install ...`.
- Pins that finally worked together: `torch==2.7.1` (CPU wheel; matches upstream docker pin), `tensordict==0.8.3`, `torchrl==0.8.1`, `mujoco==3.1.2`, `dm-control==1.0.16`, `gymnasium==0.29.1`, `numpy==1.26.4`.
- Run: `OMP_NUM_THREADS=2 MUJOCO_GL=disable /tmp/wm_official/venv_tdmpc2/bin/python src/open_wms_official/run_tdmpc2.py` (env knobs: `TDMPC2_TASKS`, `TDMPC2_EPISODES`, `TDMPC2_RANDOM_EPISODES`).

Things that blocked the stock path, and what was done:

1. `evaluate.py` asserts CUDA and the agent/scale/buffer code hard-codes `cuda:0`. The runner copies upstream `tdmpc2/` to `/tmp/wm_official/tdmpc2_cpu_patched` and does a mechanical text patch (`cuda:0` -> `cpu`, drop `capturable=True`, no `torch.compile`). The diff is saved as `tdmpc2_cpu_patch.diff`. The planner and world-model math are untouched.
2. No EGL or OSMesa on this VM, so `import mujoco` with `MUJOCO_GL=egl` crashes. `MUJOCO_GL=disable` works because state observations need no rendering.
3. Newer unpinned stacks failed: torch 2.15 + tensordict 0.15 gave `Cannot copy out of meta tensor` in the Q-ensemble; mujoco 4.x had a missing `libmujoco.so.4.0.1`; numpy 2.x broke `dm_control 1.0.16` (`np.array(copy=False)`); gymnasium 1.x rejected upstream's non-`gym.Env` wrapper. The pins above fix these.
4. The HF checkpoint (dated 2023-06-03) stores MLPs as flat `Sequential(Linear, LayerNorm, Mish, ...)`, but upstream HEAD builds `NormedLinear` blocks (`N.weight`, `N.ln.weight`). `load_state_dict` fails on the stock layout. `convert_legacy_2023_layout()` in `run_tdmpc2.py` only renames keys: encoder `state.{1,2,4,5}` -> `state.{0,0.ln,1,1.ln}`, and so on for the dynamics, reward and pi heads. The Q-ensemble keys go through upstream's own `api_model_conversion`. Strict loading succeeds, so every tensor was consumed. The layout is my inference from the key names and shapes. It is not documented upstream. See the result notes for the measured quality problem this leaves.

## V-JEPA 2 (`run_vjepa2.py`)

- Upstream: https://github.com/facebookresearch/vjepa2 (weights as published by Meta on HF; code path used = HF `transformers` `VJEPA2Model`).
- Weights: `facebook/vjepa2-vitl-fpc64-256` at sha `b3c1679b7c34d3255ef3547f27c7b226aefab26f` (ViT-L/16, 64-frame, 256px). `transformers==5.23.0`.
- Venv: `python3 -m venv --system-site-packages --without-pip /tmp/wm_official/venv_vjepa2`; `pip --python <venv>/bin/python install transformers pygame huggingface_hub scikit-learn`.
- Do NOT leave `torchvision` installed in that venv: the wheel pip pulls does not match the system torch 2.15.0+cpu (`operator torchvision::nms does not exist`) and breaks the `transformers` import. Preprocessing is done by hand (bilinear squash to 256x256, ImageNet mean/std).
- Run: `OMP_NUM_THREADS=2 SDL_VIDEODRIVER=dummy /tmp/wm_official/venv_vjepa2/bin/python src/open_wms_official/run_vjepa2.py` (knobs: `VJEPA_FRAMES`, `VJEPA_NTRAIN`, `VJEPA_NTEST`).
- Only the ViT-L encoder was run. The ViT-g checkpoints (`facebook/vjepa2-vitg-*`, ~1B-param encoder, ~4 GB fp32 before predictor/activations) were not attempted: too large for the 4-8 GB usable here. V-JEPA 2-AC (action-conditioned ViT-g predictor) is not published as an HF transformers checkpoint (original `.pt` via `dl.fbaipublicfiles.com`) and was NOT run.
