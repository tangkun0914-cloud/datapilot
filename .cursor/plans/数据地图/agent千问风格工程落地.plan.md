---
name: Agent千问风格工程落地
overview: 在 /datamap/map-agent 路由下新建一套独立的千问风格 Agent 页面，保留老 Agent（/datamap/agent）完全不动。
todos:
  - id: install-marked
    content: 安装 marked 依赖 (npm install marked)
    status: completed
  - id: create-mock
    content: 新建 mock/DataMap/MapAgent/chat.js，6 种场景输出 Markdown 文本流 + suggestions
    status: completed
  - id: create-page
    content: 新建 pages/DataMap/MapAgent/ 目录，包含 index.vue 主页面和所有子组件
    status: completed
  - id: add-route
    content: 在 router/index.js 中注册 /datamap/map-agent 路由和菜单项
    status: completed
  - id: verify
    content: 启动开发服务器验证 6 种场景的流式渲染、表格复制、分享模式均正常
    status: completed
isProject: false
---

# Agent 千问风格交互 - 工程落地计划（修订版）

## 核心策略：新建独立页面，老 Agent 不动

- 路由：`/datamap/map-agent`
- 页面目录：`src/pages/DataMap/MapAgent/`
- Mock 目录：`src/mock/DataMap/MapAgent/`
- **现有 `src/pages/DataMap/Agent/` 及其所有组件、mock、service 完全不修改**

## 复用 vs 新建


| 内容                      | 策略     | 说明                                                        |
| ----------------------- | ------ | --------------------------------------------------------- |
| 侧边栏 `Sidebar/index.vue` | 直接复用   | 从老 Agent 目录 import                                        |
| 欢迎页 `WelcomeScreen.vue` | 直接复用   | 从老 Agent 目录 import                                        |
| 输入区 `InputArea.vue`     | 直接复用   | 从老 Agent 目录 import                                        |
| 分享相关组件                  | 直接复用   | `ShareActionBar`、`ShareConfigModal`、`DislikeFeedbackCard` |
| 全局组件                    | 直接复用   | `CopilotAiAvatar`、`PilotLogo` 等                           |
| Pinia store             | 直接复用   | `useAgentStore`                                           |
| service 层               | 直接复用   | `getHistorySessions`、`getWorkspaceData`                   |
| **消息列表**                | **新建** | 核心改造点：Markdown 渲染替代卡片                                     |
| **chat mock**           | **新建** | 6 种场景输出 Markdown 文本                                       |
| **主页面 index.vue**       | **新建** | 去掉右侧面板，简化布局                                               |


## 新建文件清单

```
src/
├── pages/DataMap/MapAgent/
│   ├── index.vue                          # 主页面（简化布局，无右侧面板）
│   └── components/
│       └── Chat/
│           └── MessageList.vue            # 千问风格消息列表（Markdown 渲染）
├── mock/DataMap/MapAgent/
│   └── chat.js                            # 6 种场景的 Markdown mock 数据
└── services/DataMap/MapAgent/
    └── index.js                           # service 层（复用 workspace/history，新 chat mock）
```

## 修改文件清单（仅路由）


| 文件                    | 改动                             |
| --------------------- | ------------------------------ |
| `src/router/index.js` | 新增路由 `datamap/map-agent` + 菜单项 |


## 具体方案

### 1. 路由注册

在 `dataMapMenuItems` 中新增：

```js
{ key: '/datamap/map-agent', icon: 'RobotOutlined', label: '地图 Agent v2' }
```

在 routes 的 datamap children 中新增：

```js
{
  path: 'datamap/map-agent',
  name: 'MapAgent',
  component: () => import('@/pages/DataMap/MapAgent/index.vue'),
  meta: { title: '地图 Agent v2', module: 'datamap' },
}
```

### 2. 新建 mock：chat.js

6 种意图，每种输出一段完整 Markdown + suggestions 数组：

- **listIntent**（找表/订单/列表）→ Markdown 表格列出匹配表 + 推荐理由
- **detailIntent**（默认/查看详情）→ 基础信息 Markdown 表格
- **lineageIntent**（血缘/上游/下游）→ 上下游链路 + AI 洞察
- **fieldsIntent**（字段/schema）→ 字段详情 Markdown 表格
- **previewIntent**（预览/数据）→ 样本数据表格 + 数据概况
- **productionIntent**（生产/调度）→ 调度配置 + 执行记录表格

流式输出方式：

- `onStep` → 思考步骤（保留现有格式）
- `onMessage` → Markdown 文本逐字符输出
- `onSuggestions` → 追问建议数组（新增回调，在 onDone 之前调用）

### 3. 新建主页面：MapAgent/index.vue

与老 Agent `index.vue` 相比的差异：

- **去掉**：`TableDetailPanel`、`activeDetailData`、详情面板拖拽逻辑
- **保留**：左侧边栏（复用）、欢迎页（复用）、输入区（复用）、分享模式、暗色模式
- **新增**：`onSuggestions` 回调，将追问建议写入 AI 消息对象
- 消息对象结构：`{ id, role, status, content, steps, suggestions }`（无 `cardData`）

### 4. 新建消息列表：MessageList.vue（核心改造）

**与老版本的关键差异**：

1. **去掉所有卡片组件**：不再 import `TableCard`、`TableListCard`、`LineageCard`
2. **Markdown 渲染**：`import { marked } from 'marked'`，AI 消息 `content` 通过 `marked.parse()` 转为 HTML，用 `v-html` 输出到 `.markdown-body` 容器
3. **思考步骤 UI 保留原样**：`LoadingOutlined` / `CheckCircleOutlined` + 品牌紫色
4. **流式光标保留**：`msg.status === 'streaming'` 时显示品牌紫脉冲光标
5. **AI 消息无气泡**：去掉白色圆角边框气泡，改为无边框纯文本（千问风格）
6. **表格复制 icon**：通过 `watch + nextTick` 扫描渲染后的 `<table>` 元素，在每个表格右上角注入复制按钮
7. **追问建议 Chips**：`msg.suggestions` 在 `status === 'success'` 时渲染为品牌紫边框的可点击 chip
8. **分享模式完整保留**：复用 `ShareActionBar`、`ShareConfigModal`、`DislikeFeedbackCard`
9. **去掉 `viewDetail` 事件**：不再需要

**Markdown 样式**（`.markdown-body`）：

- 表格：圆角、`#f8fafc` 表头、hover 行高亮；暗色模式下 `#1e293b` 表头
- 代码：`#f3f4f6` 背景、monospace、品牌紫色文字
- blockquote：左边 4px 品牌紫边线
- 用户消息气泡：保持品牌紫 `bg-[rgba(108,76,155,1)]`

### 5. service 层

新建 `services/DataMap/MapAgent/index.js`：

- `getHistorySessions` → 直接从老 service 复用
- `getWorkspaceData` → 直接从老 service 复用
- `sendMessageStream` → 指向新的 `mock/DataMap/MapAgent/chat.js`

## 不涉及的文件（确认不动）

- `src/pages/DataMap/Agent/` 下所有文件
- `src/mock/DataMap/Agent/` 下所有文件
- `src/services/DataMap/Agent/` 下所有文件
- `src/components/` 下所有全局组件
- `src/stores/` 下所有 store

