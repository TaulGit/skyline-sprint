# 开发与验收记录

更新：2026-10-04。游戏 8537 已保存可试玩草稿；开发实现与场景优化已交付，尚未声称通过正式发布所需的全部真人验收。

## 预览白屏修复（2026-10-04）

星匣 dev 状态接口实际返回的 gameUrl 是 `http://127.0.0.1:7421/`，此前根入口引用 `/src/main.ts`，静态服务以 `application/octet-stream` 返回未经编译的 TypeScript，导致模块无法执行。此前只验证 dist 页面，未覆盖实际预览根入口。

现将 Vite 源入口移至 `app/index.html`，build 后自动同步编译后的 HTML 到根目录并设置 `./dist/` 资源基址。已核对平台前端通过 iframe src 直接加载上述 gameUrl；修复后的根入口在浏览器中正常显示菜单。平台外层在自动化内置浏览器中加载超时，因此未将此次验证表述为真实账号 SDK 全链路验收。已有预览页面点击“刷新游戏”即可加载修复。

## 已完成

| 范围 | 结果与证据 |
| --- | --- |
| 工程 | TypeScript 构建成功，依赖锁定，官方 IIFE SDK，storage / leaderboard 最小声明。 |
| 赛道 | 1125.219 m，899 个采样点、6 个顺序检查点与终点；S 弯、发卡弯、跳台、倾斜弯、竖直环道。 |
| 驾驶与流程 | 固定 120 Hz 悬挂物理，键盘 / 触屏输入，练习复位、暂停、重开、幽灵、分段差、设置与结算。 |
| 关键测试 | 17 项通过，见 `evidence/test-results.txt`；包括存档失败保护、CAS 最佳记录一致性、旧结算响应隔离。 |
| 整场物理回归 | 同一输入在 30 / 60 / 120 FPS 调度下均正式完赛 38.680 s，终点坐标完全一致，见 `drive-test.json`。此为自动驾驶回归基准，不是玩家奖牌定稿值。 |
| 美术 | 25 个 Tripo 原始候选，12 个运行资产含 LOD，独立轮胎节点，3 种配色，Blender 源及原生封面。 |
| 本轮场景优化 | 新增贴图浮岛基座、远景岛群、道路桁架 / 斜撑、边灯、箭头、接缝、环道外框与渐变天空。原赛道和物理哈希不变。 |
| 环境成本 | 新增环境 1,092,892 bytes、14,588 triangles，合并后 6 个材质绘制批次；见 `assets/environment-report.json`。 |
| 路线净空 | Blender 场景沿可行驶样本的 5 条横向采样线，4,445 次法向射线检查，路面上方 0.15–3.65 m 无装饰命中；见 `evidence/scenery-clearance.json`。这不等同于所有相机角度的目视验收。 |
| 平台配置 | preview 榜 `skyline_v1_time`，MIN / ASC，daily / weekly / fourweekly；check 通过，doctor 12 pass、0 warn、0 fail。 |
| CDN | 草稿上传后逐一读取所有 dist 相对资源和封面，HTTP 及 SHA-256 与本地一致性记录在 `evidence/cdn-check.json`。 |

赛道哈希：`2742d249dde822df1330e2b339ee931e137a47c958e979c0102980003690cbb3`。

## 浏览器观察的范围

本机 Windows / Codex 内置 Chromium，1280×720，标准画质、DPR 1.5。最终场景开始挑战附近的短时 300 帧窗口观察为约 109.7 FPS / p95 12.3 ms，63 次绘制、约 70,506 三角面；捕获的 console error 为空。硬件为 i5-12450H，系统包含 RTX 3050 Laptop / Intel UHD，未确认浏览器实际选择哪块 GPU。

上述只是短时画面和加载检查，不能代表整场平均性能，也不能替代 Chrome / Edge 独立浏览器、手机触控和平台 host 验收。

## 正式发布前仍需完成

1. 创作者在星匣 `/dev/preview` 中确认 SDK 握手与实际玩法；完整驾驶通过跳台、环道并冲线，重开 / 暂停 / 复位规则符合预期。
2. 两个真实账号各自授权和提交，检查较短用时靠前、慢成绩不覆盖窗口最佳、getMyValue / getTop 一致；跨周期、拒绝授权和延迟状态按实际平台验证。
3. 在平台保存最佳与设置后重新进入，验证云端回读和轨迹一致；本机模拟测试不能作为此项通过证据。
4. 在 Android Chrome、可取得的 iOS Safari，以及桌面 Chrome / Edge 记录完整圈的分辨率、画质、帧时间、双指操作和相机表现。当前未取得真机测试结果。
5. 由真实驾驶反馈定稿铜银金时间；冻结赛道 / 物理竞赛版本及正式榜配置。当前仍是 dev 版本，奖牌 65 / 80 / 100 秒为调校值。
6. 确认正式发布后配置 / 核对 live 榜并报名排行榜专项活动 3004。当前仅保存草稿，尚未正式发布或报名。

## 复现

```sh
npm ci
npm run build
npm test
npx tsx tools/drive-test.ts
star-letter check
star-letter doctor
star-letter dev --open
```

场景重建：用安装了 `bpy==4.2.0` 的 Python 执行 `tools/blender-environment.py`，再执行 `node tools/optimize-environment.mjs`，以及 `tools/check-scenery.py` 和 `tools/blender-cover.py`。这些步骤复用已有 Tripo 资产和贴图，不发生 Tripo API 扣费。

## 2026-10-04 封面、音频与操作更新

- 带标题复古海报封面已替换；主菜单、HUD、设置和结算文案精简。
- 两首用户提供的 Sky Flight 原文件顺序循环，设置支持切歌；6 个音效为 Kenney CC0 素材，音频解码信息见 evidence/audio-files.json。
- 修复方向键、WASD 与触控左右映射，车辆实际位移回归测试通过。
- npm test：20 项通过；npm run build：通过。CDN 44 个文件 HTTP 200、SHA256 与本地产物一致。
- 星匣 #8537 保持草稿。平台玩法、音量听感与移动端仍由创作者预览验收。

