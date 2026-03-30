---
name: 表详情页优化
overview: 对表详情页进行 12 项全面优化，涉及页面头部、左侧信息栏、字段详情、预览探查、使用说明、生产信息、血缘关系等多个 Tab 的 UI 和交互改进。
todos:
  - id: detail-header
    content: "Detail/index.vue + PageHeader.vue: 表名 hover 变蓝、申请权限按钮 UI、移除 Copilot"
    status: pending
  - id: info-sidebar
    content: "InfoSidebar.vue: 宽度30%、表名省略+tooltip、删除热度/浏览/权限、类目去掉、业务描述改为描述"
    status: pending
  - id: field-split
    content: "FieldDetailTab.vue: 分非分区/分区字段、删除索引信息、删安全级别列、主键蓝色icon"
    status: pending
  - id: field-toolbar
    content: "FieldDetailTab.vue: SELECT/DDL按钮UI优化、删除导出表结构、增加搜索框"
    status: pending
  - id: preview-tab
    content: "PreviewTab.vue: 按钮UI优化、间距调整、数据预览区域内滚动+表头固定"
    status: pending
  - id: usage-tab
    content: "UsageTab.vue: 增加编辑功能、移除下游依赖"
    status: pending
  - id: production-tab
    content: "ProductionTab.vue: 移除SLA、状态中文化、列名调整、移除操作列、上部UI优化"
    status: pending
  - id: lineage-tab
    content: "LineageTab.vue: 按钮UI优化、DAG节点卡片风格优化"
    status: pending
isProject: false
---

# 表详情页优化计划

## 涉及文件

- [Detail/index.vue](src/pages/Detail/index.vue) -- 详情页主容器 + 头部
- [PageHeader.vue](src/components/PageHeader.vue) -- 公共页头组件
- [Detail/InfoSidebar.vue](src/pages/Detail/InfoSidebar.vue) -- 左侧信息栏
- [Detail/FieldDetailTab.vue](src/pages/Detail/FieldDetailTab.vue) -- 字段详情
- [Detail/PreviewTab.vue](src/pages/Detail/PreviewTab.vue) -- 预览探查
- [Detail/UsageTab.vue](src/pages/Detail/UsageTab.vue) -- 使用说明
- [Detail/ProductionTab.vue](src/pages/Detail/ProductionTab.vue) -- 生产信息
- [Detail/LineageTab.vue](src/pages/Detail/LineageTab.vue) -- 血缘关系

---

## 1. 顶部表名交互优化

**文件**: `Detail/index.vue`, `PageHeader.vue`

- 表名 hover 时字体颜色变蓝色 `#1677ff`，增加 `cursor: pointer` 和 `transition`
- 中文名（displayName）弱化展示保持不变（已是灰色 `text-gray-500`）
- 热度/浏览/收藏 icon 保持当前效果不变

## 2. 头部按钮调整

**文件**: `Detail/index.vue`

- "申请权限" 按钮改为更精致的样式：`type="default"` + 灰色描边 + hover 变蓝，类似资产检索页的 toolbar-btn 风格
- 移除 Copilot 按钮（删除 `<a-button type="primary" :icon="h(RobotOutlined)">Copilot</a-button>`）
- 移除 `RobotOutlined` import

## 3. 左侧信息栏优化

**文件**: `Detail/InfoSidebar.vue`, `Detail/index.vue`

