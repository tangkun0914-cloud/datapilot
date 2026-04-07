# DataOps 异常影响评估与协同中心 - 软件设计文档 (SDD)

> **版本：** V1.0 (聚焦失败/延迟场景)
> **更新时间：** 2026-04-06
> **前置依赖：** [DataOps异常影响评估_失败延迟场景_PRD.md](./DataOps异常影响评估_失败延迟场景_PRD.md)

## 1. 技术栈选型 (Tech Stack)

继承全局技术栈规范，不引入新的框架级依赖：

| 层 | 选型 | 版本 | 说明 |
|----|------|------|------|
| 前端框架 | Vue 3 | 3.5+ | Composition API + `<script setup>` |
| UI 组件库 | Ant Design Vue | 4.x | 基础 UI（Drawer、Tabs、Tag、Table、Button 等） |
| CSS 方案 | Tailwind CSS 4 + scoped style | - | Tailwind 做布局，scoped 做组件细节样式 |
| 图可视化 | **AntV G6** | **4.x** | 沿用 `LineageTab.vue` 的技术选型，渲染 DAG 拓扑图 |
| 状态管理 | Pinia | 3.x | 按需使用（如跨组件共享评估面板状态） |
| HTTP | Axios | - | 封装在 `src/services/request.js` |

### 1.1 全局展示规范

为保证数据运维信息的一致性，在所有影响评估相关组件中，必须遵守以下规范：
1. **任务名格式**：展示为完整任务名（如 `dim_df_recall_strategy_flow_node_variable`），使用等宽字体 `.font-mono`。
2. **负责人格式**：展示为 `姓名(邮箱前缀)`（如 `张三(zhangsan)`）。
3. **状态色映射**：严格遵守 PRD **3.1** 节定义的节点状态-颜色规则。

### 1.2 告警事件状态（列表与影响评估顶部一致）

**事件状态**指告警生命周期状态（与拓扑节点 `impactStatus`、实例 `status` 不同维度）。

- **单一数据源**：告警事件列表（如 `AlertCard` + `AlertStatusBadge`）与 **影响评估**（`ImpactAssessmentDrawer` 等）顶部展示的「事件状态」，必须来自**同一条告警对象上的同一字段**，推荐字段名为 **`status`**（与列表 Mock/API 一致）。
- **枚举与展示对齐**：取值须与列表侧一致（如 `firing`、`acked`、`resolved`、`silenced`、`falsePositive` 等，以后端契约为准）；**中文标签、Tag 颜色、图标**须与列表共用**同一套映射**（同一组件或同一工具函数），禁止在影响评估内单独写一套文案或误用 `severity` 代替事件状态。
- **入口传参**：从列表或详情打开影响评估时，须传入与当前行一致的 **告警快照**（含 `id`、`status` 等），避免仅按 `eventId` 拉数导致与列表展示漂移。

### 1.3 能力边界（与 PRD 1.3 对齐）

| 告警来源 | 拓扑数据源 | 拓扑方向 | 是否向上游追溯 DQC | Tab 2「全局影响清单」粒度 |
|----------|-----------|----------|-------------------|-------------------------|
| 数据开发 / 数据集成 | **DolphinScheduler 调度依赖** | 仅**下游**（当前告警任务为根） | **否** | **任务实例**（含实例 ID、批次等，后端下发） |
| 质量监控（DQC） | **DolphinScheduler 调度依赖**（映射机制：DQC 告警关联数据表 → 找到该表对应的调度任务 → 以该调度任务为根展开下游） | 下游影响 + 当前 DQC 节点可高亮 | 不适用（当前主体即为 DQC） | **任务实例**（含实例 ID、批次等，后端下发） |

接口层必须在响应中携带 **`alertSource`** 或等价字段（如 `source === '质量监控'`），供前端切换相关逻辑；**禁止**在开发/集成类告警的拓扑响应中拼接「上游 DQC 根因节点」以满足旧版追溯需求。

---

## 2. 目录结构规范 (Directory Structure)

遵循 Domain-Driven 目录隔离规范：**L1 监控运维** 对应 `src/pages/Monitoring/`；**L2 影响评估** 对应其子目录 `ImpactAssessment/`；其下 Vue 文件均为 **L3 业务组件**。

```text
src/
├── pages/
│   └── Monitoring/                         # L1 领域：监控运维
│       ├── AlertList/
│       │   ├── index.vue                     # [改造] 增加 ImpactAssessmentDrawer 引用与 open 控制
│       │   └── AlertCard.vue                 # [改造] 按钮组增加 [影响评估] 入口
│       ├── AlertDetail/
│       │   └── AlertDetailDrawer.vue         # [改造] header 增加 [影响评估] 按钮
│       └── ImpactAssessment/                 # ★ L2「影响评估」模块代码目录（隶属 L1 监控运维）
│           ├── ImpactAssessmentDrawer.vue    # L3 - 90% 宽度战情室抽屉壳（含面板折叠/收起逻辑）
│           ├── TopologyCanvas.vue            # L3 - G6 拓扑图画布区（逐层展开 +/- 交互）
│           ├── AssessmentPanel.vue           # L3 - 右侧评估面板区（AI 总结 + Tabs + ActionBar）
│           ├── components/
│           │   ├── CanvasToolbar.vue          # L3 - 画布工具栏（仅看核心链路、缩放、适应视图、图例）
│           │   ├── StatsAndSLA.vue            # L3 - Tab1: 统计评估与 SLA 破线判定
│           │   ├── GlobalImpactList.vue       # L3 - Tab2: 全局影响清单
│           │   ├── ErrorLogViewer.vue          # L3 - Tab3: 日志详情
│           │   ├── ActionBar.vue              # L3 - 底部操作条（组合于 AssessmentPanel）
│           │   └── CreateGroupModal.vue       # L3 - ★ [新增] 一键拉群成员确认弹窗
│           └── Demo.vue                      # [保留] 场景/原型 Demo 页面
├── services/
│   └── Monitoring/
│       ├── monitoringService.js              # [现有] 告警相关 API
│       └── impactService.js                  # ★ [新增] 影响评估 API 封装
├── mock/
│   └── Monitoring/
│       ├── monitoring.js                     # [现有] 告警 mock 数据
│       └── impactAssessment.js               # ★ [新增] 影响评估 mock 数据
└── router/
    └── index.js                              # [无需修改] 影响评估以 Drawer 承载，无独立路由
```

