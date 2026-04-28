#!/usr/bin/env bash
# serve_lan.sh — host mobile_avatar.html with HTTPS over LAN so iPhone Safari
# can grant camera permission.
set -euo pipefail

DIR="${1:-.}"
IP="${IP:-$(ipconfig getifaddr en0 2>/dev/null || echo 192.168.31.157)}"
PORT="${PORT:-8443}"

cd "$DIR"

# 1) install mkcert + local CA once
if ! command -v mkcert >/dev/null; then
  echo "[init] installing mkcert"
  brew install mkcert nss
fi
mkcert -install >/dev/null 2>&1 || true

# 2) cert for this LAN IP + localhost
if [[ ! -f "lan.pem" || ! -f "lan-key.pem" ]]; then
  echo "[init] minting cert for $IP"
  mkcert -cert-file lan.pem -key-file lan-key.pem "$IP" localhost 127.0.0.1
fi

# 3) serve
echo "[ready] open on iPhone Safari:"
echo "        https://$IP:$PORT/mobile_avatar.html"
echo "        (first time will say 'untrusted' → 高级 → 继续访问)"
echo
npx --yes http-server -S -C lan.pem -K lan-key.pem -p "$PORT" -a 0.0.0.0 -c-1 .
