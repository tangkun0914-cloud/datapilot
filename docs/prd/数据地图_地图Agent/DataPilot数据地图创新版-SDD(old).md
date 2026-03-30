# DataPilot 数据地图创新版 (MVP) - 软件设计文档 (SDD)

## 1. 技术栈选型 (Tech Stack)
继承全局规范，本项目采用：
- **框架**: Vue 3 (Composition API + `<script setup>`) + Vite
- **UI 组件库**: Ant Design Vue 4
- **CSS 方案**: Tailwind CSS v4 (原子化 CSS)
- **图表/可视化**: AntV G6 (用于血缘关系图内联展示)
- **状态管理**: Pinia (用于跨组件共享对话状态、工作台状态)

## 2. 目录结构设计 (Directory Structure)
遵循 Domain-Driven 目录隔离规范，所有创新版代码收敛至 `DataMap/` 领域下，并新建 `CopilotFull/` 或 `Chat/` 专属模块。

```text
src/
├── pages/
│   ├── DataMap/
│   │   ├── Chat/                  # 创新版：对话式主页 (替代原 Home/Search)
│   │   │   ├── index.vue          # 页面入口
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.vue    # 左侧边栏 (历史记录 + 工作台)
│   │   │   │   ├── Welcome.vue    # 欢迎界面 (居中大输入框)
│   │   │   │   ├── MessageList.vue# 对话消息流
│   │   │   │   └── InputArea.vue  # 底部输入区
│   │   │   └── cards/             # AI 返回的各类结果卡片
│   │   │       ├── TableCard.vue  # 表详情卡片
│   │   │       ├── LineageCard.vue# 血缘图卡片 (集成 G6)
│   │   │       └── ErrorCard.vue  # 异常/无权限卡片
│   │   └── Detail/                # (保留) 独立的表详情页，供深度探查使用
├── services/
│   └── DataMap/
│       └── chatService.js         # 封装对话流 API (流式请求)
└── stores/
    └── DataMap/
        └── chatStore.js           # 管理对话历史、当前会话状态
```

## 3. 页面级业务模块化拆解 (L1/L2/L3)

### L1 平台级 (Platform Level)
- **AppLayout**: 顶导 (含全局 Copilot 唤起入口) + 左侧边栏 (导航)。

### L2 模块级 (Module Level) - 对话式主页 (`Chat/index.vue`)
- **SidebarModule (左侧边栏)**: 
  - 包含“历史对话”和“工作台”两个 Tab 切换。
- **ChatMainModule (主对话区)**: 
  - 包含欢迎态（居中输入）和对话态（消息流 + 底部输入）。

### L3 子模块级 (Sub-module Level)
- **SidebarModule**:
  - `HistoryList`: 按时间分组（今天、昨天、本周）的对话记录。
  - `WorkspacePanel`: 推荐数据表卡片、收藏表卡片。
- **ChatMainModule**:
  - `WelcomeScreen`: 居中 Logo、问候语、大尺寸输入框、示例问题推荐。
  - `MessageBubble`: 用户消息气泡、AI 消息气泡（支持打字机效果）。
  - `ResultCards`: 针对不同意图渲染的具体业务卡片（表卡片、血缘卡片）。
  - `BottomInput`: 底部固定输入区，支持意图选择（@提及）。

## 4. 双轨输出策略 (Dual-Track Output)
- **原型轨 (Prototypes)**: 
  - 状态：**已启用**。
  - 产出：在 `prototypes/数据地图_创新版本/` 下生成静态 HTML 文件，验证 UI 布局和基础交互（如侧边栏切换、发送消息动效）。
- **工程轨 (Engineering)**: 
  - 状态：待原型确认后，拆解为 Vue 3 组件并落入 `src/pages/DataMap/Chat/` 目录。