- **宽度**：`.info-sidebar` 从 `280px` 改为 `30%`（在 `index.vue` 中改 `.detail-sidebar` 为 `width: 30%`）
- **表名**：英文名上方 + 中文名下方，增加 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` + `a-tooltip` 展示全名
- **基础信息**：删除"使用热度"、"浏览次数"、"权限状态" 三个 info-item
- **业务信息**：删除"类目" info-item；"业务描述"改为"描述"

## 4. 字段详情：分为非分区字段和分区字段

**文件**: `FieldDetailTab.vue`

- 将 `columns` props 按是否为分区字段分成两组：`normalFields`（非分区）和 `partitionFields`（分区，即 `name === 'dt'` 等）
- 渲染两个表格区域，分别用小标题"非分区字段"和"分区字段"区分
- 移除"索引信息"整个 section（删除 `index-section` + `constraintColumns` 及对应表格）

## 5. 字段详情：列调整 + 主键图标

**文件**: `FieldDetailTab.vue`

- 从 `tableColumns` 中删除 `{ title: '安全级别', key: 'security', ... }` 列及对应 `bodyCell` 模板
- 从 `tableColumns` 中删除 `{ title: '分区', key: 'partition', ... }` 列（已通过分组替代）
- 标签列展示字段自身的标签（如"用户"、"放款"等），不展示 PII 相关标签
- 主键 icon 从 `text-amber-500` 改为蓝色 `text-blue-500`

## 6. 工具栏 UI 优化

**文件**: `FieldDetailTab.vue`

- "生成 SELECT" 和 "生成 DDL" 改为更精致的 `type="link"` 或图标+文字的紧凑按钮
- 删除"导出表结构"按钮及其 dropdown
- 移除 `DownloadOutlined` import

## 7. 字段详情增加搜索框

**文件**: `FieldDetailTab.vue`

- 在工具栏左侧增加 `a-input-search` 搜索框，`placeholder="搜索字段"`
- 增加 `searchKeyword` ref，computed `filteredColumns` 对 `columns` 按 `name` 或 `description` 进行模糊过滤
- 表格的 `data-source` 改为 `filteredColumns`

## 8. 预览探查：按钮 UI + 间距

**文件**: `PreviewTab.vue`

- "数据预览"/"数据探查" 切换按钮使用与资产检索页相同的分段控制器样式（灰底 + 白色选中 + 蓝字）
- `margin-bottom` 从 `mb-3` 增大到 `mb-4`（16px），拉开与表格的间距

## 9. 预览探查：数据预览区域内滚动 + 表头固定

**文件**: `PreviewTab.vue`

- 给数据预览表格的容器增加 `max-height` 限制（如 `500px`）+ `overflow-y: auto`
- `a-table` 增加 `:scroll="{ y: 460 }"` 实现表头固定、内容区域滚动

## 10. 使用说明：增加编辑功能 + 移除下游依赖

**文件**: `UsageTab.vue`

- 增加"编辑"按钮（`EditOutlined`），点击后切换为编辑模式
- 编辑模式下：展示四个 `a-textarea` 分别对应"表说明"、"口径说明"、"注意事项"、"示例SQL"
- 底部展示"保存"和"取消"按钮
- 保存时将值合并回 `usageDoc` 并切换回预览模式
- 从 `usageDoc` 中移除"## 下游依赖"及其后内容

## 11. 生产信息优化

**文件**: `ProductionTab.vue`

- 上部分：移除"SLA 达标率"卡片，仅保留"任务名称"、"调度周期"、"最近产出时间" 3 个卡片
- 3 个卡片改为 `a-col :lg="8"`（三等分），整体改为一行紧凑的信息条样式（背景 `#f8fafc`，无悬浮效果）
- 状态展示：`SUCCESS` 改为"成功"，`FAILED` 改为"失败"，`RUNNING` 改为"运行中"，`PENDING` 改为"等待中"
- 列名调整：执行ID -> 实例ID，任务名称 -> 实例名称
- 移除"操作"列（删除 action column 及代码/日志相关 modal）

## 12. 血缘关系：按钮 UI + DAG 风格

**文件**: `LineageTab.vue`

- "表级血缘"/"字段级血缘"切换按钮使用与资产检索页相同的分段控制器样式（灰底 + 白色选中 + 蓝字）
- DAG 风格优化：节点改为左右布局的卡片（左侧图标 + 右侧表名/数据源双行），圆角 8px，增加阴影
- 当前节点高亮用蓝色左边框标识
- 连线改为带箭头的贝塞尔曲线（保持现有逻辑），线条颜色加深
