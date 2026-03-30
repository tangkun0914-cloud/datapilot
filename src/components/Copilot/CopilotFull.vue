<template>
  <div class="copilot-full">
    <!-- 左侧：会话列表 -->
    <div class="copilot-sidebar">
      <div class="copilot-header copilot-header--sidebar">
        <div class="copilot-header-left">
          <HistoryOutlined class="copilot-header-brand-icon" />
          <span class="copilot-header-title">会话列表</span>
        </div>
        <a-tooltip title="新建对话">
          <PlusOutlined class="copilot-header-icon" @click="handleNewChat" />
        </a-tooltip>
      </div>
      <SessionList
        :sessions="copilotStore.sessions"
        :is-fullscreen="true"
        :viewing-session-id="copilotStore.viewingSessionId"
        @select="copilotStore.selectSession($event)"
        @delete="copilotStore.deleteSession($event)"
        @rename="copilotStore.renameSession"
      />
    </div>

    <!-- 右侧：聊天区 -->
    <div class="copilot-main">
      <div class="copilot-header copilot-header--main">
        <div class="copilot-header-left">
          <ThunderboltFilled class="copilot-header-brand-icon" />
          <span class="copilot-header-title">{{ copilotStore.currentSessionTitle }}</span>
        </div>
        <div class="copilot-header-actions">
          <a-tooltip title="退出全屏">
            <FullscreenExitOutlined class="copilot-header-icon" @click="exitFullscreen" />
          </a-tooltip>
          <a-tooltip title="关闭">
            <CloseOutlined class="copilot-header-icon" @click="exitFullscreen" />
          </a-tooltip>
        </div>
      </div>
      <ChatPanel :fullscreen="true" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  PlusOutlined, HistoryOutlined, ThunderboltFilled,
  FullscreenExitOutlined, CloseOutlined,
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'
import ChatPanel from './ChatPanel.vue'
import SessionList from './SessionList.vue'

const router = useRouter()
const copilotStore = useCopilotStore()

function handleNewChat() {
  copilotStore.newChat()
}

function exitFullscreen() {
  router.push('/')
  copilotStore.open()
}
</script>

<style scoped>
/* 对齐 CopilotContent.jsx + shared.css：split-layout / copilot-header 40px */
.copilot-full {
  display: flex;
  height: calc(100vh - 64px);
  background: #fff;
  margin: -24px; /* 抵消 app-content 的 24px padding，使其填满内容区 */
}

.copilot-sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
}

.copilot-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

.copilot-header {
  height: 40px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  box-sizing: border-box;
}

.copilot-header--sidebar {
  border-right: 1px solid #f0f0f0;
}

.copilot-header--main {
  padding: 0 16px 0 24px;
}

.copilot-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.copilot-header-brand-icon {
  color: #fff;
  background: rgba(108, 76, 155);
  font-size: 14px;
  padding: 3px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.copilot-header-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copilot-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.copilot-header-icon {
  font-size: 15px;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}

.copilot-header-icon:hover {
  color: #333;
  background: #f5f5f5;
}
</style>
