<template>
  <div class="h-full flex flex-col overflow-hidden text-slate-800 font-sans bg-[#f8fafc] relative">
    <div class="flex-1 flex overflow-hidden relative">
      
      <div
        v-show="!isSidebarCollapsed"
        class="shrink-0 border-r border-slate-200 flex flex-col z-10 transition-colors duration-300 relative"
        :style="{ width: sidebarWidth + 'px' }"
        :class="agentStore.isDarkMode ? 'bg-[#001529] border-none' : 'bg-white'"
      >
        <MapAgentSidebar
          class="flex-1 min-h-0"
          :is-dark-mode="agentStore.isDarkMode"
          :favorite-fqns="favoriteFqnsList"
          @collapse="isSidebarCollapsed = true"
          @send="handleSidebarSend"
          @newChat="handleNewChat"
          @select-history="handleSelectHistory"
          @toggle-table-favorite="handleToggleTableFavorite"
        />
        <div class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[rgba(108,76,155,0.5)] z-20 transition-colors"
             @mousedown="startDragSidebar"></div>
      </div>

      <!-- 主内容区（仅对话，无右侧面板） -->
      <main class="flex-1 min-w-[400px] flex flex-col relative transition-colors duration-300" :class="agentStore.isDarkMode ? 'bg-[#0f172a]' : 'bg-[url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=\')]'">
        
        <!-- 收起时的悬浮按钮 -->
        <div v-if="isSidebarCollapsed" class="absolute top-4 left-4 z-50 flex flex-row gap-2">
          <a-tooltip placement="bottom" title="展开侧边栏">
            <div class="w-9 h-9 rounded-lg shadow-md border flex items-center justify-center cursor-pointer transition-colors" 
                 :class="agentStore.isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'"
                 @click="isSidebarCollapsed = false">
              <MenuUnfoldOutlined class="text-lg" />
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom" title="新建对话">
            <div class="w-9 h-9 rounded-lg shadow-md border flex items-center justify-center cursor-pointer transition-colors" 
                 :class="agentStore.isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'"
                 @click="handleNewChat">
              <FormOutlined class="text-lg" />
            </div>
          </a-tooltip>
        </div>

        <!-- 欢迎态（复用老 Agent 欢迎页） -->
        <WelcomeScreen
          v-if="!hasMessages"
          @send="handleSend"
          :is-dark-mode="agentStore.isDarkMode"
          :frequent-tables="mapAgentMentionFrequentTables"
        />

        <!-- 对话流态 -->
        <div v-else class="flex-1 flex flex-col h-full relative">
          <MessageList
            ref="messageListRef"
            :messages="messages"
            :is-share-mode="isShareMode"
            :favorite-fqns="favoriteFqnsList"
            @send="handleSend"
            @update:is-share-mode="isShareMode = $event"
            @toggle-table-favorite="handleToggleTableFavorite"
            @regenerate="handleRegenerate"
            :is-dark-mode="agentStore.isDarkMode"
          />
          <InputArea
            v-show="!isShareMode"
            @send="handleSend"
            @stop="handleStop"
            :is-dark-mode="agentStore.isDarkMode"
            :frequent-tables="mapAgentMentionFrequentTables"
            :disabled="isGenerating"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { MenuUnfoldOutlined, FormOutlined } from '@ant-design/icons-vue'
import WelcomeScreen from '@/pages/DataMap/Agent/components/Chat/WelcomeScreen.vue'
import InputArea from '@/pages/DataMap/Agent/components/Chat/InputArea.vue'
import MapAgentSidebar from './components/MapAgentSidebar.vue'
import MessageList from './components/Chat/MessageList.vue'
import { sendMessageStream } from '@/services/DataMap/MapAgent/index.js'
import { useAgentStore } from '@/stores/DataMap/agent.js'
import { stripLeadingAtForFqn } from '@/utils/fqnDisplay.js'
import { extractMentionFqnsFromText } from '@/utils/extractMentionFqns.js'
import {
  MAP_AGENT_FAVORITE_MAX,
  MAP_AGENT_FAVORITE_TABLES_KEY,
  readMapAgentFavoriteFqnList,
  notifyMapAgentFavoritesChanged,
  mapFqnListToWorkspaceFavorites
} from '@/utils/mapAgentFavorites.js'
import { DEFAULT_FREQUENT_MENTION_TABLES } from '@/utils/agentMentionTables.js'

