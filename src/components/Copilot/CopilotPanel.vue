<template>
  <div class="copilot-panel">
    <div class="copilot-panel-header">
      <div class="panel-header-left">
        <RobotOutlined class="panel-header-icon" />
        <span class="panel-header-title">DataPilot Copilot</span>
      </div>
      <div class="panel-header-actions">
        <a-tooltip title="在新页面打开">
          <ExpandOutlined class="panel-action-btn" @click="openFullPage" />
        </a-tooltip>
        <a-tooltip title="关闭">
          <CloseOutlined class="panel-action-btn" @click="copilotStore.close()" />
        </a-tooltip>
      </div>
    </div>
    <ChatPanel :fullscreen="true" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { RobotOutlined, CloseOutlined, ExpandOutlined } from '@ant-design/icons-vue'
import { useCopilotStore } from '@/stores/copilot.js'
import ChatPanel from './ChatPanel.vue'

const router = useRouter()
const copilotStore = useCopilotStore()

function openFullPage() {
  copilotStore.close()
  router.push('/copilot')
}
</script>

<style scoped>
.copilot-panel {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #e8ecf1;
  height: 100%;
  overflow: hidden;
}

.copilot-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header-icon {
  font-size: 18px;
  color: #1677ff;
}

.panel-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-action-btn {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.panel-action-btn:hover {
  color: #1e293b;
  background: #f1f5f9;
}
</style>
