/**
 * 标签服务 - 对接 OpenMetadata Tags/Classifications API
 */
import request from './request.js'

export async function getTags(classification) {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { tags } = await import('@/mock/tags.js')
    return tags
  }
  return request.get('/v1/tags', {
    params: { parent: classification },
  })
}

export async function getClassifications() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { classifications } = await import('@/mock/tags.js')
    return classifications
  }
  return request.get('/v1/classifications')
}
