import request from '@/services/request.js'

/**
 * 是否使用 Mock 数据
 */
const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 获取历史会话列表
 */
export async function getHistorySessions() {
  if (IS_MOCK) {
    const { mockHistorySessions } = await import('@/mock/DataMap/Agent/history.js')
    return mockHistorySessions()
  }
  return request.get('/api/v1/agent/sessions')
}

/**
 * 获取工作台推荐表列表
 */
export async function getWorkspaceRecommendations() {
  if (IS_MOCK) {
    const { mockWorkspaceRecommendations } = await import('@/mock/DataMap/Agent/workspace.js')
    return mockWorkspaceRecommendations()
  }
  return request.get('/api/v1/agent/recommendations')
}

/**
 * 发送消息并获取 SSE 流式响应
 * 注意：SSE 通常不走普通的 axios request，这里封装一个原生的 EventSource 或 fetch 方案
 * @param {string} sessionId 会话 ID
 * @param {string} content 用户输入内容
 * @param {function} onMessage 接收到消息片段的回调
 * @param {function} onCard 接收到卡片数据的回调
 * @param {function} onDone 结束回调
 * @param {function} onError 错误回调
 */
export async function sendMessageStream({ sessionId, content, onMessage, onCard, onDone, onError }) {
  if (IS_MOCK) {
    const { mockSendMessageStream } = await import('@/mock/DataMap/Agent/chat.js')
    return mockSendMessageStream({ content, onMessage, onCard, onDone })
  }

  // 真实环境的 SSE 实现 (示例)
  try {
    const response = await fetch('/api/v1/agent/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // 假设有 token
      },
      body: JSON.stringify({ sessionId, content })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onDone && onDone()
        break
      }
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr === '[DONE]') continue
          
          try {
            const data = JSON.parse(dataStr)
            if (data.type === 'text') {
              onMessage && onMessage(data.content)
            } else if (data.type === 'card') {
              onCard && onCard(data.cardData)
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }
  } catch (err) {
    onError && onError(err)
  }
}
