/**
 * 组件库注册表 -- 每个项目只需维护此文件
 * 引擎文件（index.vue / DocRenderer.vue）可跨项目复制复用
 *
 * 字段说明：
 *   file        → DocRenderer 通过 import.meta.glob 自动推导 import，无需写 component
 *   demo        → 可选，复杂组件提供自定义 Demo（优先级高于 file 自动推导）
 *   previewType → 可选，'modal' 时 DocRenderer 自动生成"打开弹窗"按钮
 *   events/slots/children → 无则省略，DocRenderer 按 ?.length 判断
 *
 * 侧边栏 Tab 归类（与 L1/L2 文档标签独立）：
 *   catalogTier     'platform' → 平台级 Tab：跨产品的壳层、导航、通用能力
 *                   'productModule' → 模块级 Tab：按产品模块（如数据地图、数据集成）归类
 *   productModule   产品模块名，仅 catalogTier 为 productModule 时填写，如「数据地图」「数据集成」
 */

import { tableDetail, sampleData, changeHistory, productionInfo } from '@/mock/detail.js'
import { mockTopics } from '@/mock/topics.js'

export const componentGroups = [
  // ═══════════════════════════════════════════════
  //  L1 平台级组件
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 平台级组件',
    groupLevel: 'L1',
    items: [
      {
        id: 'AppLayout',
        name: 'AppLayout',
        label: '全局导航框架',
        catalogTier: 'platform',
        level: '平台级',
        domain: '通用',
        type: 'layout',
        file: 'src/components/AppLayout.vue',
        desc: '承载平台导航体系，提供侧边菜单（可折叠）、顶部全局导航栏（业务域切换）、页面内容区及 Copilot 面板入口。',
        demo: () => import('./demos/AppLayoutDemo.vue'),
        props: [
          { prop: '(无外部 props)', type: '-', desc: '该组件作为路由布局容器，通过 <router-view /> 渲染子页面' },
        ],
        slots: [
          { name: 'default (router-view)', desc: '由 Vue Router 自动注入当前路由对应的页面组件' },
        ],
        usages: [
          { label: '全局路由布局', route: '/home' },
        ],
      },
      {
        id: 'DataSourceIcon',
        name: 'DataSourceIcon',
        label: '数据源图标',
        catalogTier: 'platform',
        level: '平台级',
        domain: '通用',
        type: 'display',
        file: 'src/components/DataSourceIcon.vue',
        desc: '展示不同数据源（MySQL、Hive、StarRocks 等）的图标标识，内置常用数据源的 SVG/图片资源。',
        defaultProps: { type: 'mysql', size: 32 },
        previewMultiple: [
          { label: 'MySQL', props: { type: 'mysql', size: 32 } },
          { label: 'Hive', props: { type: 'hive', size: 32 } },
          { label: 'StarRocks', props: { type: 'starrocks', size: 32 } },
          { label: '默认(未知)', props: { type: 'unknown', size: 32 } },
        ],
        props: [
          { prop: 'type', type: 'String', desc: '数据源类型（mysql, hive, starrocks 等）' },
          { prop: 'size', type: 'Number', desc: '图标大小（像素），默认 28' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
          { label: '资产详情', route: '/detail/example' },
          { label: '我的库表', route: '/mytables' },
        ],
      },
      {
        id: 'SourceTag',
        name: 'SourceTag',
        label: '数据源标签',
        catalogTier: 'platform',
        level: '平台级',
        domain: '通用',
        type: 'display',
        file: 'src/components/SourceTag.vue',
        desc: '基于 DataSourceIcon 封装的标签组件，固定 20px 尺寸，常用于表格或列表中标识数据源类型。',
        defaultProps: { type: 'mysql' },
        previewMultiple: [
          { label: 'MySQL', props: { type: 'mysql' } },
          { label: 'Hive', props: { type: 'hive' } },
          { label: 'StarRocks', props: { type: 'starrocks' } },
        ],
        props: [
          { prop: 'type', type: 'String', desc: '数据源类型' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'PageHeader',
        name: 'PageHeader',
        label: '页面标题导航',
        catalogTier: 'platform',
        level: '平台级',
        domain: '通用',
        type: 'layout',
        file: 'src/components/PageHeader.vue',
        desc: '标准页面头部组件，提供统一的面包屑导航、页面标题以及附加操作区（如按钮等）。',
        defaultProps: {
          title: '数据表详情',
          breadcrumbs: [{ label: '数据地图', path: '/' }, { label: '数据表详情' }],
        },
        props: [
          { prop: 'title', type: 'String', desc: '页面标题' },
          { prop: 'breadcrumbs', type: 'Array', desc: '面包屑配置数组：[{label, path}]' },
          { prop: 'hoverable', type: 'Boolean', desc: '标题是否可悬浮变色，默认 false' },
        ],
        slots: [
          { name: 'extra', desc: '标题右侧附加操作区' },
          { name: 'title', desc: '自定义标题内容' },
          { name: 'title-suffix', desc: '标题后缀' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
          { label: '专题详情', route: '/topics/1' },
          { label: '我的库表', route: '/mytables' },
        ],
      },
      {
        id: 'CopilotPanel',
        name: 'CopilotPanel',
        label: 'AI 助手面板',
        catalogTier: 'platform',
        level: '平台级',
        domain: '通用',
        type: 'interaction',
        file: 'src/components/Copilot/CopilotPanel.vue',
        desc: '全局 AI 助手侧边面板，由顶部工具栏触发展开，内嵌 ChatPanel 实现对话功能，支持收起/展开。',
        demo: () => import('./demos/ChatPanelDemo.vue'),
        props: [
          { prop: '(无外部 props)', type: '-', desc: '内部通过 useCopilotStore 管理展开状态和对话数据' },
        ],
        usages: [
          { label: '全局布局（AppLayout 内）', route: '/home' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 首页模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 首页模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'HeroBanner',
        name: 'HeroBanner',
        label: '全局智能检索区',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '首页',
        type: 'interaction',
        file: 'src/pages/Home/HeroBanner.new.vue',
        desc: '首页核心入口，提供搜索/AI 双模式检索，支持搜索建议、历史记录、热门标签及 AI 快捷提问卡片。',
        demo: () => import('./demos/HeroBannerDemo.vue'),
        events: [
          { event: 'openCopilot', params: '-', desc: '用户通过 AI 模式提问时触发，通知父组件打开 Copilot 面板' },
        ],
        children: [
          { id: 'L3-1', name: '双模式检索入口', data: '搜索/AI 模式切换、关键词输入、搜索建议下拉、历史记录' },
          { id: 'L3-2', name: '热门搜索标签', data: '订单明细、user_profile、营收报表、dwd_trade、数据质量' },
          { id: 'L3-3', name: '核心能力快捷入口', data: '智能找表、血缘追溯、数据质量、热门推荐 4 张 AI 快捷卡片' },
        ],
        usages: [
          { label: '首页', route: '/home' },
        ],
      },
      {
        id: 'RecentList',
        name: 'RecentList',
        label: '最近访问资产流',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '首页',
        type: 'display',
        file: 'src/pages/Home/RecentList.vue',
        desc: '展示用户最近交互的数据资产流，支持"最近浏览"、"我的收藏"、"热度榜"三种视图切换。',
        demo: () => import('./demos/RecentListDemo.vue'),
        children: [
          { id: 'L3-1', name: '资产视图分类 Tab', data: '最近浏览、我的收藏、热度榜' },
          { id: 'L3-2', name: '资产明细列表', data: '数据源图标、库名.表名、中文名、负责人、热度值、浏览量、收藏操作' },
          { id: 'L3-3', name: '热度排名标识', data: '排名徽章（前3名红色高亮）' },
        ],
        usages: [
          { label: '首页', route: '/home' },
        ],
      },
      {
        id: 'HomeOverview',
        name: 'HomeOverview',
        label: '平台数据概览区',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '首页',
        type: 'display',
        file: 'src/pages/Home/index.new.vue',
        desc: '首页右侧聚合区域，展示平台整体数据资产规模、热门专题推荐以及 AI Copilot 引导入口。',
        demo: () => import('./demos/HomeOverviewDemo.vue'),
        children: [
          { id: 'L3-1', name: '资产规模指标', data: '数据表总数(12,846)、数据库数(386)、数据源数(5)、日活跃查询(1,240)' },
          { id: 'L3-2', name: '热门专题推荐', data: '专题名称、描述、关联表数量，点击可跳转' },
          { id: 'L3-3', name: 'AI Copilot 引导入口', data: '渐变色卡片，点击唤起 Copilot 面板' },
        ],
        usages: [
          { label: '首页', route: '/home' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 资产检索模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 资产检索模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'SearchBar',
        name: 'SearchBar',
        label: '搜索输入栏',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产检索',
        type: 'interaction',
        file: 'src/pages/Search/SearchBar.vue',
        desc: '资产检索页顶部搜索输入组件，支持关键词输入、搜索建议下拉和双向绑定。',
        defaultProps: { modelValue: '' },
        props: [
          { prop: 'modelValue', type: 'String', desc: '搜索关键词（v-model 绑定）' },
        ],
        events: [
          { event: 'update:modelValue', params: 'value: String', desc: '关键词变化时触发' },
          { event: 'search', params: 'query: String', desc: '用户确认搜索时触发' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
        ],
      },
      {
        id: 'FilterPanel',
        name: 'FilterPanel',
        label: '筛选面板',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产检索',
        type: 'interaction',
        file: 'src/pages/Search/FilterPanel.vue',
        desc: '资产检索的多维度筛选面板，支持按数据类型、检索范围、数据库、负责人等维度过滤，筛选项由 API 动态加载。',
        props: [
          { prop: '(无外部 props)', type: '-', desc: '筛选选项通过 onMounted 调用 getFilterOptions() 加载' },
        ],
        events: [
          { event: 'change', params: '{ dataType, searchScope, database, owner }', desc: '任一筛选条件变化时触发，传递当前全部筛选状态' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
        ],
      },
      {
        id: 'ResultList',
        name: 'ResultList',
        label: '检索结果列表视图',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产检索',
        type: 'display',
        file: 'src/pages/Search/ResultList.vue',
        desc: '以卡片形式展示搜索命中的数据资产列表，包含数据源标识、表名、元数据摘要、字段预览及收藏操作。',
        demo: () => import('./demos/ResultListDemo.vue'),
        props: [
          { prop: 'data', type: 'Array', desc: '搜索结果数据数组' },
          { prop: 'loading', type: 'Boolean', desc: '是否显示加载状态，默认 false' },
        ],
        events: [
          { event: 'filterByTag', params: 'tag: Object', desc: '点击标签时触发，用于按标签快速筛选' },
          { event: 'favorite', params: 'item: Object', desc: '收藏/取消收藏时触发' },
        ],
        children: [
          { id: 'L3-1', name: '资产卡片头部', data: '数据源图标、类型标签、库名.表名、中文名、热度/浏览量、收藏' },
          { id: 'L3-2', name: '资产元数据摘要', data: '所属库、负责人、更新时间、业务域、数仓分层、描述' },
          { id: 'L3-3', name: '字段预览', data: '前 7 个字段名（hover 显示类型和描述）' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
        ],
      },
      {
        id: 'ResultTable',
        name: 'ResultTable',
        label: '检索结果表格视图',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产检索',
        type: 'display',
        file: 'src/pages/Search/ResultTable.vue',
        desc: '以表格形式展示搜索结果，支持行选择、导出和复制操作，适用于批量操作场景。',
        defaultProps: { data: [], loading: false },
        props: [
          { prop: 'data', type: 'Array', desc: '搜索结果数据数组' },
          { prop: 'loading', type: 'Boolean', desc: '是否显示加载状态' },
        ],
        events: [
          { event: 'export', params: '-', desc: '点击导出按钮时触发' },
          { event: 'copy', params: '-', desc: '点击复制按钮时触发' },
          { event: 'selectionChange', params: 'keys: Array', desc: '行选择变化时触发' },
        ],
        usages: [
          { label: '资产检索', route: '/search' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 资产详情模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 资产详情模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'InfoSidebar',
        name: 'InfoSidebar',
        label: '资产信息侧栏',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/InfoSidebar.vue',
        desc: '资产详情页右侧信息面板，聚合展示数据表的核心元数据：负责人、业务域、标签、存储大小、行数、查询热度等。',
        defaultProps: { table: tableDetail },
        props: [
          { prop: 'table', type: 'Object', desc: '数据表详情对象（required），包含 owners、domain、tags、profile、usageSummary 等字段' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'FieldDetailTab',
        name: 'FieldDetailTab',
        label: '字段详情',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/FieldDetailTab.vue',
        desc: '展示数据表全部字段的详细信息，包括字段名、类型、长度、描述、标签、约束及数据质量画像（非空率、唯一值等）。',
        defaultProps: {
          columns: tableDetail.columns,
          tableConstraints: tableDetail.tableConstraints,
        },
        props: [
          { prop: 'columns', type: 'Array', desc: '字段定义数组，每项含 name、dataType、description、tags、profile 等' },
          { prop: 'tableConstraints', type: 'Array', desc: '表约束数组，如 PRIMARY_KEY' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'PreviewTab',
        name: 'PreviewTab',
        label: '数据预览',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/PreviewTab.vue',
        desc: '展示数据表的样本数据和字段数据画像（分布、空值率、唯一值），通过 tableId 自动加载。',
        defaultProps: { tableId: '1' },
        props: [
          { prop: 'tableId', type: 'String', desc: '数据表 ID，变化时自动重新加载样本数据和画像' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'UsageTab',
        name: 'UsageTab',
        label: '使用说明',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/UsageTab.vue',
        desc: '展示数据表的使用说明文档，支持 Markdown 格式渲染。',
        defaultProps: { description: '## 使用说明\n\n本表为交易订单明细，T+1 增量同步。\n\n### 推荐查询\n\n```sql\nSELECT * FROM dwd_trade_order_detail WHERE dt = \'20241110\' LIMIT 100\n```' },
        props: [
          { prop: 'description', type: 'String', desc: '使用说明内容，支持 Markdown 格式' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'ScriptTab',
        name: 'ScriptTab',
        label: '建表语句',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/ScriptTab.vue',
        desc: '展示数据表的 DDL 建表语句，支持代码高亮和一键复制。',
        defaultProps: { table: tableDetail },
        props: [
          { prop: 'table', type: 'Object', desc: '数据表详情对象，从中提取 columns、name 等字段生成 DDL' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'ProductionTab',
        name: 'ProductionTab',
        label: '生产信息',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/ProductionTab.vue',
        desc: '展示数据表的生产调度信息，包括调度频率、最近执行记录、SLA 达标率和任务成功/失败状态。',
        defaultProps: { tableId: '1' },
        props: [
          { prop: 'tableId', type: 'String', desc: '数据表 ID，变化时自动加载生产信息' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'LineageTab',
        name: 'LineageTab',
        label: '数据血缘',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'interaction',
        file: 'src/pages/Detail/LineageTab.vue',
        desc: '基于 G6 图形引擎渲染数据表的上下游血缘关系图，支持表级/字段级血缘切换、节点展开、缩放和拖拽。',
        demo: () => import('./demos/LineageTabDemo.vue'),
        props: [
          { prop: 'fqn', type: 'String', desc: '数据表全限定名（fullyQualifiedName），用于加载血缘数据' },
        ],
        children: [
          { id: 'L3-1', name: '血缘关系图', data: '上游节点、中心节点、下游节点、连线（表级/字段级）' },
          { id: 'L3-2', name: '节点详情', data: '数据源图标、表名、库名、负责人、字段列表' },
          { id: 'L3-3', name: '血缘操作栏', data: '表级/字段级切换、缩放、全屏' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
      {
        id: 'ChangeHistoryTab',
        name: 'ChangeHistoryTab',
        label: '变更记录',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '资产详情',
        type: 'display',
        file: 'src/pages/Detail/ChangeHistoryTab.vue',
        desc: '展示数据表的 Schema 变更历史时间线，包括字段增减、类型变更、表注释修改等。',
        defaultProps: { tableId: '1' },
        props: [
          { prop: 'tableId', type: 'String', desc: '数据表 ID，变化时自动加载变更记录' },
        ],
        usages: [
          { label: '资产详情', route: '/detail/example' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 数据专题模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 数据专题模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'TopicCard',
        name: 'TopicCard',
        label: '专题卡片',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '数据专题',
        type: 'display',
        file: 'src/pages/Topics/TopicCard.vue',
        desc: '专题列表中的单张卡片，展示专题名称、标签、描述、表数量、关注人数等信息，支持编辑/删除/关注操作。',
        defaultProps: { topic: mockTopics[0], canEdit: false },
        props: [
          { prop: 'topic', type: 'Object', desc: '专题数据对象（required），含 name、tags、description、tableCount、followerCount 等' },
          { prop: 'canEdit', type: 'Boolean', desc: '是否显示编辑/删除按钮，默认 false' },
        ],
        events: [
          { event: 'edit', params: 'topic: Object', desc: '点击编辑时触发' },
          { event: 'delete', params: 'topic: Object', desc: '点击删除时触发' },
          { event: 'follow', params: 'topic: Object', desc: '点击关注/取关时触发' },
        ],
        usages: [
          { label: '数据专题', route: '/topics' },
        ],
      },
      {
        id: 'TopicDetail',
        name: 'TopicDetail',
        label: '专题详情页',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '数据专题',
        type: 'interaction',
        file: 'src/pages/Topics/TopicDetail.vue',
        desc: '专题详情完整页面，展示专题元信息、关联数据表列表、使用说明，支持添加/移除表、编辑说明等操作。依赖 route.params.id 加载数据。',
        demo: () => import('./demos/TopicDetailDemo.vue'),
        children: [
          { id: 'L3-1', name: '专题元信息', data: '专题名称、标签、描述、管理员、创建/更新时间、关注按钮' },
          { id: 'L3-2', name: '关联表管理', data: '数据表列表、添加表弹窗、移除表操作' },
          { id: 'L3-3', name: '使用说明', data: 'Markdown 文档编辑和渲染' },
        ],
        usages: [
          { label: '专题详情', route: '/topics/1' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 我的库表模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 我的库表模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'TableGroup',
        name: 'TableGroup',
        label: '库表分组列表',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '我的库表',
        type: 'display',
        file: 'src/pages/MyTables/TableGroup.vue',
        desc: '以分组列表形式展示用户负责的数据表，支持行选择（用于批量转让等操作）和空状态提示。',
        defaultProps: {
          tables: [
            { id: 't1', name: 'dwd_trade_order_detail', displayName: '交易订单明细', serviceType: 'Hive', database: 'dm_trade', owner: '张三(zhangsan)' },
            { id: 't2', name: 'ads_user_retention_day', displayName: '用户留存日统计', serviceType: 'StarRocks', database: 'dm_user', owner: '张三(zhangsan)' },
          ],
          selectable: false,
        },
        props: [
          { prop: 'tables', type: 'Array', desc: '数据表数组' },
          { prop: 'emptyText', type: 'String', desc: '空状态提示文本，默认 "暂无数据"' },
          { prop: 'selectable', type: 'Boolean', desc: '是否启用行选择，默认 false' },
          { prop: 'selectedRowKeys', type: 'Array', desc: '已选中的行 key 数组' },
        ],
        events: [
          { event: 'update:selectedRowKeys', params: 'keys: Array', desc: '选中行变化时触发' },
        ],
        usages: [
          { label: '我的库表', route: '/mytables' },
        ],
      },
      {
        id: 'TransferModal',
        name: 'TransferModal',
        label: '库表转让弹窗',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
        domain: '我的库表',
        type: 'interaction',
        file: 'src/pages/MyTables/TransferModal.vue',
        desc: '批量转让数据表负责人的弹窗，需选择目标负责人并填写转让原因。',
        previewType: 'modal',
        defaultProps: { tableCount: 3, tableNames: ['dwd_trade_order', 'ads_user_retention', 'dim_product_info'] },
        props: [
          { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
          { prop: 'tableCount', type: 'Number', desc: '待转让表数量' },
          { prop: 'tableNames', type: 'Array', desc: '待转让表名列表' },
        ],
        events: [
          { event: 'update:open', params: 'visible: Boolean', desc: '弹窗关闭时触发' },
          { event: 'confirm', params: '{ targetOwner, reason }', desc: '确认转让时触发，传递目标人和原因' },
        ],
        usages: [
          { label: '我的库表', route: '/mytables' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  //  L2 AI Copilot 模块
  // ═══════════════════════════════════════════════
  {
    groupName: 'L2 AI Copilot 模块',
    groupLevel: 'L2',
    items: [
      {
        id: 'ChatPanel',
        name: 'ChatPanel',
        label: 'AI 对话面板',
        catalogTier: 'platform',
        level: '平台级',
        domain: 'AI Copilot',
        type: 'interaction',
        file: 'src/components/Copilot/ChatPanel.vue',
        desc: '核心 AI 对话组件，支持多轮对话、流式输出、快捷建议、代码高亮，依赖 useCopilotStore 管理对话状态。',
        demo: () => import('./demos/ChatPanelDemo.vue'),
        props: [
          { prop: 'fullscreen', type: 'Boolean', desc: '是否全屏模式，默认 false。全屏时隐藏部分 UI 元素' },
        ],
        children: [
          { id: 'L3-1', name: '对话消息流', data: '用户消息、AI 回复（Markdown 渲染）、时间戳' },
          { id: 'L3-2', name: '输入区', data: '文本输入框、发送按钮、快捷建议标签' },
          { id: 'L3-3', name: '对话管理', data: '清空对话、对话历史' },
        ],
        usages: [
          { label: 'Copilot 面板', route: '/home' },
          { label: 'AI Copilot 全屏页', route: '/copilot' },
        ],
      },
    ],
  },
]
