<template>
  <div class="error-log-viewer min-h-[200px]">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <CodeOutlined class="text-slate-400" />
        <span class="text-sm font-bold text-slate-800">{{ title || '报错日志' }}</span>
      </div>
      <a-button type="text" size="small" class="text-slate-400 hover:text-slate-600" @click="copyLog">
        <template #icon><CopyOutlined /></template>
        复制
      </a-button>
    </div>

    <div class="max-h-[min(420px,50vh)] overflow-y-auto rounded-xl border border-slate-200 bg-[#0d1117] p-4 shadow-inner">
      <div v-if="isNodeNoLog" class="flex flex-col items-center justify-center py-12 text-slate-500">
        <InboxOutlined class="text-3xl mb-2 text-slate-600" />
        <span class="text-sm">该节点尚未运行，无日志信息</span>
      </div>
      <pre v-else class="log-pre m-0 text-[13px] leading-relaxed text-slate-300">{{ displayText }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { CodeOutlined, CopyOutlined, InboxOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  alert: { type: Object, default: null },
  selectedNode: { type: Object, default: null },
})

const title = computed(() => props.selectedNode?.taskName || props.alert?.title || '')

const NO_LOG_STATUSES = ['not_generated', 'pending', 'waiting']

const isNodeNoLog = computed(() => {
  const st = props.selectedNode?.impactStatus
  return st && NO_LOG_STATUSES.includes(st)
})

const displayText = computed(() => {
  const n = props.selectedNode
  if (n && isNodeNoLog.value) return ''
  if (n?.errorSummary) {
    const extra = n.taskName ? `任务：${n.taskName}\n` : ''
    return `${extra}${n.errorSummary}\n\n（完整日志由后端日志系统拉取，此处为摘要 Demo）`
  }
  const log = props.alert?.fullLog || props.alert?.logSnippet
  if (log) return log
  return '点击拓扑上的任务节点，可查看对应报错摘要；或等待后端接入完整日志。'
})

function copyLog() {
  if (!displayText.value) return
  navigator.clipboard.writeText(displayText.value)
    .then(() => message.success('日志已复制到剪贴板'))
    .catch(() => message.error('复制失败'))
}
</script>

<style scoped>
.log-pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
