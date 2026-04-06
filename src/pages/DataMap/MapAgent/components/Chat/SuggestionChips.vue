<template>
  <div v-if="suggestions && suggestions.length > 0" class="mt-4 pt-3 border-t transition-colors duration-300" :class="isDarkMode ? 'border-slate-800' : 'border-slate-100'">
    <div class="text-[12px] mb-2.5 flex items-center gap-1.5" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
      <BulbOutlined /> 
      <span>您可以继续问我：</span>
    </div>
    <div class="flex flex-col gap-2">
      <div 
        v-for="(sug, sIdx) in suggestions" 
        :key="sIdx"
        @click="$emit('send', sug)"
        class="text-[14px] cursor-pointer flex items-start gap-2 group w-fit transition-colors duration-200"
        :class="isDarkMode ? 'text-slate-300 hover:text-[rgba(168,140,210,1)]' : 'text-slate-600 hover:text-[rgba(108,76,155,1)]'"
      >
        <div class="mt-[7px] w-1 h-1 rounded-full shrink-0 transition-colors duration-200"
             :class="isDarkMode ? 'bg-slate-600 group-hover:bg-[rgba(168,140,210,1)]' : 'bg-slate-300 group-hover:bg-[rgba(108,76,155,1)]'">
        </div>
        <span class="leading-relaxed">{{ sug }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BulbOutlined } from '@ant-design/icons-vue'

defineProps({
  suggestions: { type: Array, default: () => [] },
  isDarkMode: { type: Boolean, default: false }
})

defineEmits(['send'])
</script>
