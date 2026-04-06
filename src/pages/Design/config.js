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

import { tableDetail, sampleData, changeHistory, productionInfo } from '@/mock/DataMap/detail.js'
import { mockTopics } from '@/mock/DataMap/topics.js'
import { alertList, filterOptions as monitoringFilterOptions } from '@/mock/Monitoring/monitoring.js'

export const componentGroups = [
  // ═══════════════════════════════════════════════
  //  L1 平台级
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 平台级',
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
    ]
  },

  // ═══════════════════════════════════════════════
  //  L1 数据地图
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 数据地图',
    groupLevel: 'L1',
    children: [
      {
        groupName: 'L2 通用组件',
        groupLevel: 'L2',
        items: [

      {
        id: 'DataSourceIcon',
        name: 'DataSourceIcon',
        label: '数据源图标',
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
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
        catalogTier: 'productModule',
        productModule: '数据地图',
        level: '模块级',
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
        ]
      },
      {
        groupName: 'L2 首页',
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
            file: 'src/pages/DataMap/Home/HeroBanner.new.vue',
            desc: '首页核心入口，提供搜索/AI 双模式检索，支持搜索建议、历史记录、热门标签及 AI 快捷提问卡片。',
            demo: () => import('./demos/HeroBannerDemo.vue'),
            events: [
              { event: 'openCopilot', params: '-', desc: '用户通过 AI 模式提问时触发，通知父组件打开 Copilot 面板' },
            ],
            children: [
              { id: 'L3-1', name: '双模式检索入口', data: '搜索/AI 模式切换、关键词输入、搜索建议下拉、历史记录' },
              { id: 'L3-2', name: '热门搜索标签', data: '订单明细、user_profile、营收报表、dwd_trade、数据质量' },
              { id: 'L3-3', name: '核心能力快捷入口', data: '本期仅智能找表：业务用途 / 关键词 / 项目范围 / 专题范围 4 张卡片（与 Copilot 一致）' },
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
            file: 'src/pages/DataMap/Home/RecentList.vue',
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
            file: 'src/pages/DataMap/Home/index.new.vue',
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
        ]
      },
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
            file: 'src/pages/DataMap/Search/SearchBar.vue',
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
            file: 'src/pages/DataMap/Search/FilterPanel.vue',
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
            file: 'src/pages/DataMap/Search/ResultList.vue',
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
            file: 'src/pages/DataMap/Search/ResultTable.vue',
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
        ]
      },
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
            file: 'src/pages/DataMap/Detail/InfoSidebar.vue',
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
            file: 'src/pages/DataMap/Detail/FieldDetailTab.vue',
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
            file: 'src/pages/DataMap/Detail/PreviewTab.vue',
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
            file: 'src/pages/DataMap/Detail/UsageTab.vue',
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
            file: 'src/pages/DataMap/Detail/ScriptTab.vue',
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
            file: 'src/pages/DataMap/Detail/ProductionTab.vue',
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
            file: 'src/pages/DataMap/Detail/LineageTab.vue',
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
            file: 'src/pages/DataMap/Detail/ChangeHistoryTab.vue',
            desc: '展示数据表的 Schema 变更历史时间线，包括字段增减、类型变更、表注释修改等。',
            defaultProps: { tableId: '1' },
            props: [
              { prop: 'tableId', type: 'String', desc: '数据表 ID，变化时自动加载变更记录' },
            ],
            usages: [
              { label: '资产详情', route: '/detail/example' },
            ],
          },
        ]
      },
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
            file: 'src/pages/DataMap/Topics/TopicCard.vue',
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
            file: 'src/pages/DataMap/Topics/TopicDetail.vue',
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
        ]
      },
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
            file: 'src/pages/DataMap/MyTables/TableGroup.vue',
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
            id: 'TransferModal_MyTables',
            name: 'TransferModal',
            label: '库表转让弹窗',
            catalogTier: 'productModule',
            productModule: '数据地图',
            level: '模块级',
            domain: '我的库表',
            type: 'interaction',
            file: 'src/pages/DataMap/MyTables/TransferModal.vue',
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
        ]
      },
      {
        groupName: 'L2 AI COPILOT模块',
        groupLevel: 'L2',
        items: [
          {
            id: 'CopilotPortalDemo',
            name: 'CopilotPortal',
            label: '新版 Copilot 首页概念',
            catalogTier: 'productModule',
            productModule: '数据地图',
            level: '模块级',
            domain: 'AI Copilot',
            type: 'interaction',
            file: 'src/pages/Design/demos/CopilotPortalDemo.vue',
            desc: '基于千问/ChatGPT交互范式的全新数据地图首页概念 Demo。包含左侧个人工作台（会话历史、收藏）和中心沉浸式对话检索区域。',
            demo: () => import('./demos/CopilotPortalDemo.vue'),
            props: [],
            usages: [
              { label: '新版首页概念', route: '/home' },
            ],
          },
          {
            id: 'PilotLogo',
            name: 'PilotLogo',
            label: 'DataPilot Logo',
            catalogTier: 'platform',
            level: '平台级',
            domain: 'AI Copilot',
            type: 'display',
            file: 'src/components/Copilot/PilotLogo.vue',
            desc: 'DataPilot 星形 SVG Logo（源自 data-agent PilotLogo）。type=color 时为紫渐变，主色与 Copilot 统一为 rgba(108, 76, 155)；支持 white/dark 纯色用于深浅背景。ChatPanel 欢迎区等处使用。',
            demo: () => import('./demos/PilotLogoDemo.vue'),
            props: [
              { prop: 'size', type: 'Number', desc: '图标边长（px），默认 24' },
              { prop: 'type', type: 'String', desc: 'color（渐变）| white | dark，默认 color' },
            ],
            children: [
              { id: 'L3-1', name: '渐变', data: 'linearGradient，--agent-primary 默认 rgba(108, 76, 155)' },
              { id: 'L3-2', name: '中心点', data: '白色圆点' },
            ],
            usages: [
              { label: 'ChatPanel 欢迎区', route: '/home' },
              { label: 'Copilot 全屏', route: '/copilot' },
            ],
          },
          {
            id: 'CopilotPanel',
            name: 'CopilotPanel',
            label: 'AI 助手面板',
            catalogTier: 'productModule',
            productModule: '数据地图',
            level: '模块级',
            domain: 'AI Copilot',
            type: 'interaction',
            file: 'src/components/Copilot/CopilotPanel.vue',
            desc: '全局 AI 助手侧边面板（420px），支持 chat/list 双视图切换。chat 视图内嵌 ChatPanel 聊天，list 视图展示 SessionList 会话列表。顶部提供全屏、会话管理、新建对话、关闭等操作。',
            demo: () => import('./demos/CopilotPanelDemo.vue'),
            props: [
              { prop: '(无外部 props)', type: '-', desc: '内部通过 useCopilotStore 管理展开状态、视图模式和会话数据' },
            ],
            children: [
              { id: 'L3-1', name: 'Header 操作栏', data: '全屏按钮、会话管理切换、新建对话、关闭' },
              { id: 'L3-2', name: 'Chat 视图', data: 'ChatPanel 聊天面板' },
              { id: 'L3-3', name: 'List 视图', data: 'SessionList 会话列表（搜索/筛选/管理）' },
            ],
            usages: [
              { label: '全局布局（AppLayout 内）', route: '/home' },
            ],
          },
          {
            id: 'CopilotFull',
            name: 'CopilotFull',
            label: 'AI 全屏对话页',
            catalogTier: 'productModule',
            productModule: '数据地图',
            level: '模块级',
            domain: 'AI Copilot',
            type: 'interaction',
            file: 'src/components/Copilot/CopilotFull.vue',
            desc: 'Copilot 全屏模式页面，采用 split-layout 左右分栏：左侧 280px 会话列表（SessionList）+ 右侧聊天区（ChatPanel）。支持会话切换、新建对话、退出全屏。',
            demo: () => import('./demos/CopilotFullDemo.vue'),
            props: [
              { prop: '(无外部 props)', type: '-', desc: '通过路由 /copilot 进入，内部使用 useCopilotStore 管理状态' },
            ],
            children: [
              { id: 'L3-1', name: '左侧会话列表', data: 'SessionList 组件 + 新建对话按钮' },
              { id: 'L3-2', name: '右侧聊天区', data: 'Header（标题/退出/关闭）+ ChatPanel' },
            ],
            usages: [
              { label: 'AI Copilot 全屏页', route: '/copilot' },
            ],
          },
          {
            id: 'SessionList',
            name: 'SessionList',
            label: '会话列表',
            catalogTier: 'productModule',
            productModule: '数据地图',
            level: '模块级',
            domain: 'AI Copilot',
            type: 'interaction',
            file: 'src/components/Copilot/SessionList.vue',
            desc: 'Copilot 会话管理列表组件，支持搜索关键词、按模块筛选、会话卡片展示（标题/摘要/标签/时间）、重命名和删除操作。区分当前会话/历史会话两组。',
            demo: () => import('./demos/SessionListDemo.vue'),
            props: [
              { prop: 'sessions', type: 'Array', desc: '会话数组，每项含 id/title/summary/tags/module/ts/status' },
              { prop: 'isFullscreen', type: 'Boolean', desc: '是否全屏模式（影响激活态判断逻辑），默认 false' },
              { prop: 'viewingSessionId', type: 'Number|String|null', desc: '当前查看的会话 ID（全屏模式下使用）' },
            ],
            events: [
              { event: 'select', params: 'session: Object', desc: '点击会话卡片时触发' },
              { event: 'delete', params: 'session: Object', desc: '删除会话时触发' },
            ],
            children: [
              { id: 'L3-1', name: '搜索筛选区', data: '模块下拉选择 + 关键词搜索输入' },
              { id: 'L3-2', name: '当前会话组', data: 'status=ACTIVE 的会话卡片' },
              { id: 'L3-3', name: '历史会话组', data: '非 ACTIVE 的会话卡片（含模块标签/摘要/标签/时间）' },
            ],
            usages: [
              { label: 'CopilotPanel（list 视图）', route: '/home' },
              { label: 'CopilotFull（左侧栏）', route: '/copilot' },
            ],
          },
          {
            id: 'ChatPanel',
            name: 'ChatPanel',
            label: 'AI 对话面板',
            catalogTier: 'platform',
            level: '平台级',
            domain: 'AI Copilot',
            type: 'interaction',
            file: 'src/components/Copilot/ChatPanel.vue',
            desc: '核心 AI 对话组件。本期仅「智能找表」：空态展示欢迎页（Logo + 4 种找表范围卡片：业务用途/关键词/项目范围/专题范围），对话中支持多轮消息、简易 Markdown 渲染、用户消息行内编辑（覆盖重写/仅回退）、消息复制、点赞/踩反馈、Agent 意图标签、输入栏左侧「选择意图」下拉、@ 提及表名、打字指示器、自动滚动。消息数据通过 useCopilotStore 全局共享。',
            demo: () => import('./demos/ChatPanelDemo.vue'),
            props: [
              { prop: 'fullscreen', type: 'Boolean', desc: '是否全屏模式，默认 false' },
            ],
            children: [
              { id: 'L3-1', name: '欢迎页', data: 'PilotLogo（主色 rgba(108, 76, 155)）、标题、副标题、4 张智能找表范围卡片（业务用途/关键词/项目范围/专题）' },
              { id: 'L3-2', name: '消息列表', data: '用户消息（紫色气泡）、AI 回复（白色气泡+Markdown）、ResultCards 表卡片' },
              { id: 'L3-3', name: '消息反馈', data: '复制、点赞、踩（AI 消息）；编辑、复制（用户消息，编辑时用 UserMessageInlineEditor）' },
              { id: 'L3-4', name: '输入区', data: '文本输入框、意图选择（a-select，与欢迎卡片对齐）、@ 提及下拉、发送按钮' },
            ],
            usages: [
              { label: 'CopilotPanel', route: '/home' },
              { label: 'CopilotFull', route: '/copilot' },
            ],
          },
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  //  L1 监控运维
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 监控运维',
    groupLevel: 'L1',
    children: [
      {
        groupName: 'L2 告警列表页',
        groupLevel: 'L2',
        items: [

      {
        id: 'AlertStatusBadge',
        name: 'AlertStatusBadge',
        label: '告警状态徽章',
        catalogTier: 'productModule',
        productModule: '监控运维',
        level: '模块级',
        domain: '告警中心',
        type: 'display',
        file: 'src/pages/Monitoring/components/AlertStatusBadge.vue',
        desc: '统一展示告警生命周期状态（触发中、处理中、已屏蔽、已转交、已解决、误报）的徽章组件，含图标与配色。供 AlertCard、详情抽屉及任意列表/表格列复用。',
        demo: () => import('./demos/AlertStatusBadgeDemo.vue'),
        props: [
          {
            prop: 'status',
            type: 'String',
            desc: '必填。枚举：firing（触发中）、acked（处理中）、silenced（已屏蔽）、transferred（已转交）、resolved（已解决）、falsePositive（误报）',
          },
        ],
        children: [
          { id: 'L3-1', name: '图标', data: 'ThunderboltFilled / LoadingOutlined / BellFilled / WarningOutlined 或文本符号' },
          { id: 'L3-2', name: '样式', data: '各状态独立边框与文字色，误报为透明底+描边' },
        ],
        usages: [
          { label: '告警事件列表', route: '/monitoring/alerts' },
          { label: '组件库', route: '/design' },
        ],
      },
          {
            id: 'AlertCard',
            name: 'AlertCard',
            label: '告警事件卡片',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/AlertList/AlertCard.vue',
            desc: '单条告警事件的展示卡片，集成状态标识、操作按钮组、元信息区和日志摘要。根据 severity 和 status 自动切换 ERROR(红)/WARN(蓝)/已解决(绿)/误报(橙) 主题边框色和操作按钮集。',
            demo: () => import('./demos/AlertCardDemo.vue'),
            props: [
              { prop: 'alert', type: 'Object', desc: '告警对象（required），核心字段：id, title, severity(ERROR/WARN), status(firing/acked/silenced/transferred/resolved/falsePositive), source, monitorEvent, triggerTime, owner 等' },
              { prop: 'checked', type: 'Boolean', desc: '是否被勾选（用于批量操作），默认 false' },
            ],
            events: [
              { event: 'check', params: 'checked: Boolean', desc: '勾选状态变化' },
              { event: 'titleClick', params: 'alert: Object', desc: '点击告警标题，通常用于打开详情抽屉' },
              { event: 'action', params: 'type: String, alert: Object', desc: '操作按钮点击，type 为 claim/silence/resolve/transfer/falsePositive' },
            ],
            children: [
              { id: 'L3-1', name: '卡片头部', data: '等级标签、标题链接、状态徽章、调度信息、恢复类型标签' },
              { id: 'L3-2', name: '操作按钮组', data: '根据 status 动态切换：认领/屏蔽/已解决/转交/误报' },
              { id: 'L3-3', name: '元信息区', data: '触发时间、来源、监控事件、通知次数、升级信息、屏蔽/转交/误报详情' },
              { id: 'L3-4', name: '日志摘要', data: '调用 AlertLogSection 子组件，智能提取日志片段' },
              { id: 'L3-5', name: '底部信息栏', data: '事件ID、负责人、操作人' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'FilterSection',
            name: 'FilterSection',
            label: '告警筛选区',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/AlertList/FilterSection.vue',
            desc: '告警列表的筛选区域，支持来源、任务名/数据表名（动态切换）、事件ID、监控事件、事件状态、告警等级、调度批次、负责人等多维度筛选，支持展开/收起。',
            defaultProps: { filterOptions: monitoringFilterOptions },
            props: [
              { prop: 'filterOptions', type: 'Object', desc: '筛选选项配置，含 sources, events, statuses, levels, owners, operators 数组' },
            ],
            events: [
              { event: 'query', params: 'formData: Object', desc: '点击查询时触发，传递当前筛选表单值' },
              { event: 'reset', params: '-', desc: '点击重置时触发' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'StatsCards',
            name: 'StatsCards',
            label: '告警统计卡片',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/AlertList/StatsCards.vue',
            desc: '告警列表顶部的统计概览卡片组，展示我的待处理、我的新增、全部待处理、今日新增等指标，支持点击切换筛选。',
            defaultProps: {
              cards: [
                { label: '我的待处理', value: 20, color: '#ff4d4f' },
                { label: '我的新增', value: 10, color: '#fa8c16' },
                { label: '全部待处理', value: 10, color: '#1677ff' },
                { label: '今日新增', value: 6, color: '#52c41a' },
              ],
              activeIndex: 0,
            },
            props: [
              { prop: 'cards', type: 'Array', desc: '统计卡片数组，每项含 label, value, color' },
              { prop: 'activeIndex', type: 'Number', desc: '当前激活卡片索引' },
            ],
            events: [
              { event: 'select', params: 'index: Number', desc: '点击卡片时触发' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'BulkActionBar',
            name: 'BulkActionBar',
            label: '批量操作悬浮栏',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/AlertList/BulkActionBar.vue',
            desc: '告警列表底部悬浮操作栏，展示已选数量并提供批量认领、误报、屏蔽、转交、已解决等操作。勾选数为 0 时自动隐藏。',
            defaultProps: { count: 3 },
            props: [
              { prop: 'count', type: 'Number', desc: '当前勾选的告警数量，为 0 时隐藏' },
            ],
            events: [
              { event: 'bulk', params: 'action: String', desc: '批量操作，action: claim/falsePositive/silence/transfer/resolve' },
              { event: 'cancel', params: '-', desc: '取消全部勾选' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'ResolveModal',
            name: 'ResolveModal',
            label: '已解决弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/modals/ResolveModal.vue',
            previewType: 'modal',
            desc: '标记告警为已解决的表单弹窗，要求填写故障根因（级联选择）和可选诊断备注。',
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
            ],
            events: [
              { event: 'update:open', params: 'val: Boolean', desc: '弹窗开关变化' },
              { event: 'submit', params: '{ rootCause, remark }', desc: '提交故障根因' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'TransferModal_Monitoring',
            name: 'TransferModal',
            label: '转交弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/modals/TransferModal.vue',
            previewType: 'modal',
            desc: '将告警转交给其他用户的表单弹窗，支持多选目标用户和搜索过滤。',
            defaultProps: { users: ['王蕊(wangrui)', '王博(wangbo)', '李雷(lilei)'] },
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
              { prop: 'users', type: 'Array', desc: '可选用户列表' },
            ],
            events: [
              { event: 'update:open', params: 'val: Boolean', desc: '弹窗开关变化' },
              { event: 'submit', params: '{ targetUsers }', desc: '提交转交目标' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'SilenceModal',
            name: 'SilenceModal',
            label: '屏蔽弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/modals/SilenceModal.vue',
            previewType: 'modal',
            desc: '设置告警屏蔽规则的表单弹窗，选择屏蔽时长（1h~24h）和可选原因。',
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
            ],
            events: [
              { event: 'update:open', params: 'val: Boolean', desc: '弹窗开关变化' },
              { event: 'submit', params: '{ duration, reason }', desc: '提交屏蔽配置' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'FalsePositiveModal',
            name: 'FalsePositiveModal',
            label: '误报弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/modals/FalsePositiveModal.vue',
            previewType: 'modal',
            desc: '将告警标记为误报的表单弹窗，选择误报原因（预期内变化/阈值不合理/测试数据/其他）和可选说明。',
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
            ],
            events: [
              { event: 'update:open', params: 'val: Boolean', desc: '弹窗开关变化' },
              { event: 'submit', params: '{ reasonType, remark }', desc: '提交误报原因' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'HistoryModal',
            name: 'HistoryModal',
            label: '操作历史弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/modals/HistoryModal.vue',
            previewType: 'modal',
            desc: '以时间线展示告警事件的操作历史记录，每条含时间、操作描述和可选详情。',
            defaultProps: {
              historyItems: [
                { time: '2026-03-19 14:00', action: '触发告警', color: 'red' },
                { time: '2026-03-19 14:05', action: '王蕊(wangrui) 认领了告警', color: 'blue' },
                { time: '2026-03-19 15:30', action: '王蕊(wangrui) 标记为已解决', detail: '根因：上游延迟', color: 'green' },
              ],
            },
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
              { prop: 'historyItems', type: 'Array', desc: '历史记录数组，每项含 time, action, detail?, color?' },
            ],
            events: [
              { event: 'update:open', params: 'val: Boolean', desc: '弹窗开关变化' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
        ]
      },
      {
        groupName: 'L2 告警详情页',
        groupLevel: 'L2',
        items: [
          {
            id: 'AlertDetailDrawer',
            name: 'AlertDetailDrawer',
            label: '告警详情抽屉',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'interaction',
            file: 'src/pages/Monitoring/AlertDetail/AlertDetailDrawer.vue',
            desc: '告警事件的详情侧边抽屉，展示完整告警信息、进度时间线、质量规则明细（仅数据质量来源）、日志片段和操作按钮。',
            previewType: 'modal',
            defaultProps: { alert: alertList[0] },
            props: [
              { prop: 'open', type: 'Boolean', desc: '抽屉显示状态' },
              { prop: 'alert', type: 'Object', desc: '告警对象，与 AlertCard 使用相同数据结构' },
            ],
            events: [
              { event: 'close', params: '-', desc: '关闭抽屉' },
              { event: 'action', params: 'type: String, alert: Object', desc: '操作按钮，type 同 AlertCard' },
            ],
            children: [
              { id: 'L3-1', name: '详情头部', data: '等级标签、标题（可复制）、状态徽章、责任人、事件ID' },
              { id: 'L3-2', name: '基础信息', data: '监控事件、调度周期/批次、任务实例、触发时间、持续时间' },
              { id: 'L3-3', name: '进度时间线', data: 'ProgressTimeline + alertProgressTimelineScenarios.js 生成步骤' },
              { id: 'L3-4', name: '质量规则明细', data: 'RuleDetailTable 子组件（仅数据质量来源显示）' },
              { id: 'L3-5', name: '日志片段', data: 'AlertLogSection 子组件' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'ProgressTimeline',
            name: 'ProgressTimeline',
            label: '进度时间线',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/AlertDetail/ProgressTimeline.vue',
            desc: '水平进度时间线，展示告警生命周期各阶段。步骤数据与多场景定义集中在同目录 alertProgressTimelineScenarios.js（对齐原型「监控事件详情页进度补充」及「系统恢复」HTML）。业务侧使用 buildTimelineStepsFromAlert(alert)；演示/测试可使用 getTimelineStepsForScenario(TimelineScenarioId.xxx, ctx)。',
            demo: () => import('./demos/ProgressTimelineDemo.vue'),
            defaultProps: {
              steps: [
                { icon: 'alert-circle', title: '触发告警', time: '2026-03-19 14:00', status: 'completed' },
                { icon: 'send', title: '通知发送', status: 'completed' },
                { icon: 'user-check', title: '已认领', person: '王蕊(wangrui)', status: 'current' },
                { icon: 'check-circle', title: '已解决', status: 'pending' },
              ],
            },
            props: [
              { prop: 'steps', type: 'Array', desc: '步骤数组：icon, title, time?, person?, timeRange?, tag?, multiTime?, status(completed|current|pending)' },
            ],
            children: [
              { id: 'TL-S1', name: '场景一', data: 'fire_pending — 触发中待认领（4 步）' },
              { id: 'TL-S2', name: '场景二', data: 'acked_processing — 已认领处理中' },
              { id: 'TL-S3', name: '场景三', data: 'resolved_manual_with_ack / resolved_manual_no_ack — 人工已解决' },
              { id: 'TL-S4', name: '场景四', data: 'silenced — 已屏蔽' },
              { id: 'TL-ST', name: '转交', data: 'transferred — 已转交' },
              { id: 'TL-S5', name: '场景五', data: 'false_positive_direct — 直接误报' },
              { id: 'TL-S6', name: '场景六', data: 'false_positive_after_ack — 认领后误报' },
              { id: 'TL-S7', name: '场景七', data: 'firing_silenced — 触发中已静默（需 silenceTimeRange）' },
              { id: 'TL-S8', name: '场景八', data: 'notify_escalation — 通知升级（5 步）' },
              { id: 'TL-SYS', name: '系统恢复', data: 'system_recovery_single / multi — 自动恢复（3 步）' },
            ],
            usages: [
              { label: '告警详情抽屉', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'AlertProgressTimelineScenarios',
            name: 'alertProgressTimelineScenarios',
            label: '告警进度场景（数据模块）',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'logic',
            file: 'src/pages/Monitoring/AlertDetail/alertProgressTimelineScenarios.js',
            desc: '告警详情进度条的「场景 → steps」纯数据模块：导出 TimelineScenarioId、getTimelineStepsForScenario、buildTimelineStepsFromAlert、alertToTimelineContext。与原型 HTML 场景一一对应。预览区与「进度时间线」组件相同，展示各场景下的渲染效果。',
            demo: () => import('./demos/ProgressTimelineDemo.vue'),
            props: [
              { prop: 'buildTimelineStepsFromAlert(alert)', type: 'Function', desc: '根据告警对象自动匹配场景并返回 steps，供 AlertDetailDrawer 使用' },
              { prop: 'getTimelineStepsForScenario(id, ctx)', type: 'Function', desc: '按 TimelineScenarioId 与演示上下文生成 steps' },
              { prop: 'TimelineScenarioId', type: 'Object', desc: '场景常量枚举（freeze）' },
              { prop: 'alertToTimelineContext(alert)', type: 'Function', desc: '告警对象 → 时间线上下文字段' },
            ],
            children: [
              { id: 'TL-DATA-1', name: '数据源', data: '与 ProgressTimeline 共用步骤结构，不依赖 Vue 组件' },
            ],
            usages: [
              { label: 'AlertDetailDrawer', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'AlertLogSection',
            name: 'AlertLogSection',
            label: '告警日志片段',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/AlertDetail/AlertLogSection.vue',
            desc: '告警日志摘要展示组件，根据 monitorEvent 类型智能提取关键日志片段（错误关键词定位、SLA 摘要、末尾 N 行等），支持复制和全屏查看。',
            defaultProps: { alert: alertList[0] },
            props: [
              { prop: 'alert', type: 'Object', desc: '告警对象（required），从中提取 monitorEvent, source, logSnippet, fullLog 等字段' },
            ],
            usages: [
              { label: '告警事件卡片', route: '/monitoring/alerts' },
              { label: '告警详情抽屉', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'RuleDetailTable',
            name: 'RuleDetailTable',
            label: '质量规则明细表',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/AlertDetail/RuleDetailTable.vue',
            desc: '数据质量类告警的规则检测明细表格，展示规则名、检测列、条件、预期值、实际值和是否通过。仅在 source 为数据质量时使用。',
            defaultProps: {
              rules: [
                { ruleName: '空值率检查', column: 'order_id', condition: '空值率 ≤', expected: '0.1%', actual: '5.2%', passed: false },
                { ruleName: '唯一性检查', column: 'order_id', condition: '唯一值占比 ≥', expected: '99.9%', actual: '99.95%', passed: true },
              ],
            },
            props: [
              { prop: 'rules', type: 'Array', desc: '规则数组，每项含 ruleName, column, condition, expected, actual, passed' },
            ],
            usages: [
              { label: '告警详情抽屉（数据质量）', route: '/monitoring/alerts' },
            ],
          },
        ]
      },
      {
        groupName: 'L2 影响评估',
        groupLevel: 'L2',
        items: [
          {
            id: 'ImpactAssessmentDrawer',
            name: 'ImpactAssessmentDrawer',
            label: '影响评估战情室抽屉',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/ImpactAssessmentDrawer.vue',
            desc: '异常影响评估沉浸式战情室：左侧 G6 DAG（逐层 +/- 展开）、右侧 AI 总结与 Tab（统计/全局清单/日志）、底部操作条；支持 active / snapshot 模式、页面级刷新与快照 Banner。',
            previewType: 'modal',
            defaultProps: { alert: alertList[0], mode: 'active' },
            props: [
              { prop: 'open', type: 'Boolean', desc: '抽屉是否打开' },
              { prop: 'alert', type: 'Object', desc: '告警快照（与列表/详情同源），含 id、status、severity、source、monitorEvent、triggeredAt、owner、title 等' },
              { prop: 'mode', type: 'String', desc: 'active（实时拉数）| snapshot（历史快照，隐藏刷新与 ActionBar）' },
            ],
            events: [
              { event: 'close', params: '-', desc: '关闭战情室' },
            ],
            children: [
              { id: 'IA-L3-1', name: 'TopologyCanvas', data: 'G6 dagre 拓扑与节点交互' },
              { id: 'IA-L3-2', name: 'AssessmentPanel', data: 'AI 轮询 + Tabs（StatsAndSLA / GlobalImpactList / ErrorLogViewer）' },
              { id: 'IA-L3-3', name: 'ActionBar', data: '一键拉群与后续运维按钮占位' },
            ],
            usages: [
              { label: '告警事件列表', route: '/monitoring/alerts' },
              { label: '影响评估 Demo', route: '/monitoring/impact-demo' },
            ],
          },
          {
            id: 'ImpactAssessmentDemoPage',
            name: 'ImpactAssessmentDemo',
            label: '影响评估独立 Demo 页',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/Demo.vue',
            desc: '影响评估模块独立演示页，用于联调拓扑、面板与 Mock 数据，不等同于列表内嵌战情室入口。',
            previewMultiple: [{ route: '/monitoring/impact-demo', label: '打开影响评估 Demo 页' }],
            usages: [
              { label: '影响评估 Demo', route: '/monitoring/impact-demo' },
            ],
          },
          {
            id: 'TopologyCanvas_Impact',
            name: 'TopologyCanvas',
            label: '影响拓扑画布',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/TopologyCanvas.vue',
            desc: 'AntV G6 DAG：dagre LR、自定义 impact-task-node、逐层展开/收起、核心链路模式下冻结 +/-、节点点击联动日志 Tab。',
            demo: () => import('./demos/ImpactTopologyCanvasDemo.vue'),
            props: [
              { prop: 'topology', type: 'Object', desc: '含 nodes、edges；节点含 impactStatus、isPolluted、hasChildren 等' },
              { prop: 'branchChildrenOf', type: 'Object', desc: '父节点 id → 子 id 列表，用于推导 +/- 控件' },
              { prop: 'coreOnly', type: 'Boolean', desc: '仅看核心链路时冻结展开锚点' },
              { prop: 'highlightNodeId', type: 'String', desc: '高亮节点 id（清单联动）' },
            ],
            events: [
              { event: 'update:coreOnly', params: 'val: Boolean', desc: '核心链路开关' },
              { event: 'node-click', params: '{ nodeId, node }', desc: '点击任务节点' },
              { event: 'expand-branch', params: 'parentId: String', desc: '展开一层子图' },
              { event: 'collapse-branch', params: 'parentId: String', desc: '收起子图' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'CanvasToolbar_Impact',
            name: 'CanvasToolbar',
            label: '画布工具栏',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'display',
            file: 'src/pages/Monitoring/ImpactAssessment/components/CanvasToolbar.vue',
            desc: '画布右上角：五色图例、缩放/适应视图、「仅看核心链路」开关；刷新按钮在战情室标题区由 Drawer 承载。',
            demo: () => import('./demos/ImpactCanvasToolbarDemo.vue'),
            props: [
              { prop: 'coreOnly', type: 'Boolean', desc: '是否仅看核心链路' },
            ],
            events: [
              { event: 'update:coreOnly', params: 'val: Boolean', desc: '核心链路开关变化' },
              { event: 'zoom-in', params: '-', desc: '放大' },
              { event: 'zoom-out', params: '-', desc: '缩小' },
              { event: 'fit-view', params: '-', desc: '适应视图' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'AssessmentPanel',
            name: 'AssessmentPanel',
            label: '右侧评估面板',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/AssessmentPanel.vue',
            desc: '右侧栏：AI 分析（getAiAnalysis 轮询 + 骨架/超时降级）+ Tabs（统计评估 / 全局影响清单 / 日志详情）。',
            demo: () => import('./demos/ImpactAssessmentPanelDemo.vue'),
            props: [
              { prop: 'summary', type: 'Object', desc: 'ImpactSummary：统计、SLA、清单、aiAnalysis 等' },
              { prop: 'topology', type: 'Object', desc: '当前拓扑，供清单与节点对齐' },
              { prop: 'alert', type: 'Object', desc: '当前告警（AI 轮询用 eventId）' },
              { prop: 'selectedNodeId', type: 'String', desc: '当前选中节点 id' },
              { prop: 'selectedNode', type: 'Object', desc: '选中节点模型' },
              { prop: 'logFocusNonce', type: 'Number', desc: '递增时自动切换到日志 Tab' },
            ],
            events: [
              { event: 'select-task', params: '{ taskId, record }', desc: '清单点击联动拓扑' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'StatsAndSLA_Impact',
            name: 'StatsAndSLA',
            label: '统计与 SLA 破线',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'display',
            file: 'src/pages/Monitoring/ImpactAssessment/components/StatsAndSLA.vue',
            desc: 'Tab1：受影响节点/核心任务指标、负责人矩阵、SLA 破线卡片列表（默认仅展示已破线，可切换查看全部）。',
            demo: () => import('./demos/ImpactStatsAndSLADemo.vue'),
            props: [
              { prop: 'summary', type: 'Object', desc: '含 totalAffectedNodes、highRiskNodes、ownerMatrix、slaPredictions' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'GlobalImpactList',
            name: 'GlobalImpactList',
            label: '全局影响清单',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'display',
            file: 'src/pages/Monitoring/ImpactAssessment/components/GlobalImpactList.vue',
            desc: 'Tab2：统一下游任务实例列表（实例 ID、批次、负责人、状态）；分页默认 100 条；支持仅看核心任务；isPolluted 紫色标签。',
            demo: () => import('./demos/ImpactGlobalImpactListDemo.vue'),
            props: [
              { prop: 'summary', type: 'Object', desc: 'affectedTaskInstances / listGranularity' },
              { prop: 'topology', type: 'Object', desc: '用于任务模式与选中高亮' },
              { prop: 'selectedNodeId', type: 'String', desc: '高亮对应任务' },
            ],
            events: [
              { event: 'select-task', params: '{ taskId, record }', desc: '点击卡片联动拓扑' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'ErrorLogViewer_Impact',
            name: 'ErrorLogViewer',
            label: '日志详情',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'display',
            file: 'src/pages/Monitoring/ImpactAssessment/components/ErrorLogViewer.vue',
            desc: 'Tab3：展示告警或选中节点的日志摘要；未运行/依赖等待/未生成节点无运行日志时展示空态提示。',
            demo: () => import('./demos/ImpactErrorLogViewerDemo.vue'),
            props: [
              { prop: 'alert', type: 'Object', desc: '告警对象（兜底 fullLog / logSnippet）' },
              { prop: 'selectedNode', type: 'Object', desc: '拓扑选中节点（errorSummary、impactStatus）' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'ActionBar_Impact',
            name: 'ActionBar',
            label: '底部操作条',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/components/ActionBar.vue',
            desc: '一键拉群（去重检测 + CreateGroupModal）；挂起/重跑/置成功占位禁用；snapshot 模式下整栏隐藏。',
            demo: () => import('./demos/ImpactActionBarDemo.vue'),
            props: [
              { prop: 'eventId', type: 'String', desc: '告警事件 ID' },
              { prop: 'alertTitle', type: 'String', desc: '用于群名等展示' },
              { prop: 'summary', type: 'Object', desc: '含 ownerMatrix' },
              { prop: 'mode', type: 'String', desc: 'active | snapshot' },
              { prop: 'alert', type: 'Object', desc: '完整告警对象（拉群弹窗）' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
          {
            id: 'CreateGroupModal',
            name: 'CreateGroupModal',
            label: '一键拉群确认弹窗',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '子模块级',
            domain: '影响评估',
            type: 'interaction',
            file: 'src/pages/Monitoring/ImpactAssessment/components/CreateGroupModal.vue',
            desc: '企业微信应急群：可编辑群名、勾选成员（默认全选）、确认创建；与 ActionBar Step0 去重配合。',
            demo: () => import('./demos/ImpactCreateGroupModalDemo.vue'),
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显隐' },
              { prop: 'alert', type: 'Object', desc: '告警对象' },
              { prop: 'ownerMatrix', type: 'Array', desc: '负责人矩阵 { name, taskCount }' },
            ],
            events: [
              { event: 'confirm', params: 'res: Object', desc: '创建成功' },
              { event: 'cancel', params: '-', desc: '关闭弹窗' },
            ],
            usages: [
              { label: '影响评估战情室', route: '/monitoring/alerts' },
            ],
          },
        ]
      },
      {
        groupName: 'L2 通知策略',
        groupLevel: 'L2',
        items: [
          {
            id: 'LevelRuleBox',
            name: 'LevelRuleBox',
            label: '告警等级通知规则块',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '通知策略',
            type: 'interaction',
            file: 'src/pages/Monitoring/NotifyStrategy/LevelRuleBox.vue',
            desc: '单个告警等级的通知接收人和渠道配置面板（任务负责人/指定人员/On-call），ERROR 和 WARN 复用同一组件。',
            defaultProps: {
              level: 'ERROR',
              rules: {
                owner: { enabled: true, channels: ['feishu'] },
                specific: { enabled: false, users: [], channels: ['feishu'] },
                oncall: { enabled: false, groups: [], channels: ['feishu'] },
              },
              userOptions: [
                { value: 'u_wangrui', label: '王蕊 (ruiwang1)' },
                { value: 'u_lilei', label: '李雷 (lilei)' },
              ],
              oncallOptions: [
                { value: 'sre', label: '大数据SRE值班组' },
                { value: 'dba', label: '数据库值班组' },
              ],
            },
            props: [
              { prop: 'level', type: 'String', desc: "'ERROR' | 'WARN'" },
              { prop: 'rules', type: 'Object', desc: '规则对象，含 owner/specific/oncall 三组' },
              { prop: 'userOptions', type: 'Array', desc: '人员选项' },
              { prop: 'oncallOptions', type: 'Array', desc: '值班组选项' },
            ],
            usages: [
              { label: '新建通知策略', route: '/monitoring/strategies' },
            ],
          },
          {
            id: 'CreateStrategy',
            name: 'CreateStrategy',
            label: '新建通知策略抽屉',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '通知策略',
            type: 'interaction',
            file: 'src/pages/Monitoring/NotifyStrategy/CreateStrategy.vue',
            previewType: 'modal',
            defaultProps: { },
            desc: '右侧抽屉，分三步配置通知策略：基础信息 → 告警通知规则（ERROR/WARN） → 发送策略配置（频次/静默/升级）。',
            props: [
              { prop: 'open', type: 'Boolean', desc: '控制抽屉显示/隐藏' },
            ],
            events: [
              { event: 'close', params: '-', desc: '关闭抽屉' },
              { event: 'submit', params: 'data: Object', desc: '提交策略配置' },
            ],
            children: [
              { id: 'CS-1', name: 'Step 1 基础信息', data: '策略名称、描述' },
              { id: 'CS-2', name: 'Step 2 通知规则', data: 'LevelRuleBox × 2（ERROR + WARN）' },
              { id: 'CS-3', name: 'Step 3 发送策略', data: '频次控制、静默时间(WARN)、通知升级(ERROR)' },
            ],
            usages: [
              { label: '通知策略列表', route: '/monitoring/strategies' },
            ],
          },
          {
            id: 'StrategyFilter',
            name: 'StrategyFilter',
            label: '通知策略筛选区',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '通知策略',
            type: 'interaction',
            file: 'src/pages/Monitoring/NotifyStrategy/StrategyFilter.vue',
            desc: '通知策略列表页的顶部筛选区域，包含策略名称搜索、创建人下拉选择以及新建/刷新操作。',
            demo: () => import('./demos/StrategyFilterDemo.vue'),
            props: [
              { prop: 'searchName', type: 'String', desc: '搜索的策略名称 (v-model)' },
              { prop: 'searchCreator', type: 'String', desc: '搜索的创建人 (v-model)' },
            ],
            events: [
              { event: 'update:searchName', params: 'value: String', desc: '策略名称更新' },
              { event: 'update:searchCreator', params: 'value: String', desc: '创建人更新' },
              { event: 'refresh', params: '-', desc: '点击刷新按钮' },
              { event: 'create', params: '-', desc: '点击新建策略按钮' },
            ],
            usages: [
              { label: '通知策略列表', route: '/monitoring/strategies' },
            ],
          },
          {
            id: 'StrategyTable',
            name: 'StrategyTable',
            label: '通知策略表格',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '通知策略',
            type: 'display',
            file: 'src/pages/Monitoring/NotifyStrategy/StrategyTable.vue',
            desc: '通知策略列表展示表格，包含策略信息、状态开关和相关操作（编辑、查看、复制、删除）。',
            demo: () => import('./demos/StrategyTableDemo.vue'),
            props: [
              { prop: 'dataSource', type: 'Array', desc: '表格数据源' },
              { prop: 'pagination', type: 'Object|Boolean', desc: '分页配置' },
            ],
            events: [
              { event: 'statusChange', params: 'record, val', desc: '状态开关切换' },
              { event: 'edit', params: 'record', desc: '点击编辑' },
              { event: 'view', params: 'record', desc: '点击查看' },
              { event: 'copy', params: 'record', desc: '点击复制' },
              { event: 'delete', params: 'record', desc: '点击删除' },
            ],
            usages: [
              { label: '通知策略列表', route: '/monitoring/strategies' },
            ],
          },
          {
            id: 'StatusSwitch',
            name: 'StatusSwitch',
            label: '策略状态开关',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '通知策略',
            type: 'interaction',
            file: 'src/pages/Monitoring/NotifyStrategy/StatusSwitch.vue',
            desc: '通知策略的启用/禁用开关。开启直接切换，关闭时弹出 Popconfirm 二次确认。',
            defaultProps: { value: true },
            props: [
              { prop: 'value', type: 'Boolean', desc: '当前开关状态' },
            ],
            events: [
              { event: 'change', params: 'checked: Boolean', desc: '状态变更后触发' },
            ],
            usages: [
              { label: '通知策略列表', route: '/monitoring/strategies' },
            ],
          },
        ]
      },
      {
        groupName: 'L2 手机端告警落地页',
        groupLevel: 'L2',
        items: [
          {
            id: 'AlertLanding',
            name: 'AlertLanding',
            label: '手机端告警落地页',
            catalogTier: 'productModule',
            productModule: '监控运维',
            level: '模块级',
            domain: '告警中心',
            type: 'display',
            file: 'src/pages/Monitoring/Mobile/AlertLanding.vue',
            desc: '移动端独立路由页面（无 AppLayout），展示单条告警详情。包含告警头部信息、进度时间线、详细属性列表、底部操作栏，支持入场动画和安全区适配。',
            previewMultiple: [
              { label: '数据开发告警', route: '/monitoring/mobile/alert/1' },
              { label: '数据质量告警', route: '/monitoring/mobile/alert/2' }
            ],
            props: [
              { prop: '(无外部 props)', type: '-', desc: '通过路由参数 route.params.eventId 获取告警 ID，并调用 API 获取数据' },
            ],
            usages: [
              { label: '独立路由', route: '/monitoring/mobile/alert/1' },
            ],
          },
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════
  //  L1 地图 Agent
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 地图 Agent',
    groupLevel: 'L1',
    children: [
      {
        groupName: 'L2 首页与布局',
        groupLevel: 'L2',
        items: [
          {
            id: 'AgentHome',
            name: 'AgentHome',
            label: '地图 Agent 首页',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '页面级',
            domain: 'Agent',
            type: 'page',
            file: 'src/pages/DataMap/Agent/index.vue',
            desc: '地图 Agent 的主入口，采用左右分屏布局，整合侧边栏、对话区与右侧详情面板。',
            children: [
              { id: 'L3-1', name: '左侧边栏区', data: 'AgentSidebar 挂载、可拖拽调宽、收起/展开与悬浮快捷按钮' },
              { id: 'L3-2', name: '中间对话区', data: '欢迎态 WelcomeScreen；对话态 MessageList + InputArea；深浅色主题' },
              { id: 'L3-3', name: '右侧详情面板', data: 'TableDetailPanel 滑入、可拖拽调宽、与卡片 viewDetail 联动' },
            ],
            usages: [{ label: '地图 Agent 路由入口', route: '/datamap/agent' }]
          },
          {
            id: 'AgentSidebar',
            name: 'AgentSidebar',
            label: 'Agent 侧边栏',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '模块级',
            domain: 'Agent',
            type: 'layout',
            file: 'src/pages/DataMap/Agent/components/Sidebar/index.vue',
            desc: '包含新建对话按钮、历史对话列表以及工作台（推荐、收藏、分享）。',
            events: [
              { name: 'send', desc: '点击工作台推荐/收藏表时触发，发送对话消息' },
              { name: 'newChat', desc: '点击新建对话时触发' }
            ],
            children: [
              { id: 'L3-1', name: '历史对话 HistoryList', data: '会话列表、重命名、置顶、分享、删除' },
              { id: 'L3-2', name: '智能工作台 Workspace', data: '推荐表、收藏表、我分享的对话；折叠面板；点击表一键追问' },
            ]
          }
        ]
      },
      {
        groupName: 'L2 对话消息流',
        groupLevel: 'L2',
        items: [
          {
            id: 'WelcomeScreen',
            name: 'WelcomeScreen',
            label: '欢迎屏幕',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'ui',
            file: 'src/pages/DataMap/Agent/components/Chat/WelcomeScreen.vue',
            desc: '新对话初始状态下的欢迎语和快捷指令区。',
            events: [{ name: 'send', desc: '点击快捷指令时触发' }],
            children: [
              { id: 'L3-1', name: '欢迎引导与品牌区', data: '标题、副文案、Pilot 视觉引导' },
              { id: 'L3-2', name: '场景化快捷问题', data: '找表、查详情、看血缘等一键填入' },
              { id: 'L3-3', name: '居中大输入与 @ 提及', data: '与对话页一致的输入体验、表名下拉 mock' },
            ]
          },
          {
            id: 'InputArea',
            name: 'InputArea',
            label: '对话输入区',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'form',
            file: 'src/pages/DataMap/Agent/components/Chat/InputArea.vue',
            desc: '支持多行输入、@ 唤起表选择下拉框的输入区域。',
            props: [
              { prop: 'isShareMode', type: 'Boolean', desc: '是否处于分享模式（分享模式下隐藏输入框）' }
            ],
            events: [{ name: 'send', desc: '发送消息时触发' }],
            children: [
              { id: 'L3-1', name: '多行输入与发送', data: '文本输入、发送按钮状态（灰/品牌紫）' },
              { id: 'L3-2', name: '@ 表名联想下拉', data: '检索 mock 表列表、键盘上下选择、插入 FQN' },
              { id: 'L3-3', name: '底部快捷动作', data: '找表、看详情、查血缘等与输入区联动' },
            ]
          },
          {
            id: 'MessageList',
            name: 'MessageList',
            label: '消息列表',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'list',
            file: 'src/pages/DataMap/Agent/components/Chat/MessageList.vue',
            desc: '渲染对话流，支持思考过程展示、打字机效果、多选分享模式以及各类卡片渲染。',
            props: [
              { prop: 'messages', type: 'Array', desc: '消息流数据' },
              { prop: 'isShareMode', type: 'Boolean', desc: '是否开启多选分享模式' }
            ],
            defaultProps: {
              messages: [
                { id: 1, role: 'user', content: '帮我找一下订单相关的表' },
                { id: 2, role: 'assistant', content: '为您检索到以下相关的数据表资产：', status: 'success' }
              ],
              isShareMode: false
            },
            events: [
              { name: 'update:isShareMode', desc: '切换分享模式状态' },
              { name: 'viewDetail', desc: '点击查看详情时触发' }
            ],
            children: [
              { id: 'L3-1', name: '问答分组与消息体', data: '用户气泡、AI 气泡、PilotLogo 头像区' },
              { id: 'L3-2', name: '思考与执行步骤 Steps', data: 'SSE 模拟下的步骤 running/success 展示' },
              { id: 'L3-3', name: '流式文本输出', data: '打字机式增量拼接 content' },
              { id: 'L3-4', name: '内嵌业务卡片', data: 'TableCard / TableListCard / LineageCard 条件渲染' },
              { id: 'L3-5', name: '反馈与操作条', data: '点赞、点踩、分享（对话级）' },
            ]
          },
          {
            id: 'ShareActionBar',
            name: 'ShareActionBar',
            label: '分享底部操作栏',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'ui',
            file: 'src/pages/DataMap/Agent/components/Chat/ShareActionBar.vue',
            desc: '在多选分享模式下，固定在底部的操作栏，包含全选、已选计数、取消和分享按钮。',
            props: [
              { prop: 'visible', type: 'Boolean', desc: '是否显示操作栏' },
              { prop: 'isAllSelected', type: 'Boolean', desc: '是否已全选' },
              { prop: 'isIndeterminate', type: 'Boolean', desc: '是否半选状态' },
              { prop: 'selectedCount', type: 'Number', desc: '已选中的消息组数量' }
            ],
            defaultProps: {
              visible: true,
              isAllSelected: false,
              isIndeterminate: true,
              selectedCount: 2
            },
            events: [
              { name: 'toggleAll', desc: '点击全选复选框时触发' },
              { name: 'cancel', desc: '点击取消按钮时触发' },
              { name: 'openModal', desc: '点击分享按钮时触发' }
            ]
          },
          {
            id: 'ShareConfigModal',
            name: 'ShareConfigModal',
            label: '分享配置弹窗',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'modal',
            file: 'src/pages/DataMap/Agent/components/Chat/ShareConfigModal.vue',
            desc: '点击分享后弹出的配置窗口，用于设置分享链接的有效期。',
            previewType: 'modal',
            props: [
              { prop: 'open', type: 'Boolean', desc: '控制弹窗显示隐藏' },
              { prop: 'selectedCount', type: 'Number', desc: '已选中的消息组数量' }
            ],
            defaultProps: {
              selectedCount: 3
            },
            events: [
              { name: 'update:open', desc: '弹窗关闭时触发' },
              { name: 'confirm', desc: '点击生成链接时触发，返回 { expire }' }
            ]
          }
        ]
      },
      {
        groupName: 'L2 业务卡片',
        groupLevel: 'L2',
        items: [
          {
            id: 'TableCard',
            name: 'TableCard',
            label: '单表详情卡片',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'card',
            file: 'src/pages/DataMap/Agent/components/Cards/TableCard.vue',
            desc: '在对话流中展示单个数据表的核心元信息，包含 DDL/SELECT 快捷操作。',
            props: [{ prop: 'data', type: 'Object', desc: '表元数据信息' }],
            defaultProps: {
              data: {
                type: 'table',
                fqn: 'default.user_behavior_log',
                cnName: '用户行为日志表',
                owner: '张三(zhangsan)',
                desc: '记录用户在 App 内的所有点击、浏览、曝光等行为日志，用于用户画像和推荐系统。',
                tags: ['核心资产', '日志', 'DWD'],
                columns: [
                  { name: 'user_id', type: 'string', desc: '用户唯一标识', isPrimary: true },
                  { name: 'event_type', type: 'string', desc: '事件类型 (click/view/expose)' },
                  { name: 'page_id', type: 'string', desc: '页面 ID' },
                  { name: 'event_time', type: 'timestamp', desc: '事件发生时间' }
                ]
              }
            },
            events: [{ name: 'viewDetail', desc: '点击查看完整详情时触发' }],
            children: [
              { id: 'L3-1', name: '表身份与 HIVE 标签', data: 'FQN、中文名、分层标签、复制' },
              { id: 'L3-2', name: '描述与元信息', data: '负责人、更新时间、收藏态' },
              { id: 'L3-3', name: 'DDL / SELECT 脚本区', data: '展开代码面板、一键复制' },
              { id: 'L3-4', name: '查看完整详情', data: '触发右侧 TableDetailPanel' },
            ]
          },
          {
            id: 'TableListCard',
            name: 'TableListCard',
            label: '表资产列表卡片',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'card',
            file: 'src/pages/DataMap/Agent/components/Cards/TableListCard.vue',
            desc: '在对话流中展示检索到的多张相关数据表列表。',
            props: [{ prop: 'data', type: 'Object', desc: '包含 list 数组和 total 等信息的对象' }],
            defaultProps: {
              data: {
                type: 'table_list',
                total: 45,
                list: [
                  { fqn: 'dm_trade.dws_order_summary_nd', cnName: '订单汇总表', desc: '包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。', tags: ['核心资产', 'DWS'], reason: '表名及描述高度匹配“订单”，且为核心汇总表。', owner: '张三(zhangsan)' },
                  { fqn: 'dm_trade.dwd_order_detail_di', cnName: '订单明细表', desc: '全渠道订单原子粒度明细数据，包含订单状态、支付金额、优惠明细等。', tags: ['DWD'], reason: '包含订单最全明细数据，下游使用广泛。', owner: '李四(lisi)' }
                ]
              }
            },
            events: [{ name: 'viewDetail', desc: '点击列表中某张表时触发' }],
            children: [
              { id: 'L3-1', name: '检索结果列表行', data: 'HIVE 标签、FQN、中文名片、hover 高亮' },
              { id: 'L3-2', name: '推荐理由与负责人', data: '理由文案、热度/浏览等指标（与 RecentList 对齐）' },
              { id: 'L3-3', name: '分页与追问', data: '加载更多、查看全部、继续追问建议' },
            ]
          },
          {
            id: 'LineageCard',
            name: 'LineageCard',
            label: '血缘分析卡片',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '子模块级',
            domain: 'Agent',
            type: 'card',
            file: 'src/pages/DataMap/Agent/components/Cards/LineageCard.vue',
            desc: '在对话流中展示 AI 总结的血缘洞察及核心上下游节点。',
            props: [{ prop: 'data', type: 'Object', desc: '包含 insight, upstream, downstream 的血缘数据' }],
            defaultProps: {
              data: {
                type: 'lineage_card',
                fqn: 'dm_trade.dws_order_summary_nd',
                cnName: '订单汇总表',
                owner: '张三(zhangsan)',
                insight: '该表的血缘关系较为复杂，其上游主要依赖 `dwd_order_info` 和 `dim_user`。该表是下游 5 张核心报表表的数据源，如果该表延迟，将直接影响【每日销售看板】的产出。',
                upstream: [
                  { fqn: 'dm_trade.dwd_order_info', cnName: '订单明细表' },
                  { fqn: 'dm_base.dim_user', cnName: '用户维度表' }
                ],
                downstream: [
                  { fqn: 'ads_trade.sales_dashboard', cnName: '每日销售看板' },
                  { fqn: 'ads_trade.user_repurchase_rate', cnName: '用户复购率统计' }
                ]
              }
            },
            events: [{ name: 'viewDetail', desc: '点击查看完整血缘图时触发' }],
            children: [
              { id: 'L3-1', name: 'AI 血缘洞察', data: 'insight 富文本、代码片段样式' },
              { id: 'L3-2', name: '核心上下游列表', data: 'upstream/downstream 简表' },
              { id: 'L3-3', name: '完整血缘入口', data: '跳转详情面板血缘 Tab' },
            ]
          }
        ]
      },
      {
        groupName: 'L2 详情面板',
        groupLevel: 'L2',
        items: [
          {
            id: 'TableDetailPanel',
            name: 'TableDetailPanel',
            label: '右侧详情面板',
            catalogTier: 'productModule',
            productModule: '地图 Agent',
            level: '模块级',
            domain: 'Agent',
            type: 'panel',
            file: 'src/pages/DataMap/Agent/components/Detail/TableDetailPanel.vue',
            desc: '分屏模式下的右侧面板，展示字段、预览、生产、血缘等完整 Tab 信息。',
            props: [
              { prop: 'data', type: 'Object', desc: '表完整元数据' },
              { prop: 'defaultTab', type: 'String', desc: '默认激活的 Tab，如 "fields", "lineage"' }
            ],
            children: [
              { id: 'L3-1', name: '字段详情 Tab', data: '字段表、主键标识、描述' },
              { id: 'L3-2', name: '数据预览 Tab', data: '样本数据、探查指标' },
              { id: 'L3-3', name: '生产信息 Tab', data: '调度任务、产出时间、执行历史' },
              { id: 'L3-4', name: '血缘关系 Tab', data: '表级 G6 血缘、缩放与交互' },
            ],
            defaultProps: {
              data: {
                fqn: 'dm_trade.dws_order_summary_nd',
                cnName: '订单汇总表',
                owner: '张三(zhangsan)',
                desc: '包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。'
              },
              defaultTab: 'fields'
            },
            events: [{ name: 'close', desc: '点击关闭面板时触发' }]
          }
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  //  L1 地图 Agent v2（千问风格）
  // ═══════════════════════════════════════════════
  {
    groupName: 'L1 地图 Agent v2',
    groupLevel: 'L1',
    children: [
      {
        groupName: 'L2 首页框架',
        groupLevel: 'L2',
        items: [
          {
            id: 'MapAgentHome',
            name: 'MapAgentHome',
            label: 'Agent v2 首页框架',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '页面级',
            domain: 'Agent v2',
            type: 'page',
            file: 'src/pages/DataMap/MapAgent/index.vue',
            demo: () => import('./demos/MapAgentHomeDemo.vue'),
            desc: 'Agent v2 主入口，采用"左侧边栏 + 中间对话区"双栏弹性布局（无右侧面板）。侧栏使用 MapAgentSidebar（历史 + 我的收藏单层结构）；对话区复用 WelcomeScreen、InputArea；支持 AbortController 停止流式、重新生成、mentionTables 与异常分类文案。',
            children: [
              { id: 'L3-1', name: '侧边栏拖拽控制 SidebarResize', data: '拖拽手柄、宽度 220~480px、折叠/展开按钮、新建对话按钮' },
              { id: 'L3-2', name: '会话流转控制 SessionController', data: 'sendMessageStream + signal/mentionTables；onStep → onMessage → onSuggestions → onDone；stopped/error 分支' },
            ],
            usages: [{ label: 'Agent v2 路由入口', route: '/datamap/map-agent' }]
          },
          {
            id: 'MapAgentSidebar',
            name: 'MapAgentSidebar',
            label: 'Agent v2 侧栏（历史+收藏）',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'layout',
            file: 'src/pages/DataMap/MapAgent/components/MapAgentSidebar.vue',
            demo: () => import('./demos/MapAgentSidebarDemo.vue'),
            desc: 'PRD 3.1：单层结构，无「历史/工作台」双 Tab。上半区历史会话分组列表；下半区「我的收藏 (N)」默认折叠，展示 FQN/中文名/负责人，支持取消收藏与点击发起来话。',
            props: [
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'favoriteFqns', type: 'Array', desc: '已收藏表 FQN 列表' }
            ],
            events: [
              { event: 'collapse', desc: '收起侧栏' },
              { event: 'send', params: 'text: String', desc: '从收藏表发起追问等' },
              { event: 'newChat', desc: '新建对话' },
              { event: 'selectHistory', params: 'item', desc: '点击历史会话' },
              { event: 'toggleTableFavorite', params: 'fqn: String', desc: '取消/切换收藏' }
            ],
            usages: [{ label: 'MapAgentHome', route: '/datamap/map-agent' }]
          }
        ]
      },
      {
        groupName: 'L2 流式对话输入区',
        groupLevel: 'L2',
        items: [
          {
            id: 'MapAgentInputArea',
            name: 'InputArea',
            label: '对话输入区',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'form',
            file: 'src/pages/DataMap/Agent/components/Chat/InputArea.vue',
            desc: '支持多行输入、@ 唤起表选择下拉框。PRD：生成中 disabled 时只读 + 主按钮变为红色停止（emit stop）；超过 400 字显示剩余字数，满 500 字发送置灰并 Toast。',
            props: [
              { prop: 'isShareMode', type: 'Boolean', desc: '是否处于分享模式（分享模式下隐藏输入框）' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '是否处于暗色模式' },
              { prop: 'sessionTables', type: 'Array', desc: '本对话提及表列表' },
              { prop: 'disabled', type: 'Boolean', desc: '生成中禁用输入，主按钮变停止' }
            ],
            events: [
              { event: 'send', params: 'text: String', desc: '发送消息时触发' },
              { event: 'stop', desc: '点击停止按钮时触发' }
            ],
            children: [
              { id: 'L3-1', name: '多行输入与发送', data: '文本输入、发送按钮状态（灰/品牌紫）、500 字上限' },
              { id: 'L3-2', name: '@ 表名联想下拉', data: '检索 mock 表列表、键盘上下选择、插入 FQN' },
              { id: 'L3-3', name: '底部快捷动作', data: '找表、看详情、查血缘等与输入区联动' },
            ],
            usages: [{ label: 'Agent v2 首页', route: '/datamap/map-agent' }]
          }
        ]
      },
      {
        groupName: 'L2 流式对话消息区',
        groupLevel: 'L2',
        items: [
          {
            id: 'StreamMessageList',
            name: 'StreamMessageList',
            label: '流式对话消息区',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '模块级',
            domain: 'Agent v2',
            type: 'list',
            file: 'src/pages/DataMap/MapAgent/components/Chat/MessageList.vue',
            demo: () => import('./demos/StreamMessageListDemo.vue'),
            desc: '承载用户与 Agent 的核心交互流，按"用户问 + AI 答"自动分组，AI 回复以 Markdown 流式文本渲染，支持多选分享模式。编排层组件，内部调度 8 个 L3 子模块（含 ConversationShareModal 对话分享配置弹窗）。',
            props: [
              { prop: 'messages', type: 'Array', desc: '消息流数据' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'isShareMode', type: 'Boolean', desc: '是否多选分享模式' },
            ],
            events: [
              { event: 'send', params: 'text: String', desc: '追问建议点击时触发' },
              { event: 'update:isShareMode', params: 'visible: Boolean', desc: '切换分享模式状态' },
              { event: 'regenerate', params: 'aiMsgId', desc: '重新生成该条 AI 回复' },
            ],
            children: [
              { id: 'L3-1', name: '对话分组引擎 MessageGrouping', data: '用户问+AI答自动聚合、相邻组 ≥5min 时间分隔线、分享 checkbox' },
              { id: 'L3-2', name: '用户消息气泡 UserBubble', data: '品牌紫背景、右对齐、圆角' },
              { id: 'L3-3', name: 'Agent 思考过程 ThinkingSteps', data: '步骤文本、LoadingOutlined/CheckCircleOutlined' },
              { id: 'L3-4', name: '流式文本渲染 MarkdownRenderer', data: 'marked.js、GFM、暗色模式、脉冲光标' },
              { id: 'L3-5', name: '数据呈现表格 DataTable', data: '表格样式、hover复制按钮、制表符文本' },
              { id: 'L3-6', name: '追问建议引导 SuggestionChips', data: '品牌紫chip、点击发送追问' },
              { id: 'L3-7', name: '消息反馈与分享 MessageActions', data: '点赞/踩/分享按钮' },
              { id: 'L3-8', name: '对话分享配置弹窗 ConversationShareModal', data: '已选组数、链接有效期、生成链接（封装 ShareConfigModal）' },
            ],
            usages: [{ label: 'Agent v2 对话页', route: '/datamap/map-agent' }]
          },
          {
            id: 'ThinkingSteps',
            name: 'ThinkingSteps',
            label: 'Agent 思考过程',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'display',
            file: 'src/pages/DataMap/MapAgent/components/Chat/ThinkingSteps.vue',
            demo: () => import('./demos/ThinkingStepsDemo.vue'),
            desc: '展示 Agent 思考步骤；success 且全部完成后自动折叠为「已完成 N 个步骤」；stopped 时步骤灰色且摘要为「思考过程已中断」。',
            props: [
              { prop: 'steps', type: 'Array', desc: '步骤数组，每项含 id、text、status(running/success)' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'msgStatus', type: 'String', desc: 'AI 消息状态 loading/streaming/success/stopped/error' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
          {
            id: 'UserBubble',
            name: 'UserBubble',
            label: '用户消息气泡',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'display',
            file: 'src/pages/DataMap/MapAgent/components/Chat/UserBubble.vue',
            demo: () => import('./demos/UserBubbleDemo.vue'),
            desc: '品牌紫背景的用户消息气泡，右对齐，圆角样式。',
            props: [
              { prop: 'content', type: 'String', desc: '用户消息文本' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
          {
            id: 'MarkdownRenderer',
            name: 'MarkdownRenderer',
            label: '流式文本渲染',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'display',
            file: 'src/pages/DataMap/MapAgent/components/Chat/MarkdownRenderer.vue',
            demo: () => import('./demos/MarkdownRendererDemo.vue'),
            desc: 'marked.js 渲染为 HTML 后经 DOMPurify.sanitize 白名单过滤（SDD 6.4 XSS 防护），支持 GFM 表格/代码/引用块，流式状态显示脉冲光标，内部 useTableCopy 注入表格复制按钮。',
            props: [
              { prop: 'content', type: 'String', desc: 'Markdown 文本' },
              { prop: 'status', type: 'String', desc: '消息状态 (loading/streaming/success)' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'hasSteps', type: 'Boolean', desc: '是否有思考步骤（影响 loading 态展示）' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
          {
            id: 'useTableCopy',
            name: 'useTableCopy',
            label: '数据呈现表格（复制逻辑）',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'logic',
            file: 'src/pages/DataMap/MapAgent/components/Chat/useTableCopy.js',
            demo: () => import('./demos/UseTableCopyDemo.vue'),
            desc: '扫描 Markdown 渲染产物中的 <table> 元素，为每个表格注入 hover 出现的复制按钮，点击将表格内容转为制表符文本复制到剪贴板。',
            props: [
              { prop: 'injectTableCopyButtons(container, antMessage)', type: 'Function', desc: '核心方法，接收 DOM 容器和 message 实例' },
            ],
            usages: [{ label: 'MarkdownRenderer', route: '/datamap/map-agent' }]
          },
          {
            id: 'SuggestionChips',
            name: 'SuggestionChips',
            label: '追问建议引导',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'interaction',
            file: 'src/pages/DataMap/MapAgent/components/Chat/SuggestionChips.vue',
            demo: () => import('./demos/SuggestionChipsDemo.vue'),
            desc: 'AI 回复结束后展示的追问建议 chip 按钮，品牌紫边框，点击直接发送追问。',
            props: [
              { prop: 'suggestions', type: 'Array', desc: '建议文本数组' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
            ],
            events: [
              { event: 'send', params: 'text: String', desc: '点击 chip 时触发，传递建议文本' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
          {
            id: 'MessageActions',
            name: 'MessageActions',
            label: '消息反馈与分享',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'interaction',
            file: 'src/pages/DataMap/MapAgent/components/Chat/MessageActions.vue',
            demo: () => import('./demos/MessageActionsDemo.vue'),
            desc: 'AI 消息底部操作栏：复制、表收藏、重新生成（success/stopped/error）、点赞（可取消）、踩、分享。',
            props: [
              { prop: 'msgId', type: 'Number|String', desc: '消息 ID' },
              { prop: 'msgStatus', type: 'String', desc: 'AI 消息状态，用于控制重新生成按钮' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'actionState', type: 'Object', desc: '当前消息的操作状态 { like, dislike }' },
            ],
            events: [
              { event: 'like', params: 'msgId', desc: '点赞/取消赞' },
              { event: 'dislike', params: 'msgId', desc: '点踩' },
              { event: 'share', params: 'msgId', desc: '触发分享模式' },
              { event: 'regenerate', params: 'msgId', desc: '重新生成' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
          {
            id: 'ConversationShareModal',
            name: 'ConversationShareModal',
            label: '对话分享配置弹窗',
            catalogTier: 'productModule',
            productModule: '地图 Agent v2',
            level: '子模块级',
            domain: 'Agent v2',
            type: 'modal',
            file: 'src/pages/DataMap/MapAgent/components/Chat/ConversationShareModal.vue',
            demo: () => import('./demos/ConversationShareModalDemo.vue'),
            desc: '多选对话后配置分享链接有效期并生成链接。地图 Agent v2 业务封装，内部复用老 Agent 的 ShareConfigModal。',
            props: [
              { prop: 'open', type: 'Boolean', desc: '弹窗显示状态（v-model:open）' },
              { prop: 'isDarkMode', type: 'Boolean', desc: '暗色模式' },
              { prop: 'selectedCount', type: 'Number', desc: '已选中的对话组数量' },
            ],
            events: [
              { event: 'update:open', params: 'visible: Boolean', desc: '弹窗开关' },
              { event: 'confirm', params: '{ expire }', desc: '确认生成链接，expire 为 7days | 30days | permanent' },
            ],
            usages: [{ label: 'StreamMessageList', route: '/datamap/map-agent' }]
          },
        ]
      }
    ]
  }
]
