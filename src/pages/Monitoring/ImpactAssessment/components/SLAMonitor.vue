<template>
  <div class="flex h-full min-h-0 flex-col p-2">
    <!-- 过滤与统计栏 -->
    <div class="mb-3 flex shrink-0 items-center gap-2 px-1">
      <a-input
        v-model:value="taskNameKeyword"
        allow-clear
        size="small"
        placeholder="搜索任务名或实例 ID"
        class="flex-1"
      >
        <template #prefix>
          <SearchOutlined class="text-slate-400" />
        </template>
      </a-input>
      <a-select
        v-model:value="ownerFilter"
        mode="multiple"
        allow-clear
        size="small"
        placeholder="负责人"
        class="w-[120px] shrink-0"
        :max-tag-count="1"
        :options="ownerOptions"
      />
      <a-select
        v-model:value="statusFilter"
        mode="multiple"
        allow-clear
        size="small"
        placeholder="SLA状态"
        class="w-[120px] shrink-0"
        :max-tag-count="1"
        :options="STATUS_OPTIONS"
      />
    </div>

    <!-- 卡片式列表展示 SLA (带滚动条) -->
    <div class="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 pb-4">
      <div v-if="!filteredSlaList.length" class="text-center text-sm text-slate-400 py-4 border border-slate-200 rounded-lg border-dashed">
        暂无符合条件的 SLA 预估
      </div>
      <div
        v-for="(item, idx) in filteredSlaList"
        :key="`${item.taskName}-${idx}`"
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all"
      >
        <!-- 第一行：任务名 + 状态标签 -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="font-bold text-[13px] text-slate-800 leading-tight break-words flex-1">
            {{ item.taskName }}
          </div>
          <div class="shrink-0">
            <span v-if="isDualBreach(item)" class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
              <CloseCircleFilled class="text-[10px]" /> SLA双重破线
            </span>
            <span v-else-if="item.isStartBreached" class="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 ring-1 ring-inset ring-orange-500/20">
              <WarningFilled class="text-[10px]" /> SLA启动破线
            </span>
            <span v-else-if="item.isFinishBreached" class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
              <CloseCircleFilled class="text-[10px]" /> SLA完成破线
            </span>
            <span v-else class="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600 ring-1 ring-inset ring-green-500/20">
              <CheckCircleFilled class="text-[10px]" /> 可控
            </span>
          </div>
        </div>

        <!-- 负责人 + 实例 ID -->
        <div class="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span v-if="item.owner" class="flex items-center gap-1">
            <UserOutlined class="text-[10px] text-slate-400" />
            <span class="truncate max-w-[200px]" :title="item.owner">{{ item.owner }}</span>
          </span>
          <span v-if="item.instanceId" class="flex items-center gap-1 font-mono text-slate-600">
            <span class="text-slate-400">实例</span>
            <span :title="item.instanceId">{{ item.instanceId }}</span>
          </span>
        </div>

        <!-- SLA 承诺时间：不展示「预计」——系统无法推算预计完成/启动时间；破线结论见上方标签。可选展示调度回传的实际时间。 -->
        <div
          v-if="hasStartSla(item) || hasFinishSla(item)"
          class="flex flex-col gap-1.5 text-xs bg-slate-50 rounded p-2"
        >
          <div v-if="hasStartSla(item)" class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span class="text-slate-600">
              启动 SLA · 承诺 <span class="font-medium text-slate-800">{{ item.slaStartDeadline }}</span>
            </span>
            <span
              v-if="item.actualStartTime"
              class="text-slate-500"
            >
              实际启动
              <span :class="item.isStartBreached ? 'font-bold text-red-600' : 'font-medium text-slate-700'">
                {{ item.actualStartTime }}
              </span>
            </span>
          </div>
          <div v-if="hasFinishSla(item)" class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span class="text-slate-600">
              完成 SLA · 承诺 <span class="font-medium text-slate-800">{{ item.slaFinishDeadline }}</span>
            </span>
            <span
              v-if="item.actualFinishTime"
              class="text-slate-500"
            >
              实际完成
              <span :class="item.isFinishBreached ? 'font-bold text-red-600' : 'font-medium text-slate-700'">
                {{ item.actualFinishTime }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

function hasStartSla(item) {
  return item.slaStartDeadline != null && item.slaStartDeadline !== ''
}

function hasFinishSla(item) {
  return item.slaFinishDeadline != null && item.slaFinishDeadline !== ''
}

/** 双重破线：两侧均配置了 SLA 且均破线 */
function isDualBreach(item) {
  return hasStartSla(item) && hasFinishSla(item) && item.isStartBreached && item.isFinishBreached
}

const props = defineProps({
  summary: { type: Object, default: null },
})

const taskNameKeyword = ref('')
const ownerFilter = ref([])
const statusFilter = ref([])

const STATUS_OPTIONS = [
  { label: 'SLA双重破线', value: 'dual' },
  { label: 'SLA启动破线', value: 'start' },
  { label: 'SLA完成破线', value: 'finish' },
  { label: '可控', value: 'safe' },
]

const ownerOptions = computed(() => {
  const list = Array.isArray(props.summary?.slaPredictions) ? props.summary.slaPredictions : []
  const owners = new Set()
  list.forEach(item => {
    if (item.owner) owners.add(item.owner)
  })
  return Array.from(owners).map(o => ({ label: o, value: o }))
})

const filteredSlaList = computed(() => {
  const list = Array.isArray(props.summary?.slaPredictions) ? props.summary.slaPredictions : []
  
  const kw = taskNameKeyword.value.trim().toLowerCase()
  
  const filtered = list.filter(item => {
    // 1. 任务名搜索
    if (kw) {
      const name = (item.taskName || '').toLowerCase()
      const inst = (item.instanceId || '').toLowerCase()
      if (!name.includes(kw) && !inst.includes(kw)) {
        return false
      }
    }
    // 2. 负责人过滤
    if (ownerFilter.value.length > 0 && !ownerFilter.value.includes(item.owner)) {
      return false
    }
    // 3. 状态过滤
    if (statusFilter.value.length > 0) {
      let statusValue = 'safe'
      if (isDualBreach(item)) statusValue = 'dual'
      else if (item.isStartBreached) statusValue = 'start'
      else if (item.isFinishBreached) statusValue = 'finish'
      
      if (!statusFilter.value.includes(statusValue)) {
        return false
      }
    }
    return true
  })

  // 排序：双重破线 > 单项破线 > 可控
  return filtered.sort((a, b) => {
    const getScore = (item) => {
      if (isDualBreach(item)) return 4
      if (item.isStartBreached || item.isFinishBreached) return 3
      return 1 // 可控
    }
    const scoreA = getScore(a)
    const scoreB = getScore(b)
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }
    return (a.taskName || '').localeCompare(b.taskName || '')
  })
})
</script>
