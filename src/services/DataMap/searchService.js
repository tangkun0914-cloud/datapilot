import request from '@/services/request.js'

export async function searchAssets(params) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { searchResults } = await import('@/mock/DataMap/assets.js')
    return searchResults
  }
  return request.get('/v1/search/query', {
    params: { ...params, index: 'table_search_index' },
  })
}

export async function getSuggestions(keyword) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { searchSuggestions } = await import('@/mock/DataMap/assets.js')
    return searchSuggestions
  }
  return request.get('/v1/search/suggest', { params: { q: keyword } })
}

export async function getHotRank() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { hotRank } = await import('@/mock/DataMap/assets.js')
    return hotRank
  }
  return request.get('/v1/search/hotRank')
}

export async function getFilterOptions() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { filterOptions } = await import('@/mock/DataMap/filters.js')
    return filterOptions
  }
  return request.get('/v1/search/filters')
}
