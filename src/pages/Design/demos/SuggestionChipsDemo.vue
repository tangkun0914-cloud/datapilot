<template>
  <div class="demo-wrap">
    <SuggestionChips
      :suggestions="['查看血缘', '导出为 Markdown', '换一张表试试']"
      :is-dark-mode="false"
      @send="onSend"
    />
    <p v-if="last" class="hint">上次点击：{{ last }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SuggestionChips from '@/pages/DataMap/MapAgent/components/Chat/SuggestionChips.vue'

const last = ref('')
function onSend(text) {
  last.value = text
}
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #64748b;
}
</style>
