# 云端极速 · Skyline Sprint

[English README](README_EN.md) · [Tripothon 参赛填写稿 / Submission copy](TRIPOTHON_SUBMISSION.md)

![云端极速封面](cover-poster.png)

一款单人 3D 计时赛车游戏。沿约 1.13 km 的云端赛道依次穿过 6 个检查点，飞跃断桥，驶过竖直环道，挑战自己的最佳成绩与幽灵车。

## 玩法

- 四轮射线悬挂与固定 120 Hz 物理模拟；转弯时按刹车可以漂移，车轮接地点会留下痕迹。
- 三款可选赛车：流光、赤隼、逐风；性能一致，选择自动保存。
- 圆顶连续护栏与侧向缓冲，跳台前两处“请减速”提示。
- Tripo 空中城、空艇和赛道道具，Blender 精修建筑，双幅远景背景。
- 跳台、倾斜高速弯、竖直环道，以及计时、分段和金银铜目标。
- 本机可练习；在星匣预览中可使用云端存档与排行榜。
- 两首 Sky Flight 背景音乐轮播，设置中可切歌。

| 操作 | 键盘 | 触屏 |
| --- | --- | --- |
| 加速 | W / ↑ | ↑ |
| 刹车、低速倒车 | S / ↓ | ↓ |
| 转向 | A D / ← → | ◀ ▶ |
| 漂移 | 行驶中转向，同时按 S / ↓ | 转向同时按 ↓ |
| 手刹 | Space | 手刹 |
| 重开 / 练习复位 | R 或 Enter / C | 画面按钮 / 设置 |
| 设置 | Esc | 画面按钮 |

按顺序通过所有检查点才能记录正式成绩。暂停、失焦或练习复位会将当局转为练习。

## 本地运行

需要 Node.js、npm；如果要编辑 Blender 源文件，再安装 Git LFS 和 Blender。

```sh
git clone https://github.com/TaulGit/skyline-sprint.git
cd skyline-sprint
npm ci
npm run dev
```

Vite 开发页可体验本机模式。修改源码后可运行：

```sh
npm test
npm run build
npx tsx tools/drive-test.ts
```

`npm run build` 会烘焙赛道、类型检查、构建 `dist/`，并生成星匣本地预览需要的根目录 `index.html`。有星匣 CLI 和创作者权限时，运行 `star-letter dev --open` 打开平台预览；上传更新使用 `star-letter publish --draft`。星匣游戏 #8537 已由创作者发布；本次改动上传为更新草稿，正式更新由创作者发布。

获取可编辑的 Blender 场景和原始导出模型：

```sh
git lfs install
git lfs pull
```

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `src/game/` | 车辆物理、输入、计时和回放 |
| `src/scene/` | Three.js 场景、相机与轮胎痕迹 |
| `src/platform/` | 星匣存档与排行榜 |
| `tracks/skyline-v1/` | 赛道设计与烘焙数据 |
| `public/assets/` | 游戏运行时模型、音频与赛道 |
| `assets/blender/` | 可编辑场景和模型源文件（Git LFS） |
| `tools/` | 构建、音频转换与验证脚本 |

当前赛道规则 `skyline-v1.1.0-dev`、物理规则 `raycast-120-v5-dev` 对应独立的预览榜 `skyline_v5_time`，避免与旧规则的成绩混排。六道检查点按路线顺序设置；漏点后冲线会显示练习完赛，不计排行榜。排行榜仅作展示；正式发布前的验收范围见 [ACCEPTANCE.md](ACCEPTANCE.md) 和 [CDR.md](CDR.md)。

## 素材来源

赛车声使用 [qubodup 的真实发动机录音](https://opengameart.org/content/car-engine-loop-96khz-4s)（CC BY 3.0，已在 [音频来源](assets/AUDIO_LICENSES.md) 署名并说明修改）；其他音效来自 [Kenney](https://kenney.nl/) 的 CC0 素材。两首 Sky Flight 音乐由创作者提供，不属于这些开放音效许可。封面、场景及模型源文件随仓库保存，详情见 [场景资料](assets/SCENE.md)。

## Tripo 与 Blender 制作记录

新增 6 个 Tripo P1 模型：耐力原型车、拉力赛车、警示牌、模块护栏、空艇、空中城；本轮实际消耗 240 积分。原有 25 个任务累计 1240 积分，项目合计 1480 积分。提示词、种子及任务回执分别保存在 `assets/source/expansion-plan.json` 和 `assets/source/expansion-receipts.json`。

`tools/blender-expansion.py` 统一模型尺寸和朝向、分离车轮、制作中文标牌，并搭建带窗格、阳台与穹顶的观测城。`tools/optimize-expansion.mjs` 输出 WebP 贴图 GLB、LOD 与运行时清单。可编辑 `.blend` 与原始导出在 Git LFS 中；两幅背景图经压缩后保存在 `public/assets/sky-*.webp`。

最近回归：31 项自动测试通过；左右护栏 90/180/252 km/h 擦碰不弹飞；30/60/120 FPS 的完整赛道模拟均为 39.904 秒。

## 中英双语与驾驶修正

首页右上角可以切换 English / 中文；设置也有语言选项，选择保存在本机和云端设置中。菜单、HUD、结算、排行榜、操作说明与减速牌均可切换。

刹车漂移进一步减弱，保留轻微转向增益。观测城移出弯道；构建前会按运行时模型的实际包围盒与摆放，检查整个赛道的行车空间，避免远景建筑遮住另一段路。布局修正保存于 `assets/source/layout-overrides.json`。
