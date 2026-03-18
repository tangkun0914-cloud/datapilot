<template>
  <a-drawer
    :open="visible"
    :width="420"
    placement="right"
    :header-style="{ padding: '12px 16px' }"
    :body-style="{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }"
    @close="$emit('update:visible', false)"
  >
    <template #title>
      <div class="drawer-title-bar">
        <span class="drawer-title">DataPilot Copilot</span>
        <a class="drawer-open-link" @click="openFullPage">在新页面打开</a>
      </div>
    </template>
    <ChatPanel />
  </a-drawer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ChatPanel from './ChatPanel.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:visible'])

const router = useRouter()

function openFullPage() {
  router.push('/copilot')
}
</script>

<style scoped>
.drawer-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
}

.drawer-open-link {
  font-size: 13px;
  color: var(--color-primary);
  cursor: pointer;
}

.drawer-open-link:hover {
  text-decoration: underline;
}
</style>
