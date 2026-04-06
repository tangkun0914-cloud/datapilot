/**
 * 为收藏 FQN 列表补齐展示用元数据（中文名、负责人），供侧栏「我的收藏」使用
 */
import { DEFAULT_FREQUENT_MENTION_TABLES } from '@/utils/agentMentionTables.js'

const MOCK_SEED = [
  ['dm_trade.dws_order_summary_nd', '订单汇总表', '张三(zhangsan)'],
  ['dm_trade.dwd_order_detail_di', '订单明细表', '李四(lisi)'],
  ['dm_trade.dim_order_status', '订单状态维表', '王五(wangwu)'],
  ['dm_risk.dws_risk_order_intercept_nd', '风控拦截订单汇总表', '赵六(zhaoliu)'],
]

function buildLookup() {
  const map = new Map()
  for (const t of DEFAULT_FREQUENT_MENTION_TABLES || []) {
    if (t?.fqn) map.set(t.fqn, { cnName: t.cnName || '—', owner: t.owner || '未分配' })
  }
  for (const [fqn, cn, owner] of MOCK_SEED) {
    if (!map.has(fqn)) map.set(fqn, { cnName: cn, owner: owner || '未分配' })
  }
  return map
}

const LOOKUP = buildLookup()

/**
 * @param {string[]} fqnList
 * @returns {{ fqn: string, cnName: string, owner: string }[]}
 */
export function enrichFavoriteRowsForDisplay(fqnList) {
  const list = Array.isArray(fqnList) ? fqnList : []
  return list.map((fqn) => {
    const meta = LOOKUP.get(fqn) || {
      cnName: '—',
      owner: '未分配',
    }
    return { fqn, cnName: meta.cnName, owner: meta.owner }
  })
}
