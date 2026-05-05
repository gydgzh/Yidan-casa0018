# 修 "5 个 avatar 全是同一个形象" 的执行步骤

> **诊断**：`models/` 里 5 个 avatar 文件中 4 个 md5 完全一致：
> ```
> e90cde3e9a8659f4471dcf8d602791b6  avatar.glb            ← 唯一不同的
> afe3f5162167d139a3a9c62ffb6a406b  avatar_blonde.glb     ← 这 4 个
> afe3f5162167d139a3a9c62ffb6a406b  avatar_asian.glb       ←  全是
> afe3f5162167d139a3a9c62ffb6a406b  avatar_anime_boy.vrm   ← 同一份
> afe3f5162167d139a3a9c62ffb6a406b  avatar_anime_girl.vrm  ← 文件
> ```
> 之前的下载脚本 fallback 链有 bug 把同一个文件存了 4 个不同名。

---

## 一句话

把现在 4 个重复的 avatar 文件删掉,跑新版 `scripts/download_assets.sh`,它会用主备 URL 真正下不同文件,并在结尾跑 md5sum 自动校验。

## 步骤(本地 AI 执行,5 分钟)

```bash
DLL=/Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
cd "$DLL"

# === 1) 把 4 个重复文件删掉(保留唯一的 brunette / avatar.glb) ===
rm -f models/avatar_blonde.glb models/avatar_asian.glb \
      models/avatar_anime_boy.vrm models/avatar_anime_girl.vrm
rm -f web_avatar/public/models/avatar_blonde.glb \
      web_avatar/public/models/avatar_asian.glb \
      web_avatar/public/models/avatar_anime_boy.vrm \
      web_avatar/public/models/avatar_anime_girl.vrm \
      web_avatar/public/models/avatar.vrm \
      web_avatar/public/models/avatar_female.vrm \
      web_avatar/public/models/avatar_sample.vrm \
      web_avatar/public/models/avatar_vroid.vrm

# === 2) 跑新版下载脚本(自动校验 md5 互不相同) ===
bash scripts/download_assets.sh
# 末尾应看到:
#   ✓ 5 个唯一 hash,文件全是真不同的

# === 3) 手动二次确认 md5 全不同 ===
md5sum models/*.glb models/*.vrm 2>/dev/null || md5 -r models/*.glb models/*.vrm
# 5 行,5 个不同的 hash 才对

# === 4) 同步到 GitHub Pages 仓库(如果用) ===
PAGES=~/Yidan-casa0018
mkdir -p "$PAGES/models"
cp models/avatar.glb              "$PAGES/models/"
cp models/avatar_blonde.glb       "$PAGES/models/"
cp models/avatar_asian.glb        "$PAGES/models/"
cp models/avatar_anime_girl.vrm   "$PAGES/models/"
cp models/avatar_anime_boy.vrm    "$PAGES/models/"
md5sum "$PAGES/models/"avatar*    # 5 个不同 hash 才对

# 加 .gitattributes 防止 git 把二进制当文本破坏
ATTR="$PAGES/.gitattributes"; touch "$ATTR"
for ext in glb vrm bin task; do
  grep -qF "*.$ext binary" "$ATTR" || echo "*.$ext binary" >> "$ATTR"
done

cd "$PAGES"
git add .gitattributes models/
git commit -m "Fix duplicate avatar files: 5 truly distinct avatars"
git push

# === 5) 重启 HTTPS 静态服务让浏览器重新拉新文件 ===
cd "$DLL"
lsof -ti :8443 | xargs -r kill -9; sleep 1
npx --yes http-server . -S -C .certs/cert.pem -K .certs/key.pem -p 8443 -a 0.0.0.0 &

# === 6) 浏览器测试(强制刷新清缓存) ===
# Mac Chrome:    Cmd+Shift+R 在 https://localhost:8443/mobile_avatar.html
# Mac Safari:    同上,Cmd+Option+R
# 启动页选 5 个 avatar 各试一次,**形象应该真的不同**
```

## 预期结果

| 选了 | 应该看到 |
|---|---|
| Mira (brunette) | 棕发白人女 |
| Emma (blonde) | 金发白人女 |
| Ada (asian) | 亚裔黑发女 |
| Sakura (anime_girl) | 二次元女孩(VRM 风) |
| Kaito (anime_boy) | 二次元男孩(VRM 风) |
| Custom URL | 用户输入的 .glb/.vrm |

## 如果下载脚本最后那一步报"5 个里只有 N 个唯一 hash"

某个源被代理拦截/卡了。手动按下面命令补救:

```bash
# 看哪两个文件 hash 一样
md5sum models/avatar*

# 手动重下出问题的那个(例子)
rm models/avatar_anime_girl.vrm
curl -fL --retry 3 -o models/avatar_anime_girl.vrm \
  https://raw.githubusercontent.com/madjin/vrm-samples/master/vroid/fem_vroid.vrm
md5sum models/avatar_anime_girl.vrm   # 重新看,应该跟其他 4 个都不同了
```

## 为什么这次能信

1. 新脚本**主源用 raw.githubusercontent.com**(不是 jsdelivr),减少代理误转发
2. 每下完立即校验 magic bytes (`676c` = `glTF`) + 最小尺寸(GLB ≥ 100KB,VRM ≥ 500KB)
3. **末尾自动 md5sum** 5 个文件,有重复就 exit 1 退出
4. AVATAR_BANK 的 URL 链每个都加了**第三个 raw 源**,即便本地文件坏掉,运行时也会 fallback

## 跑完后贴回给远程 Claude

```
=== 1. 5 个 hash(必须不同) ===
md5sum models/*.glb models/*.vrm

=== 2. 5 个 file size ===
ls -lh models/*.glb models/*.vrm

=== 3. 5 个 avatar 各自的截图 ===
Mira / Emma / Ada / Sakura / Kaito 各自的 avatar 加载出来后的样子(切下拉测试)
```