---

## 3. 业务模块化拆解 (L1 监控运维 / L2 影响评估 / L3 业务组件)

> **约定**：**L1 = 监控运维**（领域）；**L2 = 影响评估**（该领域下的一个业务模块）；**L3 = 影响评估模块内拆解的业务组件**（含抽屉壳、画布、面板及其子块）。不在此把 `TopologyCanvas` 与 `影响评估` 并列为两级 L2。

### L1 领域级：监控运维 (Monitoring)

- **对应路径**：`src/pages/Monitoring/`（及 `services/Monitoring/`、`mock/Monitoring/`）。
- **本 SDD 相关能力**：告警事件列表、告警详情抽屉、通知策略等；**影响评估**从告警列表/详情**入口进入**，仍归属本 L1 域。
- **说明**：L1 不是某一个 Vue 文件，而是**业务域边界**；具体页面由路由与 `AppLayout` 挂载。

### L2 模块级：影响评估 (Impact Assessment)

- **定位**：监控运维下，面向「单告警节点下游影响评估 + 协同」的**独立业务模块**。
- **入口**：告警列表 `AlertCard`、告警详情 `AlertDetailDrawer` 上的「影响评估」操作；打开后进入 **L3 `ImpactAssessmentDrawer`** 承载的战情室。
- **职责**：编排拓扑数据展示、影响面统计、日志与一键拉群等闭环；**所有 L3 业务组件均隶属于本 L2**。

### L3 业务组件级（隶属 L2 影响评估）

| 组件 | 文件 | 组合关系 | 职责 |
|------|------|----------|------|
| **ImpactAssessmentDrawer** | `ImpactAssessmentDrawer.vue` | 战情室根容器 | `a-drawer` 宽 `90vw`，左 70% / 右 30%；Props：`open`、`alert`、`mode`（`'active'` \| `'snapshot'`）；Events：`close`。页面右上角放置【刷新】按钮（仅 active 模式展示） |
| **TopologyCanvas** | `TopologyCanvas.vue` | 由 Drawer 左侧挂载 | G6 画布，`topologyData`；缩放/平移/折叠展开/节点点击 |
| **CanvasToolbar** | `components/CanvasToolbar.vue` | 组合于 TopologyCanvas | 【仅看核心链路】开关、缩放、适应视图、图例（【刷新】按钮位于页面右上角，非画布工具栏） |
| **AssessmentPanel** | `AssessmentPanel.vue` | 由 Drawer 右侧挂载 | AI 总结 + 3 个 Tab + 底部操作区；支持折叠/收起；`summaryData`、`alert` |
| **StatsAndSLA** | `components/StatsAndSLA.vue` | 组合于 AssessmentPanel Tab1 | 统计（基于全量下游数据，受影响实例总数/核心实例数）、受影响负责人、SLA 破线判定（仅展示已破线任务） |
| **GlobalImpactList** | `components/GlobalImpactList.vue` | 组合于 AssessmentPanel Tab2 | 所有告警类型统一展示下游任务实例清单（全量数据，不依赖画布展开状态），每页 100 条分页；支持 **任务名搜索**（`taskName` 子串、忽略大小写）与 **「仅看核心任务」**开关（组合为 AND）；列表卡片展示当前状态 Tag；点击行联动拓扑高亮 |
| **ErrorLogViewer** | `components/ErrorLogViewer.vue` | 组合于 AssessmentPanel Tab3 | 当前告警节点日志摘要（与详情抽屉复用同一接口）；点击画布节点时联动展示该节点日志；未运行/依赖等待状态节点展示空白 |
| **ActionBar** | `components/ActionBar.vue` | 组合于 AssessmentPanel 底部 | 一键拉群（本期可用）；挂起/重跑/置成功（后期置灰 + Tooltip） |
| **CreateGroupModal** | `components/CreateGroupModal.vue` | 由 ActionBar 触发 | 一键拉群成员确认弹窗（群名称、成员勾选、确认/取消） |

### 组件层级关系图（L1 → L2 → L3）

```
监控运维 (L1)
└── 影响评估 (L2)
    └── ImpactAssessmentDrawer (L3, Props: mode='active'|'snapshot')
        ├── [页面右上角] 刷新按钮（仅 active 模式）
        ├── [顶部 Banner]（仅 snapshot 模式：「您正在查看历史影响评估快照...」）
        ├── AlertInfoCard (告警信息卡片，左侧上方)
        ├── TopologyCanvas (L3，左侧下方)
        │   ├── CanvasToolbar (L3)（snapshot 模式下隐藏刷新，保留核心链路开关）
        │   └── G6 Canvas DOM (ref)
        └── AssessmentPanel (L3，右侧，支持折叠/收起)
            ├── AISummaryCard (AI 智能分析总结)
            ├── StatsAndSLA (L3, Tab1 - 统计评估与 SLA 破线判定)
            ├── GlobalImpactList (L3, Tab2 - 全局影响清单，每页100条，任务名搜索 + 仅看核心任务)
            ├── ErrorLogViewer (L3, Tab3 - 日志详情，未运行节点展示空白)
            ├── ActionBar (L3)（snapshot 模式下隐藏所有按钮）
            └── CreateGroupModal (L3, 一键拉群弹窗，含 Step 0 去重检查)
```

### 关键组件实现要点

#### ImpactAssessmentDrawer 模式切换与页面级刷新

- **模式 Prop**：`mode` 取值 `'active'`（活跃战情室）或 `'snapshot'`（历史快照只读）。
- **页面右上角刷新按钮**（仅 `active` 模式展示）：
  - 点击后并行重新调用 `getNodeChildren`（对已展开节点）+ `getImpactSummary`，更新画布节点状态与右侧面板数据。
  - 战情室打开期间**不自动轮询**，所有数据刷新由用户主动触发。
