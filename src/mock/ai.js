/**
 * Mock AI Copilot 数据 - 供 Copilot 组件使用
 */

export const presetQuestions = [
  {
    icon: 'SearchOutlined',
    title: '智能找表',
    prompt: '帮我找一下和订单相关的表，需要包含订单金额、用户ID、支付渠道等字段',
  },
  {
    icon: 'ApartmentOutlined',
    title: '血缘追溯',
    prompt: 'ods_order_detail 这张表的上游数据来源有哪些？下游被哪些表引用？',
  },
  {
    icon: 'ReadOutlined',
    title: '字段释义',
    prompt: 'dwd_user_profile 表中 order_amount 和 pay_channel 字段分别是什么意思？',
  },
  {
    icon: 'BarChartOutlined',
    title: '数据质量',
    prompt: '最近一周 ods_order_detail 表的数据质量如何？有没有空值异常？',
  },
  {
    icon: 'TeamOutlined',
    title: '负责人查询',
    prompt: '交易域下有哪些表？分别是谁负责的？',
  },
  {
    icon: 'ThunderboltOutlined',
    title: '热门表推荐',
    prompt: '推荐一些最近访问量高的、和用户分析相关的表',
  },
]

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
