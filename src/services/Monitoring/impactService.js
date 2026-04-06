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
 * 获取节点子节点（逐层展开，点击 + 时调用）
 * @param {string} nodeId 当前展开的父节点 ID
 * @param {string} eventId 告警事件 ID
 * @param {object|null} [alertSnapshot] Mock 整包展开时重建根节点与告警行一致
 */
export async function getNodeChildren(nodeId, eventId, alertSnapshot = null) {
  if (useMock()) {
    const { mockExpand } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockExpand(nodeId, 3, alertSnapshot)
  }
  return request.get('/api/monitoring/impact/children', {
    params: { nodeId, eventId },
  })
}

/**
 * 获取核心链路拓扑（仅看核心链路开关开启时调用）
 * @param {string} eventId
 */
export async function getCorePath(eventId) {
  if (useMock()) {
    const { mockCorePath } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockCorePath(eventId)
  }
  return request.get('/api/monitoring/impact/core-path', { params: { eventId } })
}

/**
 * 轮询 AI 分析结果
 * @param {string} eventId
 */
export async function getAiAnalysis(eventId) {
  if (useMock()) {
    const { mockAiAnalysis } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockAiAnalysis(eventId)
  }
  return request.get('/api/monitoring/impact/ai-analysis', { params: { eventId } })
}

/**
 * 获取历史快照数据（resolved/falsePositive 状态下使用）
 * @param {string} eventId
 */
export async function getSnapshot(eventId) {
  if (useMock()) {
    const { mockSnapshot } = await import('@/mock/Monitoring/impactAssessment.js')
    return mockSnapshot(eventId)
  }
  return request.get('/api/monitoring/impact/snapshot', { params: { eventId } })
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
    if (payload.checkOnly) {
      return { alreadyExists: false }
    }
    return { success: true, alreadyExists: false, groupId: 'mock_group_' + Date.now(), groupLink: 'https://work.weixin.qq.com/mock' }
  }
  return request.post('/api/monitoring/impact/create-group', payload)
}
