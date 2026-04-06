<template>
  <div class="relative h-40 w-full rounded-lg border border-slate-200 bg-slate-100">
    <CanvasToolbar :core-only="coreOnly" @update:core-only="coreOnly = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CanvasToolbar from '@/pages/Monitoring/ImpactAssessment/components/CanvasToolbar.vue'

const coreOnly = ref(false)
</script>
