import request from '@/services/request.js'

export async function getConversations() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    const { mockConversations } = await import('@/mock/DataMap/ai.js')
    return mockConversations
  }
  return request.get('/v1/copilot/conversations')
}
