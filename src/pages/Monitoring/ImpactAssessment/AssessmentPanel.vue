<template>
  <div class="assessment-panel flex h-full min-h-0 min-w-0 flex-1 flex-col bg-slate-50">
    <!-- AI 智能分析卡片 -->
    <div class="ai-summary shrink-0 bg-white p-4 pb-0">
      <div class="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div class="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-purple-500/10 blur-xl"></div>
        
        <div class="relative flex items-start gap-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <RobotOutlined class="text-lg" />
          </div>
          <div class="flex-1 pt-0.5">
            <div class="mb-1.5 flex items-center gap-2">
              <span class="text-sm font-bold text-indigo-900">AI 智能分析</span>
              <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">Beta</span>
            </div>
            <div class="text-[13px] leading-relaxed text-slate-700">
              {{ summary?.aiAnalysis || `当前任务 ${alert?.title || '-'} 运行失败，导致下游 ${summary?.totalAffectedNodes || 0} 个任务因依赖缺失无法触发，处于"依赖等待"状态。其中 ${summary?.highRiskNodes || 0} 个核心任务受影响，存在 SLA 破线风险。建议立即联系相关负责人协同处理。` }}
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
import { ref, watch } from 'vue'
import { RobotOutlined } from '@ant-design/icons-vue'
import GlobalImpactList from './components/GlobalImpactList.vue'
import StatsAndSLA from './components/StatsAndSLA.vue'
import ErrorLogViewer from './components/ErrorLogViewer.vue'

const props = defineProps({
  summary: { type: Object, default: null },
  topology: { type: Object, default: null },
  alert: { type: Object, default: null },
  selectedNodeId: { type: String, default: null },
  selectedNode: { type: Object, default: null },
  /** 递增时切换到「日志详情」Tab（拓扑节点点击） */
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
</script>
