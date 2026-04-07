import { extractFirstTableFqnFromText } from '@/utils/fqnDisplay.js'

/** 关键词找表：单次回复内最多展示的表数量（不跳转其他页面、不分页） */
const KEYWORD_SEARCH_LIST_CAP = 20

/** 前若干条为贴近业务的种子，不足 30 条时自动补齐 */
const KEYWORD_SEARCH_SEED_TABLES = [
  ['dm_trade.dws_order_summary_nd', '订单汇总表', 'DWS', '张三(zhangsan)'],
  ['dm_trade.dwd_order_detail_di', '订单明细表', 'DWD', '李四(lisi)'],
  ['dm_trade.dim_order_status', '订单状态维表', 'DIM', '王五(wangwu)'],
  ['dm_risk.dws_risk_order_intercept_nd', '风控拦截订单汇总表', 'DWS', '赵六(zhaoliu)'],
  ['dm_risk.dwd_risk_event_detail_di', '风控事件明细表', 'DWD', '孙七(sunqi)'],
  ['dm_trade.ods_order_info', '订单原始表', 'ODS', '周八'],
  ['dm_trade.dws_user_order_stats_nd', '用户订单统计表', 'DWS', '吴九'],
  ['dm_trade.dwd_order_refund_detail_di', '订单退款明细表', 'DWD', '钱十一'],
  ['dm_risk.dim_risk_rule', '风控规则维表', 'DIM', '孙十二(sunshier)'],
  ['dm_trade.dws_shop_order_summary_nd', '店铺订单汇总表', 'DWS', '李十三(lishisan)'],
  ['dm_trade.dwd_order_logistics_detail_di', '订单物流明细表', 'DWD', '周十四(zhoushisi)'],
  ['dm_trade.dim_pay_type', '支付方式维表', 'DIM', '郑十(zhengshi)'],
  ['dm_ads.trade_kpi_daily', '交易 KPI 日表', 'ADS', '冯十五'],
  ['dm_base.dim_region', '地区维表', 'DIM', '陈十六'],
  ['dm_trade.dws_sku_sales_nd', 'SKU 销售汇总', 'DWS', '楚十七'],
  ['dm_risk.dws_fraud_score_nd', '风控评分汇总', 'DWS', '魏十八']
]

function buildKeywordSearchTableMarkdownBody() {
  const rows = KEYWORD_SEARCH_SEED_TABLES.map((r) => [...r])
  const layers = ['DWS', 'DWD', 'DIM', 'ADS', 'ODS']
  let idx = rows.length
  while (rows.length < KEYWORD_SEARCH_LIST_CAP) {
    idx += 1
    rows.push([
      `dm_trade.dws_order_search_${idx}`,
      `订单检索命中表 ${idx}`,
      layers[idx % layers.length],
      `分析师${idx}`
    ])
  }
  return rows
    .slice(0, KEYWORD_SEARCH_LIST_CAP)
    .map((r, i) => {
      const n = i + 1
      return `| ${n} | \`${r[0]}\` | ${r[1]} | ${r[2]} | ${r[3]} |`
    })
    .join('\n')
}

/**
 * 地图 Agent v2 (千问风格) - 流式 Mock
 * 6 种场景全部通过 onMessage 输出 Markdown 文本，不再输出 cardData
 *
 * @param {object} opts
 * @param {AbortSignal} [opts.abortSignal]
 * @returns {Promise<{ aborted?: boolean }>}
 */
