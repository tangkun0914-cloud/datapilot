---
name: DataMap V2.1 Build
overview: 基于 dataMap-SDD.md 规格文档，在 /Users/wangrui/Desktop/dataPilot/datapilot-datamap/ 下创建全新 Vue 3 项目，按 14 个 Task 的依赖顺序逐步构建 8 个页面 + 全局 Copilot + 完整 Mock 数据。
todos:
  - id: v2_init
    content: "[Phase 1] 创建项目 + 安装依赖 + 配置 Tailwind/AntDV 主题/端口/环境变量"
    status: completed
  - id: v2_services
    content: "[Phase 1] 创建 API 服务层 (request.js + 6 service)，Mock/API 双模式切换"
    status: completed
  - id: v2_mock
    content: "[Phase 1] 5 个 Mock 数据文件，严格对齐 OpenMetadata API 响应结构"
    status: completed
  - id: v2_layout
    content: "[Phase 1] AppLayout (深蓝侧边栏+顶导) + PageHeader + SourceTag"
    status: completed
  - id: v2_routes
    content: "[Phase 1] Vue Router 路由配置 (8 页面 + FQN 参数) + 侧边栏菜单"
    status: completed
  - id: v2_home
    content: "[Phase 2] 首页：HeroBanner (搜索跳转+AI找表) + RecentList + HotRank"
    status: completed
  - id: v2_dashboard
    content: "[Phase 2] 资产大盘：StatCards + LayerChart + TrendChart (纯 SVG)"
    status: completed
  - id: v2_search
    content: "[Phase 2] 资产检索：SearchBar + FilterPanel + ResultList + ResultTable (双模式)"
    status: completed
  - id: v2_catalog
    content: "[Phase 2] 资产目录：CatalogTree + CatalogTable"
    status: completed
  - id: v2_detail
    content: "[Phase 2] 资产详情：InfoSidebar + 6 Tab (字段/预览Profiling/使用说明/生产/血缘DAG/变更Diff)"
    status: completed
  - id: v2_topics
    content: "[Phase 2] 数据专题：TopicCard 卡片网格"
    status: completed
  - id: v2_mytables
    content: "[Phase 2] 我的库表：TableGroup + 三 Tab"
    status: completed
  - id: v2_copilot
    content: "[Phase 2] 全局 Copilot：Trigger + Drawer + ChatPanel + ResultCards + CopilotFull + 页面内嵌入口"
    status: completed
  - id: v2_verify
    content: "[Phase 3] 全量构建验证 + 启动 dev server (5180) + 页面跳转测试"
    status: completed
isProject: false
---

# DataPilot 数据地图 V2.1 — Build 构建计划

规格文档：[dataMap-SDD.md](数据地图/dataMap-SDD.md)
项目目录：`/Users/wangrui/Desktop/dataPilot/datapilot-datamap/`

## Phase 1: 基础设施 (Task 1-5)

### Task 1: v2_init — 项目初始化

- `npm create vite@latest datapilot-datamap -- --template vue` 在 `/Users/wangrui/Desktop/dataPilot/` 下
- 安装依赖：`ant-design-vue@4`, `@ant-design/icons-vue`, `tailwindcss@4`, `@tailwindcss/vite`, `vue-router@4`, `pinia`, `axios`
- 配置 Tailwind CSS v4 (`preflight: false`)
- 配置 Ant Design Vue 主题色 `#1677ff`
- 创建 `.env` 文件：`VITE_USE_MOCK=true`
- 配置 `vite.config.js`：端口 5180、路径别名 `@/` -> `src/`
- 创建 `src/index.css`：全局样式变量（SDD 第 479-489 行 UI 规范）

### Task 2: v2_services — API 服务层

- `src/services/request.js`：Axios 实例，baseURL 从环境变量读取，拦截器
- 6 个 service 文件（tableService / searchService / lineageService / tagService / domainService / glossaryService）
- 每个 service 内部判断 `VITE_USE_MOCK`：true 时 import mock 数据，false 时调用真实 API
- API 端点严格按 SDD 1.2 节映射表（第 195-215 行）

### Task 3: v2_mock — Mock 数据

- 5 个 mock 文件，数据结构严格对齐 OpenMetadata API 响应（SDD 第 217-263 行示例）
  - `mock/assets.js` — 搜索结果 + 首页数据（最近浏览、热门排行）
  - `mock/dashboard.js` — 统计卡片、分层分布、数据源分布、业务域分布
  - `mock/detail.js` — 表详情（含 columns + tags + profile + sampleData + lineage + feed）
  - `mock/catalog.js` — 数据库/Schema 树形 + 表列表
  - `mock/ai.js` — Copilot 对话数据
