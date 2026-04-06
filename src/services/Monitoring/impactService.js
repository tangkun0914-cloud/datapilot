/**
 * 监控运维 - 影响评估 API（Mock / 真实双路径）
 */
import request from '../request.js'

function useMock() {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

/**
 * @param {string} eventId
 * @param {{ depth?: number, coreOnly?: boolean }} [params]
 * @param {object|null} [alertSnapshot] Mock 下与列表行一致的告警对象，保证拓扑根节点与标题区字段同源
 */
export async function getImpactTopology(eventId, params = {}, alertSnapshot = null) {
  if (useMock()) {
    const { mockTopology } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockTopology(eventId, params, alertSnapshot)
  }
  return request.get('/api/monitoring/impact/topology', {
    params: {
      eventId,
      depth: params.depth ?? 3,
      coreOnly: params.coreOnly ?? false,
    },
  })
}

/**
 * @param {string} eventId
 * @param {object|null} [alertSnapshot] Mock 下与列表行一致的告警对象
 */
export async function getImpactSummary(eventId, alertSnapshot = null) {
  if (useMock()) {
    const { mockSummary } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockSummary(eventId, alertSnapshot)
  }
  return request.get('/api/monitoring/impact/summary', { params: { eventId } })
}

/**
 * @param {string} collapseNodeId
 * @param {number} [depth]
 * @param {object|null} [alertSnapshot] Mock 整包展开时重建根节点与告警行一致
 */
export async function expandCollapseNode(collapseNodeId, depth = 3, alertSnapshot = null) {
  if (useMock()) {
    const { mockExpand } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockExpand(collapseNodeId, depth, alertSnapshot)
  }
  return request.get('/api/monitoring/impact/expand', {
    params: { collapseNodeId, depth },
  })
}

/**
 * @param {{
 *   eventId: string,
 *   groupName: string,
 *   members: string[],
 *   reportSnapshot?: object
 * }} payload
 */
export async function createWarRoom(payload) {
  if (useMock()) {
    return { success: true, groupId: 'mock_group_' + Date.now() }
  }
  return request.post('/api/monitoring/impact/create-group', payload)
}
