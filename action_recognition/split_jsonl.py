"""把 record_session.html 下载的"sessions 数组"JSON 拆成
data/<label>/<i>.json 的目录形式（lib_dataset.py 期望的形式）。

用法:
  python split_jsonl.py ~/Downloads/sessions_yidan_2026-04-28T03-12-09.json data/
"""

import json, os, sys
from pathlib import Path

if len(sys.argv) < 3:
    print("usage: python split_jsonl.py <bundle.json> <out_dir>")
    sys.exit(1)

bundle_path, out_dir = sys.argv[1], sys.argv[2]
out = Path(out_dir)
out.mkdir(parents=True, exist_ok=True)

with open(bundle_path) as f:
    sessions = json.load(f)
if not isinstance(sessions, list):
    sys.exit("bundle 应该是 JSON 数组")

counts = {}
for s in sessions:
    lab = s.get("label", "unknown")
    sub_dir = out / lab
    sub_dir.mkdir(exist_ok=True)
    counts[lab] = counts.get(lab, 0) + 1
    p = sub_dir / f"{lab}_{s.get('subject_id','anon')}_{counts[lab]:03d}.json"
    with open(p, "w") as f:
        json.dump(s, f)
print(f"✓ 拆出 {len(sessions)} 个 session 到 {out}")
for k, v in sorted(counts.items()):
    print(f"  {k:14s} ×{v}")
