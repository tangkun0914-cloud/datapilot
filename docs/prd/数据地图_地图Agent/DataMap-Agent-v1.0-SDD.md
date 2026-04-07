# DataPilot 数据地图 Agent (千问风格版) SDD

> **文档版本：** v1.1 (对应工程侧 Map Agent v2)
> **更新时间：** 2026-04-06
> **关联 PRD：** [DataMap-Agent-v1.0-PRD.md](./DataMap-Agent-v1.0-PRD.md)

---

## 一、技术栈与核心选型

本模块继承 DataPilot 全局技术栈（Vue 3 + Vite + Tailwind CSS + Ant Design Vue），并针对对话场景引入以下特定选型：
- **流式请求 (Streaming)**：基于原生 `fetch` API 与可读数据流 (`ReadableStream`) 处理 Server-Sent Events (SSE) 或类似的分块传输协议。
- **Markdown 渲染**：基于 `marked` 库（开启 GFM + breaks），通过 `marked.parse()` 生成 HTML 后，以原生 DOM 后处理方式注入交互能力（表格复制按钮、收藏按钮），不涉及 Vue 动态组件渲染。
- **本地持久化**：使用 `localStorage` 配合自定义事件（CustomEvent）实现跨 Tab 的收藏状态同步。

---

## 二、页面模式与状态机枚举 (State/Mode Enumeration)

整个 Agent 页面受以下核心状态驱动，决定了 UI 的展现形态：

1. **会话模式 (Session Mode)**：
   - `active` (交互态)：默认模式。展示侧边栏、输入框，允许用户发送消息、点击追问建议。
   - `share` (分享态)：只读模式。隐藏侧边栏（`isSidebarCollapsed` 强制为 true 且隐藏展开按钮）、隐藏底部输入框（`InputArea`），仅展示历史消息流与分享 Banner。
2. **侧边栏状态 (Sidebar State)**：
   - `expanded` (展开)：展示历史会话列表与收藏表单。
   - `collapsed` (收起)：隐藏侧栏，释放最大横向空间给对话区，左上角悬浮展开按钮。
3. **消息流转状态 (Message Flow State)**：
   - `idle`：空闲等待输入。输入框可编辑，发送按钮可点击。
   - `thinking`：已发送请求，正在接收 AI 的思考过程（展示 `ThinkingSteps` 组件）。输入框置灰不可编辑，发送按钮替换为"停止生成"按钮。
   - `generating`：思考完毕，正在接收并渲染 Markdown 正文。输入框与按钮状态同 `thinking`。
   - `done`：生成正常结束。展示追问建议（`SuggestionChips`）和操作栏（`MessageActions`，含复制/点赞/点踩/重新生成/分享）。思考步骤自动折叠为"已完成 N 个步骤"。
   - `stopped`：用户主动中断生成。已生成内容保留，末尾附灰色提示"— 已停止生成"。**不**展示追问建议，展示操作栏（含"重新生成"按钮）。所有思考步骤（含已完成的）统一变为灰色，折叠摘要为"思考过程已中断"。
   - `error`：流式异常（网络中断/超时/服务不可用）。已生成内容保留，末尾展示红色错误提示。展示操作栏（含"重新生成"按钮），不展示追问建议。
   
   **状态转换路径**：
   ```
   idle → thinking → generating → done
                                → stopped (用户点击"停止生成"或切换会话)
                                → error   (网络异常/服务不可用)
   stopped / error → thinking (重新生成) → generating → ...
   ```

---

## 三、项目目录结构

```text
src/
├── pages/DataMap/MapAgent/              # Agent v2 核心目录
│   ├── index.vue                        # L1 页面入口 (MapAgentHome)
│   ├── components/Chat/                 # 对话流专属组件
│   │   ├── MessageList.vue              # L2 消息列表容器 + 消息分组引擎
│   │   ├── MarkdownRenderer.vue         # L3 Markdown 渲染器 (marked.parse + DOM 后处理)
│   │   ├── UserBubble.vue               # L3 用户消息气泡
│   │   ├── ThinkingSteps.vue            # L3 AI 思考过程折叠面板
│   │   ├── SuggestionChips.vue          # L3 追问建议标签组
│   │   ├── MessageActions.vue           # L3 消息操作栏 (复制/点赞/点踩/重新生成/分享/收藏星标)
│   │   ├── ConversationShareModal.vue   # L3 分享配置弹窗
│   │   ├── TableDetailHeader.vue        # L3 表元数据结构化展示 (备用，v2 中表详情已融入 Markdown)
│   │   ├── useTableCopy.js              # Hook：向 Markdown 表格注入复制按钮
│   │   └── injectTableFavoriteSlot.js   # Hook：向 Markdown 占位符注入收藏按钮
│   └── constants/
│       └── markdownSlots.js             # Markdown 占位符常量与替换函数
├── services/DataMap/MapAgent/
│   └── index.js                         # API 服务层 (含流式请求封装与 Mock 分流)
├── mock/DataMap/MapAgent/
│   └── chat.js                          # 流式对话 Mock 数据 (8 种意图场景模拟)
├── stores/DataMap/
│   └── agent.js                         # 全局 UI 状态 (深色模式等)
└── utils/
    ├── mapAgentFavorites.js             # 收藏表 localStorage 存储与跨组件事件同步
    ├── agentMentionTables.js            # @ 唤起候选表数据源构建
    └── fqnDisplay.js                    # 表名 (数据库.表名) 显示与清洗工具
```

