"""终端订阅 relay_server，把当前的 30 帧滑窗喂模型，实时打印预测。

用法:
  pip install websocket-client tensorflow-macos
  cd action_recognition
  python eval_realtime.py
"""

from __future__ import annotations
import argparse
import json
import os
import time
from collections import deque

import numpy as np

try:
    import websocket  # websocket-client
except ImportError:
    raise SystemExit("缺 websocket-client:  pip install websocket-client --break-system-packages")

from tensorflow.keras.models import load_model
import lib_dataset as ds


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--model", default=os.path.join(here, "artifacts", "action_model.h5"))
    ap.add_argument("--meta",  default=os.path.join(here, "artifacts", "class_names.json"))
    ap.add_argument("--ws",    default="ws://localhost:8765")
    ap.add_argument("--threshold", type=float, default=0.6)
    args = ap.parse_args()

    with open(args.meta) as f:
        meta = json.load(f)
    labels = meta["labels"]
    window = meta.get("window", 30)
    feature_order = meta.get("feature_order", ds.ARKIT_KEYS)

    model = load_model(args.model, compile=False)
    print(f"[ready] model={args.model}  window={window}  classes={labels}")

    buf = deque(maxlen=window)

    def on_open(ws):
        print(f"[ws] open {args.ws}")
        ws.send(json.dumps({"role": "viewer"}))

    def on_message(ws, msg):
        try:
            d = json.loads(msg)
        except Exception:
            return
        bs = d.get("blendshapes") or {}
        vec = np.array([float(bs.get(k, 0.0)) for k in feature_order], dtype=np.float32)
        np.clip(vec, 0.0, 1.0, out=vec)
        buf.append(vec)
        if len(buf) < window:
            return
        x = np.stack(buf, axis=0)[None, ...]      # (1, T, 52)
        p = model.predict(x, verbose=0)[0]
        idx = int(np.argmax(p))
        if p[idx] >= args.threshold and labels[idx] != "neutral":
            print(f"  {time.strftime('%H:%M:%S')}  {labels[idx]:14s} ({p[idx]:.2f})")

    def on_error(ws, err):
        print(f"[ws] error {err}")

    def on_close(ws, *_):
        print("[ws] closed")

    ws = websocket.WebSocketApp(args.ws,
                                on_open=on_open, on_message=on_message,
                                on_error=on_error, on_close=on_close)
    ws.run_forever()


if __name__ == "__main__":
    main()
