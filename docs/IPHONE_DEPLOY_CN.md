# Veil 双人测试 + iPhone 部署执行手册（给本地 AI）

> **现在的状态**：Veil 双人版已经能开（标题是 "Veil — Private Avatar Companionship"），单人模式所有本地功能都正常。
> **下一步要做的两件事**：(A) 双人配对测试（验 friend 能动）；(B) 部署到 iPhone 真机。
>
> **执行原则**：每一步跑完贴 verify 再进下一步。报错就停，贴 console 第一条红色 ERR。

---

## 0. 这一版的更新清单（远程 Claude 已经做完，不要重做）

- ✅ `mobile_avatar.html` 904→964 行：扩了 avatar 选择器，从 3 个 → **5 个内建 + 1 个 Custom URL**
  - Realistic（TalkingHead, MIT）：Brunette / Blonde / Asian
  - Stylised（Ready Player Me）：RPM Woman / RPM Man
  - Bring your own：Custom URL（粘贴你自己的 .glb 链接）
- ✅ `docs/DESIGN_OUTLINE_CN.md`：新建,完整项目设计大纲（按 CASA0018 marking scheme 4 项配重）
- ✅ 头部裁切框架已经在前一版搞定（FOV 30/24，距离 1.55/1.25）

---

## 1. 重要：Mac 浏览器同 tab 共享摄像头是不行的

报告里的"选项 A 两个标签页"会失败，因为 **macOS 摄像头一次只允许一个浏览器 tab 拿到**。第二个 tab 会卡在 `cam:init` 不动。

**正确的同机双人测法**（任选一个）：

| 路线 | 怎么做 | 优点 | 缺点 |
|---|---|---|---|
| **A. Chrome + Safari** | Mac 上同时开 Chrome 和 Safari,分别访问页面 | 0 额外配置;两个浏览器各拿一次摄像头权限 | Safari 的 mkcert 信任要单独装 |
| **B. Chrome + Firefox** | 同 A,换 Firefox | Chrome 已有 mkcert 信任,Firefox 也走系统 root | Firefox 第一次还是要确认证书 |
| **C. Mac + iPhone** | Mac 浏览器一端,iPhone Safari 一端 | 最真实,接近最终演示;不抢摄像头 | 要走 §3 完整 iPhone 部署 |

---

## 2. 双浏览器双人测试（Chrome + Safari，5 分钟）

### 2.1 把 mkcert root CA 装到 Safari 系统钥匙串（只做一次）

mkcert -install 默认装 Chrome/Firefox/Safari 都用的系统 trust store。如果之前 `mkcert -install` 跑过 → Safari 已经信任。验证：

```bash
# 看 Mac 系统钥匙串有没有 mkcert 的 root CA
security find-certificate -c "mkcert development CA" -p /Library/Keychains/System.keychain 2>/dev/null | head -3
# 或者
security find-certificate -c "mkcert" 2>/dev/null | grep -i alis
```

如果没有 → 重跑 `mkcert -install`。

### 2.2 启 relay 和 HTTPS 静态服务（如果没在跑）

```bash
# 终端 1 — relay
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1/relay_server
npm install
npm start
# 看到 "veil-relay listening on :8765"

# 终端 2 — HTTPS 静态
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
lsof -ti :8443 | xargs -r kill -9 ; sleep 1
npx --yes http-server . -S -C .certs/cert.pem -K .certs/key.pem -p 8443 -a 0.0.0.0
```

### 2.3 同时开 Chrome 和 Safari

**Chrome（Window A — Yidan）**:
```
https://localhost:8443/mobile_avatar.html
```
- Name: `Yidan`
- Room: `cosy42`
- Relay: `ws://localhost:8765`
- Your avatar: `Brunette`
- Friend appears as: `Blonde`
- 点 Allow camera → 同意

**Safari（Window B — Friend）**:
```
https://localhost:8443/mobile_avatar.html
```
- Name: `Friend`
- Room: `cosy42`（**必须一样**）
- Relay: `ws://localhost:8765`
- Your avatar: `Asian`
- Friend appears as: `RPM Woman`
- 点 Allow camera → 同意

### 2.4 期望（验收）

- 两边的 top bar `connecting…` → `waiting for friend` → **`paired`**（绿色）
- Chrome 屏幕：左边 Brunette 跟着 Yidan（Chrome 摄像头）动；右边 Asian 跟着 Friend（Safari 摄像头）动
- Safari 屏幕：左边 Asian 跟着 Friend 动；右边 RPM Woman 跟着 Yidan 动
- 同时大笑 → 屏幕中央炸 💞
- relay 终端：`[veil-relay] rooms=1 clients=2 forwarded=N (~24 pkt/s)`

