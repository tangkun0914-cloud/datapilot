<template>
  <div class="demo-wrap">
    <p class="demo-desc">多选对话后的分享配置：展示已选组数、选择链接有效期、生成并复制链接（Demo 仅关闭弹窗）。</p>
    <a-button type="primary" class="agent-share-primary" @click="open = true">打开对话分享配置弹窗</a-button>
    <ConversationShareModal
      v-model:open="open"
      :is-dark-mode="false"
      :selected-count="3"
      @confirm="onConfirm"
    />
    <p v-if="lastExpire" class="hint">上次确认的有效期：{{ lastExpire }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConversationShareModal from '@/pages/DataMap/MapAgent/components/Chat/ConversationShareModal.vue'

const open = ref(false)
const lastExpire = ref('')

function onConfirm({ expire }) {
  lastExpire.value = expire
  open.value = false
}
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
.demo-desc {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 12px;
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}
.agent-share-primary {
  background-color: rgba(108, 76, 155, 1) !important;
  border-color: rgba(108, 76, 155, 1) !important;
}
</style>