- **快照模式**（`mode === 'snapshot'`）：
  - 数据源：调用 `getSnapshot(eventId)` 一次性获取全量快照数据。
  - 顶部展示 Banner：「您正在查看历史影响评估快照，数据截止于 {snapshotTime}」。
  - 画布仍支持逐层展开浏览（+/−），但数据来自快照。
  - 工具栏：隐藏【刷新】按钮，**保留**【仅看核心链路】开关（基于快照数据穿透）。
  - ActionBar：所有按钮隐藏，不支持任何操作。
  - 由于后端预计算机制，快照始终存在（`exists` 恒为 `true`）。

#### AssessmentPanel 面板折叠/收起

- **默认状态**：左 70% + 右 30% 分栏布局，使用 CSS `flex` 或 `grid` 实现。
- **折叠触发**：面板顶部「◀ 收起」按钮，`panelCollapsed` ref 控制。
- **折叠态**：面板宽度过渡为 `40px` 图标条（`transition: width 0.3s ease`），仅展示「▶」展开图标。
- **画布联动**：`watch(panelCollapsed)` → 调用 G6 实例 `graph.fitView()` 适应新宽度。

#### AISummaryCard AI 生成策略与加载降级

**AI 分析生成策略（与 PRD 4.2 对齐）**：
- **触发时机**：告警产生时即由后端异步触发 AI 预计算，结果落库持久化。前端打开战情室时优先读取已有结果。
- **去重机制**：以 `alertId` 为维度，同一告警同时只有一个 AI 分析作业在执行，其他请求等待同一结果。
- **缓存策略**：AI 分析结果一旦生成即永久生效，**V1.0 不支持重新生成**。

**前端加载与降级**：
1. 打开战情室时发起 `getAiAnalysis(eventId)` 请求。若已预计算完成（`status === 'ready'`），直接展示内容。
2. 若仍在计算中（`status === 'loading'`），卡片显示「AI 分析生成中...」+ 骨架屏动画，前端自动轮询（`setInterval` 每 3 秒）。
3. 超过 30 秒（计 10 次轮询）仍为 `loading`，显示「AI 分析暂时不可用」（不提供重新生成按钮）。
4. AI 模块不可用**不阻塞**其他数据正常展示（统计、SLA、影响清单均独立加载）。
5. 组件 `onUnmounted` 时清除轮询 `clearInterval`，防止内存泄漏。

#### CreateGroupModal 一键拉群弹窗

- **Props**：`open`（控制弹窗显隐）、`alert`（当前告警快照）、`ownerMatrix`（人员责任矩阵）。
- **Events**：`confirm(payload)`、`cancel`。
- **Step 0 去重检查**：点击「一键拉群」时，先检查当前告警是否已创建过应急群（通过 `checkWarRoomExists(eventId)` 或 `createWarRoom` 接口返回 `alreadyExists`）。若已创建 → Toast 提示「当前告警已创建应急群，请勿重复创建」，流程终止，**不弹出弹窗**。
- **弹窗内容**（首次创建时弹出）：
  - 群名称：自动生成（格式 `【故障应急】{告警等级} {任务名} {监控事件}`，如 `【故障应急】ERROR dwd_fund_df_repayment 运行失败`），支持手动编辑。
  - 成员列表：从 `ownerMatrix` 提取，`a-checkbox-group` 渲染，默认全选，支持勾选/取消。
  - 底部按钮：「取消」+ 「确认创建」。
- **确认流程**：点击确认 → 按钮 loading → 调用 `createWarRoom()` → 成功 Toast + 群链接（可点击跳转到企业微信） / 失败 Toast + 按钮恢复。
- **V1.0 仅对接企业微信**。

---

## 4. G6 拓扑图实现要点 (Topology Rendering)

### 4.1 自定义节点注册

参考现有 `LineageTab.vue` 中 `G6.registerNode('table-card-node', ...)` 的实现模式，新增以下自定义节点：

**`impact-task-node`（任务卡片节点）**

```js
G6.registerNode('impact-task-node', {
  draw(cfg, group) {
    // 尺寸：260 x 120（较旧版增大，容纳更多信息）
    //
    // ┌──────────────────────────────────────────────┐
    // │ [异常/超时]              [核心任务] [SLA破线]  │  ← 顶区：状态标签 + 标识标签
    // │ dwd_fund_df_repayment                        │  ← 任务名（font-mono，过长省略，悬浮展示完整名称）
    // │ 开始：08:23  结束：08:25                      │  ← 开始/结束时间
    // │ 👤 马殿林(madianlin)                         │  ← 负责人
    // └──────────────────────────────────────────────┘
    //
    // 左侧边框色根据 cfg.impactStatus 映射（见 4.2 节）
    // 根因高亮(cfg.isRootCause=true)：仅 DQC 告警下用于强调「当前质量任务节点」；开发/集成告警不应置位
    // 污染节点(cfg.isPolluted=true)：在底部标签区域绘制紫色「☣ 可能污染」标签（仅 DQC WARN 下游），不影响顶栏主状态
    // 核心任务(cfg.isCore=true)：展示「核心任务」标签
    // SLA 风险(cfg.slaRiskType)：展示对应 SLA 风险标签（双重破线/启动破线/完成破线）
    //
    // 逐层展开控件：
    // - 节点右侧显示「+」控件（当 cfg.hasChildren=true 且子节点未展开时）
    // - 展开后切换为「−」控件（点击隐藏该节点延伸出的所有下游子图）
  },
  // ... getAnchorPoints, setState 等
})
```

> **V1.0 不使用折叠占位节点**：旧版 `impact-collapse-node`（`[+N 层, M 个任务]`）方案已废弃。V1.0 采用逐层展开（+/- 控件），不存在折叠占位节点。该节点类型保留为后续「智能折叠穿透」版本的桩。