### 2.5 不行就贴这些回 Claude

```bash
# 哪边的 console 先红？
# Chrome → 检查 → Console → 截图第一条红色
# Safari → Develop → Show JavaScript Console → 截图第一条红色

# relay 看到几个 client?
curl -s http://localhost:8765 2>&1 || true   # 这个会失败但 relay 终端打的日志最重要
```

---

## 3. iPhone 真机部署（10 分钟）

iPhone 要 HTTPS（不能用 HTTP，Safari 不给摄像头），所以需要把 Mac 当前 LAN IP 写进证书 + 把 root CA 装到 iPhone。

### 3.1 验证 Mac 当前 LAN IP（重要——WiFi 换了 IP 就变）

```bash
ifconfig | awk '/inet /&&!/127\.0/{print $2; exit}'
# 例如 192.168.31.157
```

记下这个 IP，下面要用。如果跟之前签证书时不一样 → 重签（步骤 3.2）。

### 3.2 检查证书是否包含当前 IP

```bash
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
openssl x509 -in .certs/cert.pem -noout -ext subjectAltName
# 必须看到当前的 LAN IP
```

如果**没有当前 IP** → 重签：

```bash
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1/.certs
MAC_IP=$(ifconfig | awk '/inet /&&!/127\.0/{print $2; exit}')
mkcert -cert-file cert.pem -key-file key.pem localhost 127.0.0.1 ::1 "$MAC_IP"
# 然后回到根目录,杀掉旧 http-server,用新证书重启
cd ..
lsof -ti :8443 | xargs -r kill -9 ; sleep 1
npx --yes http-server . -S -C .certs/cert.pem -K .certs/key.pem -p 8443 -a 0.0.0.0
```

### 3.3 把 mkcert root CA 装到 iPhone（一次性，3 分钟）

```bash
# Mac 上找到 root CA
mkcert -CAROOT
# 输出: /Users/yimisheng/Library/Application Support/mkcert
# 那里面有 rootCA.pem
```

**传 rootCA.pem 到 iPhone**（手机连 USB 最方便）：
1. Finder 左侧选 iPhone → "文件" 标签 → 把 `rootCA.pem` 拖到任意 app（比如 GoodNotes/Files）
2. 或者 AirDrop 给 iPhone

**iPhone 上**：
3. 打开"文件" app → 找到 `rootCA.pem` → 点击 → 系统问"安装描述文件"
4. **设置 → 通用 → VPN 与设备管理 → mkcert development CA → 安装**（输 iPhone 密码）
5. **关键**：**设置 → 通用 → 关于本机 → 证书信任设置** → mkcert development CA 那行**打开**

### 3.4 iPhone 上访问

iPhone 必须和 Mac 在**同一 WiFi**。

iPhone Safari 输入：
```
https://192.168.31.157:8443/mobile_avatar.html
```
（替换为你的 Mac LAN IP）

URL 栏前面应是 🔒 锁形（不是"不安全"红字）。如果是红字 → 回 3.3 重做证书信任。

填表：
- Name: `Yidan`
- Room: `cosy42`
- Relay: `ws://192.168.31.157:8765`（**ws 不是 wss**，relay 没加密）
- Your avatar / Friend appears as: 各选一个

点 Allow camera → 同意。

### 3.5 在 Mac 浏览器同时开第二个端

Mac Chrome：`https://localhost:8443/mobile_avatar.html`
- Room 填同样的 `cosy42`
- Relay 填 `ws://localhost:8765`
- Avatar 选与 iPhone 不同的

期望：两边 `paired`，互相看到对方 avatar 在动。

### 3.6 加到 iPhone 主屏（伪 PWA）

iPhone Safari 在 mobile_avatar.html 页面：
1. 点底部分享按钮（方框 ↑）
2. 选"添加到主屏幕"
3. 名字填 `Veil`，点"添加"
4. 主屏多了一个 Veil 图标，**点开就是全屏 Web App**，没有 Safari 地址栏

---

## 4. Custom URL 怎么用（用户想要更多 avatar 时）

启动页 avatar 下拉里选 **"Custom URL…"** → 下面会冒出一个文本框 → 粘贴任何公开 .glb URL。

