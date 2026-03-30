<template>
  <div class="h-full flex flex-col overflow-hidden text-slate-800 font-sans bg-[#f8fafc] relative">
    <!-- 主容器 -->
    <div class="flex-1 flex overflow-hidden relative">
      
      <!-- Agent 专属左侧边栏 (可收起) -->
      <div v-show="!isSidebarCollapsed" class="w-[280px] shrink-0 border-r border-slate-200 flex flex-col z-10 transition-all duration-300" :class="agentStore.isDarkMode ? 'bg-[#001529] border-none' : 'bg-white'">
        <AgentSidebar class="flex-1" :is-dark-mode="agentStore.isDarkMode" @collapse="isSidebarCollapsed = true" />
      </div>

      <!-- 主对话区 -->
      <main class="flex-1 flex flex-col relative transition-colors duration-300" :class="agentStore.isDarkMode ? 'bg-[#0f172a]' : 'bg-[url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=\')]'">
        
        <!-- Agent 页面收起时的悬浮快捷操作 (从 AppLayout 移入) -->
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
          <!-- 消息列表 -->
          <MessageList :messages="messages" @send="handleSend" :is-dark-mode="agentStore.isDarkMode" />

          <!-- 底部输入区 -->
          <InputArea @send="handleSend" :is-dark-mode="agentStore.isDarkMode" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MenuUnfoldOutlined, FormOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import WelcomeScreen from './components/Chat/WelcomeScreen.vue'
import MessageList from './components/Chat/MessageList.vue'
import InputArea from './components/Chat/InputArea.vue'
import AgentSidebar from './components/Sidebar/index.vue'
import { sendMessageStream } from '@/services/DataMap/Agent/index.js'
import { useAgentStore } from '@/stores/DataMap/agent.js'

// 状态
const messages = ref([])
const hasMessages = ref(false)
const currentSessionId = ref('session_2026_' + Date.now())
const agentStore = useAgentStore() // 使用全局 store 里的暗色状态
const isSidebarCollapsed = ref(false) // 控制专属侧边栏的收起/展开

const handleNewChat = () => {
  message.info('新建分析对话')
}

// 发送消息处理
const handleSend = async (text) => {
  if (!text.trim()) return
  
  hasMessages.value = true
  
  // 1. 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text
  })
  
  // 2. 准备 AI 消息占位
  const aiMsgId = Date.now() + 1
  messages.value.push({
    id: aiMsgId,
    role: 'ai',
    status: 'loading',
    content: '正在检索数据资产...'
  })
  
  // 3. 调用流式接口
  await sendMessageStream({
    sessionId: currentSessionId.value,
    content: text,
    onMessage: (chunk) => {
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        if (aiMsg.status === 'loading') {
          aiMsg.status = 'success'
          aiMsg.content = chunk
        } else {
          aiMsg.content = chunk // 假设 mock 返回的是全量累加文本
        }
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
      if (aiMsg && aiMsg.status === 'loading') {
        aiMsg.status = 'success'
        aiMsg.content = '检索完成。'
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
/* 引入 font-awesome (仅作演示，实际工程应使用 @ant-design/icons-vue 或项目内置图标) */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
