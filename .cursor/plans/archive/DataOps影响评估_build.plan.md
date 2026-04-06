---
todos:
  - id: 1
    content: "与用户沟通并确认 DataOps 影响评估产品的核心需求与演进路线"
    status: completed
  - id: 2
    content: "撰写并输出正式的 V1.0 产品需求文档 (PRD)"
    status: completed
  - id: 3
    content: "撰写软件设计文档 (SDD) 与架构设计"
    status: completed
  - id: 4
    content: "Mock 数据与服务层开发"
    status: completed
  - id: 5
    content: "L1 沉浸式抽屉壳与入口改造"
    status: completed
  - id: 6
    content: "L2/L3 拓扑画布与 G6 自定义节点"
    status: completed
  - id: 7
    content: "L2/L3 右侧评估面板（清单/统计/日志/操作栏）"
    status: completed
  - id: 8
    content: "联调自检与验收"
    status: completed
---

# DataOps 影响评估与智能协同平台 - 执行计划

## 需求分析
本项目旨在打造一个基于"数据血缘"与"调度依赖"的异常应急响应平台，聚焦任务失败/延迟场景。核心解决 DataOps 场景下"出了问题时，不知道影响有多大、找人难、沟通慢"的痛点。

核心功能包括：
1. **异常影响评估引擎**：多层级拓扑展示（默认3层+折叠穿透）、状态实时映射、根因溯源高亮。
2. **多维影响面报告**：资产与人员双维统计、SLA 破线预估、动态报告生成。
3. **闭环管控与智能协同**：一键拉群（本期）、手动干预矩阵（后期）。

## 文档索引
- **PRD**: `docs/prd/监控运维/DataOps异常影响评估_失败延迟场景_PRD.md`
- **SDD**: `docs/prd/监控运维/DataOps异常影响评估_失败延迟场景_SDD.md`
- **整体方案**: `docs/prd/监控运维/DataOps影响评估与智能协同方案.md`

---

## Phase 1: 产品设计与需求确认 ✅
- [x] 需求沟通与多轮迭代（失败/延迟/DQC 场景梳理、深层链路交互、入口设计）
- [x] 确定 V1.0 核心功能边界（单节点评估、6 种异常状态、仅限调度任务）
- [x] 撰写并输出 PRD (`DataOps异常影响评估_失败延迟场景_PRD.md`)

## Phase 2: 软件设计 (SDD) ✅
- [x] 技术栈确认（沿用 G6 4.x，与 `LineageTab.vue` 对齐）
- [x] 目录结构规划（`src/pages/Monitoring/ImpactAssessment/`）
- [x] L1/L2/L3 页面级组件拆解
- [x] G6 自定义节点设计（impact-task-node / impact-collapse-node）
- [x] 数据模型与 API 接口草案
- [x] 入口改造点明确（AlertCard / AlertDetailDrawer / AlertList index）
- [x] 撰写并输出 SDD (`DataOps异常影响评估_失败延迟场景_SDD.md`)

---

## Phase 3: Mock 数据与服务层 ✅

### Task 3.1: Mock 数据编写
- [x] 创建 `src/mock/Monitoring/impactAssessment.js`
- [x] 编写 `mockTopology(eventId, params)` — 开发/集成：`rootCause: null`、含 collapse + 穿透边；DQC：`isRootCause` 仅当前 DQC 节点；支持 `depth` / `coreOnly`
- [x] 编写 `mockSummary(eventId)` — `alertSource`、`listGranularity`、DQC 下 `affectedTaskInstances`
- [x] 编写 `mockExpand(collapseNodeId)` — `collapse_downstream_1` 展开增量 + `replaceCollapseId`

**AC**: 与 PRD 1.3 / 能力边界一致；质量告警可带实例列表；开发/集成不带实例、`rootCause` 为 null。

