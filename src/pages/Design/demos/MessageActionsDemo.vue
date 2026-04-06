<template>
  <div class="demo-wrap">
    <p class="demo-desc">复制、点赞、踩、分享；表详情消息可额外展示「收藏此表」。</p>
    <MessageActions
      :msg-id="1"
      :is-dark-mode="false"
      :action-state="actionState"
      :show-table-favorite="true"
      :table-favorited="tableFav"
      @copy="onCopy"
      @toggle-table-favorite="onToggleFav"
      @like="onLike"
      @dislike="onDislike"
      @share="onShare"
    />
    <p class="hint">{{ log }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageActions from '@/pages/DataMap/MapAgent/components/Chat/MessageActions.vue'

const actionState = ref({})
const tableFav = ref(false)
const log = ref('')

function onCopy() {
  log.value = '触发 copy'
}
function onToggleFav() {
  tableFav.value = !tableFav.value
  log.value = tableFav.value ? '触发 toggleTableFavorite → 已收藏' : '触发 toggleTableFavorite → 已取消'
}
function onLike() {
  actionState.value = { ...actionState.value, like: true, dislike: false }
  log.value = '触发 like'
}
function onDislike() {
  actionState.value = { ...actionState.value, dislike: true, like: false }
  log.value = '触发 dislike（真实页会打开反馈弹窗）'
}
function onShare() {
  log.value = '触发 share（真实页会进入分享多选模式）'
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
</style>
