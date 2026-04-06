/**
 * Mock AI Copilot 数据 - 供 Copilot 组件使用
 */
import dayjs from 'dayjs'

/**
 * 本期 Copilot 仅支持「智能找表」，按四种范围区分检索意图（intentId 供 Agent / 检索参数路由）
 */
export const SMART_FIND_INTENT_IDS = [
  'smart_find_business',
  'smart_find_keyword',
  'smart_find_project',
  'smart_find_topic',
]

export const presetQuestions = [
  {
    icon: 'AppstoreOutlined',
    title: '按业务用途找表',
    intentPlaceholder: '请描述业务场景或分析目的，例如交易明细、用户画像、营收统计…',
    prompt: '我要做渠道转化分析，帮我找和订单漏斗、曝光点击相关的表',
    intentId: 'smart_find_business',
  },
  {
    icon: 'SearchOutlined',
    title: '按关键词找表',
    intentPlaceholder: '输入表名、库名、字段名或描述中的关键词',
    prompt: '关键词：order_detail、支付、hive.dm_trade',
    intentId: 'smart_find_keyword',
  },
  {
    icon: 'DeploymentUnitOutlined',
    title: '指定项目范围找表',
    intentPlaceholder: '请先说明项目空间 / 项目范围，再描述要找的表或业务场景',
    prompt: '在「华东-零售项目空间」下找和用户、订单相关的宽表',
    intentId: 'smart_find_project',
  },
  {
    icon: 'TagsOutlined',
    title: '指定专题范围找表',
    intentPlaceholder: '请先说明数据专题或主题域，再描述找表需求',
    prompt: '在「交易域-订单专题」下找明细层和汇总层的表',
    intentId: 'smart_find_topic',
  },
]

/**
 * Copilot 点踩原因 — 反馈卡片内标签多选（数据地图专属分类）
 */
export const DISLIKE_REASON_OPTIONS = [
  { value: 'table_not_found', label: '找不到想要的表' },
  { value: 'info_inaccurate', label: '表/字段信息不准' },
  { value: 'lineage_error', label: '血缘关系错误' },
  { value: 'intent_drift', label: '意图理解偏差' },
  { value: 'lag_incomplete', label: '回答卡顿/不完整' },
  { value: 'other', label: '其他' },
]

/**
 * 模拟当前登录用户身份 — 供 greeting 推荐使用
 */
export const MOCK_USER_PROFILE = {
  name: '张三(zhangsan)',
  role: '数据开发工程师',
  department: '交易数据组',
  ownedTables: ['ods_order_detail', 'dwd_trade_order_detail'],
}

/**
 * Copilot 首条 greeting 推荐表 — 基于用户角色 + 团队 + 上下游综合推荐
 */
export const GREETING_RECOMMENDATIONS = {
  content: '${name}你好！为你推荐以下数据表：',
  tables: [
    { id: 'rec-1', name: 'dws_trade_summary', fullyQualifiedName: 'hive.dm_trade.dws.dws_trade_summary', displayName: '交易汇总表', serviceType: 'Hive', description: '按日/渠道/类目维度的交易汇总指标，你负责的 ods_order_detail 的下游产出', database: { name: 'dm_trade' } },
    { id: 'rec-2', name: 'ads_order_summary', fullyQualifiedName: 'starrocks.dm_report.ads.ads_order_summary', displayName: '订单汇总表', serviceType: 'StarRocks', description: '订单维度汇总指标，服务 BI 看板，近期你的团队访问频次最高', database: { name: 'dm_report' } },
    { id: 'rec-3', name: 'dwd_user_profile', fullyQualifiedName: 'starrocks.dm_user.dwd.dwd_user_profile', displayName: '用户画像宽表', serviceType: 'StarRocks', description: '用户基础属性与行为标签宽表，交易数据组常与订单表 JOIN 使用', database: { name: 'dm_user' } },
    { id: 'rec-4', name: 'ods_payment_raw', fullyQualifiedName: 'hive.dm_trade.ods.ods_payment_raw', displayName: '支付原始数据表', serviceType: 'Hive', description: '你负责的 ods_order_detail 的上游源表，近期有 schema 变更', database: { name: 'dm_trade' } },
  ],
}

