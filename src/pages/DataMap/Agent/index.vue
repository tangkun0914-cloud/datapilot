<template>
  <div class="h-full flex flex-col overflow-hidden text-slate-800 font-sans bg-[#f8fafc] relative">
    <!-- 主容器 -->
    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- Agent 专属左侧边栏 (可收起) -->
      <div v-show="!isSidebarCollapsed" 
           class="shrink-0 border-r border-slate-200 flex flex-col z-10 transition-colors duration-300 relative" 
           :style="{ width: sidebarWidth + 'px' }"
           :class="agentStore.isDarkMode ? 'bg-[#001529] border-none' : 'bg-white'">
        <AgentSidebar class="flex-1" :is-dark-mode="agentStore.isDarkMode" @collapse="isSidebarCollapsed = true" @send="handleSend" @newChat="handleNewChat" />
        <!-- 侧边栏拖拽把手 -->
        <div class="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[rgba(108,76,155,0.5)] z-20 transition-colors"
             @mousedown="startDragSidebar"></div>
      </div>

      <!-- 主内容区（对话 + 详情面板） -->
      <div class="flex-1 flex overflow-hidden relative">
        
        <!-- 对话区 -->
        <main class="flex-1 min-w-[400px] flex flex-col relative transition-colors duration-300" :class="agentStore.isDarkMode ? 'bg-[#0f172a]' : 'bg-[url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=\')]'">
          
          <!-- Agent 页面收起时的悬浮快捷操作 -->
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

          <!-- 欢迎态 -->
          <WelcomeScreen v-if="!hasMessages" @send="handleSend" :is-dark-mode="agentStore.isDarkMode" />

          <!-- 对话流态 -->
          <div v-else class="flex-1 flex flex-col h-full relative">
            <MessageList 
              :messages="messages" 
              :is-share-mode="isShareMode"
              @send="handleSend" 
              @view-detail="handleViewDetail" 
              @update:is-share-mode="isShareMode = $event"
              :is-dark-mode="agentStore.isDarkMode" 
            />
            <InputArea
              v-show="!isShareMode"
              @send="handleSend"
              :is-dark-mode="agentStore.isDarkMode"
            />
          </div>
        </main>

        <!-- 右侧详情面板 -->
        <transition name="slide-right">
          <div v-if="activeDetailData" 
               class="shrink-0 border-l overflow-hidden transition-colors duration-300 relative"
               :style="{ width: detailPanelWidth + 'px' }"
               :class="agentStore.isDarkMode ? 'border-slate-700' : 'border-[#e5e7eb]'">
            <!-- 详情面板拖拽把手 -->
            <div class="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[rgba(108,76,155,0.5)] z-20 transition-colors"
                 @mousedown="startDragDetail"></div>
            <TableDetailPanel 
              :data="activeDetailData" 
              :is-dark-mode="agentStore.isDarkMode"
              @close="activeDetailData = null" 
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MenuUnfoldOutlined, FormOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import WelcomeScreen from './components/Chat/WelcomeScreen.vue'
import MessageList from './components/Chat/MessageList.vue'
import InputArea from './components/Chat/InputArea.vue'
import AgentSidebar from './components/Sidebar/index.vue'
import TableDetailPanel from './components/Detail/TableDetailPanel.vue'
import { sendMessageStream } from '@/services/DataMap/Agent/index.js'
import { useAgentStore } from '@/stores/DataMap/agent.js'
const messages = ref([])
const hasMessages = ref(false)
const currentSessionId = ref('session_2026_' + Date.now())
const agentStore = useAgentStore()
const isSidebarCollapsed = ref(false)
const activeDetailData = ref(null)
const isShareMode = ref(false)

// 拖拽宽度控制
const sidebarWidth = ref(280)
const detailPanelWidth = ref(600) // 默认宽度

// 拖拽状态
const isDraggingSidebar = ref(false)
const isDraggingDetail = ref(false)

// 开始拖拽侧边栏
const startDragSidebar = (e) => {
  isDraggingSidebar.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none' // 防止拖拽时选中文本
}

// 开始拖拽详情面板
const startDragDetail = (e) => {
  isDraggingDetail.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 拖拽中
const handleMouseMove = (e) => {
  if (isDraggingSidebar.value) {
    // 限制侧边栏宽度范围：200px - 400px
    let newWidth = e.clientX
    if (newWidth < 200) newWidth = 200
    if (newWidth > 400) newWidth = 400
    sidebarWidth.value = newWidth
  }
  
  if (isDraggingDetail.value) {
    // 限制详情面板宽度范围：400px - 800px，且保证中间对话区至少 400px
    const windowWidth = window.innerWidth
    const currentSidebarWidth = isSidebarCollapsed.value ? 0 : sidebarWidth.value
    // 计算从右侧边缘到鼠标的距离
    let newWidth = windowWidth - e.clientX
    
    // 最小宽度
    if (newWidth < 400) newWidth = 400
    // 最大宽度
    if (newWidth > 800) newWidth = 800
    // 保证对话区最小宽度
    if (windowWidth - currentSidebarWidth - newWidth < 400) {
      newWidth = windowWidth - currentSidebarWidth - 400
    }
    
    detailPanelWidth.value = newWidth
  }
}

// 结束拖拽
const stopDrag = () => {
  isDraggingSidebar.value = false
  isDraggingDetail.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopDrag)
})

const handleNewChat = () => {
  // 清空当前对话消息，回到欢迎页状态
  messages.value = []
  hasMessages.value = false
  // 生成一个新的会话ID
  currentSessionId.value = 'session_2026_' + Date.now()
  // 如果详情面板开着，也关掉
  activeDetailData.value = null
  // 如果在分享模式，也关掉
  isShareMode.value = false
}

const handleViewDetail = (cardData) => {
  activeDetailData.value = cardData
  // 如果卡片传了 defaultTab，则给 activeDetailData 加上，TableDetailPanel 内部会响应
  if (cardData.defaultTab) {
    activeDetailData.value.defaultTab = cardData.defaultTab
  } else {
    activeDetailData.value.defaultTab = 'fields' // 默认回退到字段详情
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
    status: 'loading', // loading (思考中) -> streaming (打字中) -> success (完成)
    content: '',
    steps: [] // 记录思考步骤
  })
  
  await sendMessageStream({
    sessionId: currentSessionId.value,
    content: text,
    onStep: (stepInfo) => {
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        const existingStep = aiMsg.steps.find(s => s.id === stepInfo.id)
        if (existingStep) {
          existingStep.status = stepInfo.status
        } else {
          aiMsg.steps.push(stepInfo)
        }
      }
    },
    onMessage: (chunk) => {
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        if (aiMsg.status === 'loading') {
          aiMsg.status = 'streaming'
        }
        aiMsg.content += chunk // 增量拼接
      }
    },
    onCard: (cardData) => {
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        aiMsg.cardData = cardData
      }
    },
    onDone: () => {
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        aiMsg.status = 'success'
      }
    },
    onError: (err) => {
      console.error(err)
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        aiMsg.status = 'error'
        aiMsg.content = '抱歉，检索失败，请稍后重试。'
      }
    }
  })
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
