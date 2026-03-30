---
name: DataMap_MVP_Build
overview: 数据地图创新版 MVP 开发计划。基于对话式交互重塑数据探索流程。采用双轨制，先输出静态 HTML 原型，确认后再进行 Vue3 工程化落地。
todos:
  - id: phase1_prototype
    content: "[Phase 1] 原型开发：在 prototypes/数据地图_创新版本/ 目录下生成对话式主页的静态 HTML"
    status: pending
  - id: phase2_engineering_setup
    content: "[Phase 2] 工程化准备：在 src/pages/DataMap/Chat/ 下搭建 L1/L2 组件骨架"
    status: pending
  - id: phase3_engineering_components
    content: "[Phase 3] 组件开发：实现 Sidebar、Welcome、MessageList、InputArea 及各类 ResultCard"
    status: pending
  - id: phase4_integration
    content: "[Phase 4] 状态与联调：接入 Pinia store 和 mock service，实现流式对话交互闭环"
    status: pending
isProject: false
---

# DataPilot 数据地图创新版 MVP - 执行计划

## Phase 1: 原型开发 (Prototypes)
- [ ] **Task 1.1**: 创建 `prototypes/数据地图_创新版本/chat_home.html`。
  - **AC**: 包含顶导、左侧边栏（历史/工作台 Tab 切换）、右侧主对话区（欢迎态与对话态切换）。
  - **AC**: 参考 `DataPilot-对话式主页.html`，实现基础的 CSS 样式和 JS 交互（点击发送消息后隐藏欢迎态，显示消息流和底部输入框）。

## Phase 2: 工程化准备 (Engineering Setup)
- [ ] **Task 2.1**: 在 `src/pages/DataMap/Chat/` 建立目录结构。
  - **AC**: 创建 `index.vue` 及 `components/` 子目录。
- [ ] **Task 2.2**: 路由注册。
  - **AC**: 在 `src/router/index.js` 中注册 `/datamap/chat` 路由，并配置为数据地图的默认首页。

## Phase 3: 组件开发 (Component Development)
- [ ] **Task 3.1**: 开发 `Sidebar.vue`。
  - **AC**: 实现历史对话列表和工作台（推荐表、收藏表）的 UI 及 Tab 切换逻辑。
- [ ] **Task 3.2**: 开发 `Welcome.vue` 和 `InputArea.vue`。
  - **AC**: 实现居中大输入框和底部固定输入框，支持 `Enter` 发送和 `@` 提及的 UI 占位。
- [ ] **Task 3.3**: 开发 `MessageList.vue` 和基础 `TableCard.vue`。
  - **AC**: 实现消息气泡的渲染逻辑，AI 消息支持内嵌表详情卡片。

## Phase 4: 状态与联调 (Integration)
- [ ] **Task 4.1**: 创建 `chatStore.js`。
  - **AC**: 管理当前会话的消息列表数组、输入框状态、侧边栏展开/收起状态。
- [ ] **Task 4.2**: 模拟流式输出交互。
  - **AC**: 在发送消息后，前端模拟打字机效果输出文本，随后渲染结构化的 `TableCard`。
- [ ] **Task 4.3**: 自我检验与交付。
  - **AC**: 运行 `npm run build` 无报错，空状态/加载态处理完毕。