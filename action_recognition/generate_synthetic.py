"""生成合成训练数据，让训练管线在没有真实录制数据时也能跑通。

每类 ~75 个 session，每个 session 60 帧（2 秒）。生成的曲线尝试模拟真实 blendshape 的
"渐入 → 峰值 → 渐出"形态，加少量高斯噪声 + 各别人脸的基线偏移。

⚠️ **这些数据仅用于验证管线，不能代替真实录制**。报告里务必写明：
"为防止训练管线因等数据而停滞，先用合成 blendshape 序列做 sanity check；
最终评测以真实 MediaPipe / ARKit 录制数据为准。"
"""

from __future__ import annotations
import argparse
import json
import math
import os
import random
from pathlib import Path

from lib_dataset import ARKIT_KEYS, DEFAULT_LABELS

random.seed(42)


def bell(t: float, peak: float, sigma: float = 0.18) -> float:
    """钟形曲线，t∈[0,1]，peak 是中心位置"""
    return math.exp(-((t - peak) ** 2) / (2 * sigma * sigma))


def make_neutral_baseline(rng: random.Random) -> dict:
    """每个 session 一组小的"自然漂移"基线，模拟个体差异。"""
    return {k: max(0.0, min(0.15, rng.gauss(0.05, 0.025))) for k in ARKIT_KEYS}


def make_session(label: str, fps: int = 30, seconds: float = 2.0,
                 subject: str = "synthetic", rng: random.Random = None) -> dict:
    rng = rng or random.Random()
    n = int(fps * seconds)
    base = make_neutral_baseline(rng)
    peak_at = rng.uniform(0.4, 0.6)
    intensity = rng.uniform(0.7, 1.0)
    frames = []
    for i in range(n):
        t = i / max(1, n - 1)
        f = dict(base)  # 基线
        env = bell(t, peak_at)  # 0..1
        if label == "neutral":
            env = 0.0  # 全程接近基线
        if label == "wink_left":
            f["eyeBlinkLeft"]  = clip(intensity * env + noise(rng))
            f["eyeBlinkRight"] = clip(0.05 + noise(rng, 0.03))
        elif label == "wink_right":
            f["eyeBlinkRight"] = clip(intensity * env + noise(rng))
            f["eyeBlinkLeft"]  = clip(0.05 + noise(rng, 0.03))
        elif label == "smile_big":
            f["mouthSmileLeft"]  = clip(intensity * env + noise(rng))
            f["mouthSmileRight"] = clip(intensity * env + noise(rng))
            f["cheekSquintLeft"]  = clip(0.4 * env + noise(rng))
            f["cheekSquintRight"] = clip(0.4 * env + noise(rng))
        elif label == "surprise":
            f["browInnerUp"]   = clip(intensity * env + noise(rng))
            f["browOuterUpLeft"]  = clip(0.6 * env + noise(rng))
            f["browOuterUpRight"] = clip(0.6 * env + noise(rng))
            f["eyeWideLeft"]   = clip(0.7 * env + noise(rng))
            f["eyeWideRight"]  = clip(0.7 * env + noise(rng))
            f["jawOpen"]       = clip(0.4 * env + noise(rng))
        elif label == "frown":
            f["mouthFrownLeft"]  = clip(intensity * env + noise(rng))
            f["mouthFrownRight"] = clip(intensity * env + noise(rng))
            f["browDownLeft"]    = clip(0.5 * env + noise(rng))
            f["browDownRight"]   = clip(0.5 * env + noise(rng))
        elif label == "mouth_o":
            f["mouthFunnel"] = clip(0.7 * env + noise(rng))
            f["mouthPucker"] = clip(0.4 * env + noise(rng))
            f["jawOpen"]     = clip(0.25 * env + noise(rng))
        elif label == "tongue_out":
            f["tongueOut"] = clip(intensity * env + noise(rng))
            f["jawOpen"]   = clip(0.25 * env + noise(rng))
        # 全部加少量高斯噪声
        for k in ARKIT_KEYS:
            f[k] = clip(f[k] + noise(rng, 0.015))
        frames.append({"ts": round(i / fps, 4), "blendshapes": f})
    return {
        "version": 1,
        "label": label,
        "subject_id": subject,
        "fps_target": fps,
        "frames": frames,
        "synthetic": True,
    }


def clip(v: float) -> float:
    return float(max(0.0, min(1.0, v)))


def noise(rng: random.Random, sigma: float = 0.02) -> float:
    return rng.gauss(0.0, sigma)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "sample_dataset"),
                    help="输出目录")
    ap.add_argument("--per-class", type=int, default=75, help="每类生成多少个 session")
    ap.add_argument("--subjects", type=int, default=3, help="模拟几个 subject(每个 session 用其中一个的基线)")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    # 子目录形式：sample_dataset/<label>/<i>.json
    subjects = [f"synthetic_{i:02d}" for i in range(args.subjects)]
    rng = random.Random(123)

    total = 0
    for label in DEFAULT_LABELS:
        sub_dir = out / label
        sub_dir.mkdir(exist_ok=True)
        for k in range(args.per_class):
            sub = subjects[k % len(subjects)]
            sec = rng.uniform(1.5, 2.5)
            session = make_session(label, seconds=sec, subject=sub, rng=rng)
            path = sub_dir / f"{label}_{sub}_{k:03d}.json"
            with open(path, "w") as f:
                json.dump(session, f)
            total += 1
        print(f"  ✓ {label:12s} ×{args.per_class}")
    print(f"生成完成：{total} 个 session 到 {out}")


if __name__ == "__main__":
    main()
