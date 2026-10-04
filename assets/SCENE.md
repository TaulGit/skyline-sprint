# 场景资产说明

2026-10-04 场景升级复用原有 Tripo 候选，本轮新增 Tripo 付费任务为 0；累计账单仍为 1240 积分，逐任务见 COSTS.md。

- `source/selection.json`：Tripo 选型、比例、赛道采样位置与道路侧向偏移。
- `source/textures/basalt-albedo.png`：本轮 imagegen 生成的蓝灰玄武岩基色原图；作为 UV 岩壁贴图，经 WebP 压缩嵌入环境 GLB。没有把贴图烘焙进赛道碰撞。
- `blender/skyline-environment.blend`：完整可编辑场景，包含 Tripo 地标、岛屿、道路模型、支撑和导航细节。
- `blender/exports/environment.glb`：Blender 导出源；`public/assets/environment.glb` 为合并材质批次与压缩贴图后的运行文件。
- `environment-overview.png`：Blender 总览渲染，供检查地标与环道关系。
- `blender/cover.blend`：更新后的封面场景；根目录 `cover-final.png` 用于平台草稿。

装饰不参与车辆碰撞。赛道碰撞、检查点和回放规则仍由 tracks/skyline-v1 及 game/vehicle、game/race 决定。新环境用 6 个合并批次绘制，Tripo 独立模型继续使用两档 LOD 和距离剔除；源码保留对象供继续编辑。