/**
 * 会话列表 Mock 数据 — 供 SessionList / CopilotPanel / CopilotFull 使用
 */
export const INITIAL_SESSIONS = [
  {
    id: 201,
    title: '查找订单相关表',
    tags: [
      { type: 'table', label: 'ods_order_detail' },
      { type: 'table', label: 'dwd_trade_order_detail' },
    ],
    module: '数据地图',
    ts: dayjs().toISOString(),
    status: 'ACTIVE',
    summary: '帮我找一下和订单相关的表...',
  },
  {
    id: 202,
    title: 'ods_order_detail 血缘追溯',
    tags: [
      { type: 'table', label: 'ods_order_detail' },
    ],
    module: '数据地图',
    ts: dayjs().subtract(1, 'hour').toISOString(),
    status: 'SUSPENDED',
    summary: '上游有 5 张源表，下游被 3 张表引用',
  },
  {
    id: 203,
    title: '字段释义咨询',
    tags: [
      { type: 'table', label: 'ods_order_detail' },
    ],
    module: '数据地图',
    ts: dayjs().subtract(3, 'hour').toISOString(),
    status: 'SUSPENDED',
    summary: 'order_amount 和 pay_channel 字段含义',
  },
  {
    id: 204,
    title: '数据质量巡检',
    tags: [],
    module: '数据治理',
    ts: '2025-01-20T09:15:00',
    status: 'ARCHIVED',
    summary: 'ods_order_detail 近 7 天空值率 0.02%',
  },
  {
    id: 205,
    title: '负责人查询',
    tags: [],
    module: '数据地图',
    ts: '2025-01-18T16:00:00',
    status: 'ARCHIVED',
    summary: '交易域表及负责人信息',
  },
]

/**
 * 会话历史消息 Mock 数据 — 按 sessionId 索引
 */
