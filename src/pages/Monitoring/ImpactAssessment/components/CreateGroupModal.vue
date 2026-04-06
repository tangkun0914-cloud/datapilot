<template>
  <a-modal
    :open="open"
    title="创建故障应急群"
    :confirm-loading="creating"
    ok-text="确认创建"
    cancel-text="取消"
    @ok="handleConfirm"
    @cancel="$emit('cancel')"
    :width="480"
  >
    <div class="space-y-4 py-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">群名称</label>
        <a-input v-model:value="groupName" placeholder="请输入群名称" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">
          邀请成员（{{ checkedMembers.length }}/{{ memberOptions.length }}）
        </label>
        <a-select
          v-model:value="checkedMembers"
          mode="multiple"
          :options="memberOptions"
          option-filter-prop="label"
          show-search
          allow-clear
          placeholder="请选择邀请成员"
          :max-tag-count="3"
          class="member-select mt-1 w-full"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createWarRoom } from '@/services/Monitoring/impactService.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  alert: { type: Object, default: null },
  ownerMatrix: { type: Array, default: () => [] },
})

const emit = defineEmits(['confirm', 'cancel'])

const creating = ref(false)

const defaultGroupName = computed(() => {
  const a = props.alert
  if (!a) return '【故障应急】告警影响评估'
  const event = a.monitorEvent || ''
  return `【故障应急】${a.title || ''} ${event}`.trim()
})

const groupName = ref('')

/** 下拉项：label 展示 姓名(邮箱前缀)，value 为邮箱前缀（与 createWarRoom members 一致） */
const memberOptions = computed(() => {
  if (!props.ownerMatrix?.length) return []
  const seen = new Set()
  const list = []
  for (const row of props.ownerMatrix) {
    const raw = (row.name || '').trim()
    const m = raw.match(/^(.+?)\(([^)]+)\)\s*$/)
    const prefix = m ? m[2].trim() : raw.replace(/\s/g, '') || raw
    const displayName = m ? raw : raw || prefix
    if (!prefix || seen.has(prefix)) continue
    seen.add(prefix)
    list.push({ value: prefix, label: displayName })
  }
  return list
})

const checkedMembers = ref([])

watch(
  () => props.open,
  (v) => {
    if (v) {
      groupName.value = defaultGroupName.value
      checkedMembers.value = memberOptions.value.map((o) => o.value)
    }
  }
)

async function handleConfirm() {
  if (!checkedMembers.value.length) {
    message.warning('请至少选择一位成员')
    return
  }
  creating.value = true
  try {
    const res = await createWarRoom({
      eventId: props.alert?.id || '',
      groupName: groupName.value,
      members: checkedMembers.value,
      reportSnapshot: undefined,
    })
    if (res?.alreadyExists) {
      message.warning('当前告警已创建应急群，请勿重复创建')
      emit('cancel')
      return
    }
    if (res?.success !== false) {
      const link = res?.groupLink
      message.success(link ? `应急群创建成功` : '群聊创建成功（Mock）')
      emit('confirm', res)
    }
  } catch {
    message.error('创建失败，请稍后重试')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.member-select :deep(.ant-select-selector) {
  width: 100%;
}
</style>
