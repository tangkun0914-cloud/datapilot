<template>
  <div class="demo-wrapper">
    <div class="list-container">
      <SessionList
        :sessions="sessions"
        :is-fullscreen="false"
        :viewing-session-id="null"
        @select="handleSelect"
        @delete="handleDelete"
      />
    </div>
    <p class="demo-hint">可交互：搜索/筛选会话、点击卡片、右上角菜单重命名/删除</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import SessionList from '@/components/Copilot/SessionList.vue'
import { INITIAL_SESSIONS } from '@/mock/DataMap/ai.js'

const sessions = ref([...INITIAL_SESSIONS])

function handleSelect(session) {
  message.info(`选中会话：${session.title}`)
}

function handleDelete(session) {
  sessions.value = sessions.value.filter(s => s.id !== session.id)
  message.success(`已删除：${session.title}`)
}
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.list-container {
  width: 360px;
  height: 480px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
