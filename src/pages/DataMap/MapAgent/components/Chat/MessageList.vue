<template>
  <div class="flex-1 overflow-y-auto px-6 pt-10 flex flex-col gap-6 scroll-smooth custom-scrollbar transition-colors duration-300 relative" 
       :class="[
         isDarkMode ? 'bg-[#0f172a]' : 'bg-white',
         isShareMode ? 'pb-6' : 'pb-36'
       ]" 
       ref="listRef">
    <div 
      v-for="group in messageGroups" 
      :key="group.id"
      class="relative transition-colors duration-300 rounded-2xl"
      :class="isShareMode ? (isDarkMode ? 'bg-slate-800/50 p-4' : 'bg-gray-100/70 p-4') : ''"
    >
      <!-- 分享模式勾选框 -->
      <transition name="fade">
        <div v-if="isShareMode" class="absolute left-4 top-4 z-10 flex items-center justify-center">
          <a-checkbox 
            :checked="selectedShareGroups.includes(group.id)"
            @change="toggleShareGroup(group.id)"
            class="custom-checkbox scale-110"
          />
        </div>
      </transition>

      <div class="flex flex-col gap-6" :class="isShareMode ? 'pl-8' : ''">
        <div 
          v-for="msg in group.messages" 
          :key="msg.id" 
          class="message flex gap-3 w-full group relative transition-all duration-300"
          :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
        >
          <!-- AI 头像 -->
          <div v-if="msg.role === 'ai'" class="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-1">
            <CopilotAiAvatar />
          </div>
      
          <!-- 消息内容区 -->
          <div class="flex flex-col gap-2 w-full" :class="msg.role === 'user' ? 'max-w-[80%] items-end' : 'max-w-[85%] items-start'">
            
            <!-- L3-3 Agent 思考过程 -->
            <ThinkingSteps 
              v-if="msg.role === 'ai'" 
              :steps="msg.steps" 
              :is-dark-mode="isDarkMode" 
            />

            <!-- 表名/负责人/描述由 Markdown 正文呈现，不再单独展示 TableDetailHeader 卡片，避免与下方引用块重复 -->

            <!-- L3-2 用户消息气泡 -->
            <UserBubble 
              v-if="msg.role === 'user'" 
              :content="msg.content" 
            />

            <!-- L3-4 + L3-5 流式文本渲染（含 DataTable 复制） -->
            <MarkdownRenderer 
              v-if="msg.role === 'ai' && (msg.content || (msg.status === 'loading' && (!msg.steps || msg.steps.length === 0)))"
              :content="msg.content"
              :status="msg.status"
              :is-dark-mode="isDarkMode"
              :has-steps="!!(msg.steps && msg.steps.length > 0)"
              :table-favorite-slot="tableFavoriteSlotForMsg(msg)"
              @toggle-table-favorite="() => handleToggleTableFavoriteByMsgId(msg.id)"
            />

            <!-- L3-6 追问建议引导 -->
            <SuggestionChips 
              v-if="msg.role === 'ai' && msg.status === 'success' && !isShareMode"
              :suggestions="msg.suggestions"
              :is-dark-mode="isDarkMode"
              @send="$emit('send', $event)"
            />
            
            <!-- L3-7 消息反馈与分享 -->
            <MessageActions 
              v-if="msg.role === 'ai' && msg.status !== 'loading' && !isShareMode"
              :msg-id="msg.id"
              :is-dark-mode="isDarkMode"
              :action-state="actionStates[msg.id]"
              :show-table-favorite="showMessageActionsTableFavorite(msg)"
              :table-favorited="msg.tableDetail ? isTableFavorited(msg.tableDetail.fqn) : false"
              @copy="handleAction('copy', $event)"
              @toggle-table-favorite="handleToggleTableFavoriteByMsgId"
              @like="handleAction('like', $event)"
              @dislike="handleAction('dislike', $event)"
              @share="handleAction('share', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 分享操作栏 -->
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

    <!-- 对话分享配置弹窗（业务组件） -->
    <ConversationShareModal
      v-model:open="shareModalVisible"
      :is-dark-mode="isDarkMode"
      :selected-count="selectedShareGroups.length"
      @confirm="handleShareConfirm"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, h, computed } from 'vue'
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import { message as antMessage } from 'ant-design-vue'
import CopilotAiAvatar from '@/components/Copilot/CopilotAiAvatar.vue'
import DislikeFeedbackCard from '@/pages/DataMap/Agent/components/Chat/DislikeFeedbackCard.vue'
import ShareActionBar from '@/pages/DataMap/Agent/components/Chat/ShareActionBar.vue'
import ConversationShareModal from './ConversationShareModal.vue'
import ThinkingSteps from './ThinkingSteps.vue'
import UserBubble from './UserBubble.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import SuggestionChips from './SuggestionChips.vue'
import MessageActions from './MessageActions.vue'
import { rawMarkdownHasTableActionsMarker } from '../../constants/markdownSlots.js'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  isDarkMode: { type: Boolean, default: false },
  isShareMode: { type: Boolean, default: false },
  /** 已收藏表 FQN 列表（与 MapAgent 页 localStorage 同步） */
  favoriteFqns: { type: Array, default: () => [] }
})

