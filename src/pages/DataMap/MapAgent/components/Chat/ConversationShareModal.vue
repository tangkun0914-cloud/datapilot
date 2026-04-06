<template>
  <ShareConfigModal
    v-model:open="open"
    :is-dark-mode="isDarkMode"
    :selected-count="selectedCount"
    @confirm="$emit('confirm', $event)"
  />
</template>

<script setup>
/**
 * 对话分享配置弹窗（业务组件）
 * 多选对话后配置链接有效期并生成分享链接；UI 实现复用老 Agent 的 ShareConfigModal。
 */
import ShareConfigModal from '@/pages/DataMap/Agent/components/Chat/ShareConfigModal.vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
  isDarkMode: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
})

defineEmits(['confirm'])
</script>
