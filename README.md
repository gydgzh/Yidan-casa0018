# mobile_avatar.html — 手机网页版（自包含）

## 这是什么
一个单文件 HTML，**直接在 iPhone Safari 打开就能用**，把这些拼到一起：
- MediaPipe Face Landmarker v2（手机自己的前摄做面捕，输出 52 维 ARKit blendshape，30 fps）
- Three.js + Ready Player Me 半写实女角色（GLB，从 RPM CDN 拉）
- 你训好的 LSTM 8 类动作识别（TFJS，从 `./models/action_model/` 加载）
- 粒子特效 + 全屏 emoji 闪光

不需要 iOS App、不需要 Mac relay、不需要 WebSocket、不需要构建步骤。

## 架构（重新画）
```
┌────────── iPhone Safari ──────────────┐
│  getUserMedia (前摄, 30 fps)           │
│        │                                │
│        ▼                                │
│  MediaPipe FaceLandmarker (WASM+GPU)    │
│   → 52-d ARKit blendshapes              │
│        │                                │
│        ├──→ Three.js morph targets      │
│        │     (RPM avatar, ARKit names)  │
│        │                                │
│        └──→ TFJS LSTM (8-class)         │
│              → particle effects         │
└─────────────────────────────────────────┘
```
**所有计算在手机本地。无网络上传。延迟 < 60ms。**

## 部署 — 三选一

### A. 用 Mac 当 LAN HTTPS 服务器（推荐，无需 npm install）
```bash
# 1) 把 mobile_avatar.html 和 serve_lan.sh 放进同一文件夹（任意位置）
# 例如：
mkdir -p ~/facemocap-mobile
cp mobile_avatar.html serve_lan.sh ~/facemocap-mobile/
# 把你训好的 action 模型拷过来（可选）：
cp -R /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1/web_avatar/public/models \
      ~/facemocap-mobile/

# 2) 启动
cd ~/facemocap-mobile
chmod +x serve_lan.sh
bash serve_lan.sh

# 3) iPhone Safari 打开（必须 HTTPS，相机权限要求）
#    https://192.168.31.157:8443/mobile_avatar.html
#    第一次会说"不安全"，点 高级 → 继续访问
#    点屏幕中央"允许摄像头并开始"
```

### B. 用 ngrok 把本地 HTTP 临时变成 HTTPS（不进 LAN）
```bash
brew install ngrok
cd ~/facemocap-mobile
python3 -m http.server 8080 &
ngrok http 8080
# ngrok 给的 https://xxx.ngrok-free.app/mobile_avatar.html 直接在手机打开
```

### C. 部署到 Vercel/Netlify（永久 URL，最适合给评卷老师演示）
1. 注册 https://vercel.com（用 GitHub 登）
2. 新建项目，把 mobile_avatar.html 和 models/ 拖进去
3. 拿到永久 https URL，二维码发给老师

## URL 参数（按需）
- `?avatar=<RPM glb URL>` — 换个头像，不改源码
  例：`https://.../mobile_avatar.html?avatar=https://models.readyplayer.me/68000xxx.glb?morphTargets=ARKit`
- `?action=<model.json URL>` — 换 LSTM 模型路径

## 手机上看到什么
左上角 HUD：
```
cam: ok · mp: ok            ← 摄像头 + MediaPipe 状态
avatar: ok · action: ok     ← 头像 + LSTM 模型状态
fps: 28 · frames: 5421      ← 推理帧率
last bs: eyeBlinkLeft,...    ← 当前激活的 blendshape
action: smile_big conf:0.91  ← LSTM 当前预测
```
右下角小窗：你的真实脸（自镜像）
中间：3D 头像跟着你动
做夸张表情（笑/惊讶/眨眼/张嘴 O/吐舌/皱眉/单眼眨）→ 屏幕中央喷 emoji + 周围粒子

## 拿到自己的 RPM 头像（30 秒）
1. 浏览器打开 https://readyplayer.me/avatar
2. From Photo / Pick a Template → 调外观 → Save
3. 点"Use" → 复制 URL 里那串 hex（如 `64bfa9f0e2c0e9d0a8a0a8b1`）
4. 在手机访问：
   `https://<host>/mobile_avatar.html?avatar=https://models.readyplayer.me/<你的ID>.glb?morphTargets=ARKit&textureAtlas=1024&pose=A`

## 已知坑
| 现象 | 原因 | 修法 |
|---|---|---|
| 点开始就报错 NotAllowed | 摄像头权限拒绝 | iPhone 设置 → Safari → 摄像头 → 询问/允许 |
| 头像加载到一半挂 | RPM CDN 偶尔 502 | 刷新页面 |
| MediaPipe 启动慢（5-10 秒） | 第一次下载 ~10MB WASM+model | 装到主屏（Add to Home Screen），缓存后秒开 |
| iOS < 16 Safari 兼容差 | importmap / WebGL2 / WASM threading | 升级到 iOS 16+ |
| action 显示 off | 没拷 models/ 或路径错 | 把 action_model 文件夹放到 mobile_avatar.html 同级 |
| 头像很小很远 | RPM 模型 origin 在脚下 | 已用 camera.position 调好，不行就改 .position.y |

## 相对原 iOS App 的优势（写报告用）
1. **零安装** — 不需要 Apple 开发者账号、Xcode、签名、TestFlight
2. **跨平台** — 同一 URL 在 Android / iPad / Mac / 老师的 Linux 上都跑
3. **可演示性** — Vercel 部署后给评卷老师一个永久链接 + 二维码
4. **更可信的 DL 闭环** — MediaPipe blendshape 提取在浏览器跑（同你训练数据的提取管线）→ 训练分布 = 部署分布，真正零域适配
5. **隐私** — getUserMedia 流不出浏览器 sandbox

## 创新点（终版，写报告 §1 / §8）
1. **On-device inference**：MediaPipe + Three.js + TFJS LSTM 全在手机浏览器跑，无后端。
2. **Hybrid continuous-discrete pipeline**：连续驱动层（52d 直驱 morph）+ 离散触发层（30 帧滑窗 LSTM 8-class）解耦。
3. **Same-pipeline train/deploy**：训练和部署都用 MediaPipe 抽 blendshape → 真正的域一致。
4. **Hybrid synthetic + real training**：4 类 RAVDESS（CC BY-NC-SA 4.0）真实驱动 + 4 类参数化合成。
5. **Zero install demo path**：单 HTML 文件 + 一个 URL，评卷老师二维码扫码即跑。
