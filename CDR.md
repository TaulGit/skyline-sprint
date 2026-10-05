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

创作者已发布线上版本；本次仅保存更新草稿。已同步服务端锁定活动 #3004、screen=1 与免费买断配置（priceType=1、price=0）。本机测试、资源声明与榜单定义检查通过。草稿保存后，中央 capability preflight 已恢复通过，doctor 结果为 13 项通过、0 项失败。更新草稿版本为 17774，线上版本仍为 17665；详见 evidence/doctor.json 与 evidence/release-state-v5.json。

## 正式更新

创作者明确要求直接更新后，执行 `star-letter publish` 成功。线上版本从 #17665 切换为 #17774，草稿槽位清空；发布前 `check` 与 `doctor` 均通过。

## v6 复查

漂移参数调整后，新建 MIN/ASC 的 `skyline_v6_time` 榜并在正式版 #18717 中声明。提交代码只在有效完赛时调用官方 SDK，成功后使用 `getMyValue` 回读周榜；不能把资源预检等同于真实成绩写入。发布前 `doctor` 13 项通过，发布后中央预检又出现暂时异常，且 live 窗口列表为空，故真实榜单保存仍为待验证状态。

后续草稿 #18756 在正式发布时被中央预检阻断，诊断为 `LEADERBOARD_AVAILABILITY_UNAVAILABLE`；线上仍为 #18717。保留草稿待平台恢复后正常发布，不绕过预检。
