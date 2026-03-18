<template>
  <div class="chat-panel" :class="{ 'chat-panel-fullscreen': fullscreen }">
    <!-- Message area -->
    <div ref="messageListRef" class="chat-messages">
      <!-- Preset questions when empty -->
      <div v-if="!messages.length" class="chat-presets">
        <div class="chat-presets-title">
          <RobotOutlined class="presets-icon" />
          <span>你好，我是 DataPilot Copilot，可以帮你：</span>
        </div>
        <div class="chat-presets-grid">
          <div
            v-for="(q, i) in presetQuestions"
            :key="i"
            class="preset-card"
            @click="sendPreset(q.prompt)"
          >
            <component :is="iconMap[q.icon]" class="preset-card-icon" />
            <div class="preset-card-body">
              <span class="preset-card-title">{{ q.title }}</span>
              <span class="preset-card-prompt">{{ q.prompt }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-for="(msg, i) in messages" :key="i" class="chat-message" :class="`chat-message-${msg.role}`">
        <div class="chat-bubble" :class="`chat-bubble-${msg.role}`">
          <div class="chat-bubble-content" v-text="msg.content" />
          <ResultCards v-if="msg.tables?.length" :tables="msg.tables" />
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="chat-message chat-message-assistant">
        <div class="chat-bubble chat-bubble-assistant">
          <span class="typing-dots">
            <span /><span /><span />
          </span>
        </div>
      </div>
    </div>

    <!-- @ mention dropdown -->
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

    <!-- Input area -->
    <div class="chat-input-area">
      <a-input
        ref="inputRef"
        v-model:value="inputValue"
        placeholder="输入问题，@ 可引用表名..."
        @pressEnter="handleSend"
        @input="handleInput"
        @blur="closeMentionDelayed"
      >
        <template #suffix>
          <SendOutlined
            class="send-btn"
            :class="{ 'send-btn-active': inputValue.trim() }"
            @click="handleSend"
          />
        </template>
      </a-input>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import {
  RobotOutlined,
  SendOutlined,
  SearchOutlined,
  ApartmentOutlined,
  ReadOutlined,
  BarChartOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { presetQuestions } from '@/mock/ai.js'
import { getSuggestions } from '@/services/searchService.js'
import { useCopilotStore } from '@/stores/copilot.js'
import ResultCards from './ResultCards.vue'

defineProps({
  fullscreen: {
    type: Boolean,
    default: false,
  },
})

const iconMap = {
  SearchOutlined,
  ApartmentOutlined,
  ReadOutlined,
  BarChartOutlined,
  TeamOutlined,
  ThunderboltOutlined,
}

const messages = ref([])
const inputValue = ref('')
const isTyping = ref(false)
const messageListRef = ref(null)
const inputRef = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')

const tableSuggestions = ref([])
const copilotStore = useCopilotStore()

onMounted(async () => {
  const suggestions = await getSuggestions('') || []
  tableSuggestions.value = suggestions.map((s) => ({
    name: s._source.name,
    fqn: s._source.fullyQualifiedName,
    serviceType: s._source.serviceType,
  }))

  // 如果有待处理的问题（从首页 AI 入口传入），自动发送
  const pending = copilotStore.consumeQuestion()
  if (pending) {
    inputValue.value = pending
    nextTick(() => handleSend())
  }
})

// 监听后续打开时带入的新问题
watch(() => copilotStore.pendingQuestion, (q) => {
  if (q) {
    const question = copilotStore.consumeQuestion()
    inputValue.value = question
    nextTick(() => handleSend())
  }
})

const filteredSuggestions = ref([])

function handleInput() {
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

const mockAiResponses = [
  {
    content: '根据您的问题，我找到了以下相关的表：',
    tables: [
      { id: '1', name: 'ods_order_detail', fullyQualifiedName: 'hive.dm_trade.ods.ods_order_detail', displayName: '订单明细表', serviceType: 'Hive', description: '全渠道订单原子粒度明细数据', database: { name: 'dm_trade' } },
      { id: '2', name: 'dwd_user_profile', fullyQualifiedName: 'starrocks.dm_user.dwd.dwd_user_profile', displayName: '用户画像宽表', serviceType: 'StarRocks', description: '用户基础属性与行为标签宽表', database: { name: 'dm_user' } },
    ],
  },
  {
    content: '这张表的血缘关系较为丰富，上游有 3 张源表，下游被 5 张业务表引用。建议点击查看完整的血缘图谱。',
    tables: [
      { id: '3', name: 'dws_trade_summary', fullyQualifiedName: 'hive.dm_trade.dws.dws_trade_summary', displayName: '交易汇总表', serviceType: 'Hive', description: '按日/渠道/类目维度的交易汇总指标', database: { name: 'dm_trade' } },
    ],
  },
  {
    content: '该字段的数据类型为 DECIMAL(18,2)，含义为订单金额（单位：元），包含商品金额、运费和优惠。近 7 天空值率 0.02%，数据质量良好。',
    tables: [],
  },
]

let responseIndex = 0

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

function handleSend() {
  const text = inputValue.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  inputValue.value = ''
  showMentionDropdown.value = false
  scrollToBottom()

  isTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    isTyping.value = false
    const resp = mockAiResponses[responseIndex % mockAiResponses.length]
    responseIndex++
    messages.value.push({ role: 'assistant', content: resp.content, tables: resp.tables })
    scrollToBottom()
  }, 500)
}

function sendPreset(prompt) {
  inputValue.value = prompt
  handleSend()
}

watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-panel-fullscreen {
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-presets {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-presets-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-title);
}

.presets-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.chat-presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.preset-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.preset-card:hover {
  border-color: var(--color-primary);
  background: #f0f5ff;
}

.preset-card-icon {
  font-size: 18px;
  color: var(--color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.preset-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preset-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-title);
}

.preset-card-prompt {
  font-size: 12px;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-message {
  display: flex;
}

.chat-message-user {
  justify-content: flex-end;
}

.chat-message-assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.chat-bubble-user {
  background: var(--color-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-bubble-assistant {
  background: #f6f8fa;
  color: var(--color-text-body);
  border-bottom-left-radius: 4px;
  border: 1px solid #f0f0f0;
}

.chat-bubble-content {
  white-space: pre-wrap;
  word-break: break-word;
}

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
  background: #f0f5ff;
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

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.send-btn {
  font-size: 18px;
  color: #d9d9d9;
  cursor: pointer;
  transition: color 0.2s;
}

.send-btn-active {
  color: var(--color-primary);
}

.send-btn:hover {
  color: var(--color-primary);
}
</style>
