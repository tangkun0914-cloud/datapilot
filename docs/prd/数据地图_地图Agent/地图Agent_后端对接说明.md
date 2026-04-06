# 地图 Agent（MapAgent）— 后端研发对接说明

> 仓库：`datapilot-datamap`  
> 前端页面入口：`/datamap/map-agent`（菜单「地图 Agent v2」）  
> **约定：接口路径与分包以 `src/services` 下代码为准；PRD/SDD 中若出现旧路径，需与前端或网关做映射或废弃说明。**

---

## 1. 必读文档（业务与架构）

| 文件 | 用途 |
|------|------|
| [数据地图Agent_v1.0版本的PRD.md](./数据地图Agent_v1.0版本的PRD.md) | 产品范围、场景、能力边界 |
| [数据地图Agent_v1.0版本的SDD.md](./数据地图Agent_v1.0版本的SDD.md) | 技术结构、数据流；其中 API 表可能与当前实现不一致，**以下文第 2 节代码为准** |
| [业务组件地图.md](../../design/业务组件地图.md)（检索 **MapAgent** / **L2-27**） | 模块与源码文件对应关系 |

---

## 2. 必须实现的接口（与当前前端一致）

### 2.1 流式对话（MapAgent v2）

- **前端封装**：`src/services/DataMap/MapAgent/index.js` → `sendMessageStream`
- **方法**：`POST /api/v1/agent/chat/stream`
- **请求体**：`{ "sessionId": string, "content": string }`
- **请求头**：`Content-Type: application/json`；`Authorization: Bearer <token>`（前端从 `localStorage.getItem('token')` 读取）
- **响应**：流式正文，按行解析；行格式为 `data: <JSON>`（SSE 常见写法）。  
  每行 JSON 对象需包含字段 **`type`**，前端分支如下：

| `type` | 用途 | 典型载荷字段 |
|--------|------|----------------|
| `text` | Markdown 增量文本 | `content` |
| `step` | 思考/步骤条 | `step` |
| `suggestions` | 追问建议 | `suggestions` |
| `tableDetail` | 表详情侧栏/结构化数据 | `tableDetail` |
| `tableListState` | 表格列表状态 | `tableListState` |

- 流结束可用 `[DONE]` 或自然结束；前端在 `read()` 完成后调用 `onDone`。
- **Mock 参考**（事件形态与内容样例）：`src/mock/DataMap/MapAgent/chat.js`（仅当 `VITE_USE_MOCK === 'true'` 时前端走 Mock）

### 2.2 会话与工作台（与旧 Agent 共用）

MapAgent **复用** `src/services/DataMap/Agent/index.js` 中导出能力：

| 能力 | 方法 | 路径 |
|------|------|------|
| 历史会话列表 | GET | `/api/v1/agent/sessions` |
| 工作台数据（推荐、收藏、分享等） | GET | `/api/v1/agent/workspace` |
| 删除会话 | DELETE | `/api/v1/agent/sessions/{sessionId}` |

- **Mock 参考**：`src/mock/DataMap/Agent/history.js`、`src/mock/DataMap/Agent/workspace.js`

### 2.3 HTTP 基座

- **封装文件**：`src/services/request.js`
- **基址**：环境变量 `VITE_API_BASE_URL`（与项目其它 DataMap 接口一致）

---

## 3. 环境与联调

| 变量 | 说明 |
|------|------|
| `VITE_USE_MOCK` | 为 `true` 时，MapAgent 对话与上述 Agent 接口均走 Mock，**不请求真实后端** |
| `VITE_USE_MOCK` | 非 `true` 时，走上述真实路径，需后端或网关可访问 |

---

## 4. 源码目录（后端可略读 UI）

| 路径 | 说明 |
|------|------|
| `src/pages/DataMap/MapAgent/` | MapAgent 页面与聊天 UI（除非要对齐字段展示，否则不必细读） |
| `src/services/DataMap/MapAgent/index.js` | **对接核心**：流式协议 |
| `src/services/DataMap/Agent/index.js` | 会话 / 工作台 / 旧版流式（MapAgent 仅复用前三项） |

---

## 5. 收藏与本地状态（可选后续产品化）

- **文件**：`src/utils/mapAgentFavorites.js`
- **现状**：表收藏主要存 **浏览器 localStorage**，用于与侧栏工作台 Mock 联动。
- **若后端提供「云端收藏 / 工作台」**：需新增独立接口并与前端约定替换 localStorage 策略（当前文档不绑定具体路径）。

---

## 6. 路由与菜单（供联调自测）

- **路由配置**：`src/router/index.js`（`path: 'datamap/map-agent'`，`name: 'MapAgent'`）

---

## 7. 一句话 checklist

1. 实现 **`POST /api/v1/agent/chat/stream`**，按 `type` 输出 `text` / `step` / `suggestions` / `tableDetail` / `tableListState`。  
2. 实现 **`GET /api/v1/agent/sessions`**、**`GET /api/v1/agent/workspace`**、**`DELETE /api/v1/agent/sessions/:id`**。  
3. 对齐 **Bearer Token** 与 **`VITE_API_BASE_URL`**。  
4. 对照 **`src/mock/DataMap/MapAgent/chat.js`** 与 **`Agent/history.js`、`workspace.js`** 理解数据结构样例。

---

*文档版本：与仓库 `src/services/DataMap/MapAgent` 及 `Agent` 对齐整理，后续若改路径请同步更新本节。*
