<template>
  <a-drawer
    :open="open"
    :width="'90vw'"
    placement="right"
    :z-index="1010"
    root-class-name="impact-assessment-war-room"
    :body-style="drawerBodyStyle"
    @close="$emit('close')"
  >
    <template #title>
      <div class="flex flex-col gap-1.5 py-0.5">
        <div class="flex items-center gap-3">
          <span 
            class="rounded border px-2 py-0.5 text-xs font-bold uppercase"
            :class="alert?.severity === 'ERROR' ? 'border-red-200 bg-red-50 text-red-500' : 'border-orange-200 bg-orange-50 text-orange-500'"
          >
            {{ alert?.severity || 'WARN' }}
          </span>
          <span class="text-lg font-bold text-slate-800">{{ alert?.title || '-' }}</span>
          <span class="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
            来源：{{ alert?.source || '-' }}
          </span>
          <!-- 与告警列表 AlertCard / AlertStatusBadge 同源，避免事件状态文案与样式分叉 -->
          <AlertStatusBadge :status="alertEventStatus" />
          <span class="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
            负责人：{{ alert?.owner || '-' }}
          </span>
        </div>
        <div class="text-xs text-slate-500">
          事件ID: {{ alert?.id || '-' }}
        </div>
      </div>
    </template>
    <div class="war-room-body flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div v-if="loadError && !loading" class="load-error-wrap flex min-h-[320px] flex-1 items-center justify-center px-6 py-10">
        <a-result status="error" title="影响评估数据加载失败" sub-title="请检查网络或稍后重试；Mock 模式请确认已开启 VITE_USE_MOCK。">
          <template #extra>
            <a-button type="primary" @click="retryLoad">重新加载</a-button>
            <a-button class="ml-2" @click="$emit('close')">关闭</a-button>
          </template>
        </a-result>
      </div>
      <div v-else class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div 
          class="topology-col flex h-full min-h-0 min-w-0 flex-col border-b border-slate-200 lg:border-b-0 relative transition-all duration-300"
          :style="isLgScreen ? (isPanelCollapsed ? { flex: '1 1 0%' } : { flex: '0 0 70%', width: '70%' }) : { flex: '1 1 0%' }"
        >
          <!-- 画布与状态区域 -->
          <div class="relative flex-1 min-h-0 w-full">
            <!-- 加载遮罩 -->
            <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
              <a-spin tip="加载拓扑与影响面..." />
            </div>

            <TopologyCanvas
              v-if="topology && !isTopologyEmpty"
              class="absolute inset-0"
              :topology="canvasTopology"
              :branch-children-of="branchChildrenMap"
              :core-only="coreOnly"
              :highlight-node-id="selectedNodeId"
              @update:core-only="onCoreOnly"
              @node-click="onNodeClick"
              @expand-branch="onExpandBranch"
              @collapse-branch="onCollapseBranch"
            />
            
            <div v-else-if="!loading && topology && isTopologyEmpty" class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
              <a-empty description="当前告警暂无下游拓扑节点" />
            </div>
            
            <div v-else-if="!loading && !topology && !loadError" class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
              <a-empty description="暂无拓扑数据" />
            </div>
          </div>
        </div>

        <div class="panel-col flex min-h-0 shrink-0 flex-col border-l border-slate-200 bg-white transition-all duration-300 relative lg:min-h-0 lg:self-stretch"
             :style="isLgScreen ? (isPanelCollapsed ? { flex: '0 0 48px', width: '48px' } : { flex: '0 0 30%', width: '30%' }) : { flex: '1 1 0%' }">
          
          <!-- 折叠/展开控制按钮 -->
          <div v-if="isLgScreen"
               class="absolute -left-3.5 top-6 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-500"
               @click="togglePanel"
               :title="isPanelCollapsed ? '展开面板' : '收起面板'">
            <RightOutlined v-if="isPanelCollapsed" class="text-xs" />
            <LeftOutlined v-else class="text-xs" />
          </div>

          <!-- 展开态内容 -->
          <div v-show="!isPanelCollapsed" class="flex h-full w-full flex-col overflow-hidden">
            <a-spin :spinning="loadingSummary" class="flex min-h-0 flex-1 flex-col" tip="加载统计...">
              <AssessmentPanel
                v-if="summary && !loadError"
                :summary="summary"
                :topology="topology"
                :alert="alert"
                :selected-node-id="selectedNodeId"
                :selected-node="selectedNode"
                :log-focus-nonce="logFocusNonce"
                @select-task="onSelectTask"
              />
              <div v-else-if="!loadingSummary && !summary && !loadError" class="flex min-h-[200px] flex-col items-center justify-center p-6">
                <a-empty description="暂无影响摘要" />
              </div>
            </a-spin>
          </div>

          <!-- 收起态内容 -->
          <div v-show="isPanelCollapsed" class="flex h-full w-full flex-col items-center py-6 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" @click="togglePanel">
            <div class="text-sm tracking-[0.3em] text-slate-500 font-medium" style="writing-mode: vertical-rl;">
              影响评估分析
            </div>
          </div>
        </div>
        </div>
        <ActionBar
          v-if="summary && alert && !loadError"
          :event-id="alert.id || ''"
          :alert-title="alert.title || ''"
          :summary="summary"
          :status-hint="footerStatusHint"
        />
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { RightOutlined, LeftOutlined } from '@ant-design/icons-vue'
import AlertStatusBadge from '../components/AlertStatusBadge.vue'
import TopologyCanvas from './TopologyCanvas.vue'
import AssessmentPanel from './AssessmentPanel.vue'
import ActionBar from './components/ActionBar.vue'
import { getImpactTopology, getImpactSummary } from '@/services/Monitoring/impactService.js'
import {
  expandImpactDirectChildren,
  getImpactBranchChildrenMap,
  materializeFullImpactTopology,
  filterTopologyToCorePaths,
} from '@/services/Monitoring/impactLazyExpand.js'
import { collapseDescendantsBranch } from './impactTopologyLazy.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  alert: { type: Object, default: null },
})

