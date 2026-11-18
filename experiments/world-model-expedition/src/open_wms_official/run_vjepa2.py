#!/usr/bin/env python3
"""Run UPSTREAM V-JEPA 2 (facebook/vjepa2-vitl-fpc64-256 via HF transformers) on CPU on REAL rendered
CartPole-v1 frames, and linear-probe the latent for state / next-state.

Real data path: the shared eval transitions (cartpole_eval.npz) are CartPole-v1 states; the env state IS the
4-d observation, so each row is re-rendered through gymnasium's own pygame renderer (render_mode='rgb_array')
by setting env.unwrapped.state = obs. Consecutive rows of the same episode form T-frame clips.

Run:  OMP_NUM_THREADS=2 SDL_VIDEODRIVER=dummy /tmp/wm_official/venv_vjepa2/bin/python run_vjepa2.py
"""
import json, os, sys, time
from pathlib import Path

os.environ.setdefault("OMP_NUM_THREADS", "2")
os.environ.setdefault("MKL_NUM_THREADS", "2")
os.environ.setdefault("SDL_VIDEODRIVER", "dummy")

import numpy as np
import torch
import torch.nn.functional as F

torch.set_num_threads(2)

HERE = Path(__file__).resolve()
EXP = HERE.parents[2]
OUT = EXP / "results" / "open_wm_official" / "vjepa2.json"
DATA = EXP / "data" / "cartpole_eval.npz"
MODEL_ID = "facebook/vjepa2-vitl-fpc64-256"
LOCAL = Path("/tmp/wm_official/vjepa2-vitl-fpc64-256")
T = int(os.environ.get("VJEPA_FRAMES", "8"))          # frames per clip (model native: 64; reduced for CPU)
N_TRAIN = int(os.environ.get("VJEPA_NTRAIN", "120"))
N_TEST = int(os.environ.get("VJEPA_NTEST", "50"))
RES = 256
IDENTITY_FULL_TEST_MSE = 0.0310864


INSTALL_COMMANDS = [
    "python3 -m venv --system-site-packages --without-pip /tmp/wm_official/venv_vjepa2",
    "pip --python /tmp/wm_official/venv_vjepa2/bin/python install transformers==5.23.0 pygame huggingface_hub scikit-learn   # torch 2.15.0+cpu from system site; do NOT install torchvision (ABI mismatch with system torch)",
    "huggingface-hub snapshot_download('facebook/vjepa2-vitl-fpc64-256', local_dir='/tmp/wm_official/vjepa2-vitl-fpc64-256')   # sha b3c1679b7c34d3255ef3547f27c7b226aefab26f",
    "OMP_NUM_THREADS=2 SDL_VIDEODRIVER=dummy /tmp/wm_official/venv_vjepa2/bin/python src/open_wms_official/run_vjepa2.py"
]


def windows(obs, nxt, T):
    """Indices i such that rows i..i+T-1 are consecutive in one episode (next[j] == obs[j+1])."""
    cont = np.all(np.isclose(nxt[:-1], obs[1:], atol=1e-6), axis=1)
    out = []
    for i in range(len(obs) - T + 1):
        if cont[i:i + T - 1].all():
            out.append(i)
    return np.array(out, dtype=int)


def pick(idx, n, rng):
    if len(idx) <= n:
        return idx
    return np.sort(rng.choice(idx, size=n, replace=False))


