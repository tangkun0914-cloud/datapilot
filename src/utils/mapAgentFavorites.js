/** 与 MapAgent 页、工作台 Mock 共用，保证对话收藏与侧边栏「我的工作台」一致 */
export const MAP_AGENT_FAVORITE_TABLES_KEY = 'datamap_mapAgent_favorite_tables'

/** 收藏变更后通知 Agent 侧栏刷新工作台（同页内 storage 事件不触发，需自定义事件） */
export const MAP_AGENT_FAVORITES_CHANGED_EVENT = 'datamap-mapagent-favorites-changed'

export function readMapAgentFavoriteFqnList() {
  try {
    const raw = localStorage.getItem(MAP_AGENT_FAVORITE_TABLES_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(Boolean) : []
  } catch {
    return []
  }
}

/**
 * 将 FQN 列表转为工作台「收藏的数据表」条目（无中文名元数据时用表名片段占位）
 */
export function mapFqnListToWorkspaceFavorites(fqnList) {
  return fqnList.map((fqn) => {
    const last = fqn.split('.').pop() || fqn
    return {
      id: `map-agent:${fqn}`,
      fqn,
      cnName: last.replace(/_/g, ' '),
      reason: '地图 Agent 对话中收藏'
    }
  })
}

export function notifyMapAgentFavoritesChanged() {
  window.dispatchEvent(new CustomEvent(MAP_AGENT_FAVORITES_CHANGED_EVENT))
}
