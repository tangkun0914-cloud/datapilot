# DataPilot 数据地图 Agent - 软件设计文档 (SDD)

> **版本：** MVP v1.0
> **更新时间：** 2026-03-30
> **前置依赖：** [数据地图Agent_v1.0版本的PRD.md](./数据地图Agent_v1.0版本的PRD.md)

## 1. 技术栈选型 (Tech Stack)

继承全局技术栈规范，本项目前端侧采用以下技术：
- **框架**: Vue 3 (Composition API + `<script setup>`) + Vite 5.0+
- **UI 组件库**: Ant Design Vue 4.0+
- **CSS 方案**: Tailwind CSS v4 (原子化 CSS)
- **图表/可视化**: AntV G6 4.8+ (用于血缘关系图内联展示)
- **状态管理**: Pinia 2.1+ (用于跨组件共享对话状态、工作台状态)
- **HTTP 客户端**: Axios 1.6+ (支持 SSE 流式请求接收)
- **路由**: Vue Router 4.2+

### 1.1 全局展示规范 (Global Display Rules)
为了保证数据资产信息的一致性，在所有前端组件（卡片、抽屉、列表、输入框等）中，必须严格遵守以下展示规范：
1. **表名格式**：必须展示为 `库名.表名`（例如：`prod_db.user_behavior_log`），以明确资产的层级归属。
2. **负责人格式**：必须展示为 `姓名(邮箱前缀)`（例如：`张三(zhangsan)`），以便于跨部门沟通和权限审批。

## 2. 目录结构规范 (Directory Structure)

遵循 Domain-Driven 目录隔离规范，所有数据地图 Agent 的前端代码收敛至 `DataMap/` 领域下。

```text
src/
├── pages/
│   ├── DataMap/
│   │   ├── Agent/                 # 数据地图 Agent 核心模块
│   │   │   ├── index.vue          # Agent 首页入口 (包含侧边栏 + 主对话区)
│   │   │   ├── components/
│   │   │   │   ├── Sidebar/       # 左侧边栏模块
│   │   │   │   │   ├── HistoryList.vue   # 历史对话列表
│   │   │   │   │   └── Workspace.vue     # 工作台 (推荐表/收藏表)
│   │   │   │   ├── Chat/          # 主对话区模块
│   │   │   │   │   ├── WelcomeScreen.vue # 欢迎态 (大输入框 + 推荐问题)
│   │   │   │   │   ├── MessageList.vue   # 对话消息流 (支持 SSE 渲染)
│   │   │   │   │   ├── MessageBubble.vue # 单条消息气泡
│   │   │   │   │   ├── InputArea.vue     # 底部输入区 (含意图选择器)
│   │   │   │   │   └── TypingIndicator.vue # 打字机/思考态指示器
│   │   │   │   ├── Cards/         # AI 返回的各类结果卡片
│   │   │   │   │   ├── TableCard.vue     # 表基础信息卡片
│   │   │   │   │   ├── LineageCard.vue   # 血缘图卡片 (集成 G6)
│   │   │   │   │   └── SuggestionCard.vue# 追问建议卡片
│   │   │   │   └── Drawers/       # 抽屉组件
│   │   │   │       └── TableDetailDrawer.vue # 完整表详情抽屉 (点击"查看全部"唤起)
│   │   ├── Share/                 # 分享落地页模块
│   │   │   └── index.vue          # 只读的分享页面 (单条/完整会话)
├── services/
│   └── DataMap/
│       ├── agentService.js        # 封装与 Agent 后端的对话/搜索 API (含 SSE)
│       └── metadataService.js     # 封装与 OpenMetadata 的直连 API (如需)
└── stores/
    └── DataMap/
        └── agentStore.js          # 管理对话历史、当前会话状态、侧边栏状态
```

## 3. 页面级业务模块化拆解 (L1/L2/L3)

### L1 平台级 (Platform Level)
- **PortalLayout (DataPilot 首页)**: 数据地图 Agent 是一个**平台级功能**，它的核心入口位于 DataPilot 产品的**封面页/首页**。它是一个全局的、独立的智能消费前台，与传统的“数据集成、数据开发”等顶部导航产品模块没有层级从属关系。
- **Standalone 模式**: 整个 Agent 界面（侧边栏 + 主对话区）可以脱离传统的 AppLayout 独立全屏运行，提供沉浸式的对话体验。

### L2 模块级 (Module Level) - Agent 首页 (`Agent/index.vue`)
- **SidebarModule (侧边栏)**: 
  - 承载“历史对话”和“工作台”两个 Tab 的切换与展示。
