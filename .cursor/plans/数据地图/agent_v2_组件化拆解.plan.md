---
name: Agent v2 组件化拆解
overview: 将 MapAgent v2 的 MessageList.vue 拆分为 7 个独立 L3 子组件，并在业务组件地图文档和 Design config.js 中注册新的 L1 地图 Agent v2 组件树。
todos:
  - id: create-thinking-steps
    content: 新建 ThinkingSteps.vue：抽取思考过程渲染逻辑
    status: completed
  - id: create-user-bubble
    content: 新建 UserBubble.vue：抽取用户消息气泡
    status: completed
  - id: create-markdown-renderer
    content: 新建 MarkdownRenderer.vue：抽取 Markdown 渲染 + 流式光标 + 全局样式
    status: completed
  - id: create-data-table
    content: 新建 DataTable.vue（或 useTableCopy composable）：抽取表格复制注入逻辑 + 样式
    status: completed
  - id: create-suggestion-chips
    content: 新建 SuggestionChips.vue：抽取追问建议 chip 按钮
    status: completed
  - id: create-message-actions
    content: 新建 MessageActions.vue：抽取点赞/踩/分享操作栏
    status: completed
  - id: refactor-message-list
    content: 改造 MessageList.vue：用 6 个子组件替换内联代码，保留分组和分享编排逻辑
    status: completed
  - id: update-doc
    content: 更新 docs/design/业务组件地图.md：新增 L1 地图 Agent v2 章节
    status: completed
  - id: update-config
    content: 更新 src/pages/Design/config.js：注册 L1 地图 Agent v2 组件组
    status: completed
isProject: false
---

# 地图 Agent v2 业务组件化拆解

## 背景

当前 `MessageList.vue`（443 行）承载了全部消息渲染逻辑。按已确认的 L1 → L2 → L3 三级拆解方案，将其拆为 7 个独立 L3 子组件文件，并同步更新文档和 Design 注册表。

## 拆解产物：新建组件文件

目标目录：`src/pages/DataMap/MapAgent/components/Chat/`

- **ThinkingSteps.vue** (L3-3) — 从 MessageList 第 41~47 行抽取，接收 `steps` 和 `isDarkMode` props
- **UserBubble.vue** (L3-2) — 从第 50~55 行抽取，接收 `content` prop
- **MarkdownRenderer.vue** (L3-4) — 从第 58~73 行抽取，包含 `marked.js` 渲染逻辑和 `.markdown-body` 全局样式，接收 `content`、`status`、`isDarkMode` props
- **DataTable.vue** (L3-5) — 从第 278~305 行抽取表格复制注入逻辑 + `.table-copy-wrapper` 相关样式，独立为组合式函数或组件，暴露 `injectCopyButtons(containerRef)` 方法
- **SuggestionChips.vue** (L3-6) — 从第 76~87 行抽取，接收 `suggestions`、`isDarkMode` props，emit `send` 事件
- **MessageActions.vue** (L3-7) — 从第 90~124 行抽取，接收 `msgId`、`isDarkMode`、`actionStates` props，emit `like`/`dislike`/`share` 事件

## 改造：MessageList.vue

MessageList.vue 保留为 L2-2 的编排层：

- L3-1 `MessageGrouping` 逻辑保留在 MessageList 内部（`messageGroups` computed + 分享勾选逻辑）
- template 中用上述 6 个子组件替换原有内联代码
- 分享相关组件（`ShareActionBar`、`ShareConfigModal`、`DislikeFeedbackCard`）继续在此引入
- 全局 CSS 中 `.markdown-body` 和 `.table-copy-`* 样式随组件迁移到对应子组件

## 文档更新

### [docs/design/业务组件地图.md](docs/design/业务组件地图.md)

在 "数据地图 Agent" 章节之后新增 "地图 Agent v2" 章节，包含：

- L1 地图 Agent v2 `MapAgent` 概述
- L2-1 首页框架 `MapAgentHome`（含 L3-1、L3-2）
- L2-2 流式对话消息区 `StreamMessageList`（含 L3-1 ~ L3-7）
- 复用组件清单
- 与老 Agent 对照表
- 更新底部组件索引速查表

### [src/pages/Design/config.js](src/pages/Design/config.js)

在 `componentGroups` 数组末尾（现有 "L1 地图 Agent" 之后）新增 `L1 地图 Agent v2` 分组，注册以下组件：

- L2 首页框架组：`MapAgentHome`
- L2 流式消息组：`StreamMessageList`、`ThinkingSteps`、`UserBubble`、`MarkdownRenderer`、`DataTable`、`SuggestionChips`、`MessageActions`

每个 item 需包含 `id`、`name`、`label`、`catalogTier: 'productModule'`、`productModule: '地图 Agent v2'`、`file`、`desc`、`props`、`children` 等字段，与现有 L1 地图 Agent 格式对齐。

## 不涉及的内容

- 老 Agent（`src/pages/DataMap/Agent/`）的任何文件
- 路由、mock、service 层均不改动
- 功能和 UI 不变，纯重构

