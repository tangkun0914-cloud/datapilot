<template>
  <div class="chat-panel" :class="{ 'chat-panel-fullscreen': fullscreen }">
    <!-- 消息区域 -->
    <div ref="messageListRef" class="chat-messages" @scroll="handleChatScroll">
      <!-- 欢迎区：始终渲染，有用户消息后切换为紧凑模式 -->
      <div class="welcome-view" :class="{ 'welcome-compact': hasUserMessages }">
        <div class="welcome-logo-area">
          <PilotLogo :size="welcomeLogoSize" class="welcome-logo-svg" />
          <div class="welcome-title">DataPilot Copilot</div>
          <div v-if="!hasUserMessages" class="welcome-sub">智能找表 & 个性推荐，可从业务用途、关键词、项目范围、专题范围四种方式描述需求。</div>
        </div>
        <div class="capability-grid">
          <div
            v-for="(q, idx) in welcomePresets"
            :key="idx"
            class="capability-card"
            @click="applyIntentFromPreset(q)"
          >
            <component :is="iconMap[q.icon]" class="cap-icon" />
            <span class="cap-text">{{ q.title }}</span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, i) in copilotStore.messages" :key="i" class="chat-msg" :class="msg.role">
        <div class="chat-avatar" :class="msg.role === 'user' ? 'user' : 'ai'">
          <UserOutlined v-if="msg.role === 'user'" />
          <CopilotAiAvatar v-else />
        </div>

        <!-- 用户消息：支持行内编辑（覆盖重写 / 仅回退） -->
        <template v-if="msg.role === 'user'">
          <div class="user-msg-col">
            <UserMessageInlineEditor
              v-if="editingUserIndex === i"
              :initial-content="msg.content"
              @cancel="cancelEditUser"
              @confirm="handleUserEditConfirm(i, $event)"
            />
            <template v-else>
              <div class="chat-bubble">
                <div class="chat-bubble-content">{{ msg.content }}</div>
              </div>
              <div class="message-actions">
                <a-tooltip title="编辑">
                  <div class="action-btn" @click="startEditUser(i)"><EditOutlined /></div>
                </a-tooltip>
                <a-tooltip title="复制">
                  <div class="action-btn" @click="handleCopy(msg.content)"><CopyOutlined /></div>
                </a-tooltip>
              </div>
            </template>
          </div>
        </template>

        <!-- AI 消息 -->
        <template v-else>
          <div class="ai-output">
            <div class="ai-bubble" v-html="renderMarkdown(msg.content)" />
            <ResultCards 
              v-if="msg.tables?.length" 
              :tables="msg.tables" 
              :show-more="msg.isGreeting"
              more-keyword="智能推荐"
            />
            <div class="feedback-actions">
              <a-tooltip title="复制">
                <div class="feedback-btn" @click="handleCopy(msg.content)"><CopyOutlined /></div>
              </a-tooltip>
              <div class="feedback-divider" />
              <div
                class="feedback-btn"
                :class="{ 'active-like': msg.feedback === 'like' }"
                @click="handleLike(i)"
              >
                <LikeFilled v-if="msg.feedback === 'like'" />
                <LikeOutlined v-else />
              </div>
              <div
                class="feedback-btn"
                :class="{ 'active-dislike': msg.feedback === 'dislike' }"
                @click="handleDislike(i)"
              >
                <DislikeFilled v-if="msg.feedback === 'dislike'" />
                <DislikeOutlined v-else />
              </div>
            </div>
            <!-- 内联点踩反馈卡片 -->
            <div v-if="activeDislikeFormIndex === i" class="inline-feedback-wrapper">
              <DislikeFeedbackCard
                :initial-reason-ids="msg.dislikeReasonIds"
                :initial-detail="msg.dislikeDetail"
                @submit="(data) => onDislikeSubmit(i, data)"
                @cancel="activeDislikeFormIndex = -1"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- 打字指示器 -->
      <div v-if="isTyping" class="chat-msg assistant">
        <div class="chat-avatar ai"><CopilotAiAvatar /></div>
        <div class="chat-bubble typing-bubble">
          <span class="typing-dots"><span /><span /><span /></span>
        </div>
      </div>
    </div>

    <!-- @ 提及下拉 -->
    <div v-if="showMentionDropdown" class="mention-dropdown">
      <div
        v-for="(s, i) in filteredSuggestions"
        :key="i"
        class="mention-item"
        @mousedown.prevent="selectMention(s)"
      >
        <span class="mention-item-name">{{ s.name }}</span>
        <span class="mention-item-type">{{ s.serviceType }}</span>
      </div>
      <div v-if="!filteredSuggestions.length" class="mention-empty">无匹配表名</div>
    </div>

    <!-- 输入区域（Agent 意图模式：紫色描边 + 意图胶囊 + 分区底栏，对齐数据 Agent 设计稿） -->
    <div class="copilot-input-wrapper">
      <div
        class="input-box-container"
        :class="{ 'intent-active': activeIntent }"
      >
        <div class="input-top-row" :class="{ 'has-intent-pill': activeIntent }">
          <div v-if="activeIntent" class="intent-pill">
            <ThunderboltFilled class="intent-pill-icon" />
            <span class="intent-pill-text">{{ activeIntent.title }}</span>
            <button type="button" class="intent-pill-close" aria-label="清除意图" @click="clearIntent">
              <CloseOutlined />
            </button>
          </div>
          <textarea
            ref="inputRef"
            v-model="inputValue"
            class="chat-textarea"
            :class="{ 'with-intent': activeIntent }"
            :placeholder="inputPlaceholder"
            @keydown.enter.exact.prevent="handleSend"
            @input="handleInput"
            @blur="closeMentionDelayed"
          />
        </div>
        <div class="input-actions-bottom">
          <div class="input-controls-left">
            <a-select
              class="intent-select"
              :value="activeIntent?.title"
              :options="intentSelectOptions"
              placeholder="选择意图"
              allow-clear
              size="small"
              popup-match-select-width
              :get-popup-container="intentSelectPopupContainer"
              @change="onIntentSelectChange"
            />
            <span class="at-hint">@</span>
            <span class="slash-hint">/</span>
          </div>
          <div class="input-controls-right">
            <div
              class="send-btn-wrapper"
              :class="{ active: inputValue.trim() }"
              @click="handleSend"
            >
              <ArrowUpOutlined class="send-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import {
  UserOutlined,
  SearchOutlined, AppstoreOutlined, DeploymentUnitOutlined, TagsOutlined,
  CopyOutlined, EditOutlined, LikeOutlined, DislikeOutlined, LikeFilled, DislikeFilled,
  ArrowUpOutlined, ThunderboltFilled, CloseOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { presetQuestions, SMART_FIND_INTENT_IDS } from '@/mock/DataMap/ai.js'
