<template>
  <!-- 对齐 data-agent CopilotContent.jsx：copilot-ui 壳 + copilot-header（ThunderboltFilled 品牌区） -->
  <div class="copilot-ui">
    <div class="copilot-header">
      <div class="copilot-header-left">
        <template v-if="copilotStore.viewMode === 'list'">
          <a-button type="text" size="small" class="copilot-back-btn" @click="copilotStore.switchToChat()">
            <template #icon><LeftOutlined /></template>
          </a-button>
          <span class="copilot-header-title">会话列表</span>
        </template>
        <template v-else>
          <ThunderboltFilled class="copilot-header-brand-icon" />
          <span class="copilot-header-title">DataPilot Copilot</span>
        </template>
      </div>
      <div class="copilot-header-actions">
        <a-tooltip title="全屏模式">
          <FullscreenOutlined class="copilot-header-icon" @click="openFullPage" />
        </a-tooltip>
        <a-tooltip title="会话管理">
          <HistoryOutlined
            class="copilot-header-icon"
            :class="{ 'is-active': copilotStore.viewMode === 'list' }"
            @click="copilotStore.toggleViewMode()"
          />
        </a-tooltip>
        <a-tooltip title="新建对话">
          <PlusOutlined class="copilot-header-icon" @click="handleNewChat" />
        </a-tooltip>
        <a-tooltip title="关闭">
          <CloseOutlined class="copilot-header-icon" @click="copilotStore.close()" />
        </a-tooltip>
      </div>
    </div>

    <SessionList
      v-if="copilotStore.viewMode === 'list'"
      :sessions="copilotStore.sessions"
      :is-fullscreen="false"
      :viewing-session-id="copilotStore.viewingSessionId"
      @select="copilotStore.selectSession($event)"
      @delete="copilotStore.deleteSession($event)"
      @rename="copilotStore.renameSession"
    />
    <!-- 对话区 AI 消息头像：ChatPanel 内 CopilotAiAvatar → PilotLogo 28px -->
    <ChatPanel v-else :fullscreen="false" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  CloseOutlined, FullscreenOutlined, HistoryOutlined,
  PlusOutlined, LeftOutlined, ThunderboltFilled,
} from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'
import ChatPanel from './ChatPanel.vue'
import SessionList from './SessionList.vue'

const router = useRouter()
const copilotStore = useCopilotStore()

function openFullPage() {
  copilotStore.close()
  router.push('/copilot')
}

function handleNewChat() {
  copilotStore.newChat()
}
</script>

<style scoped>
/* shared.css — .copilot-ui / .copilot-header 语义，侧栏固定宽度 */
.copilot-ui {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 420px;
  flex-shrink: 0;
  background: #fff;
  border-left: 1px solid #e8ecf1;
  overflow: hidden;
  position: relative;
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
  line-height: 1.2;
}

.copilot-back-btn {
  padding: 0 4px;
}

.copilot-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* 与原型 Space size={16} + 图标 15px/#666 一致 */
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

.copilot-header-icon.is-active {
  color: #fff;
  background: rgba(108, 76, 155);
}

.copilot-header-icon.is-active:hover {
  color: #fff;
  background: rgba(108, 76, 155, 0.88);
}
</style>
