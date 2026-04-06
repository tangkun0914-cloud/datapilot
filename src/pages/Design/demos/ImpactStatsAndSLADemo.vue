<template>
  <div class="max-h-[480px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
    <StatsAndSLA :summary="summary" />
  </div>
</template>

<script setup>
import StatsAndSLA from '@/pages/Monitoring/ImpactAssessment/components/StatsAndSLA.vue'
import { mockSummary } from '@/mock/Monitoring/impactAssessment.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const summary = mockSummary(alert.id, alert)
</script>