### 4.2 状态-颜色映射表（五色图例统一体系）

> **图例为分类汇总，卡片顶栏为具体状态文案**。同一颜色组下，卡片可出现多种具体文案。

#### 图例（DAG 画布右上角）

| 颜色 | 色值 | 图例文案 |
|------|------|---------|
| 绿 | `#52C41A` | 执行成功 |
| 红 | `#FF4D4F` | 失败/停止 |
| 橙 | `#FA8C16` | 运行/排队 |
| 蓝 | `#1890FF` | 其他状态 |
| 灰 | `#8c8c8c` | 未生成 |

#### 主状态映射（impactStatus → 顶栏颜色 + 卡片文案）

| impactStatus 值 | 顶栏色 | 卡片文案 | 图例归属 | 说明 |
|-----------------|--------|---------|---------|------|
| `success` | `#52C41A` | 成功 | 执行成功 | 任务已正常完成 |
| `failed` | `#FF4D4F` | 已失败 | 失败/停止 | 任务运行失败；**DQC「运行失败」根**可用 `statusColor: #A8071A` 加深 |
| `timeout` | `#FF4D4F` | 已超时 | 失败/停止 | 运行超时 |
| `stopped` | `#FF4D4F` | 已停止 | 失败/停止 | 任务被停止 |
| `running` | `#FA8C16` | 运行中 | 运行/排队 | 正在执行中 |
| `waiting` | `#FA8C16` | 依赖等待 | 运行/排队 | 依赖未就绪（开发/集成/DQC Error 强阻断均用此态） |
| `delayed` | `#FA8C16` | 排队中 | 运行/排队 | 排队等待调度资源 |
| `other` | `#1890FF` | 串行等待 | 其他状态 | 串行等待等特殊场景 |
| `pending` | `#8c8c8c` | 未运行 | 未生成 | 尚未触发调度 |
| `not_generated` | `#8c8c8c` | 未生成 | 未生成 | 下游尚未生成实例 |
| `dqc_threshold` | `#FF4D4F` | 阈值异常 | 失败/停止 | **触发异常阈值**且执行已成功：顶栏告警红；图标 `！` |

#### 附加标签字段（非主状态，不影响顶栏颜色）

| 字段 | 类型 | 视觉 | 说明 |
|------|------|------|------|
| `isPolluted: true` | `boolean` | 紫色底部标签 `☣ 可能污染`（`fill: #F9F0FF`, `stroke: #D3ADF7`, `color: #722ED1`） | 仅 DQC WARN 下游节点为 `true`；顶栏仍展示真实物理运行状态（success/running/waiting 等），污染仅作为附加标签展示 |
| `isCore: true` | `boolean` | 蓝色底部标签 `核心任务` | 核心任务标记 |
| `hasSlaBreachRisk` | `boolean` | 红/橙色底部标签（SLA启动破线/完成破线/双重破线） | SLA 风险标记 |
| `isRootCause: true` | `boolean` | 🎯 前缀 | 仅 **DQC 告警**：标识当前质量监控任务节点；开发/集成告警不使用 |

### 4.3 告警类型与影响状态映射表（前后端契约）

画布上所有下游节点展示的是 **DolphinScheduler 的实际运行状态**，系统不做额外的状态推演。以下定义不同告警类型下的**影响判定策略**与前端展示规则：

| 告警来源 (Source) | 告警级别 (Severity) | 影响判定策略 | 前端节点状态 (`impactStatus`) | 实例列表状态 (Instance Status) | UI 表现要求 |
|-------------------|---------------------|-------------|-------------------------------|--------------------------------|-------------|
| **数据开发/集成** | 任意 (ERROR/WARN) | **展示实际运行状态** | 真实运行状态（`waiting` / `running` / `success` / `failed` / `not_generated` 等） | 同左（真实运行状态） | 节点顶栏按五色图例展示真实运行状态，无根因高亮，AI 话术侧重”依赖缺失/SLA破线” |
| **数据质量(DQC)** | **ERROR** (严重) | **阻断下游**（DolphinScheduler 层面挂起下游任务） | 下游实际状态为 `waiting`（依赖等待） | `waiting` / `blocked` | 根节点高亮(🎯)，下游展示实际状态（依赖等待），AI 话术侧重”强阻断” |
| **数据质量(DQC)** | **WARN** (警告) | **不阻断，标记污染风险** | 真实运行状态 + `isPolluted: true` | 同左（真实状态 + `isPolluted`） | 根节点高亮(🎯)，顶栏展示真实运行状态，底部附加紫色「☣ 污染风险」标签（**递归传递至所有后代节点**），AI 话术侧重”污染风险” |

#### 数据质量（DQC）：两类监控事件语义（必选区分）

产品与监控事件命名上存在两条**互不替代**的业务线；Mock 与真实 API 须与下方语义对齐，避免把「任务执行失败」与「执行成功但阈值触发」混为同一种根节点表现。

| 监控事件（产品侧） | 业务含义 | 对「当前/根」节点的期望 | 与上表（4.3）的关系 |
|-------------------|---------|------------------------|---------------------|
| **质量监控 - 触发异常阈值** | 质量规则或质检任务**已执行完成**；告警因校验结果/指标**越过配置的异常阈值**而产生 | 数据上宜用 **`dqc_threshold`（或后端等价枚举）+ 顶栏红色**，与列表「仍在告警」一致；**禁止**用 `failed` 表达「执行失败」。`isRootCause`/🎯 仍表示质量卡点；下游推演仍按 Severity 走 **强阻断 / 污染风险** | 表中 DQC 的 ERROR/WARN 描述的是**阈值触达之后**的严重度与下游推演策略 |
| **质量监控 - 运行失败** | **监控规则/质检作业在执行过程中失败**，**尚未进入**「产出指标并与阈值比较」的链路 | 根节点应体现 **规则或任务执行失败**（如 `failed` 或由后端约定的执行失败态）；话术侧重 **执行失败、未产生有效阈值判定**，**不要**套用「超阈值」类文案 | 与「阈值触发」**分列场景**；不应与「阈值 ERROR/WARN」混用同一套根节点 story |

