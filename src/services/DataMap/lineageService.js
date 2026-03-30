import request from '@/services/request.js'

// 数据源类型配置 - 颜色与标签
export const SOURCE_TYPE_CONFIG = {
  mysql: { color: '#52c41a', lightColor: '#f6ffed', label: 'MYSQL' },
  hive: { color: '#1677ff', lightColor: '#e6f7ff', label: 'HIVE' },
  starrocks: { color: '#722ed1', lightColor: '#f9f0ff', label: 'STARROCKS' },
  analysis: { color: '#fa8c16', lightColor: '#fff7e6', label: '分析节点' },
  tableau: { color: '#eb2f96', lightColor: '#fff0f6', label: 'TABLEAU' },
}

export async function getLineageByFqn(fqn, depth = 3) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { lineageData } = await import('@/mock/DataMap/lineage.js')
    return lineageData
  }
  return request.get(`/v1/lineage/table/name/${encodeURIComponent(fqn)}`, {
    params: { upstreamDepth: depth, downstreamDepth: depth },
  })
}

export async function getColumnLineageNeighbors(entityId, colName, direction) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { mockFetchColumnNeighbors } = await import('@/mock/DataMap/lineage.js')
    return mockFetchColumnNeighbors(entityId, colName, direction)
  }
  return request.get(`/v1/lineage/column/neighbors`, {
    params: { entityId, columnName: colName, direction },
  })
}

export async function getLineageNeighbors(nodeId, direction) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { mockFetchNeighbors } = await import('@/mock/DataMap/lineage.js')
    return mockFetchNeighbors(nodeId, direction)
  }
  return request.get(`/v1/lineage/neighbors/${encodeURIComponent(nodeId)}`, {
    params: { direction },
  })
}