*(注：部分基础组件复用自 `src/pages/DataMap/Agent/components/`，详见第六章组件复用表。)*

---

## 四、页面级业务模块化拆解 (L1-L3)

### L1 页面级 (Platform Level)
- **`MapAgentHome` (`index.vue`)**
  - **职责**：双栏弹性布局容器。管理 `isSidebarCollapsed`、`isShareMode` 等顶层状态；维护 `messages` 数组；处理流式请求的生命周期。

### L2 模块级 (Module Level)
- **`AgentSidebar`** (复用)：管理会话历史和收藏表单。
- **`WelcomeScreen`** (复用)：无消息时的欢迎语与快捷 Prompt。
- **`InputArea`** (复用)：多行自适应输入框，集成 `@` 唤起表检索功能。
  - **输入字符限制**：单次输入上限 500 字。超过 400 字时右下角显示剩余字数；达到 500 字时发送按钮置灰，提示"内容超过 500 字限制，请精简后发送"。不做自动截断（对应 PRD 3.3）。
  - **生成中禁止发送**：AI 流式输出过程中，输入框置灰不可编辑，发送按钮不可点击，直到当前回复完成、被停止或出错后才恢复可用（对应 PRD 3.2）。
  - **`@` 候选来源**：当前会话中出现过的表（由 `buildSessionMentionTableList` 从 `messages` 中提取）+ 用户收藏的表 + 默认常用表（`DEFAULT_FREQUENT_MENTION_TABLES`），常用区块最多展示 6 条（`MENTION_FREQUENT_SECTION_CAP`）。
- **`MessageList`**：
  - **职责**：对话流的滚动容器与消息分组引擎。
  - **消息分组**：将 `messages` 数组按"一条用户消息 + 对应的一条 AI 回复"配对为**消息组 (MessageGroup)**。消息组是分享选择的最小单位（对应 PRD 3.4.1），不支持更细粒度的自由框选。每组以 AI 消息的 `id` 作为组标识。
  - **渲染分发**：遍历消息组，根据角色分发给 `UserBubble`（用户）和 `ThinkingSteps` + `MarkdownRenderer` + `SuggestionChips` + `MessageActions`（AI）。
  - **时间分隔线**：当两条消息间隔超过 5 分钟时，在消息组之间插入时间分隔线（如"14:30"），对应 PRD 3.2。
  - **自动滚动**：流式输出过程中自动滚动到底部，用户手动上滑时暂停自动滚动。

### L3 子模块级 (Sub-module Level)
- **`UserBubble`**：渲染用户发送的纯文本消息，右侧对齐，深色背景。
- **`ThinkingSteps`**：解析并渲染大模型的 `<think>...</think>` 标签内容，支持折叠/展开。
- **`MarkdownRenderer`**：
  - **职责**：核心渲染引擎。将 AI 返回的 Markdown 文本转换为 HTML，并通过 DOM 后处理注入交互能力。
  - **渲染管线**：FQN 清洗 → 占位符替换 → `marked.parse()` → `v-html` 渲染 → DOM 后处理（表格复制按钮 + 收藏按钮注入）。详见 6.4 节。
- **`MessageActions`**：AI 消息底部的操作栏，包含复制、重新生成、分享（触发 `ConversationShareModal`）等。
- **`SuggestionChips`**：AI 回复完毕后，在底部展示的快捷追问胶囊。

---

## 五、数据流与 API 契约设计

### 5.1 核心数据模型 (Message Object)
前端维护的 `messages` 数组中，单个消息对象的数据结构如下：