**实现约束摘要**：告警列表、拓扑、Panel、AI 须能区分 **「跑挂了」** 与 **「跑成了但结果超阈值」**；阈值场景**禁止**用 `failed` 冒充执行失败，但**允许**顶栏与 **运行失败根** 同为红系（阈值用 `dqc_threshold`，失败用 `failed` + 可选更深 `statusColor`），避免与下游 **依赖等待（橙）** 混淆。

### 4.4 图布局与交互

- **布局算法**：采用 `dagre` 布局（G6 内置），方向 `LR`（从左到右），符合"上游 → 当前节点 → 下游"的思维模型。
- **初始状态**：进入战情室时**仅展示当前告警节点（根节点）**。根节点右侧显示「+」控件（若有下游依赖）。
- **逐层展开交互**：
  - **点击「+」控件**：调用 `getNodeChildren(nodeId)` API 获取该节点的直接子节点，追加到画布并执行 `fitView`；控件切换为「−」。
  - **点击「−」控件**：立即隐藏该节点延伸出的**所有下游子图**（递归移除），控件切换回「+」。
  - **严格遵循"逐层探索，拒绝全量渲染"原则**。
- **节点交互**：
  - **悬浮 (Hover)**：显示 G6.Tooltip，内容仅为节点完整任务名（便于复制）。
  - **点击 (Click)**：右侧 Panel 联动，Tab 切换到"日志详情"并展示该节点的日志。
- **画布操作**：支持鼠标滚轮缩放、拖拽平移、`fitView` 自适应。
- **「仅看核心链路」**：工具栏开关，默认关闭。开启后系统基于完整潜在拓扑自动穿透展示根节点到所有"核心任务"的关键路径，隐藏非路径节点，此时冻结 +/- 折叠/展开操作。快照模式下该开关同样保留可用。
- **【刷新】按钮**：位于**页面右上角**（非画布工具栏内），由 `ImpactAssessmentDrawer` 统一管理，快照模式下隐藏。

### 4.5 智能折叠穿透渲染逻辑（后续版本）

> **V1.0 不实现本节内容**。V1.0 采用逐层展开 + 核心链路穿透方案。以下折叠穿透逻辑保留为产品愿景，待后续版本迭代。

后端 API 返回的 `nodes` 数组中，折叠节点的数据结构为：

```js
{
  id: 'collapse_group_1',
  nodeType: 'collapse',           // 前端据此渲染 impact-collapse-node
  collapsedCount: 45,             // 被折叠的节点数
  collapsedDepth: 4,              // 被折叠的层级数
  penetrateTargets: ['node_88']   // 穿透目标（高危叶子节点 ID）
}
```

前端收到此数据后：
1. 在折叠节点与 `penetrateTargets` 之间画一条**虚线边**（`lineDash: [4, 4]`），表示"中间省略了 N 层"。
2. 穿透目标节点正常渲染为 `impact-task-node`，并附带 `[AI 预警: 高优业务]` 标签（如果后端标记了 `aiTag`）。

---

## 5. 数据模型与接口草案 (Data Model & API)

### 5.1 核心数据模型

**TaskNode（任务节点）**

```js
{
  id: 'task_12345',               // 唯一标识（逻辑任务维度；DQC 场景下可与实例列表中的 taskId 对齐）
  taskName: 'dwd_fund_df_repayment',  // 任务名
  taskType: 'SparkSQL',           // 任务类型（SparkSQL / HiveSQL / DataSync / DQC）
  owner: '马殿林(madianlin)',      // 负责人
  impactStatus: 'failed',         // 状态：success | failed | timeout | stopped | running | waiting | delayed | other | pending | not_generated | dqc_threshold
  isPolluted: false,              // 附加标记：仅 DQC WARN 下游为 true，底部紫色标签「☣ 可能污染」；不影响顶栏主状态
  isRootCause: false,             // 仅 DQC 告警：true 表示当前质量监控任务节点需 🎯 高亮；开发/集成告警恒 false
  isCurrentNode: true,            // 是否为当前选中的异常节点（画布根节点）
  nodeType: 'task',               // 节点类型：task（V1.0 仅使用 task）
  hasChildren: true,              // 是否存在未展开的下游子节点（控制 +/- 控件显示）
  isCore: false,                  // 是否为核心任务（有 SLA 配置 → true）
  slaRiskType: null,              // SLA 风险类型：'dual_breached' | 'start_breached' | 'end_breached' | null
  startTime: '2026-04-02 08:23',  // 任务开始时间
  endTime: '2026-04-02 08:25',    // 任务结束时间（运行中/未运行为 null）
  aiTag: null,                    // AI 标签（如 'high_priority_business'，后续版本启用）
  lastRunDuration: '1h3m',        // 最近运行时长
  avgDuration: '45m',             // 历史平均运行时长
  errorSummary: 'Task [dwd_fund...] Failure Warning',  // 报错摘要
  depth: 0,                       // 相对于根节点的层级深度
  statusColor: null,              // 可选：后端指定节点左边框色覆盖（如 DQC 运行失败根用 #A8071A 加深）
  statusText: null,               // 可选：后端指定节点顶区状态文案覆盖（如「触发异常阈值」vs「运行失败」）
}
```

**AffectedTaskInstance（所有告警类型，供 Tab 2 全局影响清单使用）**

```js
{
  instanceId: 'inst_88421',       // 任务实例 ID
  taskId: 'task_67890',           // 关联逻辑任务 ID（与拓扑节点 id 可对齐）
  taskName: 'dws_order_summary_di',
  scheduleBatch: '2026-04-02',
  status: 'waiting',              // 实例状态（与 TaskNode.impactStatus 枚举对齐，列表 Tag 展示）
  owner: '张三(zhangsan)',
  isCore: false,                  // 是否核心任务（与「仅看核心任务」筛选一致）
  isPolluted: false,              // DQC WARN 下游可能污染
  isDqcErrorBlocked: false,       // DQC 强阻断
}
```