const emit = defineEmits(['send', 'update:isShareMode', 'toggleTableFavorite'])

const isTableFavorited = (fqn) => props.favoriteFqns.includes(fqn)

/** 正文已出现 1A 占位则只在 Markdown 内挂载收藏，操作栏星标作流式未到占位前的后备 */
const showMessageActionsTableFavorite = (msg) =>
  !!msg.tableDetail && !rawMarkdownHasTableActionsMarker(msg.content || '')

/** 3C：fqn/收藏态仍来自消息上的 tableDetail；1A：由 replaceMapagentTableActionsMarker 在 MarkdownRenderer 内处理 */
const tableFavoriteSlotForMsg = (msg) => {
  if (msg.role !== 'ai' || !msg.tableDetail) return null
  return {
    enabled: true,
    favorited: isTableFavorited(msg.tableDetail.fqn),
    disabled: props.isShareMode
  }
}

const handleToggleTableFavoriteByMsgId = (msgId) => {
  const msg = props.messages.find((m) => m.id === msgId)
  const fqn = msg?.tableDetail?.fqn
  if (fqn) emit('toggleTableFavorite', fqn)
}

const listRef = ref(null)
const actionStates = ref({})
const feedbackModalVisible = ref(false)
const currentFeedbackMsgId = ref(null)
const shareModalVisible = ref(false)
const selectedShareGroups = ref([])

// L3-1 对话分组引擎
const messageGroups = computed(() => {
  const groups = []
  let currentGroup = []
  for (const msg of props.messages) {
    if (msg.role === 'user') {
      if (currentGroup.length > 0) {
        groups.push({ id: currentGroup.find(m => m.role === 'ai')?.id || currentGroup[0].id, messages: currentGroup })
      }
      currentGroup = [msg]
    } else {
      currentGroup.push(msg)
    }
  }
  if (currentGroup.length > 0) {
    groups.push({ id: currentGroup.find(m => m.role === 'ai')?.id || currentGroup[0].id, messages: currentGroup })
  }
  return groups
})

const isAllSelected = computed(() => messageGroups.value.length > 0 && selectedShareGroups.value.length === messageGroups.value.length)
const isIndeterminate = computed(() => selectedShareGroups.value.length > 0 && selectedShareGroups.value.length < messageGroups.value.length)

const toggleShareGroup = (groupId) => {
  const index = selectedShareGroups.value.indexOf(groupId)
  if (index > -1) selectedShareGroups.value.splice(index, 1)
  else selectedShareGroups.value.push(groupId)
}
const toggleSelectAllGroups = (e) => {
  selectedShareGroups.value = e.target.checked ? messageGroups.value.map(g => g.id) : []
}
const cancelShareMode = () => { emit('update:isShareMode', false); selectedShareGroups.value = [] }
const openShareConfigModal = () => {
  if (selectedShareGroups.value.length === 0) { antMessage.warning('请至少选择一组对话'); return }
  shareModalVisible.value = true
}

