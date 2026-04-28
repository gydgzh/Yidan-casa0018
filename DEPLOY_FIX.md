# mobile_avatar.html 修复 — 给本地 AI 的执行单

## 现状判断
本地 AI 报告里几个迹象确认它**没有用我给的 mobile_avatar.html**，而是自己重写了一份：
- 它说用了 Three.js **r128**（我写的是 0.160 + ESM importmap）
- 它说用了 **`@pixiv/three-vrm`**（我没引用过）
- 它说 `MODEL_URL = "...VRMAvatarSample_B.vrm"`（这个文件名错了，仓库里实际是 `AvatarSample_B.vrm`，前面没"VRM"前缀；而且我原版用的是 Ready Player Me GLB，不是 VRM）
- 它说用 **MediaPipe Face Mesh**（老 API，只输出 landmarks，不输出 52 维 ARKit blendshapes；我用的是 `@mediapipe/tasks-vision` 的 `FaceLandmarker`，新 API，原生 52 维输出）

→ 所以现在网页打开是空白/报错，**完全是因为底层 API 选错了**。修法：直接全文替换。

## 步骤 1 ：把仓库里那份替换掉 + 下一个合法头像进来
```bash
# 仓库根目录（GitHub Pages 仓库名是 Yidan-casa0018）
cd ~/Yidan-casa0018

# 1) 先把现存的（错误的）那份归档到 AAAther
mkdir -p AAAther
git mv mobile_avatar.html AAAther/mobile_avatar.broken.html 2>/dev/null \
  || mv mobile_avatar.html AAAther/mobile_avatar.broken.html

# 2) 拷贝我的新版 + 下载脚本进来
SRC="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
SRC="$(find "$SRC" -name download_avatar.sh -print -quit | xargs dirname)"
cp "$SRC/mobile_avatar.html" .
cp "$SRC/download_avatar.sh" .
chmod +x download_avatar.sh

# 3) ★关键：下一个合法头像到仓库 models/avatar.glb
#    源：met4citizen/TalkingHead （MIT 协议，女性写实，自带 ARKit 52 blendshape）
bash download_avatar.sh                # 默认 brunette
# 不喜欢这个换：  AVATAR=blonde bash download_avatar.sh
# 或：           AVATAR=asian  bash download_avatar.sh

ls -lh models/avatar.glb               # 期望 ~10MB
ls models/action_model/                # 应有 model.json + bin

# 4) commit + push
git add mobile_avatar.html download_avatar.sh models/avatar.glb AAAther/
git commit -m "replace mobile_avatar (v2) + bundled MIT TalkingHead avatar"
git push
```

GitHub Pages 一般 30-60 秒后生效。访问：
`https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html`

## 步骤 2 ：iPhone Safari 测试 + 用 URL flag 排错

新版本支持 4 种调试模式（URL 后加参数即可）：

| URL | 作用 | 用途 |
|---|---|---|
| `mobile_avatar.html` | 正常模式 | 真实场景 |
| `mobile_avatar.html?debug=1` | 自动展开屏上日志 | 看不到错误时用 |
| `mobile_avatar.html?cube=1` | 头像换成简易代理头 | RPM CDN 失败时验证其它部分 |
| `mobile_avatar.html?nocam=1&cube=1` | 不用摄像头 + 用代理头 | 纯渲染测试，最干净 |

**推荐第一次按这个顺序排查**：

### 测 1：纯渲染（最干净，2 秒就知道 Three.js 工作没）
打开：`https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?nocam=1&cube=1&debug=1`

- 应该看到屏幕中央有个肉色球状代理头来回轻摆
- 如果黑屏 → Three.js 模块都没加载，仓库里 importmap 被破坏了；或者 iOS Safari < 16
- 看屏上日志里最后一行错误

### 测 2：摄像头 + MediaPipe（不要头像）
`mobile_avatar.html?cube=1&debug=1`

