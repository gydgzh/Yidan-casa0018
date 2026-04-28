"""1D-CNN 动作识别训练。

输入：(window=30, features=52) blendshape 序列
输出：8 类离散动作

用法：
  cd action_recognition
  python train.py                                  # 默认用 sample_dataset/
  python train.py --data ../data/sessions          # 用真实录制数据
  python train.py --window 45 --epochs 80          # 调超参

会生成：
  artifacts/action_model.h5              # Keras 模型
  artifacts/class_names.json             # 类别名顺序
  artifacts/training_history.png         # loss/acc 曲线
  artifacts/confusion_matrix.png
  artifacts/training_metrics.json        # test_acc, f1, per_class 等
"""

from __future__ import annotations
import argparse
import json
import os
from pathlib import Path

import numpy as np

# 让 sklearn 缺失也能跑（沙盒里可能没装）
try:
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, confusion_matrix, f1_score
    SKLEARN = True
except ImportError:
    SKLEARN = False

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

import lib_dataset as ds


def stratified_split(X, y, val_ratio=0.15, test_ratio=0.15, seed=42):
    """sklearn 缺失时的 fallback 分层划分。"""
    if SKLEARN:
        X_tv, X_te, y_tv, y_te = train_test_split(X, y, test_size=test_ratio,
                                                  stratify=y, random_state=seed)
        val_size = val_ratio / (1.0 - test_ratio)
        X_tr, X_va, y_tr, y_va = train_test_split(X_tv, y_tv, test_size=val_size,
                                                  stratify=y_tv, random_state=seed)
        return X_tr, y_tr, X_va, y_va, X_te, y_te
    rng = np.random.default_rng(seed)
    idx = np.arange(len(X))
    rng.shuffle(idx)
    n = len(X)
    n_te = int(n * test_ratio)
    n_va = int(n * val_ratio)
    te = idx[:n_te]
    va = idx[n_te:n_te + n_va]
    tr = idx[n_te + n_va:]
    return X[tr], y[tr], X[va], y[va], X[te], y[te]


def build_model(window: int, num_features: int, num_classes: int) -> tf.keras.Model:
    inp = layers.Input(shape=(window, num_features), name="bs_seq")
    x = layers.Conv1D(32, 5, padding="causal", activation="relu")(inp)
    x = layers.BatchNormalization()(x)
    x = layers.Conv1D(64, 5, padding="causal", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv1D(64, 3, padding="causal", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dropout(0.3)(x)
    out = layers.Dense(num_classes, activation="softmax", name="action")(x)
    m = models.Model(inp, out, name="action_cnn1d")
    return m


def plot_history(hist, out_path):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("(matplotlib 缺失,跳过曲线图)")
        return
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].plot(hist.history["loss"], label="train")
    axes[0].plot(hist.history["val_loss"], label="val")
    axes[0].set_title("Loss"); axes[0].set_xlabel("epoch"); axes[0].legend()
    axes[1].plot(hist.history["accuracy"], label="train")
    axes[1].plot(hist.history["val_accuracy"], label="val")
    axes[1].set_title("Accuracy"); axes[1].set_xlabel("epoch"); axes[1].legend()
    fig.tight_layout()
    fig.savefig(out_path, dpi=120)
    plt.close(fig)
    print(f"  ✓ 训练曲线 → {out_path}")


def plot_confusion(cm, labels, out_path):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return
    fig, ax = plt.subplots(figsize=(6.5, 5.5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(labels))); ax.set_yticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.set_yticklabels(labels)
    ax.set_xlabel("predicted"); ax.set_ylabel("true")
    ax.set_title("Confusion (test set)")
    for i in range(len(labels)):
        for j in range(len(labels)):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else "black", fontsize=9)
    fig.colorbar(im, ax=ax)
    fig.tight_layout()
    fig.savefig(out_path, dpi=120)
    plt.close(fig)
    print(f"  ✓ 混淆矩阵 → {out_path}")


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--data", default=os.path.join(here, "sample_dataset"))
    ap.add_argument("--out", default=os.path.join(here, "artifacts"))
    ap.add_argument("--window", type=int, default=30)
    ap.add_argument("--stride", type=int, default=10)
    ap.add_argument("--epochs", type=int, default=40)
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--lr", type=float, default=1e-3)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)

    print(f"[load] sessions from {args.data}")
    X, y, labels = ds.build_dataset(args.data, window=args.window, stride=args.stride)
    print(f"  X={X.shape}  y={y.shape}  classes={labels}")
    print(ds.class_distribution(y, labels))

    X_tr, y_tr, X_va, y_va, X_te, y_te = stratified_split(X, y)
    print(f"  split: train={len(X_tr)}  val={len(X_va)}  test={len(X_te)}")

    model = build_model(args.window, ds.NUM_FEATURES, len(labels))
    model.compile(optimizer=tf.keras.optimizers.Adam(args.lr),
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    model.summary(line_length=90)

    cb = [
        callbacks.EarlyStopping(patience=10, restore_best_weights=True, monitor="val_accuracy"),
        callbacks.ReduceLROnPlateau(patience=5, factor=0.5, min_lr=1e-5, monitor="val_loss"),
    ]
    hist = model.fit(X_tr, y_tr,
                     validation_data=(X_va, y_va),
                     epochs=args.epochs, batch_size=args.batch,
                     callbacks=cb, verbose=2)

    # 评估
    test_loss, test_acc = model.evaluate(X_te, y_te, verbose=0)
    print(f"\n=== TEST ===\n  loss={test_loss:.4f}  acc={test_acc:.4f}")

    y_pred = np.argmax(model.predict(X_te, verbose=0), axis=1)
    metrics = {"test_loss": float(test_loss), "test_accuracy": float(test_acc),
               "labels": labels}

    if SKLEARN:
        f1 = f1_score(y_te, y_pred, average="macro")
        metrics["f1_macro"] = float(f1)
        print(f"  f1_macro={f1:.4f}\n")
        print(classification_report(y_te, y_pred, target_names=labels, zero_division=0))
        cm = confusion_matrix(y_te, y_pred, labels=list(range(len(labels))))
        plot_confusion(cm, labels, os.path.join(args.out, "confusion_matrix.png"))
        metrics["confusion_matrix"] = cm.tolist()

    plot_history(hist, os.path.join(args.out, "training_history.png"))

    # 保存
    h5_path = os.path.join(args.out, "action_model.h5")
    model.save(h5_path, include_optimizer=False)
    print(f"  ✓ 模型 → {h5_path}  ({os.path.getsize(h5_path)/1024:.1f} KB)")

    with open(os.path.join(args.out, "class_names.json"), "w") as f:
        json.dump({"labels": labels, "window": args.window,
                   "num_features": ds.NUM_FEATURES,
                   "feature_order": ds.ARKIT_KEYS}, f, indent=2)
    with open(os.path.join(args.out, "training_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"  ✓ class_names.json + training_metrics.json")
    print("\n下一步:  python export_tfjs.py")


if __name__ == "__main__":
    main()
