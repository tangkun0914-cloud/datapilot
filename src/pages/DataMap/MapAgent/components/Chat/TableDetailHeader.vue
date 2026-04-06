<template>
  <div
    class="w-full rounded-xl border px-4 py-3 transition-colors duration-300"
    :class="
      isDarkMode
        ? 'border-slate-600/80 bg-slate-800/60 ring-1 ring-white/5'
        : 'border-slate-200 bg-slate-50/90 ring-1 ring-slate-100'
    "
  >
    <div class="min-w-0 space-y-1">
      <div
        class="font-mono text-sm font-semibold leading-snug break-all"
        :class="isDarkMode ? 'text-slate-100' : 'text-slate-900'"
      >
        {{ displayFqn }}
      </div>
      <div class="text-sm font-medium" :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'">
        {{ detail.cnName }}
      </div>
      <div class="text-xs" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
        负责人：{{ detail.owner }}
      </div>
      <div
        class="text-sm leading-relaxed pt-0.5"
        :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'"
      >
        {{ detail.description }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { stripLeadingAtForFqn } from '@/utils/fqnDisplay.js'

const props = defineProps({
  detail: {
    type: Object,
    required: true
  },
  isDarkMode: { type: Boolean, default: false }
})

const displayFqn = computed(() => stripLeadingAtForFqn(props.detail?.fqn))
</script>
