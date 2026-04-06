import { getHistorySessions, getWorkspaceData, deleteAgentSession } from '@/services/DataMap/Agent/index.js'

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export { getHistorySessions, getWorkspaceData, deleteAgentSession }

/**
 * 发送消息并获取流式响应（千问风格：纯 Markdown 文本流）
 * @param {object} params
 * @param {AbortSignal} [params.signal]
 * @param {string[]} [params.mentionTables]
 */
export async function sendMessageStream({
  sessionId,
  content,
  mentionTables = [],
  signal,
  onStep,
  onMessage,
  onSuggestions,
  onTableDetail,
  onTableListState,
  onDone,
  onError
}) {
  if (IS_MOCK) {
    const { mockSendMessageStream } = await import('@/mock/DataMap/MapAgent/chat.js')
    try {
      await mockSendMessageStream({
        content,
        abortSignal: signal,
        onStep,
        onMessage,
        onSuggestions,
        onTableDetail,
        onDone
      })
    } catch (e) {
      if (e?.name === 'AbortError' || signal?.aborted) return
      onError && onError(e)
    }
    return
  }

  try {
    const response = await fetch('/api/v1/agent/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ sessionId, content, mentionTables }),
      signal
    })

    if (response.status === 401) {
      const err = new Error('Unauthorized')
      err.status = 401
      throw err
    }

    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`)
      err.status = response.status
      throw err
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      if (signal?.aborted) return
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
            } else if (data.type === 'step') {
              onStep && onStep(data.step)
            } else if (data.type === 'suggestions') {
              onSuggestions && onSuggestions(data.suggestions)
            } else if (data.type === 'tableDetail') {
              onTableDetail && onTableDetail(data.tableDetail)
            } else if (data.type === 'tableListState') {
              onTableListState && onTableListState(data.tableListState)
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError' || signal?.aborted) return
    onError && onError(err)
  }
}
