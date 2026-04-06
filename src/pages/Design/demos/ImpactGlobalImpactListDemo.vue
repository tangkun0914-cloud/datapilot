<template>
  <div class="h-[400px] rounded-lg border border-slate-200 bg-white">
    <GlobalImpactList
      :summary="summary"
      :topology="topology"
      :selected-node-id="null"
    />
  </div>
</template>

<script setup>
import GlobalImpactList from '@/pages/Monitoring/ImpactAssessment/components/GlobalImpactList.vue'
import { mockTopology, mockSummary } from '@/mock/Monitoring/impactAssessment.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const topology = mockTopology(alert.id, {}, alert)
const summary = mockSummary(alert.id, alert)
</script>
