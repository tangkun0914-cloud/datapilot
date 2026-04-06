<template>
  <div class="impact-topology-demo">
    <p class="mb-2 text-xs text-slate-500">Mock 根节点拓扑；可切换「核心链路」开关（与战情室内行为一致）。</p>
    <div class="relative h-[420px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <TopologyCanvas
        v-if="topology"
        :topology="topology"
        :branch-children-of="branchMap"
        :core-only="coreOnly"
        @update:core-only="coreOnly = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TopologyCanvas from '@/pages/Monitoring/ImpactAssessment/TopologyCanvas.vue'
import { mockTopology } from '@/mock/Monitoring/impactAssessment.js'
import { getImpactBranchChildrenMap } from '@/services/Monitoring/impactLazyExpand.js'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const alert = alertList[0]
const topology = ref(mockTopology(alert.id, {}, alert))
const coreOnly = ref(false)
const branchMap = computed(() => getImpactBranchChildrenMap(alert))
</script>