- 人员姓名统一 `姓名(邮箱前缀)` 格式

### Task 4: v2_layout — 全局布局

- `src/components/AppLayout.vue`：深蓝 `#001529` 侧边栏 + 深蓝顶导 + 浅灰 `#f5f7fa` 内容区
- `src/components/PageHeader.vue`：面包屑 + 标题 + 操作按钮插槽
- `src/components/SourceTag.vue`：数据源类型彩色标签

### Task 5: v2_routes — 路由 + 菜单

- `src/router/index.js`：Vue Router v4 配置
- 8 个页面路由，详情页支持 FQN 参数：`/detail/:fqn`
- 侧边栏菜单数据（图标 + 名称 + 路由）

## Phase 2: 8 个页面 + Copilot (Task 6-13)

### Task 6: v2_home — 首页

- `HeroBanner.vue`：搜索框回车/点击 -> `router.push('/search?q=keyword')`，右侧「AI 找表」按钮
- `RecentList.vue`：最近浏览 / 我的收藏 Tab 切换
- `HotRank.vue`：全域热度排行榜

### Task 7: v2_dashboard — 资产大盘

- `StatCards.vue`：5 个指标卡片（纯 CSS + Ant Design Statistic）
- `LayerChart.vue`：数仓分层横向条形图（纯 SVG）
- `TrendChart.vue`：数据源分布环形图 + 业务域分布 + 热度 Top 10 表格

### Task 8: v2_search — 资产检索

- `SearchBar.vue`：支持历史记录下拉 + 搜索推荐 + 关键词匹配表名和标签
- `FilterPanel.vue`：8 维筛选（数据类型/库/负责人/状态/业务线/项目/主题/标签）
- `ResultList.vue`：卡片列表模式，标签可点击筛选
- `ResultTable.vue`：Excel 模式，支持列隐藏/复制/下载
- 列表/Excel 双模式切换

### Task 9: v2_catalog — 资产目录

- `CatalogTree.vue`：左侧树形导航（业务域 -> 分层 -> 表）
- `CatalogTable.vue`：右侧表资产列表

### Task 10: v2_detail — 资产详情（最复杂页面）

- `InfoSidebar.vue`：上部基础信息（含行数/容量/权限状态）+ 下部业务信息（含类目/标签）
- `FieldDetailTab.vue`：字段表格（含安全级别/标签列）+ 索引区 + 操作栏（SELECT/DDL/导出）
- `PreviewTab.vue`：前 50 行预览 + 数据探查 Profiling（字段统计卡片）
- `UsageTab.vue`：Markdown 文档区
- `ProductionTab.vue`：任务列表 + 代码/日志查看
- `LineageTab.vue`：SVG DAG 血缘图（表级 + 字段级切换）
- `ChangeHistoryTab.vue`：DDL 时间线 + 版本对比 Diff

### Task 11: v2_topics — 数据专题

- `TopicCard.vue`：卡片网格（专题名/描述/表数量/负责人）

### Task 12: v2_mytables — 我的库表

- `TableGroup.vue`：三 Tab（我负责的/我收藏的/最近访问）

### Task 13: v2_copilot — 全局 AI Copilot

- `src/components/Copilot/CopilotTrigger.vue`：顶导右侧图标按钮
- `src/components/Copilot/CopilotDrawer.vue`：Ant Design Drawer 抽屉容器
- `src/components/Copilot/ChatPanel.vue`：消息列表 + 输入框 + @ 上下文引用
- `src/components/Copilot/ResultCards.vue`：资产结果卡片
- `src/pages/CopilotFull/index.vue`：全屏页（左侧历史列表 + 右侧对话区）
- 在 Home/Search/Detail 页面添加内嵌入口按钮

## Phase 3: 验证 (Task 14)

### Task 14: v2_verify — 全量验证

- `npm run build` 确保零错误
- `npm run dev` 启动开发服务器（端口 5180）
- 验证所有 8 个页面路由可访问
- 验证页面间跳转（首页搜索 -> 检索页，检索 -> 详情，Copilot 抽屉等）

## 执行策略

- 按 Phase 1 -> Phase 2 -> Phase 3 顺序执行
- Phase 2 中 Task 6-13 可根据依赖关系适当并行（均依赖 Task 3+5）
- 每个 Task 完成后更新 todo 状态
- 每个 `.vue` 文件使用 `<script setup>` + Composition API，主页面不超过 80 行
- 所有图表使用纯 SVG，零额外图表库依赖
- 遵循 DataWorks 蓝白风格 UI 规范（SDD 第 479-489 行）