### Task 3.2: 服务层封装
- [x] 创建 `src/services/Monitoring/impactService.js`
- [x] 实现 `getImpactTopology`、`getImpactSummary`、`expandCollapseNode`、`createWarRoom`
- [x] `VITE_USE_MOCK === 'true'` 时动态 `import` mock

**AC**: `npm run build` 通过；Mock 模式下四接口可调用（待 Phase 4 页面接线验证）。

---

## Phase 4: 工程化落地 — 组件开发

### Task 4.1: L1 沉浸式抽屉壳与入口改造 (1-3 文件)
- [x] 创建 `ImpactAssessmentDrawer.vue` — 90vw 宽度 Drawer，左右分栏布局
- [x] 改造 `AlertCard.vue` — 按钮组增加 `[影响评估]` 按钮
- [x] 改造 `AlertDetailDrawer.vue` — header 增加 `[影响评估]` 按钮
- [x] 改造 `AlertList/index.vue` — 引入 Drawer，处理 `impact` action

**AC**: 在告警列表页和详情抽屉中均可看到"影响评估"按钮，点击后弹出 90% 宽度的沉浸式抽屉（内容暂时为占位区域）。

### Task 4.2: L2 拓扑画布 + G6 自定义节点 (1-2 文件)
- [x] 创建 `TopologyCanvas.vue` — G6 画布容器，接收 topologyData props
- [x] 创建 `components/CanvasToolbar.vue` — 层级选择器、核心链路开关
- [x] 注册 `impact-task-node` 自定义节点（状态色、根因动效、污染标签）
- [x] 注册 `impact-collapse-node` 自定义节点（虚线边框、[+N层] 文本、双击展开）
- [x] 实现 dagre 布局、缩放平移、Tooltip、节点点击事件

**AC**: 画布正确渲染 mock 拓扑数据（3 层 + 1 个折叠节点），节点颜色与 PRD 状态映射一致，根因节点有脉冲动效，折叠节点可双击展开。

### Task 4.3: L2/L3 右侧评估面板 (4-5 文件)
- [x] 创建 `AssessmentPanel.vue` — 右侧 Tab 容器 + ActionBar 插槽
- [x] 创建 `components/GlobalImpactList.vue` — Tab1: 受影响任务清单列表
- [x] 创建 `components/StatsAndSLA.vue` — Tab2: 统计卡片 + 人员矩阵 + SLA 预估
- [x] 创建 `components/ErrorLogViewer.vue` — Tab3: 报错日志代码块展示
- [x] 创建 `components/ActionBar.vue` — 底部固定操作条（一键拉群 + 后期按钮 disabled）

**AC**: 右侧面板 3 个 Tab 均正确渲染 mock 数据。点击"一键拉群"弹出确认弹窗。点击清单中的任务行，左侧拓扑图对应节点高亮。

---

## Phase 5: 联调自检与验收 ✅

### Task 5.1: 联调与自检
- [x] `npm run build` 确认 0 error
- [x] 确认路由/菜单无需修改（Drawer 模式，无独立路由）
- [x] 确认新增文件已在 SDD 目录结构范围内
- [x] 确认空状态、加载态、失败态已处理（战情室：`a-result` 重试、空拓扑/空摘要 `a-empty`；表格 `locale.emptyText`）
- [x] 核心 SFC/画布逻辑 ≤300 行（`ImpactAssessmentDrawer` ~224、`TopologyCanvas` ~215；`impactG6Nodes.js` ~285）。**遗留**：原型页 `Demo.vue` >300 行，随 UI 改版或下线时可再拆

**AC**: 完整流程可走通——从告警列表点击"影响评估" → 弹出沉浸式抽屉 → 左侧拓扑图渲染 → 右侧统计/清单/日志正确展示 → 一键拉群弹窗可触发。

---

## 后续（不在本计划范围内）

- 功能补齐：真实 API 联调、权限、更多运维动作等  
- UI/UX 统一优化：战情室视觉层级、主题与 G6 样式、`/design` 注册等