import { getSuggestions } from '@/services/DataMap/searchService.js'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'
import ResultCards from './ResultCards.vue'
import CopilotAiAvatar from './CopilotAiAvatar.vue'
import UserMessageInlineEditor from './UserMessageInlineEditor.vue'
import PilotLogo from './PilotLogo.vue'
import DislikeFeedbackCard from './DislikeFeedbackCard.vue'

const props = defineProps({
  fullscreen: { type: Boolean, default: false },
})

const copilotStore = useCopilotStore()

const iconMap = {
  AppstoreOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
  TagsOutlined,
}

/** 与 mock 中 presetQuestions 一致：本期仅四种「智能找表」范围 */
const welcomePresets = presetQuestions

const hasUserMessages = computed(() =>
  copilotStore.messages.some((m) => m.role === 'user'),
)

const welcomeLogoSize = computed(() => {
  if (hasUserMessages.value) return 28
  return props.fullscreen ? 72 : 48
})

const smartFindIntentSet = new Set(SMART_FIND_INTENT_IDS)

/** 输入栏左侧：与欢迎区卡片一致的意图选项（会话中可切换下一次发送的意图） */
const intentSelectOptions = computed(() =>
  welcomePresets.map((q) => ({ label: q.title, value: q.title })),
)

function intentSelectPopupContainer(trigger) {
  return trigger?.parentElement ?? document.body
}

function onIntentSelectChange(value) {
  if (value == null || value === '') {
    clearIntent()
    return
  }
  const q = welcomePresets.find((p) => p.title === value)
  if (q) applyIntentFromPreset(q)
}

/** 当前选中的 Agent 意图（来自欢迎区卡片），未选时为 null */
const activeIntent = ref(null)