const messages = ref([])
const hasMessages = ref(false)
const currentSessionId = ref('session_2026_' + Date.now())
const agentStore = useAgentStore()
const isSidebarCollapsed = ref(false)
const isShareMode = ref(false)

const favoriteFqnSet = ref(new Set())
const favoriteFqnsList = computed(() => [...favoriteFqnSet.value])

const defaultFrequentByFqn = computed(
  () => new Map(DEFAULT_FREQUENT_MENTION_TABLES.map((t) => [t.fqn, t]))
)

/** 首页与输入框 @ 列表共用：有收藏则按收藏顺序展示（元数据优先命中内置演示表），否则用默认列表 */
const mapAgentMentionFrequentTables = computed(() => {
  const fqns = favoriteFqnsList.value
  if (!fqns.length) return [...DEFAULT_FREQUENT_MENTION_TABLES]
  return fqns.map((fqn) => {
    const fromDef = defaultFrequentByFqn.value.get(fqn)
    if (fromDef) return { ...fromDef }
    const row = mapFqnListToWorkspaceFavorites([fqn])[0]
    return { fqn: row.fqn, cnName: row.cnName, owner: '' }
  })
})

const abortController = ref(null)
const streamingAiMsgId = ref(null)
const messageListRef = ref(null)

const isGenerating = computed(() =>
  messages.value.some((m) => m.role === 'ai' && (m.status === 'loading' || m.status === 'streaming'))
)

function loadFavoriteTables() {
  favoriteFqnSet.value = new Set(readMapAgentFavoriteFqnList())
}

function persistFavoriteTables() {
  try {
    localStorage.setItem(MAP_AGENT_FAVORITE_TABLES_KEY, JSON.stringify([...favoriteFqnSet.value]))
  } catch (_) {
    /* ignore */
  }
  notifyMapAgentFavoritesChanged()
}

const handleToggleTableFavorite = (fqn) => {
  if (!fqn) return
  const next = new Set(favoriteFqnSet.value)
  if (next.has(fqn)) {
    next.delete(fqn)
    antMessage.success('已取消收藏')
  } else {
    if (next.size >= MAP_AGENT_FAVORITE_MAX) {
      antMessage.warning('收藏已满，请先取消部分收藏')
      return
    }
    next.add(fqn)
    antMessage.success('已加入收藏')
  }
  favoriteFqnSet.value = next
  persistFavoriteTables()
}

/** 地图 Agent：侧栏略宽于老 Agent，便于历史标题 / 表名展示；可拖拽右缘调整 */
const MAP_AGENT_SIDEBAR_DEFAULT = 300
const MAP_AGENT_SIDEBAR_MIN = 220
const MAP_AGENT_SIDEBAR_MAX = 480
const sidebarWidth = ref(MAP_AGENT_SIDEBAR_DEFAULT)
const isDraggingSidebar = ref(false)

const startDragSidebar = () => {
  isDraggingSidebar.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleMouseMove = (e) => {
  if (isDraggingSidebar.value) {
    let newWidth = e.clientX
    if (newWidth < MAP_AGENT_SIDEBAR_MIN) newWidth = MAP_AGENT_SIDEBAR_MIN
    if (newWidth > MAP_AGENT_SIDEBAR_MAX) newWidth = MAP_AGENT_SIDEBAR_MAX
    sidebarWidth.value = newWidth
  }
}

const stopDrag = () => {
  isDraggingSidebar.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  loadFavoriteTables()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopDrag)
  abortController.value?.abort()
})

function handleStop() {
  abortController.value?.abort()
  abortController.value = null
  const id = streamingAiMsgId.value
  streamingAiMsgId.value = null
  if (id == null) return
  const aiMsg = messages.value.find((m) => m.id === id)
  if (!aiMsg || aiMsg.role !== 'ai') return
  if (aiMsg.status !== 'loading' && aiMsg.status !== 'streaming') return
  aiMsg.status = 'stopped'
  aiMsg.suggestions = []
  const c = String(aiMsg.content || '')
  if (!c.includes('已停止生成')) {
    aiMsg.content = c + '\n\n*— 已停止生成*'
  }
}

function handleSidebarSend(text) {
  if (isGenerating.value) handleStop()
  handleSend(text)
}

function handleSelectHistory(item) {
  if (isGenerating.value) handleStop()
  antMessage.info(`加载历史对话：${item.title}`)
}

