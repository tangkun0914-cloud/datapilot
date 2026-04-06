import { stripAtBeforeFqnInPlainText, stripNoiseBeforeFqnInPlainText } from '@/utils/fqnDisplay.js'

/** 与 fqnDisplay 一致：至少两段式 schema.table */
const FQN_TOKEN_RE = /\b([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)+)\b/g

/**
 * @param {string} text
 * @returns {string[]}
 */
function extractFqnsFromText(text) {
  if (!text || typeof text !== 'string') return []
  const cleaned = stripNoiseBeforeFqnInPlainText(stripAtBeforeFqnInPlainText(text))
  const out = []
  let m
  FQN_TOKEN_RE.lastIndex = 0
  while ((m = FQN_TOKEN_RE.exec(cleaned)) !== null) {
    const fqn = m[1]
    if (fqn.includes('.')) out.push(fqn)
  }
  return out
}

/**
 * @param {object} card
 * @returns {Array<{ fqn: string, cnName?: string, owner?: string, type?: string }>}
 */
function rowsFromCard(card) {
  if (!card || typeof card !== 'object') return []
  const rows = []
  if (card.type === 'table' && card.fqn) {
    rows.push({ fqn: card.fqn, cnName: card.cnName, owner: card.owner, type: card.type })
  }
  if (card.type === 'table_list' && Array.isArray(card.list)) {
    for (const item of card.list) {
      if (item?.fqn) rows.push({ fqn: item.fqn, cnName: item.cnName, owner: item.owner, type: item.type })
    }
  }
  if (card.type === 'lineage_card') {
    if (card.fqn) rows.push({ fqn: card.fqn, cnName: card.cnName, owner: card.owner })
    for (const x of [...(card.upstream || []), ...(card.downstream || [])]) {
      if (x?.fqn) rows.push({ fqn: x.fqn, cnName: x.cnName })
    }
  }
  return rows
}

/**
 * @param {object} detail
 * @returns {Array<{ fqn: string, cnName?: string, owner?: string, type?: string }>}
 */
function rowsFromTableDetail(detail) {
  if (!detail?.fqn) return []
  return [
    {
      fqn: detail.fqn,
      cnName: detail.cnName || detail.name,
      owner: detail.owner,
      type: detail.type
    }
  ]
}

function mergeMentionRow(base, next) {
  return {
    fqn: next.fqn || base.fqn,
    cnName: next.cnName || base.cnName || '',
    owner: next.owner || base.owner || '',
    type: next.type || base.type || ''
  }
}

/**
 * 从当前会话消息中收集 @ 提及候选表（顺序：首次出现先后，按 fqn 去重）。
 * @param {Array<{ role?: string, content?: string, cardData?: object, tableDetail?: object }>} messages
 * @param {Array<{ fqn: string, cnName?: string, owner?: string, type?: string }>} enrichCatalog 用于补全仅有 fqn 时的中文名/负责人
 * @returns {Array<{ fqn: string, cnName: string, owner: string, type?: string }>}
 */
export function buildSessionMentionTableList(messages, enrichCatalog = []) {
  const catalogMap = new Map(enrichCatalog.map((t) => [t.fqn, { ...t }]))
  /** @type {Map<string, { fqn: string, cnName: string, owner: string, type?: string }>} */
  const seen = new Map()

  function upsert(partial) {
    const fqn = partial.fqn
    if (!fqn || typeof fqn !== 'string') return
    const fromCat = catalogMap.get(fqn) || {}
    const prev = seen.get(fqn) || { fqn, cnName: '', owner: '' }
    seen.set(fqn, mergeMentionRow(mergeMentionRow(fromCat, prev), partial))
  }

  for (const msg of messages || []) {
    if (msg.content) {
      for (const fqn of extractFqnsFromText(msg.content)) upsert({ fqn })
    }
    if (msg.cardData) {
      for (const row of rowsFromCard(msg.cardData)) upsert(row)
    }
    if (msg.tableDetail) {
      for (const row of rowsFromTableDetail(msg.tableDetail)) upsert(row)
    }
  }

  return [...seen.values()]
}

/** 演示 / 降级用：与个人工作台 mock 可后续接真实「常用」接口 */
export const DEFAULT_FREQUENT_MENTION_TABLES = [
  { fqn: 'dm_trade.dws_order_summary_nd', cnName: '订单汇总表', owner: '张三(zhangsan)', type: 'hive' },
  { fqn: 'dm_trade.dwd_order_detail_di', cnName: '订单明细表', owner: '李四(lisi)', type: 'hive' },
  { fqn: 'default.user_behavior_log', cnName: '用户行为日志表', owner: '王五(wangwu)', type: 'hive' },
  { fqn: 'dm_risk.dws_risk_order_intercept_nd', cnName: '风控拦截订单汇总表', owner: '赵六(zhaoliu)', type: 'mysql' },
  { fqn: 'dm_trade.dim_pay_type', cnName: '支付方式维表', owner: '郑十(zhengshi)', type: 'hive' }
]

/** 「常用」区块最多展示条数（无搜索时） */
export const MENTION_FREQUENT_SECTION_CAP = 6
