<template>
  <div>
    <a-button type="primary" @click="open = true">打开一键拉群确认弹窗</a-button>
    <CreateGroupModal
      :open="open"
      :alert="alert"
      :owner-matrix="summary?.ownerMatrix || []"
      @confirm="open = false"
      @cancel="open = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CreateGroupModal from '@/pages/Monitoring/ImpactAssessment/components/CreateGroupModal.vue'
import { mockSummary } from '@/mock/Monitoring/impactAssessment.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const open = ref(false)
const alert = alertList[0]
const summary = mockSummary(alert.id, alert)
</script>
