# 场景资产说明

2026-10-04 最新扩建新增 6 个 Tripo P1 模型，实际 240 积分；连同原有 1240 积分，累计 1480 积分。任务回执见 source/expansion-receipts.json。

- `source/selection.json`：Tripo 选型、比例、赛道采样位置与道路侧向偏移。
- `source/textures/basalt-albedo.png`：本轮 imagegen 生成的蓝灰玄武岩基色原图；作为 UV 岩壁贴图，经 WebP 压缩嵌入环境 GLB。没有把贴图烘焙进赛道碰撞。
- `blender/skyline-environment.blend`：完整可编辑场景，包含 Tripo 地标、岛屿、道路模型、支撑和导航细节。
- `blender/exports/environment.glb`：Blender 导出源；`public/assets/environment.glb` 为合并材质批次与压缩贴图后的运行文件。
- `environment-overview.png`：Blender 总览渲染，供检查地标与环道关系。
- `blender/cover.blend`：更新后的封面场景；根目录 `cover-poster.png` 用于平台草稿。

装饰不参与车辆碰撞。赛道碰撞、检查点和回放规则仍由 tracks/skyline-v1 及 game/vehicle、game/race 决定。新环境用 6 个合并批次绘制，Tripo 独立模型继续使用两档 LOD 和距离剔除；源码保留对象供继续编辑。

## 最新扩建

- `blender/endurance-coupe.blend`、`rally-buggy.blend`：玩家可选车型，统一轴向和尺寸，保留 Tripo 贴图并分离车轮。
- `blender/warning-sign.blend`：Tripo 标牌框架与 Blender 中文立体字；位于飞跃前约 30 m 和 10 m，面向来车。
- `blender/safety-barrier.blend`：发车区外侧模块围栏；物理护栏由 `src/game/rails.ts` 的连续圆顶断面生成，避免模型缝隙干扰驾驶。
- `blender/sky-airship.blend`、`sky-citadel.blend`：远景空艇、空中城，补充栏杆、港口桩和檐口。
- `blender/distant-observatory.blend`：Blender 制作的层叠平台、八座塔楼、窗格、金属栏杆、穹顶与天线。
- `source/textures/sky-city-panorama.png`、`sky-mountains-panorama.png`：imagegen 原图；压缩后作为球面天空的两段远景，以边缘渐隐消除接缝。
- `public/assets/models.json`：三款车型与扩建摆放参数，远景独立设置可见距离，近景继续使用 LOD。

运行原有模型优化脚本后，需再运行 `node tools/optimize-expansion.mjs` 恢复扩建清单。
