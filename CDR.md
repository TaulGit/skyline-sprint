# 能力设计评审

依据：官方 SDK 2.4.6、文档 rev23。检查日期：2026-10-04。

## storage

| 项目 | 结论 | 证据 |
| --- | --- | --- |
| S1 单值容量 | pass | `cloudRecord` 对 JSON UTF-8 实测，超过 192 KiB 移除云回放；成绩与轨迹仍为同一对象，本机保留完整回放。 |
| S2 key 数量 | pass | 每个竞赛版本固定一个 user key；不使用 game scope。 |
| S3 写入频率 | pass | 仅个人最佳更新、设置或选车确认触发；一次操作 get + CAS set，冲突仅重试一次。帧循环不请求平台。 |
| S4 scope | pass | 所有成绩与设置均为 user scope。 |
| S5 并发 | pass | ifVersion CAS，冲突重新读取；合并更快的完整最佳记录，不拼接轨迹。 |
| S6 韧性 | pass | 平台错误守卫；云端读失败不覆盖远端；本机备份与明确同步状态；账号变化丢弃旧在途响应。 |

## leaderboard

| 项目 | 结论 | 证据 |
| --- | --- | --- |
| 声明与资源 | pass | 游戏 8537，preview board `skyline_v5_time`，MIN/ASC，daily/weekly/fourweekly；与旧赛道/物理规则的榜隔离，doctor readiness 通过。 |
| 客户端成绩边界 | pass | 仅显示排行，不依据榜值发放资产或奖励。 |
| 幂等 | pass | 每次正式完整完赛一个 UUID；CAPABILITY_UNAVAILABLE 同会话同结算仅一次限次重试，ID 与 payload 固定。离开该结算取消待重试。 |
| 窗口与投影 | pass | 三种平台 view；READY/PENDING/DELAYED/EMPTY、TopK 外、拒绝授权和终态失败分别处理。未按本机日期生成窗口。 |
| 分类与存储 | pass | PLAYER_VALUE 数值用时；无 storage 自建全服榜。 |

## 验收边界

本报告覆盖实现设计、平台配置与模拟测试。两个真实账号的授权、完整驾驶提交、getMyValue/getTop、跨周期与真实设备验收仍需在平台完成；未将模拟测试当作真实榜单验收。正式发布前保留创作者最终确认。

## 本次发布边界

创作者已发布线上版本；本次仅保存更新草稿。已同步服务端锁定活动 #3004、screen=1 与免费买断配置（priceType=1、price=0）。本机测试、资源声明与榜单定义检查通过，但 doctor 的中央 capability preflight 返回异常；保留完整诊断于 evidence/doctor.json，正式更新前需平台预检恢复。
