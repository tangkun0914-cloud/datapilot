<template>
  <div class="demo-wrapper">
    <HeroBanner @open-copilot="onCopilot" />
    <div v-if="copilotTriggered" class="demo-toast">
      Copilot 已触发（在组件库中不实际弹出面板）
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeroBanner from '@/pages/Home/HeroBanner.new.vue'

const copilotTriggered = ref(false)

function onCopilot() {
  copilotTriggered.value = true
  setTimeout(() => { copilotTriggered.value = false }, 2000)
}
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
  margin: -24px;
  overflow: hidden;
  border-radius: 8px;
}

.demo-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 10px 20px;
  background: #0f172a;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
</style>
