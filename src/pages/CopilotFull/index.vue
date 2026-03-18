<template>
  <div class="copilot-full">
    <!-- Left sidebar: conversation history -->
    <div class="copilot-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">对话历史</span>
        <a-button type="primary" size="small" @click="handleNewChat">
          <template #icon><PlusOutlined /></template>
          新对话
        </a-button>
      </div>
      <div class="sidebar-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conv-item"
          :class="{ 'conv-item-active': activeConv === conv.id }"
          @click="activeConv = conv.id"
        >
          <div class="conv-item-title">{{ conv.title }}</div>
          <div class="conv-item-preview">{{ getPreview(conv) }}</div>
          <div class="conv-item-time">{{ getTime(conv) }}</div>
        </div>
      </div>
    </div>

    <!-- Right area: ChatPanel -->
    <div class="copilot-main">
      <ChatPanel :fullscreen="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getConversations } from '@/services/copilotService.js'
import ChatPanel from '@/components/Copilot/ChatPanel.vue'

const conversations = ref([])
const activeConv = ref('')

onMounted(async () => {
  conversations.value = await getConversations() || []
  activeConv.value = conversations.value[0]?.id || ''
})

function getPreview(conv) {
  const lastMsg = conv.messages?.[conv.messages.length - 1]
  if (!lastMsg) return ''
  const text = lastMsg.content || ''
  return text.length > 40 ? text.slice(0, 40) + '...' : text
}

function getTime(conv) {
  const idx = conversations.value.indexOf(conv)
  const offsets = ['2 小时前', '昨天', '3 天前']
  return offsets[idx] || '1 周前'
}

function handleNewChat() {
  activeConv.value = ''
}
</script>

<style scoped>
.copilot-full {
  display: flex;
  height: calc(100vh - 48px);
  margin: -24px;
  background: #fff;
}

.copilot-sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-title);
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conv-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.conv-item:hover {
  background: #f0f5ff;
}

.conv-item-active {
  background: #e6f0ff;
  border: 1px solid rgba(22, 119, 255, 0.2);
}

.conv-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-title);
  margin-bottom: 4px;
}

.conv-item-preview {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.conv-item-time {
  font-size: 11px;
  color: #c0c0c0;
}

.copilot-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