- 应弹出摄像头权限请求
- 允许后右下角应该有镜像摄像头小窗
- 代理头应跟你脸动同步（眨眼/张嘴明显能看到）
- HUD 里 `cam: ok · mp: ok`

### 测 3：完整模式
`mobile_avatar.html?debug=1`

- 验证 RPM 头像是否加载
- 如果 RPM URL 失效，新版会**自动 fallback 到代理头**而不是黑屏
- HUD 里 `avatar: ok` 才算真头像加载好；显示 `proxy` 表示用了代理头

## 步骤 3 ：常见错误 → 直接修

| 屏上日志最后一行 | 意思 | 修法 |
|---|---|---|
| `GLB FAILED: ... 404` | RPM URL 不存在 | 自己去 readyplayer.me 生成一个新 ID，URL 后加 `?avatar=https://models.readyplayer.me/<新ID>.glb?morphTargets=ARKit` |
| `action model unavailable: ... 404` | model.json 路径错 | 确认 `models/action_model/model.json` 真在仓库根，仓库 settings → Pages → source 是 main 分支 root |
| `NotAllowedError` | 摄像头权限被拒 | iPhone 设置 → Safari → 摄像头 = 询问；并清掉这个域的权限重试 |
| `FilesetResolver / vision_bundle 404` | jsdelivr 抽风 | 等一会儿；或换 `unpkg.com` 镜像 |
| `failed to fetch importmap` 或一上来就白屏 | iOS < 16.4 不支持 importmap | 让用户升级 iOS |

## 步骤 4 ：换头像（可选）

默认下载的是 TalkingHead 项目的 `brunette.glb`。如果想换：

```bash
cd ~/Yidan-casa0018
AVATAR=blonde bash download_avatar.sh    # 或 asian / brunette
git add models/avatar.glb
git commit -m "switch avatar to blonde"
git push
```

或者**完全不动 models/，临时用 URL 参数试别的**：
```
?avatar=https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@main/avatars/blonde.glb
```

或者**自己用 Ready Player Me 生成一个**（外观可定制）：
1. https://readyplayer.me/avatar 定制完点 Use → 复制 ID
2. 把它下到本地仓库（更稳）：
   ```bash
   cd ~/Yidan-casa0018
   curl -L -o models/avatar.glb \
     "https://models.readyplayer.me/<你的ID>.glb?morphTargets=ARKit&textureAtlas=1024&pose=A"
   git add models/avatar.glb && git commit -m "rpm avatar" && git push
   ```

把最终 URL 用 https://www.qrcode-monkey.com 生成二维码，演示给老师扫码。

## 步骤 5 ：成功的判定标志
iPhone 上看到：
- HUD 五行最下三行不是 `-`：fps 在 25-30、frames 持续涨、last bs 显示 `eyeBlinkLeft,eyeBlinkRight,…`
- 中央一个写实女角色（或代理头）跟着你脸动
- 做夸张表情时屏幕中央喷 emoji 闪光 + 周围粒子
- HUD 里 `action: <类别>  conf: 0.7+`

## 你不用做的事
- 不需要换 Three.js 版本：保持 0.160 + importmap，这是为啥能直接用现代 API
- 不需要装 `@pixiv/three-vrm`：项目改用 GLB 路线，VRM 那条路废弃
- 不需要 MediaPipe Face Mesh：老 API，新版用 `@mediapipe/tasks-vision` 才能拿 52 维 blendshape
- 不需要本地 npm install：完全 CDN，丢仓库就跑

## 把生成的实验产物之类的扔到 AAAther
```bash
mkdir -p AAAther
# 原先错的 mobile_avatar 已经移过去了
# 如果还有别的实验文件（比如 server_https.js / mkcert 证书 / 之前 v1 v2 swift），都丢这里
mv lan*.pem AAAther/ 2>/dev/null
mv WebAvatarView*.swift AAAther/ 2>/dev/null
mv ContentView_v2.swift AAAther/ 2>/dev/null
git add AAAther/
git commit -m "archive deprecated experiment files"
git push
```