def main():
    import gymnasium as gym
    result = dict(
        model="V-JEPA 2 ViT-L/16 fpc64-256 (HF transformers VJEPA2Model, encoder only)",
        upstream_repo="https://github.com/facebookresearch/vjepa2",
        commit_or_revision=None, executable=False, blocker=None, install_commands=INSTALL_COMMANDS,
        hardware={}, identity_baseline_mse=IDENTITY_FULL_TEST_MSE,
        capabilities=dict(predict=True, simulate=False, share=False, merge=False, multi_agent_shared_world=False),
        notes=[],
    )
    try:
        import transformers
        from transformers import VJEPA2Model
        from huggingface_hub import HfApi
        sha = HfApi().model_info(MODEL_ID).sha
        result["commit_or_revision"] = dict(hf_model=MODEL_ID, hf_sha=sha, transformers=transformers.__version__)
        result["hardware"] = dict(device="cpu", gpu=False, cores_visible=os.cpu_count(), torch_threads=2,
                                  torch=torch.__version__, python=sys.version.split()[0],
                                  dtype="float32")

        d = np.load(DATA)
        rng = np.random.default_rng(0)
        env = gym.make("CartPole-v1", render_mode="rgb_array")
        env.reset(seed=0)
        frame_cache = {}

        def frame(split, arr_obs, i):
            k = (split, i)
            if k not in frame_cache:
                env.unwrapped.state = arr_obs[i].astype(np.float64)
                f = env.render()
                f = torch.from_numpy(np.ascontiguousarray(f)).permute(2, 0, 1).float().unsqueeze(0) / 255.0
                f = F.interpolate(f, size=(RES, RES), mode="bilinear", antialias=True, align_corners=False)[0]
                frame_cache[k] = f
            return frame_cache[k]

        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

        splits = {}
        for split, n in (("train", N_TRAIN), ("test", N_TEST)):
            O, A, N = d[f"{split}_obs"], d[f"{split}_act"], d[f"{split}_next"]
            w = windows(O, N, T)
            sel = pick(w, n, rng)
            splits[split] = dict(O=O, A=A, N=N, sel=sel, n_windows_available=int(len(w)))

        t0 = time.time()
        model = VJEPA2Model.from_pretrained(str(LOCAL) if LOCAL.exists() else MODEL_ID, torch_dtype=torch.float32)
        model.eval()
        result["model_load_seconds"] = time.time() - t0
        result["model_params_encoder_M"] = sum(p.numel() for p in model.encoder.parameters()) / 1e6
        result["model_params_predictor_M"] = sum(p.numel() for p in model.predictor.parameters()) / 1e6

        feats, secs = {}, []
        grid = RES // 16
        for split in ("train", "test"):
            S = splits[split]
            F_all, F_last, F_grid = [], [], []
            for c, i in enumerate(S["sel"]):
                clip = torch.stack([(frame(split, S["O"], i + k) - mean) / std for k in range(T)])  # T,C,H,W
                x = clip.unsqueeze(0)
                ts = time.perf_counter()
                with torch.inference_mode():
                    out = model(pixel_values_videos=x, skip_predictor=True)
                    h = out.last_hidden_state[0]  # tokens, dim
                secs.append(time.perf_counter() - ts)
                tt = h.shape[0] // (grid * grid)  # temporal token groups
                h = h.view(tt, grid, grid, -1)
                F_all.append(h.mean((0, 1, 2)).numpy())
                last = h[-1]
                F_last.append(last.mean((0, 1)).numpy())
                g = F.adaptive_avg_pool2d(last.permute(2, 0, 1).unsqueeze(0), 4)[0]  # dim,4,4
                F_grid.append(g.flatten().numpy())
                if c % 20 == 0:
                    print(f"[{split}] clip {c}/{len(S['sel'])} {secs[-1]:.2f}s tokens={tt*grid*grid}", flush=True)
            feats[split] = dict(mean_all=np.stack(F_all), last_slice_mean=np.stack(F_last), last_slice_4x4=np.stack(F_grid))

        # ---- probes ----
        def ridge_fit(Xtr, Ytr, alphas):
            mu, sd = Xtr.mean(0), Xtr.std(0) + 1e-6
            Xs = (Xtr - mu) / sd
            ym = Ytr.mean(0)
            n = len(Xs)
            # k-fold CV over train for alpha (dual form, n small)
            folds = np.array_split(np.random.default_rng(1).permutation(n), 5)
            best, best_err = alphas[0], 1e18
            for a in alphas:
                err = 0.0
                for f in folds:
                    tr = np.setdiff1d(np.arange(n), f)
                    K = Xs[tr] @ Xs[tr].T
                    coef = np.linalg.solve(K + a * np.eye(len(tr)), Ytr[tr] - Ytr[tr].mean(0))
                    P = Xs[f] @ (Xs[tr].T @ coef) + Ytr[tr].mean(0)
                    err += ((P - Ytr[f]) ** 2).sum()
                if err < best_err:
                    best, best_err = a, err
            K = Xs @ Xs.T
            coef = np.linalg.solve(K + best * np.eye(n), Ytr - ym)
            W = Xs.T @ coef
            return (lambda X: ((X - mu) / sd) @ W + ym), best

        def r2(P, Y):
            ss_res = ((P - Y) ** 2).sum(0)
            ss_tot = ((Y - Y.mean(0)) ** 2).sum(0)
            return (1 - ss_res / ss_tot)

        def targets(split):
            S = splits[split]; sel = S["sel"]
            last = sel + T - 1
            return (S["O"][last].astype(np.float64), S["A"][last].astype(np.float64), S["N"][last].astype(np.float64))

        s_tr, a_tr, n_tr = targets("train")
        s_te, a_te, n_te = targets("test")
        alphas = [1e-1, 1, 10, 100, 1e3, 1e4, 1e5]
        probes = {}
        for fname in ("mean_all", "last_slice_mean", "last_slice_4x4"):
            Xtr, Xte = feats["train"][fname], feats["test"][fname]
            fn, a = ridge_fit(Xtr, s_tr, alphas)
            P = fn(Xte)
            fn2, a2 = ridge_fit(np.hstack([Xtr, a_tr[:, None] * np.ones((1, 8)) * 10.0]), n_tr, alphas)
            P2 = fn2(np.hstack([Xte, a_te[:, None] * np.ones((1, 8)) * 10.0]))
            probes[fname] = dict(
                state_alpha=a, state_mse_per_dim=((P - s_te) ** 2).mean(0).tolist(), state_mse=float(((P - s_te) ** 2).mean()),
                state_r2_per_dim=r2(P, s_te).tolist(), state_r2_mean=float(r2(P, s_te).mean()),
                state_mse_mean_predictor=float(((s_tr.mean(0) - s_te) ** 2).mean()),
                next_alpha=a2, next_mse=float(((P2 - n_te) ** 2).mean()),
                next_r2_per_dim=r2(P2, n_te).tolist(), next_r2_mean=float(r2(P2, n_te).mean()),
            )
        # baselines on the SAME test clips
        ident_clips = float(((s_te - n_te) ** 2).mean())
        mean_pred = float(((n_tr.mean(0) - n_te) ** 2).mean())
        # reference: ridge on TRUE current state + action (what a perfect state-reading probe could reach linearly)
        fnr, ar = ridge_fit(np.hstack([s_tr, a_tr[:, None]]), n_tr, [1e-6, 1e-4, 1e-2, 1, 10])
        ref_lin = float(((fnr(np.hstack([s_te, a_te[:, None]])) - n_te) ** 2).mean())
        best_name = min(probes, key=lambda k: probes[k]["next_mse"])
        result["executable"] = True
        result["measured"] = dict(
            frames_per_clip=T, native_frames_per_clip=64, resolution=RES, tokens_per_clip=int(T // 2 * grid * grid),
            n_train_clips=int(len(splits["train"]["sel"])), n_test_clips=int(len(splits["test"]["sel"])),
            seconds_per_clip_mean=float(np.mean(secs)), seconds_per_clip_median=float(np.median(secs)),
            seconds_per_clip_min=float(np.min(secs)), seconds_per_clip_max=float(np.max(secs)),
            latent_dim=1024, probes=probes, best_next_feature=best_name,
            identity_baseline_mse_full_shared_test=IDENTITY_FULL_TEST_MSE,
            identity_baseline_mse_on_probe_test_clips=ident_clips,
            mean_predictor_next_mse_on_probe_test_clips=mean_pred,
            reference_linear_true_state_plus_action_next_mse=ref_lin,
            test_state_variance_per_dim=s_te.var(0).tolist(),
        )
        result["notes"] += [
            "Real facebook/vjepa2-vitl-fpc64-256 encoder weights executed on CPU fp32 via HF transformers VJEPA2Model(skip_predictor=True); frames are real gymnasium CartPole-v1 pygame renders (rows of the shared eval npz re-rendered by setting env state).",
            f"Clips use {T} frames (native fpc is 64; 64x256^2 = 8192 tokens is impractical on 2 CPU threads). Temporal RoPE positions are index-based in HF implementation so a shorter clip is a prefix of the native layout, but this is outside the pretraining clip length.",
            "Frames are squash-resized 600x400 -> 256x256 (no center-crop, which would cut the cart off). ImageNet mean/std normalization as in the model's preprocessor.",
            "Probes: ridge with 5-fold CV alpha on train; features = mean over all tokens, mean over last temporal token group, or 4x4 spatially pooled last temporal group. Next-state probe input = [latent, action*10 repeated 8x]. Small N (train/test clips as listed); single split; R2 is test-set R2 per state dim.",
            "Windows are drawn from the shared train/test transitions (random-policy CartPole, episodes are short), so test states have small variance; compare MSE with the identity baseline on the same clips AND with the full-set 0.0310864.",
            "V-JEPA 2 is a video representation model (predict-in-latent masked prediction). The encoder alone was run; there is no share/merge/multi-agent shared-world mechanism. The V-JEPA 2-AC action-conditioned predictor (ViT-g, ~1B params encoder + predictor, distributed as .pt via dl.fbaipublicfiles, not as an HF transformers checkpoint) was NOT run.",
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
