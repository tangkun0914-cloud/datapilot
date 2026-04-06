<template>
  <div class="h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
    <AssessmentPanel
      :summary="summary"
      :topology="topology"
      :alert="alert"
      :selected-node-id="null"
      :selected-node="null"
      :log-focus-nonce="0"
    />
  </div>
</template>

<script setup>
import AssessmentPanel from '@/pages/Monitoring/ImpactAssessment/AssessmentPanel.vue'
import { mockTopology, mockSummary } from '@/mock/Monitoring/impactAssessment.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const topology = mockTopology(alert.id, {}, alert)
const summary = mockSummary(alert.id, alert)
</script>