#### GlobalImpactList 筛选规则（前端）

- **任务名搜索**：`a-input`（`allow-clear`），占位「搜索任务名」。对 `record.taskName` 做 **不区分大小写** 的**子串**匹配；`trim` 后为空则不过滤。实例模式（`affectedTaskInstances`）与任务模式（`affectedTasks`）均使用同一字段名 `taskName`。匹配到的行右侧仍展示 **当前状态 Tag**（实例模式用 `status`，任务模式用 `impactStatus`），文案与色系与拓扑节点一致。
- **仅看核心任务**：`a-switch`，`isCore === true`。
- **组合逻辑**：任务名条件与核心开关同时生效时为 **AND**（等价交集）。
- **分页**：在筛选后的列表上分页；任务名输入或核心开关变化时 `currentPage` 重置为 1；`summary` / `topology` 数据源变更时清空任务名搜索、关闭「仅看核心任务」。

**Edge（连线）**

```js
{
  source: 'task_12345',
  target: 'task_67890',
  edgeType: 'dependency',         // dependency | penetrate（穿透虚线）
}
```

**ImpactSummary（统计摘要）**

```js
{
  alertSource: 'quality',         // 'dev' | 'integration' | 'quality'
  affectedTaskInstances: [],      // 所有告警类型统一返回下游任务实例列表（供 Tab 2 使用）
  totalAffectedInstances: 56,     // 受影响实例总数（基于全量下游数据）
  coreInstanceCount: 3,           // 核心实例数（有 SLA 配置的任务实例）
  ownerMatrix: [                  // 受影响负责人矩阵
    { name: '张三(zhangsan)', instanceCount: 5 },
    { name: '李四(lisi)', instanceCount: 2 },
  ],
  slaBreaches: [                  // SLA 破线判定（仅包含已破线的任务，无破线的不在列表中）
    {
      taskName: 'ads_finance_daily_report',
      owner: '王五(wangwu)',
      slaStartDeadline: '08:00',        // SLA 启动时间承诺（未配置为 null）
      slaEndDeadline: '09:00',          // SLA 完成时间承诺（未配置为 null）
      actualStarted: false,             // 任务是否已启动
      actualCompleted: false,           // 任务是否已完成
      slaBreachType: 'dual_breached',   // 破线类型：dual_breached | start_breached | end_breached
    },
  ],
  aiAnalysis: {                   // AI 智能分析总结（独立加载，可为 null 表示加载中/不可用）
    status: 'ready',              // 'loading' | 'ready' | 'failed'
    impactJudgment: '受影响下游实例 56 个，其中核心实例 3 个，波及 5 位负责人。',
    impactConclusion: '财务日报当前处于依赖等待状态，尚未产出。',  // 基于实际状态描述，不做时间预测
    suggestion: '建议立即联系相关负责人协同处理，优先关注财务日报产出链路。',
    generatedAt: '2026-04-02T08:30:00Z',
  },
}
```

### 5.2 API 接口定义

#### (1) 获取影响拓扑初始数据（仅根节点）

