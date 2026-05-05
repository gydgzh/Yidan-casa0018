"""加载 session JSON → (N, T, F) tensor + label 数组。

Session JSON 格式（与 record_session.html 对齐）:
{
  "version": 1,
  "label": "wink_left",
  "subject_id": "yidan",
  "fps_target": 30,
  "frames": [
    { "ts": 0.000, "blendshapes": { "jawOpen": 0.0, ... } },
    ...
  ]
}

ARKit blendshape 名见 web_avatar/src/arkitToVrm.js 里的 ARKIT_KEYS（52 个）。
本 loader 用同一份顺序，缺失字段补 0。
"""

from __future__ import annotations
import json
import os
from pathlib import Path
from typing import List, Tuple

import numpy as np

# ARKit 52 blendshape 标准顺序（与 arkitToVrm.js 完全一致）
ARKIT_KEYS = [
    "browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight",
    "eyeBlinkLeft", "eyeBlinkRight", "eyeLookDownLeft", "eyeLookDownRight",
    "eyeLookInLeft", "eyeLookInRight", "eyeLookOutLeft", "eyeLookOutRight",
    "eyeLookUpLeft", "eyeLookUpRight", "eyeSquintLeft", "eyeSquintRight",
    "eyeWideLeft", "eyeWideRight",
    "cheekPuff", "cheekSquintLeft", "cheekSquintRight", "noseSneerLeft", "noseSneerRight",
    "jawForward", "jawLeft", "jawOpen", "jawRight",
    "mouthClose", "mouthDimpleLeft", "mouthDimpleRight", "mouthFrownLeft", "mouthFrownRight",
    "mouthFunnel", "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight",
    "mouthPressLeft", "mouthPressRight", "mouthPucker", "mouthRight",
    "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper",
    "mouthSmileLeft", "mouthSmileRight", "mouthStretchLeft", "mouthStretchRight",
    "mouthUpperUpLeft", "mouthUpperUpRight",
    "tongueOut",
]
NUM_FEATURES = len(ARKIT_KEYS)  # 52
assert NUM_FEATURES == 52, f"ARKIT_KEYS must have 52 entries, got {NUM_FEATURES}"

# 默认 8 类（顺序固定，决定 softmax index）
DEFAULT_LABELS = [
    "neutral",
    "wink_left", "wink_right",
    "smile_big",
    "surprise",
    "frown",
    "mouth_o",
    "tongue_out",
]


def session_to_array(session: dict) -> np.ndarray:
    """单个 session dict → (T, 52) float32"""
    frames = session.get("frames", [])
    out = np.zeros((len(frames), NUM_FEATURES), dtype=np.float32)
    for t, f in enumerate(frames):
        bs = f.get("blendshapes", {}) or {}
        for j, k in enumerate(ARKIT_KEYS):
            v = bs.get(k, 0.0)
            try:
                out[t, j] = float(v)
            except Exception:
                out[t, j] = 0.0
    np.clip(out, 0.0, 1.0, out=out)
    return out


def load_session_file(path: str) -> Tuple[np.ndarray, str]:
    with open(path) as f:
        s = json.load(f)
    return session_to_array(s), s.get("label", "unknown")


def discover_sessions(root: str) -> List[Tuple[str, str]]:
    """遍历目录，返回 [(json_path, label), ...]。
    支持两种组织方式：
      a) sessions/<label>/*.json     → 标签从目录名取
      b) sessions/*.json             → 标签从 JSON 内字段取
    """
    paths: List[Tuple[str, str]] = []
    rp = Path(root)
    if not rp.exists():
        return paths
    # (a) 子目录形式
    for sub in sorted(rp.iterdir()):
        if sub.is_dir():
            for j in sorted(sub.glob("*.json")):
                paths.append((str(j), sub.name))
    # (b) 顶层文件形式
    for j in sorted(rp.glob("*.json")):
        try:
            with open(j) as f:
                d = json.load(f)
            paths.append((str(j), d.get("label", "unknown")))
        except Exception:
            pass
    return paths


def windows_from_array(arr: np.ndarray, win: int, stride: int) -> np.ndarray:
    """(T, F) → (N, win, F)。如果 T < win 用 zero-pad 在末尾补一段；保留至少 1 个窗口。"""
    T, F = arr.shape
    if T < win:
        pad = np.zeros((win - T, F), dtype=arr.dtype)
        arr = np.concatenate([arr, pad], axis=0)
        T = win
    starts = list(range(0, T - win + 1, stride))
    if not starts:
        starts = [0]
    return np.stack([arr[s:s + win] for s in starts], axis=0)


def build_dataset(
    session_dir: str,
    labels: List[str] = None,
    window: int = 30,
    stride: int = 10,
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """枚举 session_dir，组成 (X, y, label_names)。

    X: (N, window, 52) float32 in [0,1]
    y: (N,)            int64   in [0, num_classes)
    """
    if labels is None:
        labels = DEFAULT_LABELS
    label_to_idx = {lab: i for i, lab in enumerate(labels)}
    pairs = discover_sessions(session_dir)
    if not pairs:
        raise RuntimeError(f"No session JSON found under {session_dir}")
    Xs, ys = [], []
    for path, lab in pairs:
        if lab not in label_to_idx:
            print(f"  [skip] {path} unknown label '{lab}'")
            continue
        arr, _ = load_session_file(path)
        wins = windows_from_array(arr, window, stride)
        Xs.append(wins)
        ys.append(np.full(len(wins), label_to_idx[lab], dtype=np.int64))
    if not Xs:
        raise RuntimeError(f"No usable sessions for labels={labels} under {session_dir}")
    X = np.concatenate(Xs, axis=0)
    y = np.concatenate(ys, axis=0)
    return X, y, labels


def class_distribution(y: np.ndarray, labels: List[str]) -> str:
    out = ["类别分布:"]
    for i, lab in enumerate(labels):
        n = int((y == i).sum())
        out.append(f"  [{i}] {lab:14s} {n:5d}")
    return "\n".join(out)


if __name__ == "__main__":
    import sys
    here = os.path.dirname(os.path.abspath(__file__))
    sd = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "sample_dataset")
    X, y, labs = build_dataset(sd)
    print(f"X={X.shape} y={y.shape}")
    print(class_distribution(y, labs))
