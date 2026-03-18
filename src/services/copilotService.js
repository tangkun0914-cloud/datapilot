import request from './request.js'

export async function getConversations() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { mockConversations } = await import('@/mock/ai.js')
    return mockConversations
  }
  return request.get('/v1/copilot/conversations')
}