defineEmits(['close'])

/** 告警事件状态：与列表同源字段，缺省时与列表兜底策略一致 */
const alertEventStatus = computed(() => props.alert?.status || 'firing')

/** 底栏「当前状态」提示（偏处置引导；措辞与列表徽章语义一致） */
const footerStatusHint = computed(() => {
  const a = props.alert
  if (!a) return ''
  const st = a.status || 'firing'
  if (st === 'resolved') return '已解决，可关闭评估'
  if (st === 'falsePositive') return '误报，可归档'
  if (st === 'silenced') return '已屏蔽，请关注后续恢复'
  if (st === 'acked') return '处理中，请跟进处置'
  if (st === 'transferred') return '已转交，请等待处理'
  if (st === 'firing' && a.severity === 'ERROR') return '需人工干预'
  if (st === 'firing') return '触发中，建议人工确认'
  return '请根据影响面评估处置'
})

/** 与下方全局样式配合，让 body 在 flex 链里吃满高度，避免拓扑只显示半屏、底部留白 */
const drawerBodyStyle = {
  padding: 0,
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const loading = ref(false)
const loadingSummary = ref(false)
const loadError = ref(false)
const topology = ref(null)
const summary = ref(null)

const isTopologyEmpty = computed(() => {
  const t = topology.value
  if (!t) return false
  const nodes = t.nodes
  if (!Array.isArray(nodes)) return true
  return nodes.length === 0
})
const coreOnly = ref(false)

/** Mock 下由本地子图规范推导 +/−；真实接口可改为 topology.lazyChildrenOf */
const branchChildrenMap = computed(() => {
  if (import.meta.env.VITE_USE_MOCK !== 'true' || !props.alert) {
    return topology.value?.lazyChildrenOf || {}
  }
  return getImpactBranchChildrenMap(props.alert)
})

/** 核心链路开启：在规范子图上物化全量拓扑后再做根→核心关键路径过滤，实现与当前展开态无关的「一键穿透」 */
const canvasTopology = computed(() => {
  const t = topology.value
  if (!t || !coreOnly.value) return t
  const full = materializeFullImpactTopology(t, props.alert, branchChildrenMap.value)
  return filterTopologyToCorePaths(full)
})
const selectedNodeId = ref(null)
const selectedNode = ref(null)
const logFocusNonce = ref(0)

// --- 折叠/展开逻辑 ---
const isLgScreen = ref(window.innerWidth >= 1024)
const isPanelCollapsed = ref(false)

function checkScreen() {
  isLgScreen.value = window.innerWidth >= 1024
}

function togglePanel() {
  isPanelCollapsed.value = !isPanelCollapsed.value
  // 触发 resize 事件，让 G6 画布重新适应宽度
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 300)
}