```
GET /api/monitoring/impact/topology?eventId={eventId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventId | string | 是 | 当前告警事件 ID |

**响应体**：

```js
{
  alertSource: 'quality',          // 与 summary 一致
  currentNode: { /* TaskNode */ }, // 当前告警对应节点（画布根），hasChildren 指示是否有下游
  rootCause: null,                 // 开发/集成告警：**必须为 null**，不得返回「上游 DQC」节点
  // DQC 告警：rootCause 可省略或与 currentNode 相同（仅表达当前质量任务）；禁止返回伪造的开发任务上游 DQC 链
}
```

> **V1.0 变更说明**：初始请求**不再**批量返回多层 nodes/edges，仅返回根节点。下游节点通过接口 (2) 逐层懒加载。

#### (2) 获取节点子节点（逐层展开）

```
GET /api/monitoring/impact/children?nodeId={nodeId}&eventId={eventId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 当前展开的父节点 ID |
| eventId | string | 是 | 告警事件 ID（用于影响判定上下文） |

**响应体**：

```js
{
  nodes: [ /* TaskNode[] */ ],     // 该节点的直接子节点列表
  edges: [ /* Edge[] */ ],          // 父→子连线列表
}
```

前端收到后追加到画布并执行 `fitView`。

#### (3) 获取核心链路拓扑（一键穿透）

```
GET /api/monitoring/impact/core-path?eventId={eventId}
```

**响应体**：

```js
{
  nodes: [ /* TaskNode[] */ ],     // 根节点到所有核心任务的关键路径上的节点
  edges: [ /* Edge[] */ ],          // 路径连线
}
```

> 开启「仅看核心链路」时调用，替换当前画布内容；关闭后恢复用户手动展开的局部子图。

#### (4) 获取影响统计摘要

```
GET /api/monitoring/impact/summary?eventId={eventId}
```

**响应体**：`ImpactSummary` 对象（含 `aiAnalysis`，AI 分析可能为 `null` 表示尚未就绪）。

#### (5) 获取 AI 分析结果（轮询）

```
GET /api/monitoring/impact/ai-analysis?eventId={eventId}
```

**响应体**：

```js
{
  status: 'ready',                // 'loading' | 'ready' | 'failed'
  impactJudgment: '...',
  impactConclusion: '...',        // 基于实际状态描述，不做时间预测
  suggestion: '...',
  generatedAt: '2026-04-02T08:30:00Z',
}
```

> AI 分析由后端在告警产生时异步预计算，以 `alertId` 去重，结果永久缓存。前端每 3 秒轮询一次，`status === 'ready'` 时停止轮询并填充内容；超过 30 秒仍为 `loading` 时展示「AI 分析暂时不可用」。V1.0 不支持重新生成。

#### (6) 一键拉群

```
POST /api/monitoring/impact/create-group
```

**请求体**：

```js
{
  eventId: 'E-10000641',
  groupName: '【故障应急】ERROR dwd_fund_df_repayment 运行失败',
  members: ['zhangsan', 'lisi', 'madianlin'],  // 从 ownerMatrix 提取
  reportSnapshot: { /* ImpactSummary 快照 */ },
}
```

**响应体**：

```js
{
  success: true,
  alreadyExists: false,           // 是否已存在应急群（true 时 groupId/groupLink 为已有群信息）
  groupId: 'group_001',
  groupLink: 'https://work.weixin.qq.com/...',  // 企业微信群链接，前端可点击跳转
}
```

> **去重逻辑**：后端以 `eventId` 为维度判断是否已创建过应急群。若已存在，返回 `alreadyExists: true`，前端 Toast 提示「当前告警已创建应急群，请勿重复创建」，不弹出成员确认弹窗。V1.0 仅对接**企业微信** API。

#### (7) 故障恢复通知（由告警状态变更为 `resolved` 时触发）

```
POST /api/monitoring/alert/resolve
```

> 此接口为现有「解决告警」操作的后端处理，V1.0 在其中追加一步：检查该 `eventId` 是否曾创建过应急群，若有则自动向群内推送恢复通知消息卡片。**前端无需额外调用**。

**两种恢复方式的消息模板**（详见 PRD 3.7 节）：
- **人工确认恢复**：操作人手动点击「已解决」触发，消息包含操作人信息，提示相关方确认下游任务运行状态。
- **系统自动恢复**：系统检测到任务实例已完成时自动标记为已解决，消息仅包含恢复时间。

后端根据 `resolveType`（`'manual'` | `'auto'`）选择对应消息模板推送至应急群。

#### (8) 刷新战情室数据（页面级刷新按钮）

> 战情室打开期间**不自动轮询**，所有数据刷新由用户点击页面右上角【刷新】按钮主动触发。刷新时前端并行重新调用以下已有接口：
> - `getNodeChildren` — 对已展开的各层级节点重新拉取子节点最新状态
> - `getImpactSummary` — 重新拉取统计面板与 SLA 破线数据
>
> 无需新增独立刷新接口。

#### (9) 获取历史快照数据

```
GET /api/monitoring/impact/snapshot?eventId={eventId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventId | string | 是 | 当前告警事件 ID |

**响应体**：

```js
{
  exists: true,                    // 是否存在快照（由于预计算机制，恒为 true）
  snapshotTime: '2026-04-02T10:00:00Z',  // 快照生成时间
  topology: {                      // 全量下游依赖图数据
    nodes: [ /* TaskNode[] */ ],
    edges: [ /* Edge[] */ ],
  },
  summary: { /* ImpactSummary */ },  // 统计面板 + SLA 破线 + AI 分析（快照冻结时的数据）
}
```

> **快照机制**：告警产生时即由后端异步预计算全量下游拓扑与统计数据。告警状态变更为 `resolved` 或 `falsePositive` 时，基于预计算数据自动保存历史快照。快照内容包含全量下游依赖图、各节点当时的实际运行状态、统计面板数据、SLA 破线数据、AI 分析结果。由于预计算机制，快照始终存在，`exists` 恒为 `true`。

### 5.3 服务层封装 (`impactService.js`)

遵循项目 service-layer 规范（动态 import mock）：

```js
// src/services/Monitoring/impactService.js
import request from '../request.js'

// (1) 获取影响拓扑初始数据（仅根节点）
export async function getImpactTopology(eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockTopology } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockTopology(eventId)
  }
  return request.get('/api/monitoring/impact/topology', { params: { eventId } })
}

// (2) 获取节点子节点（逐层展开，点击 + 时调用）
export async function getNodeChildren(nodeId, eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockNodeChildren } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockNodeChildren(nodeId, eventId)
  }
  return request.get('/api/monitoring/impact/children', {
    params: { nodeId, eventId },
  })
}

// (3) 获取核心链路拓扑（仅看核心链路开关开启时调用）
export async function getCorePath(eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockCorePath } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockCorePath(eventId)
  }
  return request.get('/api/monitoring/impact/core-path', { params: { eventId } })
}

// (4) 获取影响统计摘要
export async function getImpactSummary(eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockSummary } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockSummary(eventId)
  }
  return request.get('/api/monitoring/impact/summary', { params: { eventId } })
}

// (5) 轮询 AI 分析结果
export async function getAiAnalysis(eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockAiAnalysis } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockAiAnalysis(eventId)
  }
  return request.get('/api/monitoring/impact/ai-analysis', { params: { eventId } })
}

// (6) 一键拉群（含去重检查，后端以 eventId 判断是否已创建）
export async function createWarRoom(payload) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { success: true, alreadyExists: false, groupId: 'mock_group_001', groupLink: 'https://work.weixin.qq.com/mock' }
  }
  return request.post('/api/monitoring/impact/create-group', payload)
}

// (9) 获取历史快照数据（resolved/falsePositive 状态下使用）
export async function getSnapshot(eventId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockSnapshot } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockSnapshot(eventId)
  }
  return request.get('/api/monitoring/impact/snapshot', { params: { eventId } })
}
```

---

## 6. 入口改造点 (Entry Points Integration)

### 6.1 AlertCard.vue 改造

在 `card-actions` 区域的按钮组中，增加 `[影响评估]` 按钮。**列表页**遵循「降噪」原则，仅在**需要处置或处置进行中**的状态下展示：

| 状态 | 是否展示 |
|------|---------|
| `firing` / `acked` / `silenced` | **展示** |
| `resolved` / `falsePositive` | **不展示** |

```vue
<!-- 在 card-actions 内现有按钮后追加，v-if 条件控制展示 -->
<button
  v-if="!['resolved', 'falsePositive'].includes(alert.status)"
  class="btn btn-sub"
  @click.stop="$emit('action', 'impact', alert)"
>
  影响评估