```javascript
// 用户消息
{
  id: number,              // 消息唯一标识 (时间戳)
  role: 'user',            // 角色
  content: string          // 用户输入的纯文本
}

// AI 消息
{
  id: number,              // 消息唯一标识 (时间戳 + 1)
  role: 'ai',              // 角色
  content: string,         // AI 回复正文 (Markdown 格式，流式追加)
  status: 'loading' | 'streaming' | 'success' | 'stopped' | 'error',
  steps: [                 // 思考步骤数组 (流式追加)
    { id: number, status: 'running' | 'success', text: string }
  ],
  suggestions: string[],   // 追问建议 (流结束时一次性下发)
  tableDetail: {           // 表元数据 (仅单表详情响应时存在)
    fqn: string,           // 完整表名 (数据库.表名)
    cnName: string,        // 中文名
    owner: string,         // 负责人
    description: string    // 表描述
  } | null
}
```

**状态枚举说明**：
| 状态 | 含义 | 对应 UI |
|------|------|---------|
| `loading` | 请求已发出，等待首个数据块 | 展示加载动画 |
| `streaming` | 正在接收流式数据 | 逐字渲染 + "停止生成"按钮 |
| `success` | 生成正常完成 | 展示追问建议 + 完整操作栏 |
| `stopped` | 用户主动中断 | 末尾灰色提示 + 操作栏（含重新生成） |
| `error` | 流式异常 | 红色错误提示 + 操作栏（含重新生成） |

### 5.2 API 契约与 Mock 策略 (Streaming)
流式接口不返回传统 JSON，而是返回分块的文本流。

**Service 接口定义：**
```javascript
export async function sendMessageStream(params, onMessage, onError, onDone)
// params: { sessionId, content, mentionTables: [] }
// onMessage: (chunk: string, isThinking: boolean) => void
```

**Mock 数据策略 (`chat.js`)：**
为了在本地逼真地模拟大模型的流式输出，Mock 层采用 `setInterval` 或 `setTimeout` 配合异步生成器 (Async Generator) 吐出数据块。

**Mock 意图场景与 PRD 3.8 响应类型映射**：

Mock 层通过关键词匹配模拟 8 种意图场景，每种场景对应 PRD 3.8 定义的一种响应类型：

| Mock 场景 | 匹配关键词 | 对应 PRD 响应类型 | 是否下发 `tableDetail` |
|-----------|-----------|-------------------|----------------------|
| 列表搜索 | 订单、列表、相关、风控、找 | 类型 1：表搜索列表 | 否 |
| 表详情 | (默认兜底) | 类型 2：单表详情 | 是 |
| 字段列表 | 字段、schema | 类型 3：字段列表 | 否 |
| 血缘摘要 | 血缘、上游、下游 | 类型 4：血缘摘要 | 否 |
| 数据预览 | 预览、抽样 | 类型 5：数据预览 | 否 |
| 生产调度 | 生产、调度、执行 | 类型 6：生产调度信息 | 否 |
| 脚本信息 | DDL、建表语句、脚本信息、查看脚本 | 类型 7：脚本信息 | 否 |
| SELECT | SELECT、查询语句 | 类型 8：SELECT 查询语句 | 否 |

- 每种场景均模拟 3-4 个思考步骤（`onStep`），然后逐字流式输出 Markdown 正文（`onMessage`），最后下发追问建议（`onSuggestions`）。
- 兜底类型 A（无结果）和兜底类型 B（闲聊）由大模型自行判断返回，Mock 层不单独模拟。
- **多意图处理**（PRD 3.8）：后端/大模型在一次回复中按顺序组织多种响应类型的输出，前端无需特殊处理，正常渲染 Markdown 即可。

### 5.3 收藏状态同步策略
- **存储介质**：`localStorage.getItem(MAP_AGENT_FAVORITE_TABLES_KEY)`，key 为 `datamap_mapAgent_favorite_tables`。
- **容量限制**：单用户最多收藏 50 张表（对应 PRD 3.4.2），达上限时 Toast 提示。
- **跨组件同步**：收藏/取消收藏时，更新 `localStorage` 并派发 `window.dispatchEvent(new CustomEvent('datamap-mapagent-favorites-changed'))`。
- **响应更新**：`MapAgentHome` 监听该事件，重新读取列表并下发给 `AgentSidebar` 进行重新渲染。
- **对话内按钮同步**：收藏操作后，当前会话中所有涉及该表的”收藏此表”按钮状态同步更新（已收藏显示实心星标，未收藏显示空心星标）。
- **多表详情场景**：当 AI 回复包含多张表的详情（多意图查询）时，每张表的正文内收藏按钮独立操作，操作栏星标不展示（因无法对应单一表）。对应 PRD 3.4.2。

