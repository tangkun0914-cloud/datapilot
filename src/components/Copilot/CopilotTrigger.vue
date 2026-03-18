<template>
  <a-tooltip title="AI Copilot" placement="left">
    <button class="copilot-trigger" @click="$emit('click')">
      <RobotOutlined />
    </button>
  </a-tooltip>
</template>

<script setup>
import { RobotOutlined } from '@ant-design/icons-vue'

defineEmits(['click'])
</script>

<style scoped>
.copilot-trigger {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.35);
  transition: all 0.3s ease;
}

.copilot-trigger:hover {
  background: #4096ff;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.45);
  transform: scale(1.08);
}

.copilot-trigger:active {
  transform: scale(0.95);
}
</style>
