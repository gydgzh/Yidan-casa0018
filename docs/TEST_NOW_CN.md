# 本地 AI 测试单（这一版的所有改动）

> **远程 Claude 这一轮做了 2 件事 + 1 个 UI 优化**：
>
> 1. AVATAR_BANK 改成**纯 CDN**：不再读 `./models/` 本地文件,5 个 avatar 全从 jsdelivr 拉。**本地 4 个重复文件 md5 相同的 bug 直接绕过**——浏览器只看 CDN。
> 2. 启动页 UI 大改：紫色提示框 + ①②③④⑤ 五步 + 中英双语提示 + Custom URL 旁加 readyplayer.me 链接。
> 3. Relay URL 智能自动填:用 LAN IP 访问页面时,relay 自动跟着用同样 IP。
>
> **不需要再跑下载脚本了**,5 个 avatar 全从 CDN 拿。本地那 4 个重复 .glb/.vrm 留着也没关系(反正不读),想删也行。

---

## 步骤(5 分钟)

### 1) 同步 HTML 到 GitHub Pages（如果用）

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
PAGES=~/Yidan-casa0018

cp "$DLL/mobile_avatar.html" "$PAGES/mobile_avatar.html"
cd "$PAGES"
git add mobile_avatar.html
git commit -m "Veil v4: CDN-only avatars + bilingual start screen"
git push
```

### 2) 杀旧 + 起新（HTTPS + relay）

```bash
cd "$DLL"
# 杀掉旧服务
lsof -ti :8443 2>/dev/null | xargs -r kill -9
lsof -ti :8765 2>/dev/null | xargs -r kill -9
sleep 1

# 起 HTTPS 静态(给 Mac 双浏览器测)
npx --yes http-server . -S -C .certs/cert.pem -K .certs/key.pem -p 8443 -a 0.0.0.0 &
sleep 1

# 起 relay(房间 + peerId 多人版)
cd "$DLL/relay_server"
npm start &
# 控制台必须打 "(multi-user)" 字样,否则跑的还是旧版
```

### 3) Mac 浏览器双开测试

**Chrome 窗口（你 = Yidan）**:
```
https://localhost:8443/mobile_avatar.html
```
- ① Your name = `Yidan`
- ② Room code = `cosy42`
- ③ Relay = 自动填好(`ws://localhost:8765`),不动
- ④ Choose avatar → 点 **Mira** 卡片
- ⑤ 点紫色按钮 → 同意摄像头

**Safari 窗口（朋友 = Mom）**:
```
https://localhost:8443/mobile_avatar.html
```
- ① Your name = `Mom`
- ② Room code = `cosy42`（**和 Chrome 一样**）
- ③ Relay = 自动填好,不动
- ④ Choose avatar → 点 **Sakura** 卡片（二次元少女 VRM）
- ⑤ 点按钮 → 同意摄像头

**第三窗口（Chrome 隐身, 可选, 测三人）**:
- Name = `Friend` · Room = `cosy42` · Avatar = **Kaito**

### 4) 验收清单（按顺序检查）

| 检查 | 期望看到 | 失败怎么办 |
|---|---|---|
| Mac 浏览器开启动页 | 顶部紫色提示框"三步开始"+ 五个圆圈编号 | 强制刷新 Cmd+Shift+R |
| Avatar 卡片图标 | Mira👩🏻 / Emma👱🏼‍♀️ / Ada👩🏻‍🦱 / Sakura👧 / Kaito👦 / Custom➕ 6 张卡 | 看 console 第一条红 ERR |
| 进入房间后顶部 pill | `connecting…` → `waiting for friend` → **`paired`** 绿 | relay 没起或 IP 错 |
| Chrome 屏幕 | 左 Mira 跟你脸动,右 Sakura 跟 Safari 那边脸动 | 看下面 §"全是同一个" |
| Safari 屏幕 | 左 Sakura 跟自己动,右 Mira 跟 Chrome 动 | 同上 |
| 加第 3 人 (Kaito) | 弧形 3 个 avatar,每个 halo 不同色 | relay banner 必须有"multi-user" |
| 同时大笑 | 屏幕中央炸 💞 | action_recognition 没加载,看 log |
| 关掉 Safari | 另外两屏中间 avatar 立刻消失 | server_rooms 没处理 disconnect |

### 5) 跑完贴回这块给远程 Claude

```bash
echo "=== 1. mobile_avatar.html title ==="
grep "<title>" "$DLL/mobile_avatar.html"
echo
echo "=== 2. AVATAR_BANK 是 CDN 还是本地 ==="
grep -A 1 "AVATAR_BANK = {" "$DLL/mobile_avatar.html" | head -10
echo
echo "=== 3. 服务状态 ==="
lsof -i :8443 2>/dev/null | head -3
lsof -i :8765 2>/dev/null | head -3
echo
echo "=== 4. 测试结果 ==="
echo "  双浏览器 paired? ___ (Y/N)"
echo "  5 个 avatar 选过都不一样? ___ (Y/N)"
echo "  3 人时弧形布局正确? ___ (Y/N)"
echo "  Mood Sync 触发过? ___ (Y/N)"
echo "  iPhone 上能开吗? ___ (Y/N,装了 mkcert root 后)"
```

---

## 常见故障速查

| 现象 | 真因 | 修法 |
|---|---|---|
| 5 个 avatar 选过看起来还是一样 | 浏览器缓存 | Cmd+Shift+R 强刷 |
| Avatar 加载时间巨长 | jsdelivr 慢 | 等 30 秒,或开 ?debug=1 看 log;每个 12MB |
| 顶部 pill 一直 `connecting…` | relay 没起或 IP 写错 | `lsof -i :8765` 看 / 重抄 IP |
| 启动页布局乱 / 看不到提示框 | 没拉到新 HTML | 强刷 / 检查 `git pull` 在 Pages 仓库 |
| Custom URL 失败 | URL 不可达 | 浏览器直接开那个 URL 看是 200 + .glb 字节流 |
| iPhone 红屏不安全 | mkcert root 没装到 iPhone | `docs/IPHONE_DEPLOY_CN.md` §3 |
| 三个人但只显示两个 | server_rooms.js 是旧版没 peerId | banner 要打"multi-user" |

---

## iPhone 真机部署(这一版用同样方法)

照旧用 `docs/IPHONE_DEPLOY_CN.md`,但**这一版有个额外好处**:

- iPhone Safari 打开 `https://<MAC_IP>:8443/mobile_avatar.html` 时, **relay 字段自动填成 `ws://<MAC_IP>:8765`**(因为 `location.hostname` 就是 Mac IP)
- 你不用在 iPhone 上手敲 IP,自动对的
- 5 个 avatar 都从 CDN 拉,iPhone 不需要先下任何文件

---

## 给本地 AI 一句话指令

> 1. `cp` 新 HTML 到 GitHub Pages 仓库 + push(步骤 1)
> 2. 杀重启 8443 + 8765 两个服务(步骤 2)
> 3. **Mac Chrome + Safari 双开测**——填同 room code、各选不同 avatar
> 4. 期望:两屏的左 = 自己,右 = 对方,且 5 个 avatar 真的不同
> 5. 加第 3 个浏览器(隐身)测 3 人弧形布局
> 6. 跑完按"步骤 5"的命令把输出贴回
