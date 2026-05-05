# 立刻能跑的方案 — HTTP localhost(绕过所有证书问题)

> **诊断**：HTTPS 8443 服务在运行,curl 返回 200,但 Chrome 红屏不让打开。
> 问题不在代码,在 mkcert 证书 Chrome/Safari 不信任。
>
> **最快解决**：localhost 是浏览器特批的 secure context,HTTP 都能调摄像头。
> 直接 HTTP 跑,不用碰证书。**iPhone 真机测试**才需要 HTTPS,本地 Mac 双浏览器测试不需要。

---

## 立刻执行(2 分钟)

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
cd "$DLL"

# === 1) 杀光所有占用端口的旧进程 ===
lsof -ti :8443 2>/dev/null | xargs -r kill -9
lsof -ti :8080 2>/dev/null | xargs -r kill -9
lsof -ti :8765 2>/dev/null | xargs -r kill -9
sleep 1
echo "  ✓ 旧服务全部杀光"

# === 2) 起 HTTP 静态服务(不要 HTTPS!) ===
npx --yes http-server . -p 8080 -a 0.0.0.0 --cors > /tmp/httpserver.log 2>&1 &
sleep 2
curl -s -o /dev/null -w "HTTP server returns: %{http_code}\n" http://localhost:8080/mobile_avatar.html
# 必须看到 "HTTP server returns: 200"

# === 3) 起 multi-user relay ===
cd "$DLL/relay_server"
npm start > /tmp/relay.log 2>&1 &
sleep 2
head -3 /tmp/relay.log
# 必须打印 "veil-relay listening on :8765" 和 "(multi-user)" 字样

# === 4) 打开 Chrome ===
open -a "Google Chrome" "http://localhost:8080/mobile_avatar.html"

# === 5) 等 3 秒,再打开 Safari(测多人) ===
sleep 3
open -a "Safari" "http://localhost:8080/mobile_avatar.html"
```

---

## 浏览器里看到啥才算成功

### Chrome 窗口

1. **没有红屏警告**(因为 HTTP 不验证证书)
2. 紫色启动页,顶部有"VEIL"+紫色提示框"三步开始 / 3 steps to start"
3. 字段编号 ① ② ③ ④ ⑤ 五步
4. 中下部有 6 张 avatar 卡片:Mira / Emma / Ada / Sakura / Kaito / Custom
5. 填:
   - ① Yidan
   - ② cosy42
   - ③ 自动是 `ws://localhost:8765`,**不要动**
   - ④ 点 **Mira** 卡(变高亮)
   - ⑤ 点紫色按钮 → 同意摄像头权限

→ 看到自己的 avatar(Mira)在屏幕左侧动

### Safari 窗口(同一台 Mac)

同样流程,**填同一个 room code `cosy42`**,选不同 avatar(比如 **Sakura** 二次元少女)。

→ 期望:**两个浏览器顶部 pill 都从 `waiting for friend` 变 `paired` 绿色**;两边屏幕都能看到 Mira + Sakura 各自跟自己的脸动。

---

## 还是打不开?贴这个回来

```bash
echo "=== 1. 服务在不在 ==="
lsof -i :8080 2>/dev/null
lsof -i :8765 2>/dev/null
echo
echo "=== 2. http server 日志末 20 行 ==="
tail -20 /tmp/httpserver.log
echo
echo "=== 3. relay 日志末 20 行 ==="
tail -20 /tmp/relay.log
echo
echo "=== 4. curl 测试 ==="
curl -sI http://localhost:8080/mobile_avatar.html | head -5
echo
echo "=== 5. 浏览器打开后 console 第一条红色 ERR ==="
echo "在 Chrome → 检查 → Console → 截图第一条红色错误"
```

---

## iPhone 测试怎么办?

iPhone Safari 必须 HTTPS(localhost 例外不适用,iPhone 不在你 Mac 上),所以:

1. **本地 Mac 测试用 HTTP**(本文档)
2. **iPhone 部署用 HTTPS**(`docs/IPHONE_DEPLOY_CN.md` §3)

两条路并存,不冲突。

---

## 给本地 AI 一句话指令

> **先用 HTTP 测**(本文档)。3 步:杀光旧服务 → 起 HTTP 8080 + relay → Chrome+Safari 同 room code 配对。
> HTTPS 那条路先不动,等本地 HTTP 测通了再回去搞 iPhone。
> 跑完贴 §"还是打不开" 那 5 块输出回来。
