/**
 * 将 getNodeChildren 返回的增量合并进当前拓扑（移除折叠桩并重连入边）
 * 按需 DAG 模式下一般由前端本地 merge；本函数保留给真实接口返回 replaceCollapseId 时使用。
 * @param {object} topology - getImpactTopology 结构
 * @param {object} expandResult - getNodeChildren 响应
 */
export function mergeExpandTopology(topology, expandResult) {
  if (!topology || !expandResult?.replaceCollapseId) return topology

  const collapseId = expandResult.replaceCollapseId
  const parentEdge = topology.edges.find((e) => e.target === collapseId && e.edgeType === 'dependency')
  const parentId = parentEdge?.source

  let nodes = topology.nodes.filter((n) => n.id !== collapseId)
  const existingIds = new Set(nodes.map((n) => n.id))
  for (const n of expandResult.nodes || []) {
    const idx = nodes.findIndex((x) => x.id === n.id)
    if (idx >= 0) {
      nodes[idx] = { ...nodes[idx], ...n }
    } else if (!existingIds.has(n.id)) {
      nodes.push(n)
      existingIds.add(n.id)
    }
  }

  let edges = topology.edges.filter((e) => e.source !== collapseId && e.target !== collapseId)

  const keyOf = (e) => `${e.source}->${e.target}`
  const edgeKeys = new Set(edges.map(keyOf))

  for (const e of expandResult.edges || []) {
    const next = { ...e }
    if (next.source === collapseId && parentId) {
      next.source = parentId
    }
    const k = keyOf(next)
    if (!edgeKeys.has(k)) {
      edges.push(next)
      edgeKeys.add(k)
    }
  }

  if (parentId) {
    const pi = nodes.findIndex((x) => x.id === parentId)
    if (pi >= 0) {
      nodes[pi] = { ...nodes[pi], showCollapseAnchor: true }
    }
  }

  return {
    ...topology,
    nodes,
    edges,
    evalDepthCap: expandResult.evalDepthCap ?? topology.evalDepthCap,
  }
}
