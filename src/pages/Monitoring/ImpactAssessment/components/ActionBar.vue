<template>
  <div
    v-if="mode !== 'snapshot'"
    class="action-bar flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 shrink-0"
  >
    <a-tooltip title="该功能将在后续版本支持">
      <a-button size="small" disabled>
        <template #icon><PauseCircleOutlined /></template>
        一键挂起
      </a-button>
    </a-tooltip>
    <a-tooltip title="该功能将在后续版本支持">
      <a-button size="small" disabled>
        <template #icon><ReloadOutlined /></template>
        级联重跑
      </a-button>
    </a-tooltip>
    <a-tooltip title="该功能将在后续版本支持">
      <a-button size="small" danger disabled>
        <template #icon><CheckCircleOutlined /></template>
        一键置成功
      </a-button>
    </a-tooltip>
    <a-button type="primary" size="small" :loading="checkingGroup" @click="handleWarRoom">
      <template #icon><UsergroupAddOutlined /></template>
      一键拉群
    </a-button>

    <CreateGroupModal
      :open="groupModalOpen"
      :alert="alertObj"
      :owner-matrix="summary?.ownerMatrix || []"
      @confirm="onGroupCreated"
      @cancel="groupModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UsergroupAddOutlined, PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { createWarRoom } from '@/services/Monitoring/impactService.js'
import CreateGroupModal from './CreateGroupModal.vue'

const props = defineProps({
  eventId: { type: String, default: '' },
  alertTitle: { type: String, default: '' },
  summary: { type: Object, default: null },
  mode: { type: String, default: 'active' },
  alert: { type: Object, default: null },
})

const alertObj = computed(() => props.alert || { id: props.eventId, title: props.alertTitle })

const checkingGroup = ref(false)
const groupModalOpen = ref(false)

async function handleWarRoom() {
  checkingGroup.value = true
  try {
    const res = await createWarRoom({
      eventId: props.eventId,
      groupName: '',
      members: [],
      checkOnly: true,
    })
    if (res?.alreadyExists) {
      message.warning('当前告警已创建应急群，请勿重复创建')
      return
    }
  } catch {
    // 检查失败不阻塞，继续弹窗
  } finally {
    checkingGroup.value = false
  }
  groupModalOpen.value = true
}

function onGroupCreated() {
  groupModalOpen.value = false
}
</script>
