# Tripothon S1 参赛填写稿

按截图字段准备；中文和英文选一版填写即可。下方两版均在 60 / 100 / 60 / 2000 字符限制内。这里提供填写稿，尚未代为提交报名表。

## 中文版

### 项目名称（最多 60 字符）
云端极速 / Skyline Sprint

### 一句话简介（最多 100 字符）
在云海、浮岛与空中城之间飞驰，用一圈时间把日常留在身后。

### 这份礼物送给（最多 60 字符）
每个忙碌一天后，仍想给自己留一圈自由的人。

### 项目介绍（最多 2000 字符）
《云端极速》是一份送给忙碌生活中那个“还想再跑一圈”的自己的礼物。我想把只存在于想象中的空中赛道变成可以亲自驾驶的世界：路在云上延伸，浮岛之间有飞跃，远处是空中城、观测塔和缓缓悬浮的飞艇。

这是一款可在浏览器中游玩的 3D 单人计时赛车游戏。玩家可以选择三款外观不同、性能一致的赛车，挑战约 1.13 公里的原创赛道，依次通过六个检查点，驶过 S 弯、跨岛跳台与竖直环道。转弯时按刹车可以轻度漂移，轮胎会留下痕迹；完成一圈后，可以与自己的最佳成绩和幽灵车比较，再试一次。界面支持中文和英文切换，兼容键盘与触屏操作。

Tripo 是这个世界的重要制作工具。我用它生成赛车、浮岛、能源装置、空中城、飞艇、警示牌和护栏等 3D 资产，再在 Blender 中整理尺寸与朝向、分离车轮、补充建筑细节，并在游戏中叠加可切换的中文/英文减速提示。模型经过贴图压缩和远近细节处理后接入 Three.js，车辆使用 Rapier 四轮射线悬挂；两幅远景图让云海和山峦延伸到赛道之外。

我希望这份礼物是一条随时可以重新出发的路：玩家可以认真追逐自己的最佳纪录，也可以在云海里放松地跑完一圈。游戏已在星匣发布，源代码、Blender 文件和 Tripo 制作记录已在 GitHub 公开。

## English version

### Project name (60 characters maximum)
Skyline Sprint

### One-line description (100 characters maximum)
A sky-high time trial through floating islands: one lap of freedom above everyday life.

### A gift for (60 characters maximum)
Anyone who needs one lap of freedom after a long day.

### Project description (2000 characters maximum)
Skyline Sprint is a gift for the part of us that still wants “one more lap” after a busy day. I wanted to turn an imaginary sky racetrack into a place you can drive through: roads above the clouds, jumps between floating islands, and distant sky cities, observatories and airships.

This browser-based 3D time trial offers three visually distinct cars with identical performance. Race along an original 1.13 km course, pass six checkpoints, and tackle S-bends, an island jump and a vertical loop. Brake while turning for a gentle drift and leave tire marks on the road. Then chase your personal best and recorded ghost. The interface switches between Chinese and English, with keyboard and touch controls.

Tripo is central to the asset workflow. I used it to generate cars, floating islands, energy structures, a sky citadel, an airship, warning signs and barriers. In Blender, I standardized scale and orientation, separated wheels, refined architectural details and built additional scenery. Clear localized warning labels, compressed textures and distance-based detail levels bring these assets into a playable Three.js world. Rapier handles the four-wheel raycast suspension, while two panoramic paintings extend the cloudscape beyond the track.

The gift is a road you can return to. Chase your previous best, or simply enjoy a lap above the clouds and keep a little freedom in your day. The game is published on Star-letter. Source code, editable Blender files and Tripo production records are public on GitHub.

## 两版通用选项

- 方向赛道：游戏 / Games
- 工具赛道：Tripo（其余截图里的工具未用于本项目，不勾选）
- 使用的工具：逐项输入，每项回车添加。

```text
Tripo
Blender
Three.js
Rapier
TypeScript
Vite
OpenAI Codex
OpenAI Image Generation
Suno
```

Suno 用于创作者提供的两首 Sky Flight BGM。其他音效来源与授权见 `assets/AUDIO_LICENSES.md`。

## 可附的项目资料

- GitHub：https://github.com/TaulGit/skyline-sprint
- 制作说明：`assets/SCENE.md`
- Tripo 提示词和种子：`assets/source/expansion-plan.json`
- Tripo 任务回执：`assets/source/expansion-receipts.json`
- 可编辑 Blender 文件：`assets/blender/`（Git LFS）
- 游玩链接：填写星匣正式游戏页链接，不填写带本机端口和临时 token 的 `/dev/preview` 链接。

表单要求的游戏画面、演示视频和正式游玩链接应使用最终发布版本；本稿没有声称已经完成赛事提交。