const inputPlaceholder = computed(() => {
  if (activeIntent.value?.intentPlaceholder) {
    return activeIntent.value.intentPlaceholder
  }
  return '使用 @ 关联上下文，Enter 发送'
})

/** 正在行内编辑的用户消息下标，null 表示未编辑 */
const editingUserIndex = ref(null)

const inputValue = ref('')
const isTyping = ref(false)
const messageListRef = ref(null)
const inputRef = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const tableSuggestions = ref([])
const filteredSuggestions = ref([])
const autoScroll = ref(true)

/** 内联点踩反馈卡片索引，-1 表示未打开 */
const activeDislikeFormIndex = ref(-1)

onMounted(async () => {
  try {
    const suggestions = await getSuggestions('') || []
    tableSuggestions.value = suggestions.map((s) => ({
      name: s._source.name,
      fqn: s._source.fullyQualifiedName,
      serviceType: s._source.serviceType,
    }))
  } catch { /* 静默 */ }

  if (!copilotStore.messages.length) {
    copilotStore.injectGreeting()
  }

  const pending = copilotStore.consumeQuestion()
  if (pending) {
    inputValue.value = pending
    nextTick(() => handleSend())
  }
})

watch(() => copilotStore.pendingQuestion, (q) => {
  if (q) {
    const question = copilotStore.consumeQuestion()
    inputValue.value = question
    nextTick(() => handleSend())
  }
})

