<template>
  <div class="assessment-panel flex h-full min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
    <!-- AI 智能分析卡片 -->
    <div class="ai-summary shrink-0 bg-white p-4 pb-0">
      <div class="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div class="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-purple-500/10 blur-xl"></div>
        
        <div class="relative flex items-start gap-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center">
            <CopilotAiAvatar :size="24" />
          </div>
          <div class="flex-1 pt-0.5">
            <div class="mb-1.5 flex items-center gap-2">
              <span class="text-sm font-bold text-indigo-900">AI 智能分析</span>
              <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">Beta</span>
            </div>
            <!-- 加载中：骨架屏 -->
            <div v-if="aiStatus === 'loading'" class="space-y-2">
              <a-skeleton :paragraph="{ rows: 2 }" :title="false" active />
              <span class="text-xs text-slate-400">AI 分析生成中...</span>
            </div>
            <!-- 超时不可用 -->
            <div v-else-if="aiStatus === 'failed'" class="text-[13px] text-slate-400">
              AI 分析暂时不可用
            </div>
            <!-- 正常展示 -->
            <div v-else class="text-[13px] leading-relaxed text-slate-700">
              {{ aiDisplayText }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex min-h-0 flex-1 flex-col p-4 pt-3">
      <div class="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <a-tabs
          v-model:activeKey="activeKey"
          class="impact-tabs min-h-0 flex-1"
          :tab-bar-style="{ marginBottom: 0, paddingLeft: '16px', paddingRight: '16px' }"
        >
          <a-tab-pane key="stats" tab="统计评估">
            <div class="tab-body overflow-y-auto p-4">
              <StatsAndSLA :summary="summary" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="sla" tab="SLA 监控状态">
            <div class="tab-body overflow-y-auto p-4">
              <SLAMonitor :summary="summary" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="list" tab="全局影响清单">
            <div class="tab-body overflow-y-auto">
              <GlobalImpactList
                :summary="summary"
                :topology="topology"
                :selected-node-id="selectedNodeId"
                @select-task="(p) => $emit('select-task', p)"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="log" tab="日志详情">
            <div class="tab-body overflow-y-auto p-4">
              <ErrorLogViewer :alert="alert" :selected-node="selectedNode" />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import GlobalImpactList from './components/GlobalImpactList.vue'
import StatsAndSLA from './components/StatsAndSLA.vue'
import SLAMonitor from './components/SLAMonitor.vue'
import ErrorLogViewer from './components/ErrorLogViewer.vue'
import CopilotAiAvatar from '@/components/Copilot/CopilotAiAvatar.vue'
import { getAiAnalysis } from '@/services/Monitoring/impactService.js'

const props = defineProps({
  summary: { type: Object, default: null },
  topology: { type: Object, default: null },
  alert: { type: Object, default: null },
  selectedNodeId: { type: String, default: null },
  selectedNode: { type: Object, default: null },
  logFocusNonce: { type: Number, default: 0 },
})

defineEmits(['select-task'])

const activeKey = ref('stats')

watch(
  () => props.logFocusNonce,
  (n) => {
    if (n > 0) activeKey.value = 'log'
  }
)

const AI_POLL_INTERVAL = 3000
const AI_POLL_MAX = 10

const aiStatus = ref('loading')
const aiData = ref(null)
let pollTimer = null
let pollCount = 0

const aiDisplayText = computed(() => {
  if (aiData.value) {
    const d = aiData.value
    return [d.impactJudgment, d.impactConclusion, d.suggestion].filter(Boolean).join('\n')
  }
  const s = props.summary
  if (s?.aiAnalysis && typeof s.aiAnalysis === 'string') return s.aiAnalysis
  if (s?.aiAnalysis?.impactJudgment) {
    const d = s.aiAnalysis
    return [d.impactJudgment, d.impactConclusion, d.suggestion].filter(Boolean).join('\n')
  }
  return `当前任务 ${props.alert?.title || '-'} 异常，导致下游 ${s?.totalAffectedNodes || 0} 个任务受影响。其中 ${s?.highRiskNodes || 0} 个核心任务存在风险。建议立即联系相关负责人协同处理。`
})

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function fetchAi() {
  const eventId = props.alert?.id
  if (!eventId) return
  try {
    const res = await getAiAnalysis(eventId)
    if (res?.status === 'ready') {
      aiStatus.value = 'ready'
      aiData.value = res
      stopPolling()
      return
    }
    if (res?.status === 'failed') {
      aiStatus.value = 'failed'
      stopPolling()
      return
    }
  } catch {
    // 网络错误不终止轮询
  }
  pollCount++
  if (pollCount >= AI_POLL_MAX) {
    aiStatus.value = 'failed'
    stopPolling()
  }
}

function startPolling() {
  stopPolling()
  pollCount = 0
  aiStatus.value = 'loading'
  aiData.value = null
  fetchAi()
  pollTimer = setInterval(fetchAi, AI_POLL_INTERVAL)
}

watch(
  () => props.alert?.id,
  (id) => {
    if (id) startPolling()
    else stopPolling()
  },
  { immediate: true }
)

onUnmounted(() => {
  stopPolling()
})
</script>