</button>
```

### 6.2 AlertDetailDrawer.vue 改造

在 `drawer-header` 的 `header-close` 区域左侧，增加影响评估入口按钮。**详情抽屉**与列表规则有差异：`resolved` 和 `falsePositive` 在详情中**保留入口**，但文案和模式不同，支持事后复盘：

| 状态 | 是否展示 | 入口文案 | 模式 |
|------|---------|---------|------|
| `firing` / `acked` / `silenced` | **展示** | `[影响评估]` | 活跃战情室（实时数据） |
| `resolved`（已解决） | **展示** | `[查看影响评估记录]` | 历史快照模式（只读） |
| `falsePositive`（误报） | **展示** | `[查看影响评估记录]` | 历史快照模式（只读） |

```vue
<!-- 活跃状态：影响评估 -->
<a-button
  v-if="!['resolved', 'falsePositive'].includes(alert.status)"
  type="primary"
  size="small"
  @click="$emit('action', 'impact', alert)"
>
  <template #icon><NodeIndexOutlined /></template>
  影响评估
</a-button>
<!-- 终态：查看影响评估记录（历史快照） -->
<a-button
  v-if="['resolved', 'falsePositive'].includes(alert.status)"
  size="small"
  @click="$emit('action', 'impact-snapshot', alert)"
>
  <template #icon><HistoryOutlined /></template>
  查看影响评估记录
</a-button>
```

### 6.3 AlertList/index.vue 改造

1. 引入 `ImpactAssessmentDrawer` 组件。
2. 增加 `impactDrawerOpen` (ref) 和 `impactAlert` (ref) 状态。
3. 在 `handleAction` 中增加 `case 'impact'` 分支，设置状态并打开抽屉。

```vue
<ImpactAssessmentDrawer
  :open="impactDrawerOpen"
  :alert="impactAlert"
  @close="impactDrawerOpen = false"
/>
```

---

## 7. 数据流总览 (Data Flow)

```
═══════════════════════════════════════════════════════
  活跃模式（firing / acked / silenced）
═══════════════════════════════════════════════════════

用户点击 [影响评估]
    │
    ▼
AlertList/index.vue（或 AlertDetailDrawer.vue）
    │ (设置 impactDrawerOpen = true, impactAlert = alert 快照, mode = 'active')
    ▼
ImpactAssessmentDrawer (L3, mode='active')
    │ (watch alert，解析告警来源 → alertSource)
    │ (并行发起 3 个请求)
    ├──────────────────────┬──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
getImpactTopology()   getImpactSummary()    getAiAnalysis()
(仅返回根节点)         (全量统计 + SLA破线)   (轮询，每 3s)
    │                      │                      │
    ▼                      ▼                      ▼
TopologyCanvas (L3)   AssessmentPanel (L3)   AISummaryCard
    │                      │                  (骨架屏 → 内容/超时提示)
    │                      │
    │                      ├── StatsAndSLA (L3, Tab1)
    │                      ├── GlobalImpactList (L3, Tab2，每页100条，任务名搜索 + 仅看核心任务)
    │                      ├── ErrorLogViewer (L3, Tab3, 未运行节点展示空白)
    │                      └── ActionBar (L3)
    │                           │
    │                           ├─→ [一键拉群] → Step 0 去重检查
    │                           │       │ (已存在 → Toast 提示，终止)
    │                           │       │ (首次 → 弹出 CreateGroupModal)
    │                           │       │ (确认成员)
    │                           │       ▼
    │                           │   createWarRoom() → Toast 成功/失败
    │                           │
    │                           └─→ [挂起/重跑/置成功] → 置灰 + Tooltip
    │
    ▼ (用户操作)
    ├── 页面右上角 [刷新] → 并行重新调用 topology + summary → 更新画布与面板
    ├── 点击 [+] → getNodeChildren(nodeId) → 追加子节点到画布 + fitView
    ├── 点击 [−] → 递归移除该节点延伸的所有下游子图
    ├── 悬浮节点 → Tooltip 展示节点详情（负责人、任务类型、运行时长等）
    ├── 点击节点 → emit('nodeClick', node)
    │       └→ AssessmentPanel 联动切换到 ErrorLogViewer，展示该节点日志
    └── [仅看核心链路] 开关
            ├── 开启 → getCorePath(eventId) → 替换画布为关键路径 + 冻结 +/-
            └── 关闭 → 恢复用户手动展开的局部子图

面板折叠/展开：
    AssessmentPanel [◀ 收起] → 面板折叠为 40px 图标条 → 画布自动 fitView
    AssessmentPanel [▶ 展开] → 恢复左 70% / 右 30% 分栏

═══════════════════════════════════════════════════════
  快照模式（resolved / falsePositive → 详情抽屉入口）
═══════════════════════════════════════════════════════

用户点击 [查看影响评估记录]
    │
    ▼
AlertDetailDrawer.vue
    │ (设置 mode = 'snapshot')
    ▼
ImpactAssessmentDrawer (L3, mode='snapshot')
    │ (调用 getSnapshot(eventId))
    ▼
    └── 展示快照数据 →
        ├── 顶部 Banner：「您正在查看历史影响评估快照，数据截止于 {snapshotTime}」
        ├── TopologyCanvas：逐层展开浏览（+/−），数据来自快照
        │   ├── [刷新] 按钮隐藏
        │   └── [仅看核心链路] 开关保留可用（基于快照数据穿透）
        ├── AssessmentPanel：只读展示快照冻结时的统计/SLA/AI 数据
        └── ActionBar：所有按钮隐藏
```

---

## 8. 双轨输出策略 (Dual-Track Output)

1. **原型轨 (Prototypes) - 跳过**
   现有 `ImpactAssessment/Demo.vue` 已充当原型验证角色，且 PRD 经过多轮确认，跳过独立 HTML 原型。
2. **工程轨 (Engineering) - 执行**
   在 `src/pages/Monitoring/ImpactAssessment/` 目录下（**L2 影响评估**），基于 Vue 3 + Tailwind + G6 落地 **L3 业务组件**；**L1 监控运维** 边界内改造 `AlertList` / `AlertDetail` 入口。