function handleChatScroll() {
  const el = messageListRef.value
  if (!el) return
  autoScroll.value = el.scrollHeight - el.scrollTop - el.clientHeight <= 80
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value && autoScroll.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

function renderMarkdown(md) {
  if (!md) return ''
  return md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

function handleCopy(content) {
  if (navigator.clipboard && content) {
    navigator.clipboard.writeText(content)
    message.success('已复制到剪贴板')
  }
}

function handleLike(index) {
  const msg = copilotStore.messages[index]
  if (!msg) return
  if (msg.feedback === 'like') {
    msg.feedback = null
  } else {
    msg.feedback = 'like'
    msg.dislikeReasonIds = []
    delete msg.dislikeReasonId
    msg.dislikeDetail = ''
    if (activeDislikeFormIndex.value === index) {
      activeDislikeFormIndex.value = -1
    }
  }
}

function handleDislike(index) {
  const msg = copilotStore.messages[index]
  if (!msg) return
  if (msg.feedback === 'dislike') {
    msg.feedback = null
    msg.dislikeReasonIds = []
    delete msg.dislikeReasonId
    msg.dislikeDetail = ''
    if (activeDislikeFormIndex.value === index) {
      activeDislikeFormIndex.value = -1
    }
    return
  }
  msg.feedback = 'dislike'
  activeDislikeFormIndex.value = index
}

function onDislikeSubmit(index, { reasonIds, detail }) {
  const msg = copilotStore.messages[index]
  if (!msg) return
  msg.dislikeReasonIds = Array.isArray(reasonIds) ? [...reasonIds] : []
  delete msg.dislikeReasonId
  msg.dislikeDetail = detail || ''
  activeDislikeFormIndex.value = -1
  message.success('感谢反馈，我们会持续改进')
}

function handleInput(e) {
  if (e.target) {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }
  const val = inputValue.value
  const atIdx = val.lastIndexOf('@')
  if (atIdx >= 0) {
    const afterAt = val.substring(atIdx + 1)
    if (!afterAt.includes(' ')) {
      mentionQuery.value = afterAt.toLowerCase()
      filteredSuggestions.value = tableSuggestions.value.filter((t) =>
        t.name.toLowerCase().includes(mentionQuery.value)
      )
      showMentionDropdown.value = true
      return
    }
  }
  showMentionDropdown.value = false
}

function selectMention(suggestion) {
  const val = inputValue.value
  const atIdx = val.lastIndexOf('@')
  inputValue.value = val.substring(0, atIdx) + '@' + suggestion.name + ' '
  showMentionDropdown.value = false
  inputRef.value?.focus()
}

function closeMentionDelayed() {
  setTimeout(() => { showMentionDropdown.value = false }, 200)
}

const mockFindTableRows = [
  { id: '1', name: 'ods_order_detail', fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail', displayName: '订单明细表', serviceType: 'Hive', description: '全渠道订单原子粒度明细数据', database: { name: 'dm_trade' } },
  { id: '2', name: 'dwd_user_profile', fullyQualifiedName: 'starrocks.dm_user.dwd.dwd_user_profile', displayName: '用户画像宽表', serviceType: 'StarRocks', description: '用户基础属性与行为标签宽表', database: { name: 'dm_user' } },
]

/** 未选具体范围时的通用找表 Mock（仍属智能找表） */
const mockAiResponses = [
  {
    content: '根据您的描述，为您检索到以下数据表（示例）：',
    tables: mockFindTableRows,
  },
  {
    content: '为您补充匹配到以下表资产（示例）：',
    tables: [
      mockFindTableRows[0],
      { id: '3', name: 'dws_trade_summary', fullyQualifiedName: 'hive.dm_trade.dws.dws_trade_summary', displayName: '交易汇总表', serviceType: 'Hive', description: '按日/渠道/类目维度的交易汇总指标', database: { name: 'dm_trade' } },
    ],
  },
]

let responseIndex = 0

const SMART_FIND_REPLY_COPY = {
  smart_find_business: '已按**业务用途**理解您的需求，为您匹配到以下数据表：',
  smart_find_keyword: '已按**关键词**在元数据中检索，找到以下表：',
  smart_find_project: '已在您指定的**项目范围**内检索，找到以下表：',
  smart_find_topic: '已在您指定的**专题范围**内检索，找到以下表：',
}

function buildSmartFindMockResponse(intentId) {
  const content = SMART_FIND_REPLY_COPY[intentId] || '根据您的描述，为您检索到以下数据表：'
  return {
    content: `${content}\n\n> 提示：真实环境由检索服务按对应范围过滤资产。`,
    tables: mockFindTableRows,
  }
}

/**
 * @param {{ intentId?: string }} [ctx] 发送前选中的意图（与 presetQuestions.intentId 对应）
 */
function runMockAssistantReply(ctx = {}) {
  isTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    isTyping.value = false
    let resp
    if (ctx.intentId && smartFindIntentSet.has(ctx.intentId)) {
      resp = buildSmartFindMockResponse(ctx.intentId)
    } else {
      resp = mockAiResponses[responseIndex % mockAiResponses.length]
      responseIndex++
    }
    copilotStore.messages.push({
      role: 'assistant',
      content: resp.content,
      tables: resp.tables,
      feedback: null,
      dislikeReasonIds: [],
      dislikeDetail: '',
    })
    scrollToBottom()
  }, 600)
}

function handleSend() {
  const text = inputValue.value.trim()
  if (!text) return

  const intentId = activeIntent.value?.intentId

  copilotStore.messages.push({ role: 'user', content: text })
  inputValue.value = ''
  activeIntent.value = null
  if (inputRef.value) inputRef.value.style.height = 'auto'
  showMentionDropdown.value = false
  scrollToBottom()

  runMockAssistantReply({ intentId })
}

/**
 * 点击欢迎区意图卡片：写入 Agent 意图标签与占位，不自动发送（用户输入后再发）
 */
function applyIntentFromPreset(q) {
  activeIntent.value = {
    title: q.title,
    intentPlaceholder: q.intentPlaceholder || `请输入与「${q.title}」相关的自然语言`,
    prompt: q.prompt,
    ...(q.intentId ? { intentId: q.intentId } : {}),
  }
  inputValue.value = ''
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = `${inputRef.value.scrollHeight}px`
      inputRef.value.focus()
    }
  })
}

function clearIntent() {
  activeIntent.value = null
  nextTick(() => inputRef.value?.focus())
}

function startEditUser(index) {
  editingUserIndex.value = index
}

function cancelEditUser() {
  editingUserIndex.value = null
}

/**
 * 用户消息行内编辑确认
 * @param {number} index
 * @param {{ action: 'rewrite'|'rollback', text: string }} payload
 */
