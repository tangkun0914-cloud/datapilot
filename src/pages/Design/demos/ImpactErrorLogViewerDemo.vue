<template>
  <div class="rounded-lg border border-slate-200 bg-white p-4">
    <ErrorLogViewer :alert="alert" :selected-node="selectedNode" />
  </div>
</template>

<script setup>
import ErrorLogViewer from '@/pages/Monitoring/ImpactAssessment/components/ErrorLogViewer.vue'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const selectedNode = {
  id: 'demo-node',
  taskName: 'demo_task_di',
  impactStatus: 'failed',
  errorSummary: 'java.lang.RuntimeException: Mock 报错摘要，用于组件库预览。',
}
</script>
