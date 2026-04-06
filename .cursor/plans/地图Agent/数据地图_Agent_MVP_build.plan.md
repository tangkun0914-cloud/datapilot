---
name: DataMap_Agent_MVP_Build
overview: 数据地图 Agent MVP v1.0 开发计划。基于最新的设计图（地图Agent-首页.png / 对话消息展示区.png）重构对话式前台。采用双轨制，先输出高保真静态 HTML 原型，确认后再进行 Vue3 工程化落地。
todos:
  - id: phase1_prototype_rebuild
    content: "[Phase 1] 原型重构：参考最新设计图，在 prototypes/数据地图_创新版本/ 下生成 agent_home_v1.html"
    status: completed
  - id: phase2_engineering_setup
    content: "[Phase 2] 工程化准备：在 src/pages/DataMap/Agent/ 下搭建 L1/L2 组件骨架，配置独立路由"
    status: completed
  - id: phase3_sidebar_and_welcome
    content: "[Phase 3] 组件开发 (上)：实现 Sidebar (历史/工作台) 和 WelcomeScreen (大输入框)"
    status: completed
  - id: phase4_chat_and_cards
    content: "[Phase 4] 组件开发 (下)：实现 MessageList、InputArea、TableCard (含内联详情)、LineageCard 及 SSE 流式接收"
    status: completed
  - id: phase5_api_integration
    content: "[Phase 5] 接口联调准备：梳理并定义 Agent 交互所需的 API 接口 (Mock)"
    status: pending
isProject: false
---

# DataPilot 数据地图 Agent MVP v1.0 - 执行计划

## Phase 1: 原型重构 (Prototypes Rebuild)

- **Task 1.1**: 创建 `prototypes/数据地图_创新版本/agent_home_v1.html`。
  - **依赖**: 读取 `地图Agent-首页.png` 和 `对话消息展示区.png` 作为设计参考。
  - **AC**: 还原“地图Agent-首页”的初始欢迎态（居中大输入框、推荐问题、侧边栏布局）。
  - **AC**: 还原“对话消息展示区”的对话流态（消息气泡样式、表卡片样式、底部输入框）。
  - **AC**: 实现基础的 JS 交互：点击发送消息后，从欢迎态平滑切换到对话流态，并模拟流式输出卡片。
  - **AC**: (已更新) 移除右侧抽屉，改为在卡片下方内联展开详情面板；DDL/SELECT 改为 Action Chips 样式；移除质量评分；增加中文名和复制图标。

## Phase 2: 工程化准备 (Engineering Setup)

- **Task 2.1**: 在 `src/pages/DataMap/Agent/` 建立目录结构。
  - **AC**: 创建 `index.vue` 及 `components/` 目录（含 Sidebar, Chat, Cards 子目录）。
- **Task 2.2**: 路由注册。
  - **AC**: 在 `src/router/index.js` 中注册 `/datamap/agent` 路由，并将其配置为 DataPilot 产品的核心首页入口。

## Phase 3: 组件开发 - 侧边栏与欢迎态

- **Task 3.1**: 开发 `SidebarModule`。
  - **AC**: 实现历史对话列表和工作台（推荐表、收藏表）的 UI 及 Tab 切换逻辑。
- **Task 3.2**: 开发 `WelcomeScreen.vue`。
  - **AC**: 实现居中大输入框，支持多行输入，展示预置的推荐问题卡片。

## Phase 4: 组件开发 - 对话流与卡片

- **Task 4.1**: 开发 `MessageList.vue` 和 `InputArea.vue`。
  - **AC**: 实现底部固定输入框，支持 `Enter` 发送和 `@` 提及的 UI 占位。
- **Task 4.2**: 开发 `TableCard.vue`。
  - **AC**: 还原设计图中的表卡片样式（含基础信息、分享/收藏置顶、无质量评分、中文名+复制图标）。
  - **AC**: 实现“生成 DDL”和“生成 SELECT”按钮的 Action Chips 样式及代码面板展开复制功能。
  - **AC**: 实现“展开全部详情”按钮，点击后在卡片下方内联展开详情面板（包含字段详情、数据预览、生产信息、血缘关系 Tab）。
- **Task 4.3**: 模拟 SSE 流式输出交互。
  - **AC**: 在发送消息后，前端模拟打字机效果输出文本，随后渲染结构化的 `TableCard`。

## Phase 5: 接口联调准备 (API & Mock)

- **Task 5.1**: 梳理 Agent 相关的接口定义。
  - **AC**: 定义发送消息接口（支持 SSE）、获取历史会话列表接口、获取工作台推荐表接口。
- **Task 5.2**: 编写 Mock 数据。
  - **AC**: 在 `src/mock/DataMap/` 下创建对应的 mock 文件，支撑前端独立运行。

## 验收检查清单 (全局)

- 运行 `npm run build` 无报错。
- 运行 `npm run lint` 无报错。
- 空状态、加载态已处理完毕。

