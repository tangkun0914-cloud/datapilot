import request from './request.js'

export async function getTables(params) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { searchResults } = await import('@/mock/assets.js')
    return searchResults.hits.hits.map(h => h._source)
  }
  return request.get('/v1/tables', { params })
}

export async function getTableByFqn(fqn) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { tableDetail } = await import('@/mock/detail.js')
    return tableDetail
  }
  return request.get(`/v1/tables/name/${encodeURIComponent(fqn)}`, {
    params: { fields: 'owners,tags,usageSummary,domain,profile' },
  })
}

export async function getTableSampleData(id) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { sampleData } = await import('@/mock/detail.js')
    return sampleData
  }
  return request.get(`/v1/tables/${id}/sampleData`)
}

export async function getTableColumnProfile(id) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { columnProfiles } = await import('@/mock/detail.js')
    return columnProfiles
  }
  return request.get(`/v1/tables/${id}/columnProfile`)
}

export async function getTableVersions(id) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { changeHistory } = await import('@/mock/detail.js')
    return changeHistory
  }
  return request.get(`/v1/tables/${id}/versions`)
}

export async function getTableVersion(id, version) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { changeHistory } = await import('@/mock/detail.js')
    return changeHistory.find(c => c.id === version) || changeHistory[0]
  }
  return request.get(`/v1/tables/${id}/versions/${version}`)
}

export async function toggleFollow(id) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    return { message: 'followers updated' }
  }
  return request.put(`/v1/tables/${id}/followers`)
}

export async function getProductionInfo(id) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { productionInfo } = await import('@/mock/detail.js')
    return productionInfo
  }
  return request.get(`/v1/tables/${id}/productionInfo`)
}

export async function getRecentViewed() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { recentViewed } = await import('@/mock/assets.js')
    return recentViewed
  }
  return request.get('/v1/feed/recentlyViewed', { params: { entityType: 'table' } })
}

export async function getFavorites() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { favorites } = await import('@/mock/assets.js')
    return favorites
  }
  return request.get('/v1/feed/favorites', { params: { entityType: 'table' } })
}

export async function transferTables(tableIds, targetOwnerId, reason) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    await new Promise(r => setTimeout(r, 800))
    return { success: true, message: `已成功转交 ${tableIds.length} 张表` }
  }
  return request.post('/v1/tables/transfer', { tableIds, targetOwnerId, reason })
}