export function mockSendMessageStream({
  content,
  abortSignal,
  onStep,
  onMessage,
  onSuggestions,
  onTableDetail,
  onDone
}) {
  return new Promise((resolve) => {
    const timers = []
    let streamIntervalId = null
    let settled = false

    const settle = (aborted) => {
      if (settled) return
      settled = true
      clearAllTimers()
      resolve({ aborted: !!aborted })
    }

    const isAborted = () => Boolean(abortSignal?.aborted)

    const clearAllTimers = () => {
      timers.forEach((id) => clearTimeout(id))
      timers.length = 0
      if (streamIntervalId != null) {
        clearInterval(streamIntervalId)
        streamIntervalId = null
      }
    }

    const safeSetTimeout = (fn, delay) => {
      const id = setTimeout(() => {
        const idx = timers.indexOf(id)
        if (idx !== -1) timers.splice(idx, 1)
        if (isAborted()) {
          settle(true)
          return
        }
        fn()
      }, delay)
      timers.push(id)
      return id
    }

    abortSignal?.addEventListener(
      'abort',
      () => {
        clearAllTimers()
        settle(true)
      },
      { once: true }
    )

  const isFieldsIntent = content.includes('字段') || content.includes('schema') || content.includes('Schema')
  const isPreviewIntent = content.includes('预览') || content.includes('抽样')
  const isProductionIntent = content.includes('生产') || content.includes('调度') || content.includes('执行')
  const isLineageIntent = content.includes('血缘') || content.includes('上游') || content.includes('下游')
  const isDdlIntent =
    content.includes('DDL') ||
    content.includes('建表语句') ||
    content.includes('脚本信息') ||
    content.includes('查看脚本')
  const isSelectIntent = content.includes('SELECT') || content.includes('查询语句')
  const isListIntent = content.includes('订单') || content.includes('列表') || content.includes('相关') || content.includes('风控') || content.includes('找')

  let scenario
  if (isFieldsIntent) scenario = buildFieldsScenario()
  else if (isPreviewIntent) scenario = buildPreviewScenario()
  else if (isProductionIntent) scenario = buildProductionScenario()
  else if (isLineageIntent) scenario = buildLineageScenario()
  else if (isDdlIntent) scenario = buildDdlScenario()
  else if (isSelectIntent) scenario = buildSelectScenario()
  else if (isListIntent) scenario = buildListScenario()
  else scenario = buildDetailScenario(content)

  let currentStepIndex = 0

    const runStep = () => {
      if (isAborted()) {
        settle(true)
        return
      }
      if (currentStepIndex < scenario.steps.length) {
        const step = scenario.steps[currentStepIndex]
        if (onStep) onStep({ id: step.id, status: 'running', text: step.text })
        safeSetTimeout(() => {
          if (isAborted()) {
            settle(true)
            return
          }
          if (onStep) onStep({ id: step.id, status: 'success', text: step.text })
          currentStepIndex++
          runStep()
        }, step.duration)
      } else {
        streamMarkdown()
      }
    }

    const streamMarkdown = () => {
      if (isAborted()) {
        settle(true)
        return
      }
      if (scenario.tableDetail && onTableDetail) {
        onTableDetail(scenario.tableDetail)
      }
      const text = scenario.markdown
      let i = 0
      streamIntervalId = setInterval(() => {
        if (isAborted()) {
          settle(true)
          return
        }
        if (i < text.length) {
          if (onMessage) onMessage(text[i])
          i++
        } else {
          clearAllTimers()
          safeSetTimeout(() => {
            if (isAborted()) {
              settle(true)
              return
            }
            if (onSuggestions) onSuggestions(scenario.suggestions)
            if (onDone) onDone()
            settle(false)
          }, 200)
        }
      }, 15)
    }

    safeSetTimeout(() => {
      runStep()
    }, 300)
  })
}

function buildListScenario() {
  const n = KEYWORD_SEARCH_LIST_CAP
  const tableBody = buildKeywordSearchTableMarkdownBody()
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 600 },
      { id: 2, text: '在向量库中检索相关表资产...', duration: 1000 },
      { id: 3, text: '进行数据权限校验与脱敏处理...', duration: 800 },
      { id: 4, text: '生成总结与推荐理由...', duration: 1200 }
    ],
    markdown: `为您检索到与关键词相关的数据表（命中 **${n}** 张，已在本条回复内全部列出；单次最多 **${n}** 张）。

| # | 表名 | 中文名 | 分层 | 负责人 |
|---|---|---|---|---|
${tableBody}

**说明**：
- 可在**当前对话**中继续输入表名查看详情、字段或血缘，无需离开本页。
- 若需缩小范围，可补充分层、业务域或负责人等条件后再问。

**匹配摘要**：
1. 与检索词语义最接近的表排在表格前部。
2. 同时包含汇总（DWS）、明细（DWD）与维表（DIM），便于按需下钻。
3. 风控相关命中表可与订单域表联合分析。`,
    suggestions: [
      '查看 dm_trade.dws_order_summary_nd 的详情',
      '帮我对比一下汇总表和明细表',
      '只看 DWS 层的表'
    ]
  }
}

