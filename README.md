# 云端极速 / Skyline Sprint

原创单人 3D 计时赛车。TypeScript、Three.js、Rapier，固定 120 Hz 四轮射线悬挂，约 1.13 km 云端赛道、跨岛跳台、竖直环道及 6 个顺序检查点。

## 开发

克隆仓库后先安装 Git LFS 并运行 `git lfs pull`，以取回 Blender 源文件和原始导出模型；运行游戏所需的压缩模型与音乐直接保存在 `public/assets/`。

```sh
npm ci
npm run dev
npm run build
npm test
npx tsx tools/drive-test.ts
star-letter dev --open
```

星匣清单使用 `gameFile: ./dist`，修改后先 build 再打开平台预览。普通本机页面可练习，平台存档和排行榜需在星匣 host 中运行。SDK 2.4.5 rev21 文档核对，运行时官方 v2 IIFE。依赖精确版本记录在 package-lock.json。

Vite 源入口是 `app/index.html`。根目录 `index.html` 是 `npm run build` 自动生成的星匣静态预览入口，使用 `dist/` 作为资源基址；不要手动将其改成直接加载 `.ts`。星匣静态服务不执行 Vite 编译，修改源码后必须重新 build。

## 操作

W / ↑ 加速，S / ↓ 刹车、低速倒车，A D / ← → 转向，Space 手刹。R / Enter 重新挑战；C 检查点练习复位；Esc 暂停设置。触屏支持同时转向和加速。设置含自动油门、低晃动、音量、幽灵和画质；三种配色性能一致。

暂停、失焦、后台、严重模拟积压、复位或异常状态使本局变成练习，不上正式榜。正式成绩只来自连续通过全部有方向有限门面的完整比赛。排行榜仅用于展示，平台信任级别 CLIENT_REPORTED。

## 资产与赛道

- `tracks/skyline-v1/design.json`：赛道参数；`npm run bake` 烘焙固定中心线、检查点、初值与校验和。
- `tools/blender-track.py`：生成可编辑赛道和碰撞源、GLB。
- `tools/blender-assets.py`：候选选型、赛车尺寸朝向修整、独立轮胎节点和各资产 Blender 源。
- `tools/optimize-assets.mjs`：纹理压缩与 LOD；运行 `node tools/optimize-assets.mjs`。
- `tools/blender-cover.py`：可编辑原生 3D 封面。
- `tools/blender-environment.py`：组合 Tripo 地标、贴图浮岛、桁架、路标与环道外框，保留完整 `.blend`。
- `tools/optimize-environment.mjs`：将环境压缩为 6 个绘制批次；`tools/check-scenery.py` 检查驾驶通道净空。
- `assets/source/`：25 个原始候选、提示词、种子、任务账单、选型；不需要重新生成即可重建。
- `assets/blender/`：各 `.blend` 与导出源。
- `public/assets/`：随 dist 上传的运行资源。

本机 Blender GUI 可执行文件存在 Windows SxS 启动问题；已用官方 PyPI `bpy==4.2.0` 成功生成源文件及渲染。可在正常 Blender 中直接运行以上 Python 脚本；或使用已配置的 Python 3.11：`C:/Users/mi/AppData/Local/SkylineTools/blender-4.2.5-windows-x64/4.2/python/bin/python.exe`。脚本要求 `bpy`，无需重新调用付费生成。

音效采用 Kenney 赛车和界面音效素材，首次交互后启动；不使用程序合成。BGM 使用用户提供的两首 Sky Flight，顺序循环，可在设置中切换。完整来源、许可和转换方式见 [音频说明](assets/AUDIO_LICENSES.md)。当前封面为 `cover-poster.png`，采用复古赛车海报风格。

## 版本与发布

预览游戏 ID：8537。稳定榜码：`skyline_v1_time`，MIN/ASC，日/周/28 天周期。正式发布前需完成平台与真机验收，详见 `ACCEPTANCE.md` 和 `CDR.md`。当前竞赛版本带 dev 后缀，在冻结赛道和物理后再建立正式竞赛版本；后续改变赛道/物理必须隔离旧榜和旧回放。

```sh
star-letter check
star-letter doctor
star-letter publish --draft
```

只有创作者确认玩法与平台验收后才执行不带 `--draft` 的正式发布。

本轮场景优化、贴图来源与资源预算见 `assets/SCENE.md`；完成范围及待验证项见 `ACCEPTANCE.md`。
