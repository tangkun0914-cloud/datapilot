<template>
  <div
    class="action-bar flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 shrink-0"
  >
    <div class="min-w-0 text-sm text-slate-600">
      <span class="text-slate-500">当前状态：</span>
      <span class="font-medium text-slate-800">{{ statusHint || '—' }}</span>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-2">
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
      <a-button type="primary" size="small" @click="handleWarRoom">
        <template #icon><UsergroupAddOutlined /></template>
        一键拉群
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { UsergroupAddOutlined, PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { createWarRoom } from '@/services/Monitoring/impactService.js'

const props = defineProps({
  eventId: { type: String, default: '' },
  alertTitle: { type: String, default: '' },
  summary: { type: Object, default: null },
  /** 底栏左侧「当前状态」文案 */
  statusHint: { type: String, default: '' },
})

function extractMembers(matrix) {
  if (!matrix?.length) return []
  const out = []
  for (const row of matrix) {
    const name = row.name || ''
    const m = name.match(/\(([^)]+)\)/)
    out.push(m ? m[1] : name.replace(/\s/g, '') || name)
  }
  return [...new Set(out)].filter(Boolean)
}

function handleWarRoom() {
  const members = extractMembers(props.summary?.ownerMatrix)
  Modal.confirm({
    title: '一键拉群',
    content: `将创建故障应急群，并邀请 ${members.length || 0} 位相关责任人（来自责任矩阵）。是否继续？`,
    okText: '创建群聊',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await createWarRoom({
          eventId: props.eventId,
          groupName: `【故障应急】${props.alertTitle || '告警影响评估'}`,
          members,
          reportSnapshot: props.summary ? { ...props.summary } : undefined,
        })
        if (res?.success !== false) {
          message.success(res?.groupId ? `群聊已创建：${res.groupId}` : '群聊创建成功（Mock）')
        }
      } catch {
        message.error('创建失败，请稍后重试')
      }
    },
  })
}
</script>