- **ChatMainModule (主对话区)**: 
  - 承载核心的自然语言交互流。分为初始的“欢迎态”和对话中的“消息流态”。
- **DetailDrawerModule (详情抽屉)**:
  - **核心定位**：承载 MVP 中“查看全部”的交互。不跳出当前页面，在右侧滑出展示完整的表资产信息。
  - **多 Tab 展示**：包含表字段、数据预览、生产信息、血缘信息等核心 Tab。

### L3 子模块级 (Sub-module Level)
- **SidebarModule**:
  - `HistoryList`: 按时间分组（今天、昨天、本周）的对话记录，支持点击加载历史上下文。
  - `Workspace`: 包含 `RecommendTables` (推荐表) 和 `FavoriteTables` (收藏表) 卡片列表。
- **ChatMainModule**:
  - `WelcomeScreen`: 居中 Logo、问候语、大尺寸输入框、示例问题推荐。
  - `MessageList`: 渲染 `MessageBubble` 列表。
  - `Cards`: 针对不同意图渲染的具体业务卡片 (`TableCard`, `LineageCard`)。
    - **TableCard**: 展示表基础信息、质量评分。**底部提供“生成 DDL”和“生成 SELECT”快捷按钮，点击后在卡片下方展开代码块面板，并提供一键复制功能。**
    - **LineageCard**: 展示血缘分析结果。包含 AI 洞察总结、核心上下游链路（列表形式，基于后端图数据库剪枝 Top N + LLM 总结的混合模式），并提供“查看完整血缘图”按钮联动右侧详情面板。
  - `InputArea`: 底部固定输入区，支持意图选择按钮和 `@` 提及表名的快捷交互。

## 4. 数据流与 API 映射 (Data Flow & API Mapping)

前端主要与 DataPilot 后端服务层交互，后端再代理至 OpenMetadata 和 LLM。

| 前端动作 | 调用的后端 API (DataPilot Service) | 备注 |
|---------|--------------------------------|------|
| 发送对话消息 | `POST /api/chat/message` | **核心**：需支持 SSE (Server-Sent Events) 接收流式响应。 |
| 获取推荐表 | `GET /api/recommend/tables` | 渲染工作台推荐模块 |
| 获取历史会话 | `GET /api/conversations` | 渲染侧边栏历史模块 |
| 获取表完整详情 | `GET /api/v1/tables/name/{fqn}` | 代理 OpenMetadata API，用于渲染 `TableDetailDrawer` |
| 生成分享链接 | `POST /api/share` | 返回分享 Token |
| 获取分享内容 | `GET /api/share/{token}` | 渲染 `Share/index.vue` |

### 4.1 SSE 流式输出处理规范
前端在接收 `POST /api/chat/message` 的 SSE 流时，需根据 `type` 字段动态渲染 UI：
- `type: "status"` -> 渲染 `TypingIndicator` (如："正在查询表信息...")
- `type: "text"` -> 渲染 `MessageBubble` 文本追加
- `type: "card"` -> 渲染 `TableCard` 或 `LineageCard`
- `type: "suggestions"` -> 渲染 `SuggestionCard` (追问按钮)

## 5. 双轨输出策略 (Dual-Track Output)

根据 SDD 规范，本项目采用双轨输出策略：

1. **原型轨 (Prototypes) - [待执行]**
   - **目标**：废弃旧版原型，根据最新的设计图重新生成高保真 HTML 原型。
   - **参考设计图**：
     - `prototypes/数据地图_创新版本/地图Agent-首页.png` (用于还原初始欢迎态、侧边栏和整体布局)
     - `prototypes/数据地图_创新版本/对话消息展示区.png` (用于还原对话流态、消息气泡、卡片样式及底部输入框)
   - **产出**：`prototypes/数据地图_创新版本/agent_home_v1.html`
2. **工程轨 (Engineering) - [待执行]**
   - 产出：在原型确认后，在 `src/pages/DataMap/Agent/` 目录下，基于 Vue 3 + Tailwind CSS 严格按照上述 L1/L2/L3 拆解进行组件化落地。

## 6. 权限与分享设计 (MVP 弱管控)
- **权限拦截**：前端在渲染 `TableDetailDrawer` 时，默认展示基础元数据和前 20 条样例数据。当后端返回无高级权限标识时，展示“一键申请”按钮。
- **分享页面**：`Share/index.vue` 是一个脱离主 Layout 的独立路由页面（只读模式），根据 Token 渲染静态的对话流或单张卡片。