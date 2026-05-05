"""把 Keras .h5 转成 TFJS layers 格式，直接拷给 web_avatar/public/models/action_model/。

用法:
  cd action_recognition
  python export_tfjs.py
  # 输出:
  #   ../web_avatar/public/models/action_model/model.json + group1-shard1of1.bin
  #   ../web_avatar/public/models/action_model/class_names.json
"""

from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--h5", default=os.path.join(here, "artifacts", "action_model.h5"))
    ap.add_argument("--meta", default=os.path.join(here, "artifacts", "class_names.json"))
    ap.add_argument("--metrics", default=os.path.join(here, "artifacts", "training_metrics.json"))
    ap.add_argument("--out", default=os.path.join(here, "..", "web_avatar", "public", "models", "action_model"))
    args = ap.parse_args()

    if not os.path.exists(args.h5):
        sys.exit(f"❌ {args.h5} 不存在 — 先跑 train.py")
    if not os.path.exists(args.meta):
        sys.exit(f"❌ {args.meta} 不存在 — 先跑 train.py")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    # 优先用 tensorflowjs Python API；如果未装 fallback 到 CLI
    try:
        import tensorflowjs as tfjs  # noqa
        from tensorflow.keras.models import load_model
        print("[export] 使用 tensorflowjs Python API")
        m = load_model(args.h5, compile=False)
        tfjs.converters.save_keras_model(m, str(out))
    except ImportError:
        print("[export] tensorflowjs Python 包没装 — 试 CLI")
        subprocess.check_call([
            "tensorflowjs_converter",
            "--input_format=keras",
            "--output_format=tfjs_layers_model",
            args.h5, str(out),
        ])

    # 把元数据也拷过去
    shutil.copy(args.meta, out / "class_names.json")
    if os.path.exists(args.metrics):
        shutil.copy(args.metrics, out / "training_metrics.json")

    # 大小 / 文件清单
    print(f"\n✅ 导出完成 → {out}")
    for p in sorted(out.iterdir()):
        size = p.stat().st_size
        print(f"  {p.name:35s}  {size/1024:7.1f} KB")

    print("\n下一步:")
    print("  1) cd ../web_avatar && npm install @tensorflow/tfjs")
    print("  2) npm run dev    → 打开 5173,actionInference.js 会自动加载")


if __name__ == "__main__":
    main()