onMounted(() => {
  window.addEventListener('resize', checkScreen)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})
// --- 逻辑结束 ---

async function loadData() {
  if (!props.alert?.id) return
  loading.value = true
  loadingSummary.value = true
  loadError.value = false
  selectedNodeId.value = null
  selectedNode.value = null
  try {
    const [top, sum] = await Promise.all([
      getImpactTopology(props.alert.id, {}, props.alert),
      getImpactSummary(props.alert.id, props.alert),
    ])
    topology.value = top
    summary.value = sum
  } catch {
    loadError.value = true
    message.error('加载影响评估数据失败')
    topology.value = null
    summary.value = null
  } finally {
    loading.value = false
    loadingSummary.value = false
  }
}

function retryLoad() {
  loadData()
}

function onCoreOnly(v) {
  coreOnly.value = v
  // 纯前端视觉切换，不再重新请求接口
}

function onNodeClick({ nodeId, node }) {
  selectedNodeId.value = nodeId
  selectedNode.value = { ...node }
  logFocusNonce.value += 1
}

function onSelectTask({ taskId, record }) {
  selectedNodeId.value = taskId
  const n = topology.value?.nodes?.find((x) => x.id === taskId)
  selectedNode.value = n
    ? { ...n }
    : {
        id: taskId,
        taskName: record?.taskName,
        owner: record?.owner,
        impactStatus: record?.status || record?.impactStatus,
        errorSummary: '',
      }
}

function onExpandBranch(parentId) {
  if (!props.alert || !topology.value) return
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    topology.value = expandImpactDirectChildren(topology.value, parentId, props.alert)
    return
  }
  message.info('非 Mock 模式需接口按父节点返回子节点后再合并拓扑')
}

function onCollapseBranch(parentId) {
  if (!topology.value) return
  topology.value = collapseDescendantsBranch(topology.value, parentId)
}

watch(
  () => [props.open, props.alert?.id],
  ([isOpen, eventId]) => {
    if (isOpen && eventId) {
      loadData()
    }
    if (!isOpen) {
      topology.value = null
      summary.value = null
      loadError.value = false
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.topology-col {
  transition: flex 0.1s ease-out;
}

.drag-divider {
  width: 8px;
  margin: 0 -4px;
  cursor: col-resize;
  z-index: 10;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-divider:hover,
.drag-divider:active {
  background-color: #f1f5f9;
}

.topology-col :deep(.topology-spin.ant-spin-nested-loading) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.topology-col :deep(.topology-spin .ant-spin-container) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

/* 右栏 a-spin 与 AssessmentPanel 同链，否则内部 h-full / flex-1 会塌成 0 */
.panel-col :deep(.ant-spin-nested-loading) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.panel-col :deep(.ant-spin-container) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.panel-col :deep(.impact-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.panel-col :deep(.impact-tabs > .ant-tabs-content-holder) {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-col :deep(.impact-tabs > .ant-tabs-content-holder > .ant-tabs-content) {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-col :deep(.impact-tabs .ant-tabs-tabpane) {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-col :deep(.tab-body) {
  flex: 1;
  min-height: 160px;
  min-width: 0;
}
</style>

<!-- 覆盖 Ant Drawer 默认：content overflow:auto 导致内部 flex 无法撑满视口，拓扑画布被压成「半屏」、底部大块白底 -->
<style>
.ant-drawer.impact-assessment-war-room .ant-drawer-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ant-drawer.impact-assessment-war-room .ant-drawer-wrapper-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.ant-drawer.impact-assessment-war-room .ant-drawer-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 0 !important;
}

/* 小屏纵向堆叠时允许整体滚动，避免内容被裁切 */
@media (max-width: 1023px) {
  .ant-drawer.impact-assessment-war-room .ant-drawer-body {
    overflow-y: auto;
  }
}
</style>
