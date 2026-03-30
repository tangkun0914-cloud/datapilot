<template>
  <div class="demo-wrapper">
    <div class="panel-container">
      <CopilotPanel />
    </div>
    <p class="demo-hint">可交互：切换 chat/list 视图、点击会话卡片、新建对话、发送消息</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CopilotPanel from '@/components/Copilot/CopilotPanel.vue'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'

const copilotStore = useCopilotStore()
onMounted(() => {
  copilotStore.visible = true
})
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.panel-container {
  width: 420px;
  height: 560px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
