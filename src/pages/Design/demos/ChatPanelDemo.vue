<template>
  <div class="demo-wrapper">
    <div class="chat-container">
      <div class="chat-header">
        <RobotOutlined class="chat-header-icon" />
        <span class="chat-header-title">DataPilot Copilot</span>
      </div>
      <ChatPanel />
    </div>
    <p class="demo-hint">可交互：点击预设问题卡片、输入自由文本、使用 @ 引用表名</p>
  </div>
</template>

<script setup>
import { RobotOutlined } from '@ant-design/icons-vue'
import ChatPanel from '@/components/Copilot/ChatPanel.vue'
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.chat-container {
  width: 100%;
  height: 480px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  flex-shrink: 0;
}

.chat-header-icon {
  font-size: 18px;
}

.chat-header-title {
  font-size: 14px;
  font-weight: 600;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
