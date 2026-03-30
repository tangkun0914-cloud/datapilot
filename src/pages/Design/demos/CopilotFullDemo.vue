<template>
  <div class="demo-wrapper">
    <div class="full-container">
      <CopilotFull />
    </div>
    <p class="demo-hint">可交互：左侧会话列表点击切换、新建对话、右侧发送消息、退出全屏（会跳转首页）</p>
  </div>
</template>

<script setup>
import CopilotFull from '@/components/Copilot/CopilotFull.vue'
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.full-container {
  width: 100%;
  height: 560px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.full-container :deep(.copilot-full) {
  position: absolute;
  height: 100%;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
