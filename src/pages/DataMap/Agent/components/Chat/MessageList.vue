<template>
  <div class="flex-1 overflow-y-auto px-6 pt-10 flex flex-col gap-6 scroll-smooth custom-scrollbar transition-colors duration-300 relative" 
       :class="[
         isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fafafa]',
         isShareMode ? 'pb-6' : 'pb-36'
       ]" 
       ref="listRef">
    <div 
      v-for="group in messageGroups" 
      :key="group.id"
      class="relative transition-colors duration-300 rounded-2xl"
      :class="isShareMode ? (isDarkMode ? 'bg-slate-800/50 p-4' : 'bg-gray-100/70 p-4') : ''"
    >
      <!-- 分享模式下的勾选框 (代表这一组问答) -->
      <transition name="fade">
        <div v-if="isShareMode" 
             class="absolute left-4 top-4 z-10 flex items-center justify-center">
          <a-checkbox 
            :checked="selectedShareGroups.includes(group.id)"
            @change="toggleShareGroup(group.id)"
            class="custom-checkbox scale-110"
          />
        </div>
      </transition>

      <div class="flex flex-col gap-6" :class="isShareMode ? 'pl-8' : ''">
        <div 
          v-for="(msg, index) in group.messages" 
          :key="msg.id" 
          class="message flex gap-3 w-full group relative transition-all duration-300"
          :class="[
            msg.role === 'user' ? 'flex-row-reverse' : ''
          ]"
        >
          <!-- 头像 -->
      <div v-if="msg.role === 'ai'" class="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-1">
        <CopilotAiAvatar />
      </div>
      
      <!-- 消息内容区 -->
      <div class="flex flex-col gap-2 w-full" :class="msg.role === 'user' ? 'max-w-[80%] items-end' : 'max-w-[85%] items-start'">
        
        <!-- Agent 思考过程 (Steps) -->
        <div v-if="msg.role === 'ai' && msg.steps && msg.steps.length > 0" class="flex flex-col gap-1.5 mb-1 ml-1 mt-1">
          <div v-for="step in msg.steps" :key="step.id" class="flex items-center gap-2 text-[12px] transition-colors" :class="isDarkMode ? 'text-slate-400' : 'text-[#64748b]'">
            <LoadingOutlined v-if="step.status === 'running'" class="text-[rgba(108,76,155,1)]" />
            <CheckCircleOutlined v-else class="text-emerald-500" />
            <span :class="step.status === 'running' ? (isDarkMode ? 'text-slate-300' : 'text-[#334155]') : ''">{{ step.text }}</span>
          </div>
        </div>

        <!-- 文本气泡 (仅当有内容或处于纯loading态时渲染) -->
        <div 
          v-if="msg.content || (msg.status === 'loading' && (!msg.steps || msg.steps.length === 0))"
          class="px-3.5 py-2.5 text-[13px] leading-[1.6] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors duration-300"
          :class="[
            msg.role === 'user' 
              ? 'bg-[rgba(108,76,155,1)] text-white rounded-[14px] rounded-tr-sm border-none' 
              : (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-[14px] rounded-tl-sm' : 'bg-white border border-[#eef0f2] text-[#333] rounded-[14px] rounded-tl-sm')
          ]"
        >
          <template v-if="msg.status === 'loading' && (!msg.steps || msg.steps.length === 0)">
            <span class="typing-dots"><span /><span /><span /></span>
          </template>
          <template v-else>
            {{ msg.content }}
            <span v-if="msg.status === 'streaming'" class="inline-block w-1.5 h-3.5 ml-1 align-middle bg-[rgba(108,76,155,1)] animate-pulse"></span>
          </template>
        </div>

        <!-- 卡片内容 (根据类型渲染不同的卡片组件) -->
        <template v-if="msg.cardData">
          <TableCard v-if="msg.cardData.type === 'table'" :data="msg.cardData" :is-dark-mode="isDarkMode" @send="$emit('send', $event)" @view-detail="$emit('viewDetail', $event)" />
          <TableListCard v-else-if="msg.cardData.type === 'table_list'" :data="msg.cardData" :is-dark-mode="isDarkMode" @view="handleViewFromList" @send="$emit('send', $event)" />
          <LineageCard v-else-if="msg.cardData.type === 'lineage_card'" :data="msg.cardData" :is-dark-mode="isDarkMode" @send="$emit('send', $event)" @view-detail="$emit('viewDetail', $event)" />
        </template>
        
        <!-- AI 消息底部操作栏 -->
        <div v-if="msg.role === 'ai' && msg.status !== 'loading' && !isShareMode" class="flex items-center gap-2 mt-1 px-1 transition-opacity duration-300">
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
                 :class="isDarkMode
                   ? 'text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)] hover:text-[rgba(198,170,235,1)]'
                   : 'text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.1)] hover:text-[rgba(88,56,135,1)]'"
                 @click="handleAction('share', msg.id)">
              <ShareAltOutlined class="text-[13px]" />
            </div>
          </a-tooltip>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- 底部悬浮分享操作栏 -->
    <ShareActionBar 
      :visible="isShareMode"
      :is-dark-mode="isDarkMode"
      :is-all-selected="isAllSelected"
      :is-indeterminate="isIndeterminate"
      :selected-count="selectedShareGroups.length"
      @toggle-all="toggleSelectAllGroups"
      @cancel="cancelShareMode"
      @open-modal="openShareConfigModal"
    />

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

    <!-- 分享配置弹窗 -->
    <ShareConfigModal
      v-model:open="shareModalVisible"
      :is-dark-mode="isDarkMode"
      :selected-count="selectedShareGroups.length"
      @confirm="handleShareConfirm"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, h, computed } from 'vue'
