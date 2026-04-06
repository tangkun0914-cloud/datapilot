<template>
  <div class="rounded-lg border border-slate-200 bg-slate-50">
    <ActionBar
      :event-id="alert.id"
      :alert-title="alert.title"
      :summary="summary"
      mode="active"
      :alert="alert"
    />
  </div>
</template>

<script setup>
import ActionBar from '@/pages/Monitoring/ImpactAssessment/components/ActionBar.vue'
import { mockSummary } from '@/mock/Monitoring/impactAssessment.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const summary = mockSummary(alert.id, alert)
</script>
