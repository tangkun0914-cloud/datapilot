/**
 * 术语表服务 - 对接 OpenMetadata GlossaryTerms API
 */
import request from './request.js'

export async function getGlossaryTerms(glossary) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { glossaryTerms } = await import('@/mock/glossary.js')
    return glossaryTerms
  }
  return request.get('/v1/glossaryTerms', {
    params: { glossary },
  })
}