import { LikeOutlined, LikeFilled, DislikeOutlined, DislikeFilled, ShareAltOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message as antMessage } from 'ant-design-vue'
import CopilotAiAvatar from '@/components/Copilot/CopilotAiAvatar.vue'
import PilotLogo from '@/components/Copilot/PilotLogo.vue'
import TableCard from '../Cards/TableCard.vue'
import TableListCard from '../Cards/TableListCard.vue'
import LineageCard from '../Cards/LineageCard.vue'
import DislikeFeedbackCard from './DislikeFeedbackCard.vue'
import ShareActionBar from './ShareActionBar.vue'
import ShareConfigModal from './ShareConfigModal.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  isShareMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'viewDetail', 'update:isShareMode'])

const listRef = ref(null)

// 记录消息的操作状态
const actionStates = ref({})

// 控制踩反馈弹窗
const feedbackModalVisible = ref(false)
const currentFeedbackMsgId = ref(null)

// 控制分享弹窗
const shareModalVisible = ref(false)
const shareExpire = ref('7days')
const selectedShareGroups = ref([]) // 存储被选中的分组 ID

// 将消息分组为一问一答 (User + AI)
const messageGroups = computed(() => {
  const groups = []
  let currentGroup = []
  for (const msg of props.messages) {
    if (msg.role === 'user') {
      if (currentGroup.length > 0) {
        groups.push({
          id: currentGroup.find(m => m.role === 'ai')?.id || currentGroup[0].id,
          messages: currentGroup
        })
      }
      currentGroup = [msg]
    } else {
      currentGroup.push(msg)
    }
  }
  if (currentGroup.length > 0) {
    groups.push({
      id: currentGroup.find(m => m.role === 'ai')?.id || currentGroup[0].id,
      messages: currentGroup
    })
  }
  return groups
})

// 判断是否全选了所有问答组
const isAllSelected = computed(() => {
  return messageGroups.value.length > 0 && selectedShareGroups.value.length === messageGroups.value.length
})

const isIndeterminate = computed(() => {
  return selectedShareGroups.value.length > 0 && selectedShareGroups.value.length < messageGroups.value.length
})

const toggleShareGroup = (groupId) => {
  const index = selectedShareGroups.value.indexOf(groupId)
  if (index > -1) {
    selectedShareGroups.value.splice(index, 1)
  } else {
    selectedShareGroups.value.push(groupId)
  }
}

const toggleSelectAllGroups = (e) => {
  if (e.target.checked) {
    selectedShareGroups.value = messageGroups.value.map(g => g.id)
  } else {
    selectedShareGroups.value = []
  }
}

const cancelShareMode = () => {
  emit('update:isShareMode', false)
  selectedShareGroups.value = []
}

const openShareConfigModal = () => {
  if (selectedShareGroups.value.length === 0) {
    antMessage.warning('请至少选择一组对话')
    return
  }
  shareModalVisible.value = true
}

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
    emit('update:isShareMode', true)
    selectedShareGroups.value = [msgId] // 默认选中当前点击的这一组
  }
}

const handleShareConfirm = ({ expire }) => {
  // 模拟生成链接并复制
  const mockLink = `https://datapilot.com/share/${Date.now().toString(36)}?expire=${expire}`
  navigator.clipboard.writeText(mockLink).then(() => {
    antMessage.success('分享链接已生成并复制到剪贴板')
    shareModalVisible.value = false
    cancelShareMode() // 成功后退出分享模式
  }).catch(() => {
    antMessage.success(`分享链接：${mockLink}`)
    shareModalVisible.value = false
    cancelShareMode() // 成功后退出分享模式
  })
}

const handleViewFromList = (fqn) => {
  emit('send', `查看 ${fqn} 表的详细信息`)
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

/* 自定义 Radio 样式 */
.custom-radio .ant-radio-inner {
  border-color: #d9d9d9;
}
.dark-modal .custom-radio .ant-radio-inner {
  background-color: transparent;
  border-color: #475569;
}
.custom-radio.ant-radio-wrapper-checked .ant-radio-inner {
  border-color: rgba(108,76,155,1);
  background-color: rgba(108,76,155,1);
}
.dark-modal .custom-radio.ant-radio-wrapper-checked .ant-radio-inner {
  border-color: rgba(108,76,155,1);
  background-color: rgba(108,76,155,1);
}

/* 自定义 Checkbox 样式 */
.custom-checkbox .ant-checkbox-inner {
  border-color: #d9d9d9;
}
.dark-modal .custom-checkbox .ant-checkbox-inner {
  background-color: transparent;
  border-color: #475569;
}
.custom-checkbox.ant-checkbox-wrapper-checked .ant-checkbox-inner {
  border-color: rgba(108,76,155,1);
  background-color: rgba(108,76,155,1);
}
.dark-modal .custom-checkbox.ant-checkbox-wrapper-checked .ant-checkbox-inner {
  border-color: rgba(108,76,155,1);
  background-color: rgba(108,76,155,1);
}

/* 分享主按钮：覆盖 Ant Design 默认蓝色，统一品牌紫 */
.agent-share-primary.ant-btn-primary:not(:disabled) {
  background-color: rgba(108, 76, 155, 1) !important;
  border-color: rgba(108, 76, 155, 1) !important;
  color: #fff !important;
}
.agent-share-primary.ant-btn-primary:not(:disabled):hover {
  background-color: rgba(108, 76, 155, 0.88) !important;
  border-color: rgba(108, 76, 155, 0.88) !important;
  color: #fff !important;
}
.agent-share-primary.ant-btn-primary:disabled {
  background-color: rgba(108, 76, 155, 0.35) !important;
  border-color: rgba(108, 76, 155, 0.25) !important;
  color: rgba(255, 255, 255, 0.75) !important;
}
</style>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

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
