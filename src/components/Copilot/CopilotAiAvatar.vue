<template>
  <!-- AI 回复头像：DataPilot PilotLogo（与侧栏 Copilot 品牌一致，rgba(108,76,155) 渐变） -->
  <span class="copilot-ai-avatar" aria-hidden="true">
    <PilotLogo :size="size" />
  </span>
</template>

<script setup>
import PilotLogo from './PilotLogo.vue'

defineOptions({ name: 'CopilotAiAvatar' })

defineProps({
  size: { type: Number, default: 28 },
})
</script>

<style scoped>
.copilot-ai-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}
</style>
