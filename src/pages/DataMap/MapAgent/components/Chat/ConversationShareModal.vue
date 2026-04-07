<template>
  <ShareConfigModal
    v-model:open="open"
    :is-dark-mode="isDarkMode"
    :selected-count="selectedCount"
    @confirm="onConfirm"
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

const emit = defineEmits(['confirm'])

/** script setup 模板中不能使用 $emit，须显式 emit，否则父组件收不到 confirm */
const onConfirm = (payload) => {
  emit('confirm', payload)
}
</script>
