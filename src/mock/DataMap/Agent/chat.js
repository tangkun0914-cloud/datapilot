export function mockSendMessageStream({ content, onStep, onMessage, onCard, onDone }) {
  // 判断意图
  const isListIntent = content.includes('订单') || content.includes('列表') || content.includes('相关') || content.includes('风控')
  const isLineageIntent = content.includes('血缘') || content.includes('上游') || content.includes('下游')
  
  // 1. 模拟思考/执行步骤
  let steps = []
  if (isLineageIntent) {
    steps = [
      { id: 1, text: '语义解析与意图识别...', duration: 600 },
      { id: 2, text: '提取数据表血缘链路...', duration: 1000 },
      { id: 3, text: '生成血缘分析报告...', duration: 1200 }
    ]
  } else {
    steps = [
      { id: 1, text: '语义解析与意图识别...', duration: 600 },
      { id: 2, text: isListIntent ? '在向量库中检索相关表资产...' : '查询 OpenMetadata 元数据...', duration: 1000 },
      { id: 3, text: '进行数据权限校验与脱敏处理...', duration: 800 },
      { id: 4, text: '生成总结与推荐理由...', duration: 1200 }
    ]
  }

  let currentStepIndex = 0

  const runStep = () => {
    if (currentStepIndex < steps.length) {
      const step = steps[currentStepIndex]
      // 发送执行中状态
      if (onStep) onStep({ id: step.id, status: 'running', text: step.text })
      
      setTimeout(() => {
        // 发送成功状态
        if (onStep) onStep({ id: step.id, status: 'success', text: step.text })
        currentStepIndex++
        runStep()
      }, step.duration)
    } else {
      // 步骤执行完毕，开始流式输出文本
      streamText()
    }
  }

  // 2. 模拟流式文本输出 (增量 Delta)
  const streamText = () => {
    let text = ''
    if (isLineageIntent) {
      text = '已经为您分析了该表的血缘关系，核心结论如下：'
    } else if (isListIntent) {
      text = '为您检索到以下相关的数据表资产：'
    } else {
      text = `这是 ${content.replace('查看 ', '').replace(' 表的详细信息', '')} 表的详细信息：`
    }
      
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        if (onMessage) onMessage(text[i]) // 每次只发送一个字符，模拟真实 SSE Delta
        i++
      } else {
        clearInterval(interval)
        // 文本输出完成后，模拟输出卡片数据
        sendCard()
      }
    }, 50) // 每个字 50ms
  }

  // 3. 模拟输出卡片并结束
  const sendCard = () => {
    setTimeout(() => {
      if (isLineageIntent) {
        if (onCard) onCard({
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
          ],
          suggestions: [
            '查看上游 dwd_order_info 的详情',
            '分析下游销售看板的指标口径',
            '该表最近一次产出是否延迟？'
          ]
        })
      } else if (isListIntent) {
        if (onCard) onCard({
          type: 'table_list',
          total: 45,
          list: [
            { fqn: 'dm_trade.dws_order_summary_nd', cnName: '订单汇总表', desc: '包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。', tags: ['核心资产', 'DWS'], reason: '表名及描述高度匹配“订单”，且为核心汇总表。', owner: '张三(zhangsan)' },
            { fqn: 'dm_trade.dwd_order_detail_di', cnName: '订单明细表', desc: '全渠道订单原子粒度明细数据，包含订单状态、支付金额、优惠明细等。', tags: ['DWD'], reason: '包含订单最全明细数据，下游使用广泛。', owner: '李四(lisi)' },
            { fqn: 'dm_trade.dim_order_status', cnName: '订单状态维表', desc: '订单各状态节点的枚举与说明，用于状态映射。', tags: ['DIM'], reason: '订单分析常用维表。', owner: '王五(wangwu)' },
            { fqn: 'dm_risk.dws_risk_order_intercept_nd', cnName: '风控拦截订单汇总表', desc: '记录每日被风控规则拦截的异常订单汇总数据。', tags: ['风控', 'DWS'], reason: '涉及订单与风控双重属性。', owner: '赵六(zhaoliu)' },
            { fqn: 'dm_risk.dwd_risk_event_detail_di', cnName: '风控事件明细表', desc: '详细记录每次风控触发事件的上下文、规则命中情况及处置结果。', tags: ['风控', 'DWD'], reason: '风控分析核心明细表。', owner: '孙七(sunqi)' },
            { fqn: 'dm_trade.ods_order_info', cnName: '订单原始表', desc: '业务系统同步的原始订单数据。', tags: ['ODS'], reason: '订单数据源头。', owner: '周八(zhouba)' },
            { fqn: 'dm_trade.dws_user_order_stats_nd', cnName: '用户订单统计表', desc: '按用户粒度统计的订单相关指标，如累计下单次数、累计消费金额等。', tags: ['DWS'], reason: '用户维度的订单分析常用表。', owner: '吴九(wu9)' },
            { fqn: 'dm_trade.dim_pay_type', cnName: '支付方式维表', desc: '支付方式的枚举说明，如微信、支付宝、银行卡等。', tags: ['DIM'], reason: '订单支付分析关联维表。', owner: '郑十(zhengshi)' },
            { fqn: 'dm_trade.dwd_order_refund_detail_di', cnName: '订单退款明细表', desc: '记录订单退款的详细信息，包括退款金额、退款原因等。', tags: ['DWD'], reason: '订单售后分析核心表。', owner: '钱十一(qianshiyi)' },
            { fqn: 'dm_risk.dim_risk_rule', cnName: '风控规则维表', desc: '风控系统中配置的各项拦截规则说明。', tags: ['风控', 'DIM'], reason: '风控分析关联维表。', owner: '孙十二(sunshier)' },
            { fqn: 'dm_trade.dws_shop_order_summary_nd', cnName: '店铺订单汇总表', desc: '按店铺粒度统计的每日订单量、销售额等指标。', tags: ['DWS'], reason: '商家维度的订单分析常用表。', owner: '李十三(lishisan)' },
            { fqn: 'dm_trade.dwd_order_logistics_detail_di', cnName: '订单物流明细表', desc: '记录订单的物流轨迹、配送状态等信息。', tags: ['DWD'], reason: '订单履约分析核心表。', owner: '周十四(zhoushisi)' }
          ],
          suggestions: [
            '帮我对比一下 订单汇总表 和 订单明细表',
            '只看 DWS 层的表',
            '哪些表包含用户设备信息？'
          ]
        })
      } else {
        if (onCard) onCard({
          type: 'table',
          fqn: 'default.user_behavior_log',
          cnName: '用户行为日志表',
          tags: ['核心资产'],
          layers: ['ODS', 'Hive'],
          desc: '记录用户在 App 和 Web 端的所有核心行为事件，包含浏览、点击、加购、收藏等，T+1 更新。',
          owner: '张三(zhangsan)',
          updateFreq: '2026-03-30 02:15:30',
          hotness: '1.2w',
          hasPermission: false,
          suggestions: [
            '查看血缘关系',
            '查询近7天产出量',
            '谁是这张表的使用者最多？'
          ]
        })
      }
      
      // 结束流
      if (onDone) onDone()
    }, 300)
  }

  // 启动流程
  setTimeout(() => {
    runStep()
  }, 300)
}