function handleNewChat() {
  if (isGenerating.value) handleStop()
  messages.value = []
  hasMessages.value = false
  currentSessionId.value = 'session_2026_' + Date.now()
  isShareMode.value = false
}

function classifyStreamError(err) {
  if (err?.name === 'AbortError') return { skip: true }
  const status = err?.status ?? err?.response?.status
  if (status === 401) return { type: 'auth' }
  if (status === 503 || status === 502 || status === 504) return { type: 'service' }
  const msg = String(err?.message || '')
  if (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.toLowerCase().includes('network') ||
    err?.code === 'ECONNABORTED'
  ) {
    return { type: 'network' }
  }
  return { type: 'generic' }
}

async function runStreamForUserText(text, aiMsgId) {
  const mentionTables = extractMentionFqnsFromText(text)
  const controller = new AbortController()
  abortController.value = controller
  streamingAiMsgId.value = aiMsgId

  await sendMessageStream({
    sessionId: currentSessionId.value,
    content: text,
    mentionTables,
    signal: controller.signal,
    onTableDetail: (detail) => {
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (!aiMsg || !detail?.fqn) return
      // 对话内不展示表描述；tableDetail 仅绑定 fqn/中文名/负责人（收藏与 @ 候选）
      aiMsg.tableDetail = {
        fqn: stripLeadingAtForFqn(detail.fqn),
        cnName: detail.cnName ?? '',
        owner: detail.owner ?? ''
      }
    },
    onStep: (stepInfo) => {
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (aiMsg) {
        const existingStep = aiMsg.steps.find((s) => s.id === stepInfo.id)
        if (existingStep) {
          existingStep.status = stepInfo.status
          existingStep.text = stepInfo.text
        } else {
          aiMsg.steps.push({ ...stepInfo })
        }
      }
    },
    onMessage: (chunk) => {
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (aiMsg) {
        if (aiMsg.status === 'loading') aiMsg.status = 'streaming'
        aiMsg.content += chunk
      }
    },
    onSuggestions: (suggestions) => {
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (aiMsg) aiMsg.suggestions = suggestions
    },
    onDone: () => {
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (!aiMsg) return
      if (aiMsg.status === 'stopped') return
      if (!String(aiMsg.content || '').trim()) {
        aiMsg.status = 'error'
        aiMsg.content = '抱歉，我暂时无法回答这个问题，请换个方式描述试试'
        return
      }
      aiMsg.status = 'success'
    },
    onError: (err) => {
      const { skip, type } = classifyStreamError(err)
      if (skip) return
      const aiMsg = messages.value.find((m) => m.id === aiMsgId)
      if (!aiMsg) return
      if (aiMsg.status === 'stopped') return
      aiMsg.status = 'error'
      if (type === 'auth') {
        antMessage.error('登录已过期，请重新登录')
        aiMsg.content = ''
        return
      }
      if (type === 'network') {
        aiMsg.content = '**网络异常，回复不完整**'
        return
      }
      if (type === 'service') {
        aiMsg.content = '服务暂时不可用，请稍后重试'
        return
      }
      aiMsg.content = '抱歉，检索失败，请稍后重试。'
    }
  })

  if (streamingAiMsgId.value === aiMsgId) {
    streamingAiMsgId.value = null
    abortController.value = null
  }
}

const handleSend = async (text) => {
  if (!text.trim()) return

  hasMessages.value = true

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text
  })

  const aiMsgId = Date.now() + 1
  messages.value.push({
    id: aiMsgId,
    role: 'ai',
    status: 'loading',
    content: '',
    steps: [],
    suggestions: [],
    tableDetail: null
  })

  await runStreamForUserText(text, aiMsgId)
}

const handleRegenerate = async (aiMsgId) => {
  abortController.value?.abort()
  abortController.value = null
  streamingAiMsgId.value = null

  const idx = messages.value.findIndex((m) => m.id === aiMsgId)
  if (idx < 1) return
  const userMsg = messages.value[idx - 1]
  if (userMsg.role !== 'user' || !userMsg.content) return

  messageListRef.value?.clearMessageActionState?.(aiMsgId)

  const aiMsg = messages.value[idx]
  aiMsg.status = 'loading'
  aiMsg.content = ''
  aiMsg.steps = []
  aiMsg.suggestions = []
  aiMsg.tableDetail = null

  await runStreamForUserText(userMsg.content, aiMsgId)
}
</script>