function handleUserEditConfirm(index, { action, text }) {
  const msgs = copilotStore.messages
  const trimmed = (text || '').trim()

  if (action === 'rollback') {
    editingUserIndex.value = null
    msgs.splice(index, msgs.length - index)
    return
  }

  if (action === 'rewrite') {
    if (!trimmed) {
      message.warning('请输入有效内容后再覆盖重写')
      return
    }
    editingUserIndex.value = null
    msgs.splice(index, msgs.length - index)
    msgs.push({ role: 'user', content: trimmed })
    runMockAssistantReply()
  }
}

watch(() => copilotStore.messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fafafa;
}

/* 欢迎页 */
.welcome-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  gap: 24px;
}

.welcome-logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.welcome-sub {
  font-size: 13px;
  color: #999;
  max-width: 260px;
  line-height: 1.5;
}

.capability-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 360px;
  margin-top: 12px;
}

/* 对齐 data-agent shared.css：空态卡片底 #f9f9f9 */
.capability-card {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.capability-card:hover {
  border-color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.07);
  color: rgba(108, 76, 155);
}

.cap-icon {
  font-size: 18px;
  color: #666;
}

.capability-card:hover .cap-icon {
  color: rgba(108, 76, 155);
}

.cap-text {
  font-size: 12px;
  font-weight: 500;
}

/* === 紧凑模式（有用户消息后） === */
.welcome-compact {
  flex: unset;
  justify-content: flex-start;
  padding: 16px 16px 8px;
  gap: 10px;
}

.welcome-compact .welcome-logo-area {
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.welcome-compact .welcome-title {
  font-size: 14px;
  font-weight: 600;
}

.welcome-compact .capability-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
  max-width: 100%;
}

.welcome-compact .capability-card {
  flex-direction: row;
  padding: 6px 12px;
  border-radius: 16px;
  gap: 6px;
  min-height: auto;
  background: #fff;
}

.welcome-compact .capability-card:hover {
  background: rgba(108, 76, 155, 0.07);
}

.welcome-compact .cap-icon {
  font-size: 13px;
}

.welcome-compact .cap-text {
  font-size: 12px;
  font-weight: 500;
}

/* 全屏（/copilot）：欢迎区与 4 张「智能找表」范围卡片自适应放大 */
.chat-panel-fullscreen .chat-messages {
  padding: 28px 32px;
}

.chat-panel-fullscreen .welcome-view {
  padding: 48px 24px;
  gap: 36px;
}

.chat-panel-fullscreen .welcome-logo-area {
  gap: 16px;
}

.chat-panel-fullscreen .welcome-title {
  font-size: 26px;
  letter-spacing: -0.02em;
}

.chat-panel-fullscreen .welcome-sub {
  font-size: 15px;
  max-width: 520px;
  line-height: 1.65;
}

.chat-panel-fullscreen .capability-grid {
  max-width: min(960px, 100%);
  width: 100%;
  margin-top: 16px;
  gap: 18px 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.chat-panel-fullscreen .capability-card {
  padding: 22px 20px;
  border-radius: 12px;
  gap: 12px;
  min-height: 108px;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chat-panel-fullscreen .cap-icon {
  font-size: 28px;
}

.chat-panel-fullscreen .cap-text {
  font-size: 15px;
  line-height: 1.45;
  font-weight: 600;
}

/* 全屏但主区域较窄时，退回两列避免挤压 */
@media (max-width: 900px) {
  .chat-panel-fullscreen .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 560px;
  }
}

/* 全屏 + 紧凑模式：覆盖全屏放大样式 */
.chat-panel-fullscreen .welcome-compact {
  padding: 20px 32px 12px;
  gap: 12px;
}

.chat-panel-fullscreen .welcome-compact .welcome-logo-area {
  flex-direction: row;
  gap: 10px;
}

.chat-panel-fullscreen .welcome-compact .welcome-title {
  font-size: 16px;
}

.chat-panel-fullscreen .welcome-compact .capability-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 0;
}

.chat-panel-fullscreen .welcome-compact .capability-card {
  flex-direction: row;
  padding: 8px 16px;
  border-radius: 20px;
  gap: 8px;
  min-height: auto;
  box-shadow: none;
}

.chat-panel-fullscreen .welcome-compact .cap-icon {
  font-size: 14px;
}

.chat-panel-fullscreen .welcome-compact .cap-text {
  font-size: 13px;
}

