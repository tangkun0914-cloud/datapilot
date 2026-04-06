<template>
  <div v-if="steps && steps.length > 0" class="flex flex-col gap-1.5 mb-1 ml-1 mt-1">
    <div 
      v-for="step in steps" 
      :key="step.id" 
      class="flex items-center gap-2 text-[12px] transition-colors" 
      :class="isDarkMode ? 'text-slate-400' : 'text-[#64748b]'"
    >
      <LoadingOutlined v-if="step.status === 'running'" class="text-[rgba(108,76,155,1)]" />
      <CheckCircleOutlined v-else class="text-emerald-500" />
      <span :class="step.status === 'running' ? (isDarkMode ? 'text-slate-300' : 'text-[#334155]') : ''">
        {{ step.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'

defineProps({
  steps: { type: Array, default: () => [] },
  isDarkMode: { type: Boolean, default: false }
})
</script>
