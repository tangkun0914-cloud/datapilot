import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { INITIAL_SESSIONS, MOCK_CHAT_HISTORY, MOCK_USER_PROFILE, GREETING_RECOMMENDATIONS } from '@/mock/DataMap/ai.js'

export const useCopilotStore = defineStore('copilot', () => {
  const visible = ref(false)
  const pendingQuestion = ref('')
  const viewMode = ref('chat') // 'chat' | 'list'
  const sessions = ref([...INITIAL_SESSIONS])
  const viewingSessionId = ref(null)
  const messages = ref([])

  const activeSession = computed(() =>
    sessions.value.find(s => s.status === 'ACTIVE')
  )

  const currentSessionTitle = computed(() => {
    if (!viewingSessionId.value) return 'DataPilot Copilot'
    const s = sessions.value.find(s => s.id === viewingSessionId.value)
    return s?.title || 'DataPilot Copilot'
  })

  function open(question = '') {
    pendingQuestion.value = question
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function consumeQuestion() {
    const q = pendingQuestion.value
    pendingQuestion.value = ''
    return q
  }

  function switchToChat() {
    viewMode.value = 'chat'
  }

  function toggleViewMode() {
    viewMode.value = viewMode.value === 'chat' ? 'list' : 'chat'
  }

  function selectSession(session) {
    viewingSessionId.value = session.id
    messages.value = MOCK_CHAT_HISTORY[session.id]
      ? [...MOCK_CHAT_HISTORY[session.id]]
      : []
    viewMode.value = 'chat'
  }

  function deleteSession(session) {
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    if (session.status === 'ACTIVE') {
      newChat()
    }
    if (viewingSessionId.value === session.id) {
      const active = sessions.value.find(s => s.status === 'ACTIVE')
      viewingSessionId.value = active ? active.id : null
      messages.value = active && MOCK_CHAT_HISTORY[active.id]
        ? [...MOCK_CHAT_HISTORY[active.id]]
        : []
    }
  }

  function renameSession(id, newTitle) {
    sessions.value = sessions.value.map(s =>
      s.id === id ? { ...s, title: newTitle } : s
    )
  }

  function buildGreetingMessage() {
    const { name, department } = MOCK_USER_PROFILE
    const content = GREETING_RECOMMENDATIONS.content
      .replace('${name}', name)
      .replace('${department}', department)
    return {
      role: 'assistant',
      content,
      tables: GREETING_RECOMMENDATIONS.tables,
      isGreeting: true,
      feedback: null,
      dislikeReasonIds: [],
      dislikeDetail: '',
    }
  }

  function injectGreeting() {
    messages.value = [buildGreetingMessage()]
  }

  let nextId = 300
  function newChat() {
    sessions.value.forEach(s => {
      if (s.status === 'ACTIVE') s.status = 'SUSPENDED'
    })
    const newSession = {
      id: nextId++,
      title: '新对话',
      tags: [],
      module: '数据地图',
      ts: new Date().toISOString(),
      status: 'ACTIVE',
      summary: '新对话...',
    }
    sessions.value.unshift(newSession)
    viewingSessionId.value = newSession.id
    injectGreeting()
    viewMode.value = 'chat'
  }

  return {
    visible,
    pendingQuestion,
    viewMode,
    sessions,
    viewingSessionId,
    messages,
    activeSession,
    currentSessionTitle,
    open,
    close,
    consumeQuestion,
    switchToChat,
    toggleViewMode,
    selectSession,
    deleteSession,
    renameSession,
    newChat,
    injectGreeting,
  }
})