---

## 六、PRD v1.1 补齐项的技术实现

> 以下内容对应 PRD v1.1 新增的产品需求，补充其技术实现方案。

### 6.1 停止生成与重新生成

**停止生成：**
- 发起流式请求时创建 `AbortController`，将 `signal` 传入 `fetch`。
- 用户点击"停止生成"时调用 `controller.abort()`，中断当前连接。
- 消息状态设为 `stopped`（终态），已生成内容保留，末尾附灰色提示"— 已停止生成"。
- **思考步骤渲染（`ThinkingSteps` 组件）**：停止后，所有步骤（含已完成和进行中的）统一变为**灰色**，不保留绿色对勾，表示整个思考过程已被中断。折叠摘要文案为"思考过程已中断"（不展示具体步骤数）。
- **生成中切换会话**：等同于先触发"停止生成"（保留已生成内容，标记为 `stopped`），再切换到目标会话。

**重新生成：**
- 重置当前 AI 消息的 `content`/`steps`/`suggestions`/`tableDetail`，状态设为 `loading`。
- 新建 `AbortController`，以原用户消息的 `content` 重新调用 `sendMessageStream`。
- 不新增消息条目，原地替换当前 AI 消息。
- **上下文范围**：重新生成时，传给大模型的上下文与首次生成完全一致（当前轮用户输入 + 之前所有轮次的对话历史），确保 AI 能正确理解代词和上下文指代（对应 PRD 3.2 方案 C）。
- **反馈状态重置**：重新生成后，该消息的点赞/点踩状态重置为未操作。

### 6.2 会话持久化接口

| 能力 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取会话消息 | GET | `/api/v1/agent/sessions/{sessionId}/messages` | 返回完整消息列表（含 steps、suggestions、tableDetail） |
| 重命名会话 | PATCH | `/api/v1/agent/sessions/{sessionId}` | `{ "title": "新标题" }` |

- 当前活跃 `sessionId` 存入 `sessionStorage`，刷新后自动恢复。
- 首条消息发送后，后端自动创建会话记录（无需前端单独调 create 接口）。

### 6.3 `@` 提及的上下文传递

请求体新增 `mentionTables` 字段：
```json
{
  "sessionId": "xxx",
  "content": "帮我看下 @dm_trade.dws_order_summary_nd 的字段",
  "mentionTables": ["dm_trade.dws_order_summary_nd"]
}
```
- `content` 中保留 `@` 前缀原文，供大模型自然语言理解。
- `mentionTables` 供后端做精准元数据检索，不依赖大模型提取表名。

### 6.4 Markdown 渲染与收藏注入

**渲染管线（`MarkdownRenderer.vue`）**：

```
原始 Markdown
  ↓ ① fqnDisplay.js 清洗（去除 @ 前缀、噪声字符）
  ↓ ② markdownSlots.js 替换占位符
  │   <!-- MAPAGENT:TABLE_ACTIONS --> → <div class="mapagent-table-actions-host"></div>
  ↓ ③ marked.parse() 生成 HTML (开启 GFM + breaks)
  ↓ ④ v-html 渲染到 DOM
  ↓ ⑤ DOM 后处理 (watch 触发)
  │   ├─ useTableCopy.js：扫描 <table>，注入悬停复制按钮
  │   └─ injectTableFavoriteSlot.js：向占位 <div> 注入收藏按钮
  ↓
最终 UI
```

全流程为**原生 DOM 操作**，不涉及 Vue 动态组件渲染。

**收藏按钮注入的两种策略**：

| 策略 | 触发条件 | 实现方式 | 适用场景 |
|------|----------|----------|----------|
| **策略 1A（Markdown 占位符）** | AI 回复的 Markdown 中包含 `<!-- MAPAGENT:TABLE_ACTIONS -->` 标记 | `injectTableFavoriteSlot.js` 在渲染后的 DOM 中找到 `.mapagent-table-actions-host`，注入收藏按钮 | 后端在 Markdown 正文中主动插入占位符 |
| **策略 3C（消息元数据）** | AI 消息携带 `tableDetail` 字段且 Markdown 中无占位符 | `MessageActions.vue` 中的操作栏星标展示，对应该表的收藏状态 | 后端通过独立事件下发表元数据 |

- 两种策略可共存：正文内收藏按钮（策略 1A）和操作栏星标（策略 3C）独立运作。
- **多表详情场景**（对应 PRD 3.4.2）：多意图回复中包含多张表详情时，每张表的正文内收藏按钮独立展示，操作栏星标不展示。
- 分享态下，收藏按钮置灰不可点击（`disabled` 属性）。