function buildDetailScenario(content) {
  const tableName =
    extractFirstTableFqnFromText(content) || 'dm_trade.dws_order_summary_nd'
  const cnName = '订单汇总表'
  const owner = '张三(zhangsan)'
  const description =
    '包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。该表是下游核心报表的数据源，主要用于管理层经营分析。'
  return {
    tableDetail: {
      fqn: tableName,
      cnName,
      owner,
      description
    },
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 600 },
      { id: 2, text: '查询 OpenMetadata 元数据...', duration: 1000 },
      { id: 3, text: '进行数据权限校验与脱敏处理...', duration: 800 },
      { id: 4, text: '生成总结与推荐理由...', duration: 1200 }
    ],
    markdown: `为您找到表 **${tableName}** 的详细信息：

> **表英文名：** ${tableName}
> **表中文名：** ${cnName}
> **表负责人：** ${owner}
> **表描述：** ${description}

<!-- MAPAGENT:TABLE_ACTIONS -->

### 基础信息
| 属性 | 内容 |
|---|---|
| **表类型** | Hive 内部表 |
| **分区类型** | 按天分区 (dt) |
| **表创建时间** | 2023-05-12 10:00:00 |
| **表更新时间** | 2026-03-30 02:30:00 |
| **表数量** | 1.2 亿行 (450GB) |

### Tableau 数据源信息
| 属性 | 内容 |
|---|---|
| **是否推送** | 是 |
| **数据源名称** | DS_Trade_Order_Summary |
| **最近开始时间** | 2026-03-30 03:00:00 |
| **最近结束时间** | 2026-03-30 03:15:00 |`,
    suggestions: [
      '字段详情',
      '预览探查',
      '查看脚本信息',
      '生成SELECT',
      '生产信息',
      '血缘关系',
      '这张表主要被哪些报表使用？',
      '如何计算客单价？'
    ]
  }
}

function buildLineageScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 600 },
      { id: 2, text: '提取数据表血缘链路...', duration: 1000 },
      { id: 3, text: '生成血缘分析报告...', duration: 1200 }
    ],
    markdown: `已经为您分析了该表的血缘关系，核心结论如下：

> **💡 AI 洞察**：该表的血缘关系较为复杂，其上游主要依赖 \`dwd_order_info\` 和 \`dim_user\`。该表是下游 5 张核心报表的数据源，如果该表延迟，将直接影响【每日销售看板】的产出。

**上游依赖（2 张）**

| 表名 | 中文名 | 关系 |
|---|---|---|
| \`dm_trade.dwd_order_info\` | 订单明细表 | 直接依赖 |
| \`dm_base.dim_user\` | 用户维度表 | 直接依赖 |

⬇️

**当前表：\`dm_trade.dws_order_summary_nd\`** — 订单汇总表

⬇️

**下游影响（2 张核心）**

| 表名 | 中文名 | 影响等级 |
|---|---|---|
| \`ads_trade.sales_dashboard\` | 每日销售看板 | 🔴 高 |
| \`ads_trade.user_repurchase_rate\` | 用户复购率统计 | 🟡 中 |`,
    suggestions: [
      '查看上游 dwd_order_info 的详情',
      '分析下游销售看板的指标口径',
      '该表最近一次产出是否延迟？'
    ]
  }
}

function buildFieldsScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 500 },
      { id: 2, text: '获取表 Schema 信息...', duration: 800 }
    ],
    markdown: `\`default.user_behavior_log\` 共有 100 个字段，以下是核心字段：

| # | 字段名 | 类型 | 描述 | 标记 |
|---|---|---|---|---|
| 1 | \`user_id\` | string | 全局唯一用户标识 | 🔑 主键 |
| 2 | \`event_type\` | string | 事件类型 (click, view, add_cart) | |
| 3 | \`page_id\` | string | 发生事件的页面ID | |
| 4 | \`device_os\` | string | 设备操作系统 (iOS, Android) | |
| 5 | \`device_model\` | string | 设备型号 | |
| 6 | \`ip_address\` | string | 客户端 IP 地址 | |
| 7 | \`session_id\` | string | 会话 ID | |
| 8 | \`app_version\` | string | App 版本号 | |
| … | … | … | *(省略 91 个扩展字段)* | |
| 100 | \`dt\` | string | 日期分区 (yyyyMMdd) | 📂 分区 |`,
    suggestions: [
      '预览下数据',
      '看下生产信息',
      '查看血缘关系'
    ]
  }
}

function buildPreviewScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 500 },
      { id: 2, text: '执行数据抽样探查任务...', duration: 1200 }
    ],
    markdown: `以下是 \`default.user_behavior_log\` 的数据预览（随机抽样 5 条）：

| user_id | event_type | page_id | device_os | device_model | ip_address |
|---|---|---|---|---|---|
| U28371 | click | page_12 | iOS | iPhone 14 | 192.168.32.105 |
| U91204 | view | page_3 | Android | Xiaomi 13 | 192.168.128.77 |
| U45082 | add_cart | page_7 | Web | MacBook | 192.168.201.33 |
| U67193 | purchase | page_1 | iOS | iPhone 14 | 192.168.45.219 |
| U33021 | click | page_15 | Android | Huawei P60 | 192.168.99.142 |

**📊 数据概况**
- 总行数：**100,000**
- 主键去重记录数：**98,520**
- 重复记录数：**1,480**`,
    suggestions: [
      '看下这张表的字段',
      '看下生产信息',
      '查看血缘关系'
    ]
  }
}

function buildProductionScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 500 },
      { id: 2, text: '查询调度系统运行日志...', duration: 1000 }
    ],
    markdown: `\`default.user_behavior_log\` 的生产调度信息如下：

**⚙️ 调度配置**

| 属性 | 值 |
|---|---|
| 任务名称 | \`dws_user_behavior_log_di\` |
| 调度周期 | 每日 02:00 |
| 所属时区 | 中国时间 |
| 最近产出 | 2026-03-30 02:15:30 |

**⏱️ 近 5 次执行记录**

| 实例ID | 状态 | 开始时间 | 结束时间 | 耗时 |
|---|---|---|---|---|
| 100456 | ✅ 成功 | 03-30 02:00 | 03-30 02:15 | 15分30秒 |
| 100455 | ✅ 成功 | 03-29 02:00 | 03-29 02:14 | 14分20秒 |
| 100454 | ✅ 成功 | 03-28 02:00 | 03-28 02:16 | 16分10秒 |
| 100453 | ❌ 失败 | 03-27 02:00 | 03-27 02:05 | 5分0秒 |
| 100452 | ✅ 成功 | 03-26 02:00 | 03-26 02:15 | 15分45秒 |

> **⚠️ 异常提醒**：3月27日执行失败，耗时异常偏短（5分钟），建议排查当日任务日志。`,
    suggestions: [
      '排查 3月27日的失败原因',
      '看下这张表的字段',
      '查看血缘关系'
    ]
  }
}

function buildDdlScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 500 },
      { id: 2, text: '拉取调度脚本与表结构信息...', duration: 800 }
    ],
    markdown: `以下为 **dm_trade.dws_order_summary_nd** 的任务脚本信息：

\`\`\`sql
--set spark.dynamicAllocation.maxExecutors=80;
--set spark.executor.cores=2;
--set spark.executor.memory=10G;

--依赖:
--    ods_trade.ods_order_detail_di
--create by 张三(zhangsan) on 20260101
--备注:包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。  运行时长 约 10 分钟

create table if not exists dm_trade.dws_order_summary_nd
(
  order_id        string comment '订单号'
 ,user_id         string comment '用户 ID'
 ,total_amount    decimal(22,6) comment '订单总金额'
 ,order_status    string comment '订单状态'
 ,create_time     bigint comment '创建时间戳'
)
COMMENT '订单汇总表'
PARTITIONED BY (
  \`dt\` string
)
stored as orc;

insert overwrite table dm_trade.dws_order_summary_nd partition (dt='\${p_date}')
select
  order_id
 ,user_id
 ,total_amount
 ,order_status
 ,unix_timestamp(create_time) as create_time
from ods_trade.ods_order_detail_di
where dt = '\${p2_date}'
;

-- 历史版本已注释
-- insert overwrite table dm_trade.dws_order_summary_nd partition (dt='\${p_date}')
-- select * from ods_trade.ods_order_detail_di where dt = '\${p_date}';
\`\`\`
`,
    suggestions: [
      '生成SELECT',
      '字段详情',
      '生产信息'
    ]
  }
}

function buildSelectScenario() {
  return {
    steps: [
      { id: 1, text: '语义解析与意图识别...', duration: 500 },
      { id: 2, text: '获取表结构并生成查询语句...', duration: 800 }
    ],
    markdown: `为您生成了该表的常用 SELECT 查询语句：

\`\`\`sql
-- 查询最新分区的前 100 条数据
SELECT 
  order_id,
  user_id,
  total_amount,
  order_status,
  create_time
FROM dm_trade.dws_order_summary_nd
WHERE dt = '20260330'
LIMIT 100;
\`\`\`
`,
    suggestions: [
      '查看脚本信息',
      '预览探查',
      '血缘关系'
    ]
  }
}
