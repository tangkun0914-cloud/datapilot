/**
 * 业务域服务 - 对接 OpenMetadata Domains API
 */
import request from './request.js'

export async function getDomains() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { domains } = await import('@/mock/domains.js')
    return domains
  }
  return request.get('/v1/domains')
}