**XSS 防护**（⚠️ 待实现）：需在 `marked` 输出后增加 HTML 标签白名单过滤（仅允许 `table`、`thead`、`tbody`、`tr`、`th`、`td`、`code`、`pre`、`blockquote`、`strong`、`em`、`a`、`ul`、`ol`、`li`、`p`、`h1-h6`、`div`、`span`、`br`、`hr` 及其常规属性），剥离 `<script>`、`<iframe>`、事件属性等。当前 MVP 阶段 AI 回复内容可信，但接入真实后端前必须补齐此项。建议引入 `DOMPurify` 或自定义 sanitizer。

### 6.5 分享接口

| 能力 | 方法 | 路径 | 请求/响应 |
|------|------|------|-----------|
| 创建分享 | POST | `/api/v1/agent/share` | `{ sessionId, messageGroupIds[], permission, expireIn }` → `{ shareUrl, token }` |
| 获取分享内容 | GET | `/api/v1/agent/share/{token}` | → 分享元数据 + 消息列表 |

### 6.6 组件复用与迁移计划

本版 MapAgent 复用旧版 Agent 的 6 个组件：

| 组件 | 来源 | 用途 |
|------|------|------|
| `AgentSidebar` | `Agent/components/Sidebar/index.vue` | 侧边栏 |
| `WelcomeScreen` | `Agent/components/Chat/WelcomeScreen.vue` | 欢迎态 |
| `InputArea` | `Agent/components/Chat/InputArea.vue` | 输入框 + @ 唤起 |
| `ShareConfigModal` | `Agent/components/Chat/ShareConfigModal.vue` | 分享配置弹窗 |
| `DislikeFeedbackCard` | `Agent/components/Chat/DislikeFeedbackCard.vue` | 踩反馈表单 |
| `ShareActionBar` | `Agent/components/Chat/ShareActionBar.vue` | 分享操作栏 |

旧版下线后，以上组件应迁移至 `src/components/Agent/` 公共目录。

**侧边栏结构变更（对应 PRD 3.1）：**

取消工作台 Tab，`AgentSidebar` 需改造为单层结构：
- 上半区：历史会话列表（现有逻辑不变）
- 下半区：收藏表折叠面板（从工作台 Tab 中剥离，作为常驻区域）
- 移除：分享的对话模块、推荐数据表模块（MVP 不启用）

### 6.7 `tableListState` 事件（预留）

SSE `type: 'tableListState'` 为 V2"边加载边展示表列表"预留。MVP 阶段：
- 前端 `sendMessageStream` 已预留 `onTableListState` 回调，但 `index.vue` 未接入。
- 后端 MVP 可不返回此类型事件。

### 6.8 对话时间分隔线

对应 PRD 3.2"对话时间分隔"需求，`MessageList` 在渲染消息组时插入时间标记：

- **触发规则**：相邻两条消息的 `timestamp`（或 `id` 时间戳）间隔 **≥ 5 分钟**时，在两组消息之间插入分隔线。
- **展示格式**：居中灰色文字，格式为当日时间（如"14:30"）；若跨日则展示日期 + 时间（如"04-06 14:30"）。
- **不在每条消息上单独标注时间戳**，仅在间隔超过阈值时才展示。

### 6.9 深色模式实现

对应 PRD 6.2"主题适配"需求，全面支持浅色/深色模式无缝切换。

- **状态管理**：`useAgentStore()` 中的 `isDarkMode`（`ref<boolean>`，默认 `false`）。
- **传递方式**：`MapAgentHome` 将 `isDarkMode` 作为 props 下发给所有子组件（`AgentSidebar`、`MessageList`、`MarkdownRenderer`、`InputArea` 等），各组件通过 Tailwind CSS 条件类名切换样式。
- **核心色值**：

| 用途 | 浅色模式 | 深色模式 |
|------|----------|----------|
| 页面背景 | `#f8fafc` | `#0f172a` |
| 侧边栏背景 | `#ffffff` | `#001529` |
| 主文字 | `#334155` | `#e2e8f0` |
| 次要文字 | `#64748b` | `#94a3b8` |
| 品牌主色 | `rgba(108,76,155,1)` | 同左 |
| 收藏高亮 | `#fb923c` (橙色) | 同左 |
| 成功状态 | `#22c55e` (绿色) | 同左 |

- **实现方式**：各组件通过 `:class="isDarkMode ? 'dark-class' : 'light-class'"` 三元表达式切换，不依赖 Tailwind 的 `dark:` 变体（因深色模式由业务状态控制，非系统偏好）。