合法 URL 来源建议：
- **Ready Player Me** 自己创角：去 https://readyplayer.me/avatar 创建一个 → 复制 .glb 链接（形如 `https://models.readyplayer.me/<id>.glb`）→ 粘到 Custom URL
- **TalkingHead 仓库其他变体**：https://github.com/met4citizen/TalkingHead/tree/main/avatars 里找其它 .glb
- **Khronos glTF Sample Models**: https://github.com/KhronosGroup/glTF-Sample-Models（CC0/CC-BY，但很多没有 ARKit blendshape，表情不会动只会显示）
- **自己用 VRoid Studio 导 .vrm → Blender VRM 插件 → 导出 .glb 带 ARKit morph target**：本地放进 `models/` 后填 `./models/your_avatar.glb`

---

## 5. 测试场景脚本（验三件事）

### 场景 1 — 双人面捕同步
| 你做 | 对方屏幕看到 |
|---|---|
| 张嘴 | 对方右边 avatar 嘴张开 |
| 眨左眼 | 对方右边 avatar 左眼闭 |
| 偏头 30° | 对方右边 avatar 头跟着偏 |

### 场景 2 — 8 类动作触发 Halo + 心情同步
做下列动作，**自己屏左边 halo 应该变色**，**对方屏右边 halo 也变同样色**：

| 你做 | Halo 颜色 |
|---|---|
| smile_big | 橙 |
| surprise | 蓝 |
| frown | 红 |
| mouth_o | 绿 |
| wink_left/right | 紫 |
| tongue_out | 粉 |

两边**同时**做同样动作 → 中央炸 emoji（💞 / ✨ / 🎵 / 🫂 / 🌟 / 🤪）

### 场景 3 — 5 个 avatar 切换
回启动页（点 Leave），换不同 avatar，进同 room，看哪个嘴形/眨眼跟得最准。

---

## 6. 跑完后把这些贴回给 Claude（远程）

```bash
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
echo "=== 1. 服务状态 ==="
lsof -i :8765 2>/dev/null | head -3
lsof -i :8443 2>/dev/null | head -3
echo
echo "=== 2. 证书 SAN ==="
openssl x509 -in .certs/cert.pem -noout -ext subjectAltName
echo
echo "=== 3. 测试结果 ==="
echo "  双浏览器配对(Chrome+Safari): paired? ___ (Y/N)"
echo "  iPhone 配对成功? ___ (Y/N)"
echo "  双人 fps 平均: ___"
echo "  KB/s: ___"
echo "  RTT(LAN): ___ ms"
echo "  Mood Sync 触发率(20 秒里 3 次同动作)：___ /3"
echo "  哪几个 avatar 表情还原最好(按 1-5 排名): ___"
echo
echo "=== 4. iPhone Safari console (Mac 端: 开发→<iPhone 名>→mobile_avatar.html) ==="
echo "  把 [boot] / [ws] / [mp] / [self] / [peer] 这些行 copy 回来"
```

---

## 7. 常见故障速查

| 症状 | 原因 | 解决 |
|---|---|---|
| 两个 Chrome tab 同时开,第二个 cam 卡 init | macOS 摄像头单 tab 限制 | 用 Chrome+Safari 不要同浏览器开两个 |
| iPhone Safari 红屏"不安全" | mkcert root CA 没装到 iPhone / 没在"证书信任设置"打开 | 回 §3.3 |
| iPhone Safari 上不去摄像头 | 不是 HTTPS 或证书不被信任 | 回 §3.2-3.3 |
| `paired` 一直没出现 | room code 两端不一致 / relay IP 错 | 仔细抄 room code,用 `ifconfig` 重看 IP |
| `KB/s: 0` 但 `paired` | WS 协议字段 type 没对上 | 看 relay 控制台,看 `rooms=1 clients=2 forwarded=0` 就是字段问题 |
| 自己 avatar 加载到一半卡 | 第一个 URL fail 在 retry | 等 30 秒,看 log 确认 fallback |
| 自己 avatar 是色块小脸 | URL chain + FALLBACK_URL 全失败 | 重跑 `bash scripts/download_assets.sh` |
| Custom URL 失败 | URL 不可达或不是合法 .glb | 浏览器直接打开那个 URL,看是不是 200 + .glb 二进制 |
| iPhone 主屏 launch 后空白 | localStorage 隔离了 | 第一次重新填 name/room/relay |

---

## 8. 给本地 AI 的硬要求

- ❌ **不要**改 Swift / Xcode 工程：iPhone 端是 **Safari Web App**
- ❌ **不要**关 mkcert root CA
- ❌ **不要**重新加 `@pixiv/three-vrm` 到 importmap：上次试过页面会空白
- ❌ **不要**两个 Chrome tab 测：摄像头会冲突
- ✅ **要**确保 8765 和 8443 都是 `0.0.0.0` 监听
- ✅ **要**先用 Chrome + Safari 验证双人配对再上 iPhone
- ✅ **要**测完贴 §6 的 5 块输出回来