export const MOCK_CHAT_HISTORY = {
  201: [
    { role: 'user', content: '帮我找一下和订单相关的表，需要包含订单金额、用户ID、支付渠道等字段' },
    {
      role: 'assistant',
      content: '根据您的需求，我找到了以下与订单相关的表，均包含订单金额、用户ID、支付渠道等核心字段：',
      tables: [
        { id: '1', name: 'ods_order_detail', fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail', displayName: '订单明细表', serviceType: 'Hive', description: '全渠道订单原子粒度明细数据', database: { name: 'dm_trade' } },
        { id: '13', name: 'dwd_trade_order_detail', fullyQualifiedName: 'hive.dm_trade.dwd.dwd_trade_order_detail', displayName: '交易订单明细事实表', serviceType: 'Hive', description: '订单+支付关联后的明细事实表', database: { name: 'dm_trade' } },
      ],
    },
  ],
  202: [
    { role: 'user', content: 'ods_order_detail 这张表的上游数据来源有哪些？下游被哪些表引用？' },
    {
      role: 'assistant',
      content: 'ods_order_detail（订单明细表）的血缘关系如下：\n\n**上游来源（5 张表）：**\n- ods_order_raw\n- ods_payment_raw\n- ods_user_raw\n\n**下游引用（3 张表）：**\n- dwd_trade_order_detail\n- dws_sku_sale_daily\n- ads_order_summary',
      tables: [
        { id: '1', name: 'ods_order_detail', fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail', displayName: '订单明细表', serviceType: 'Hive', description: '全渠道订单原子粒度明细数据', database: { name: 'dm_trade' } },
      ],
    },
  ],
  203: [
    { role: 'user', content: 'ods_order_detail 表中 order_amount 和 pay_channel 字段分别是什么意思？' },
    {
      role: 'assistant',
      content: '**order_amount**（DECIMAL 18,2）：订单金额（单位：元），包含商品金额、运费和优惠。\n\n**pay_channel**（VARCHAR 32）：支付渠道，取值 alipay / wechat / bank_card。',
      tables: [],
    },
  ],
}

export const mockConversations = [
  {
    id: 'conv-1',
    title: '查找订单相关表',
    messages: [
      {
        role: 'user',
        content: '帮我找一下和订单相关的表，需要包含订单金额、用户ID、支付渠道等字段',
      },
      {
        role: 'assistant',
        content: '根据您的需求，我找到了以下与订单相关的表，均包含订单金额、用户ID、支付渠道等核心字段：',
        tables: [
          {
            id: '1',
            name: 'ods_order_detail',
            fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail',
            displayName: '订单明细表',
            serviceType: 'Hive',
            description: '全渠道订单原子粒度明细数据，T+1 增量同步',
            owners: [{ name: '张三(zhangsan)' }],
          },
          {
            id: '13',
            name: 'dwd_trade_order_detail',
            fullyQualifiedName: 'hive.dm_trade.dwd.dwd_trade_order_detail',
            displayName: '交易订单明细事实表',
            serviceType: 'Hive',
            description: '订单+支付关联后的明细事实表',
            owners: [{ name: '张三(zhangsan)' }],
          },
          {
            id: '15',
            name: 'ads_order_summary',
            fullyQualifiedName: 'starrocks.dm_report.ads.ads_order_summary',
            displayName: '订单汇总表',
            serviceType: 'StarRocks',
            description: '订单维度汇总指标',
            owners: [{ name: '赵六(zhaoliu)' }],
          },
        ],
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'ods_order_detail 血缘追溯',
    messages: [
      {
        role: 'user',
        content: 'ods_order_detail 这张表的上游数据来源有哪些？下游被哪些表引用？',
      },
      {
        role: 'assistant',
        content: 'ods_order_detail（订单明细表）的血缘关系如下：\n\n**上游来源（5 张表）：**\n- ods_order_raw：订单原始数据\n- ods_payment_raw：支付原始数据\n- ods_user_raw：用户原始数据\n- ods_product_raw：商品原始数据\n- ods_inventory_raw：库存原始数据\n\n**下游引用（3 张表）：**\n- dwd_trade_order_detail：交易订单明细事实表\n- dws_sku_sale_daily：SKU 日销表\n- ads_order_summary：订单汇总表',
        tables: [
          {
            id: '1',
            name: 'ods_order_detail',
            fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail',
            displayName: '订单明细表',
            serviceType: 'Hive',
            description: '全渠道订单原子粒度明细数据',
            owners: [{ name: '张三(zhangsan)' }],
          },
        ],
      },
    ],
  },
  {
    id: 'conv-3',
    title: '字段释义',
    messages: [
      {
        role: 'user',
        content: 'ods_order_detail 表中 order_amount 和 pay_channel 字段分别是什么意思？',
      },
      {
        role: 'assistant',
        content: 'ods_order_detail 表中这两个字段的含义如下：\n\n**order_amount**（DECIMAL 18,2）\n- 含义：订单金额，单位为元\n- 说明：表示该笔订单的应付总金额，包含商品金额、运费、优惠等\n\n**pay_channel**（VARCHAR 32）\n- 含义：支付渠道\n- 取值：alipay（支付宝）、wechat（微信支付）、bank_card（银行卡）\n- 说明：标识用户完成支付时使用的支付方式',
        tables: [
          {
            id: '1',
            name: 'ods_order_detail',
            fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail',
            displayName: '订单明细表',
            serviceType: 'Hive',
            description: '全渠道订单原子粒度明细数据',
            owners: [{ name: '张三(zhangsan)' }],
          },
        ],
      },
    ],
  },
]
