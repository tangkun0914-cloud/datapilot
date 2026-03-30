<template>
  <div class="flex-1 overflow-y-auto px-6 pt-16 pb-36 flex flex-col gap-6 scroll-smooth custom-scrollbar transition-colors duration-300" :class="isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fafafa]'" ref="listRef">
    <div 
      v-for="msg in messages" 
      :key="msg.id" 
      class="message flex gap-3 w-full group"
      :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
    >
      <!-- 头像 -->
      <div v-if="msg.role === 'ai'" class="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-1">
        <CopilotAiAvatar />
      </div>
      
      <!-- 消息内容区 -->
      <div class="flex flex-col gap-2 w-full" :class="msg.role === 'user' ? 'max-w-[80%] items-end' : 'max-w-[85%] items-start'">
        
        <!-- 文本气泡 -->
        <div 
          v-if="msg.content || msg.status === 'loading'"
          class="px-3.5 py-2.5 text-[13px] leading-[1.6] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors duration-300"
          :class="[
            msg.role === 'user' 
              ? 'bg-[rgba(108,76,155,1)] text-white rounded-[14px] rounded-tr-sm border-none' 
              : (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-[14px] rounded-tl-sm' : 'bg-white border border-[#eef0f2] text-[#333] rounded-[14px] rounded-tl-sm')
          ]"
        >
          <template v-if="msg.status === 'loading'">
            <span class="typing-dots"><span /><span /><span /></span>
          </template>
          <template v-else>
            {{ msg.content }}
          </template>
        </div>

        <!-- 卡片内容 (根据类型渲染不同的卡片组件) -->
        <template v-if="msg.cardData">
          <TableCard v-if="msg.cardData.type === 'table'" :data="msg.cardData" :is-dark-mode="isDarkMode" @send="$emit('send', $event)" />
          <TableListCard v-else-if="msg.cardData.type === 'table_list'" :data="msg.cardData" :is-dark-mode="isDarkMode" @view="$emit('send', `查看 ${$event} 表的详细信息`)" @send="$emit('send', $event)" />
        </template>
        
        <!-- AI 消息底部操作栏 -->
        <div v-if="msg.role === 'ai' && msg.status !== 'loading'" class="flex items-center gap-2 mt-1 px-1 transition-opacity duration-300">
          <a-tooltip title="有帮助">
            <div class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
                 :class="[
                   actionStates[msg.id]?.like 
                     ? (isDarkMode ? 'text-teal-400 bg-teal-400/10' : 'text-teal-500 bg-teal-50') 
                     : (isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]')
                 ]"
                 @click="handleAction('like', msg.id)">
              <LikeFilled v-if="actionStates[msg.id]?.like" class="text-[13px]" />
              <LikeOutlined v-else class="text-[13px]" />
            </div>
          </a-tooltip>
          <a-tooltip title="没帮助">
            <div class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
                 :class="[
                   actionStates[msg.id]?.dislike 
                     ? (isDarkMode ? 'text-orange-400 bg-orange-400/10' : 'text-orange-500 bg-orange-50') 
                     : (isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]')
                 ]"
                 @click="handleAction('dislike', msg.id)">
              <DislikeFilled v-if="actionStates[msg.id]?.dislike" class="text-[13px]" />
              <DislikeOutlined v-else class="text-[13px]" />
            </div>
          </a-tooltip>
          <a-tooltip title="分享">
            <div class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
                 :class="isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]'"
                 @click="handleAction('share', msg.id)">
              <ShareAltOutlined class="text-[13px]" />
            </div>
          </a-tooltip>
        </div>
        
      </div>
    </div>

    <!-- 踩反馈弹窗 -->
    <a-modal
      v-model:open="feedbackModalVisible"
      title="请提供您的反馈"
      :footer="null"
      :width="400"
      :class="isDarkMode ? 'dark-modal' : ''"
      destroyOnClose
    >
      <DislikeFeedbackCard :is-dark-mode="isDarkMode" @submit="handleFeedbackSubmit" @cancel="feedbackModalVisible = false" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, h } from 'vue'
import { LikeOutlined, LikeFilled, DislikeOutlined, DislikeFilled, ShareAltOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message as antMessage } from 'ant-design-vue'
import CopilotAiAvatar from '@/components/Copilot/CopilotAiAvatar.vue'
import TableCard from '../Cards/TableCard.vue'
import TableListCard from '../Cards/TableListCard.vue'
import DislikeFeedbackCard from './DislikeFeedbackCard.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['send'])

const listRef = ref(null)

// 记录消息的操作状态
const actionStates = ref({})

// 控制踩反馈弹窗
const feedbackModalVisible = ref(false)
const currentFeedbackMsgId = ref(null)

const handleAction = (action, msgId) => {
  if (!actionStates.value[msgId]) {
    actionStates.value[msgId] = {}
  }

  if (action === 'like') {
    if (actionStates.value[msgId].like) return // 已经点赞过
    actionStates.value[msgId].like = true
    actionStates.value[msgId].dislike = false
    
    antMessage.open({
      content: () => h('div', { class: 'flex items-center gap-2 px-1' }, [
        h(CheckCircleOutlined, { style: { color: '#14b8a6', fontSize: '16px' } }),
        h('span', { style: { fontWeight: '500', color: '#1e293b' } }, '感谢您的支持')
      ]),
      duration: 2,
      class: 'custom-like-message'
    })
  } else if (action === 'dislike') {
    if (actionStates.value[msgId].dislike) return
    currentFeedbackMsgId.value = msgId
    feedbackModalVisible.value = true
  } else if (action === 'share') {
    antMessage.success('分享链接已复制到剪贴板')
  }
}

const handleFeedbackSubmit = (feedbackData) => {
  const msgId = currentFeedbackMsgId.value
  if (msgId && actionStates.value[msgId]) {
    actionStates.value[msgId].dislike = true
    actionStates.value[msgId].like = false
    // 实际项目中这里可以把 feedbackData 提交给后端
    console.log('提交反馈:', msgId, feedbackData)
    antMessage.success('感谢您的反馈，我们会继续改进')
  }
  feedbackModalVisible.value = false
}


// 自动滚动到底部
watch(() => props.messages, () => {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<style>
/* 全局覆盖 Ant Design Message 样式以实现自定义点赞提示 */
.custom-like-message .ant-message-notice-content {
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  background: #ffffff;
}
.dark .custom-like-message .ant-message-notice-content {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.dark .custom-like-message span {
  color: #f1f5f9 !important;
}

/* 暗黑模式下的 Modal 样式覆盖 */
.dark-modal .ant-modal-content {
  background-color: #1e293b !important;
  border: 1px solid #334155;
}
.dark-modal .ant-modal-header {
  background-color: #1e293b !important;
  border-bottom: 1px solid #334155;
}
.dark-modal .ant-modal-title {
  color: #f1f5f9 !important;
}
.dark-modal .ant-modal-close {
  color: #94a3b8 !important;
}
.dark-modal .ant-modal-close:hover {
  color: #f1f5f9 !important;
  background-color: rgba(255,255,255,0.1) !important;
}
</style>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 打字指示 */
.typing-dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #b0b0b0;
  border-radius: 50%;
  animation: typingBounce 1.2s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
</style>
