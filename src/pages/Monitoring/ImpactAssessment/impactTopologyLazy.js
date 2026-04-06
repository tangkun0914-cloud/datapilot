/**
 * 影响评估 DAG：按需逐层展开 / 整枝收起（仅操作当前可见 nodes/edges）
 */

/**
 * 从 parentId 出发沿当前 edges 做 BFS，收集所有可达节点（不含 parentId）
 * @param {string} parentId
 * @param {object[]} edges
 * @returns {Set<string>}
 */
export function collectDescendantIds(parentId, edges) {
  const adj = new Map()
  for (const e of edges || []) {
    if (e.edgeType === 'penetrate') continue
    if (!adj.has(e.source)) adj.set(e.source, [])
    adj.get(e.source).push(e.target)
  }
  const out = new Set()
  const queue = [...(adj.get(parentId) || [])]
  while (queue.length) {
    const id = queue.shift()
    if (out.has(id)) continue
    out.add(id)
    for (const t of adj.get(id) || []) {
      if (!out.has(t)) queue.push(t)
    }
  }
  return out
}

/**
 * 收起 parent 的整条下游子图（保留 parent 自身）
 * @param {object} topology
 * @param {string} parentId
 */
export function collapseDescendantsBranch(topology, parentId) {
  if (!topology?.nodes?.length) return topology
  const desc = collectDescendantIds(parentId, topology.edges || [])
  if (desc.size === 0) return topology

  const nodes = topology.nodes.filter((n) => !desc.has(n.id))
  const edges = (topology.edges || []).filter((e) => !desc.has(e.source) && !desc.has(e.target))

  return {
    ...topology,
    nodes,
    edges,
  }
}