const handleAction = (action, msgId) => {
  if (!actionStates.value[msgId]) actionStates.value[msgId] = {}
  if (action === 'copy') {
    const msg = props.messages.find(m => m.id === msgId)
    if (msg && msg.content) {
      navigator.clipboard.writeText(msg.content).then(() => {
        antMessage.success('内容已复制到剪贴板')
      }).catch(() => {
        antMessage.error('复制失败，请手动复制')
      })
    }
  } else if (action === 'like') {
    if (actionStates.value[msgId].like) return
    actionStates.value[msgId].like = true
    actionStates.value[msgId].dislike = false
    antMessage.open({
      content: () => h('div', { class: 'flex items-center gap-2 px-1' }, [
        h(CheckCircleOutlined, { style: { color: '#14b8a6', fontSize: '16px' } }),
        h('span', { style: { fontWeight: '500', color: '#1e293b' } }, '感谢您的支持')
      ]),
      duration: 2, class: 'custom-like-message'
    })
  } else if (action === 'dislike') {
    if (actionStates.value[msgId].dislike) return
    currentFeedbackMsgId.value = msgId
    feedbackModalVisible.value = true
  } else if (action === 'share') {
    emit('update:isShareMode', true)
    selectedShareGroups.value = [msgId]
  }
}

const handleShareConfirm = ({ expire }) => {
  const mockLink = `https://datapilot.com/share/${Date.now().toString(36)}?expire=${expire}`
  navigator.clipboard.writeText(mockLink).then(() => {
    antMessage.success('分享链接已生成并复制到剪贴板')
    shareModalVisible.value = false; cancelShareMode()
  }).catch(() => {
    antMessage.success(`分享链接：${mockLink}`)
    shareModalVisible.value = false; cancelShareMode()
  })
}

const handleFeedbackSubmit = (feedbackData) => {
  const msgId = currentFeedbackMsgId.value
  if (msgId && actionStates.value[msgId]) {
    actionStates.value[msgId].dislike = true
    actionStates.value[msgId].like = false
    antMessage.success('感谢您的反馈，我们会继续改进')
  }
  feedbackModalVisible.value = false
}

// 自动滚动到底部
watch(() => props.messages, () => {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}, { deep: true })
</script>

<style>
/* 表格复制按钮 — 从 useTableCopy.js 注入的 DOM 使用 */
.table-copy-wrapper {
  position: relative;
}
.table-copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  opacity: 0;
  transition: all 0.2s;
  z-index: 5;
}
.table-copy-wrapper:hover .table-copy-btn { opacity: 1; }
.table-copy-btn:hover { color: rgba(108, 76, 155, 1); border-color: rgba(108, 76, 155, 0.3); background: rgba(108, 76, 155, 0.05); }

.dark-markdown .table-copy-btn {
  background: #1e293b;
  border-color: #334155;
  color: #64748b;
}
.dark-markdown .table-copy-btn:hover {
  color: rgba(168, 140, 210, 1);
  border-color: rgba(108, 76, 155, 0.5);
  background: rgba(108, 76, 155, 0.15);
}

/* 全局样式：消息提示、弹窗暗色、checkbox 品牌色 */
.custom-like-message .ant-message-notice-content { padding: 8px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; background: #fff; }
.dark-modal .ant-modal-content { background-color: #1e293b !important; border: 1px solid #334155; }
.dark-modal .ant-modal-header { background-color: #1e293b !important; border-bottom: 1px solid #334155; }
.dark-modal .ant-modal-title { color: #f1f5f9 !important; }
.dark-modal .ant-modal-close { color: #94a3b8 !important; }
.dark-modal .ant-modal-close:hover { color: #f1f5f9 !important; background-color: rgba(255,255,255,0.1) !important; }
.custom-checkbox .ant-checkbox-inner { border-color: #d9d9d9; }
.custom-checkbox.ant-checkbox-wrapper-checked .ant-checkbox-inner { border-color: rgba(108,76,155,1); background-color: rgba(108,76,155,1); }
.agent-share-primary.ant-btn-primary:not(:disabled) { background-color: rgba(108,76,155,1) !important; border-color: rgba(108,76,155,1) !important; color: #fff !important; }
.agent-share-primary.ant-btn-primary:not(:disabled):hover { background-color: rgba(108,76,155,0.88) !important; border-color: rgba(108,76,155,0.88) !important; }
</style>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 2px; }
.custom-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
</style>
