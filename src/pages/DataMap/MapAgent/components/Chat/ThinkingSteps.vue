<template>
  <div v-if="steps && steps.length > 0" class="flex flex-col gap-1 mb-1 ml-1 mt-1">
    <button
      v-if="collapsible && collapsed"
      type="button"
      class="text-left text-[12px] rounded-md px-2 py-1 -ml-1 transition-colors w-fit border-none cursor-pointer bg-transparent"
      :class="summaryBtnClass"
      @click="collapsed = false"
    >
      {{ summaryCollapsedText }}
    </button>
    <template v-else>
      <div 
        v-for="step in steps" 
        :key="step.id" 
        class="flex items-center gap-2 text-[12px] transition-colors" 
        :class="rowMutedClass"
      >
        <LoadingOutlined v-if="step.status === 'running' && !isStoppedOverall" class="text-[rgba(108,76,155,1)]" />
        <CheckCircleOutlined v-else :class="isStoppedOverall ? 'text-slate-400' : 'text-emerald-500'" />
        <span :class="stepLabelClass(step)">
          {{ step.text }}
        </span>
      </div>
      <button
        v-if="collapsible && !collapsed"
        type="button"
        class="text-[11px] mt-0.5 ml-7 border-none cursor-pointer bg-transparent transition-colors"
        :class="isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'"
        @click="collapsed = true"
      >
        收起
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  steps: { type: Array, default: () => [] },
  isDarkMode: { type: Boolean, default: false },
  /** AI 消息状态：success 时步骤完成后自动折叠；stopped 时灰色 + 中断文案 */
  msgStatus: { type: String, default: '' }
})

const collapsed = ref(false)

const isStoppedOverall = computed(() => props.msgStatus === 'stopped')

const allStepsSuccess = computed(
  () =>
    props.steps.length > 0 &&
    props.steps.every((s) => s.status === 'success' || s.status === 'done')
)

const collapsible = computed(() => {
  if (props.msgStatus === 'success' && allStepsSuccess.value) return true
  if (props.msgStatus === 'stopped') return true
  return false
})

const summaryCollapsedText = computed(() => {
  if (props.msgStatus === 'stopped') return '思考过程已中断'
  const n = props.steps.length
  return `已完成 ${n} 个步骤`
})

const summaryBtnClass = computed(() =>
  props.isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-[#64748b] hover:bg-slate-100'
)

const rowMutedClass = computed(() =>
  isStoppedOverall.value
    ? props.isDarkMode
      ? 'text-slate-500'
      : 'text-slate-400'
    : props.isDarkMode
      ? 'text-slate-400'
      : 'text-[#64748b]'
)

function stepLabelClass(step) {
  if (isStoppedOverall.value) {
    return props.isDarkMode ? 'text-slate-400' : 'text-slate-500'
  }
  if (step.status === 'running') {
    return props.isDarkMode ? 'text-slate-300' : 'text-[#334155]'
  }
  return ''
}

watch(
  () => [props.msgStatus, props.steps],
  () => {
    if (props.msgStatus === 'success' && allStepsSuccess.value) {
      collapsed.value = true
    } else if (props.msgStatus === 'stopped') {
      collapsed.value = true
    } else if (props.msgStatus === 'loading' || props.msgStatus === 'streaming') {
      collapsed.value = false
    }
  },
  { deep: true, immediate: true }
)
</script>