/* 消息 */
.chat-msg {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.chat-msg.user {
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.chat-avatar.ai {
  background: transparent;
  padding: 0;
}

.chat-avatar.user {
  background: #f0f0f0;
  color: #666;
}

.chat-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
  max-width: 90%;
  position: relative;
  background: #fff;
  border: 1px solid #eef0f2;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

.chat-msg.user .chat-bubble {
  background: rgba(108, 76, 155);
  color: #fff;
  border: none;
  border-top-right-radius: 0;
}

.chat-bubble-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.user-msg-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  max-width: 90%;
}

.message-actions {
  display: flex;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.2s;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.chat-msg:hover .message-actions {
  opacity: 1;
}

.action-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #999;
  transition: all 0.2s;
}

.action-btn:hover {
  color: #666;
}

/* AI 输出 */
.ai-output {
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-bubble {
  font-size: 13px;
  color: #333;
  line-height: 1.7;
  background: #fff;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #eef0f2;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04);
}

.ai-bubble :deep(strong) {
  font-weight: 600;
}

.typing-bubble {
  background: #fff;
}

.feedback-actions {
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  align-items: center;
}

.chat-msg:hover .feedback-actions {
  opacity: 1;
}

.feedback-divider {
  width: 1px;
  height: 12px;
  background: #e0e0e0;
}

.feedback-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
  transition: all 0.2s;
}

.feedback-btn:hover {
  color: #666;
}

.feedback-btn.active-like {
  color: #1677ff;
}

.feedback-btn.active-dislike {
  color: #ff4d4f;
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

/* @ 提及下拉 */
.mention-dropdown {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin: 0 16px;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.mention-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.mention-item:hover {
  background: rgba(108, 76, 155, 0.08);
}

.mention-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-title);
}

.mention-item-type {
  font-size: 12px;
  color: var(--color-text-muted);
}

.mention-empty {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}

/* 输入区 */
.copilot-input-wrapper {
  background: #fff;
  border-top: 1px solid #eee;
  padding: 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-box-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.input-box-container:focus-within {
  border-color: rgba(108, 76, 155);
  box-shadow: 0 0 0 2px rgba(108, 76, 155, 0.15);
}

.input-box-container.intent-active {
  border-color: rgba(108, 76, 155);
  box-shadow: 0 0 0 1px rgba(108, 76, 155, 0.25);
}

.input-box-container.intent-active:focus-within {
  border-color: rgba(108, 76, 155);
  box-shadow: 0 0 0 2px rgba(108, 76, 155, 0.22);
}

.input-top-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
}

.input-top-row.has-intent-pill {
  align-items: flex-start;
  gap: 10px;
  flex-wrap: nowrap;
}

/* Agent 意图胶囊（闪电 + 文案 + 关闭） */
.intent-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 4px 5px 10px;
  border-radius: 999px;
  background: rgba(108, 76, 155);
  color: #fff;
  flex-shrink: 0;
  max-width: min(100%, 200px);
}

.intent-pill-icon {
  font-size: 12px;
  color: #fff;
  flex-shrink: 0;
}

.intent-pill-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.intent-pill-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px 2px 4px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  line-height: 1;
  border-radius: 4px;
}

.intent-pill-close:hover {
  color: #fff;
  background: rgba(0, 0, 0, 0.12);
}

.chat-textarea {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  padding: 0;
  resize: none;
  font-size: 13px;
  max-height: 120px;
  min-height: 60px;
  line-height: 1.5;
  margin-top: 4px;
}

.chat-textarea.with-intent {
  min-height: 40px;
  margin-top: 2px;
}

.input-actions-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.input-controls-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.intent-select {
  min-width: 132px;
  max-width: 200px;
}

.intent-select :deep(.ant-select-selector) {
  border-radius: 6px;
}

.at-hint,
.slash-hint {
  font-size: 14px;
  color: #999;
  font-weight: 500;
  user-select: none;
}

.slash-hint {
  margin-left: 4px;
}

.input-controls-right {
  display: flex;
  align-items: center;
}

.send-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn-wrapper.active {
  background: rgba(108, 76, 155);
}

.send-icon {
  font-size: 12px;
  color: #999;
  transition: color 0.2s;
}

.send-btn-wrapper.active .send-icon {
  color: #fff;
}
.inline-feedback-wrapper {
  margin-top: 12px;
  animation: slideDown 0.2s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
