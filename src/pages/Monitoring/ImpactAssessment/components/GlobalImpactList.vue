<template>
  <div class="global-impact-list flex flex-col h-full p-2">
    <!-- 过滤与统计栏 -->
    <div class="mb-3 flex shrink-0 items-center justify-between px-1">
      <span class="text-xs font-medium text-slate-500">共 {{ totalCount }} 项</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-600">仅看核心任务</span>
        <a-switch v-model:checked="filterCoreOnly" size="small" />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto min-h-[120px]">
      <!-- 实例模式卡片列表 -->
      <template v-if="isInstanceMode">
        <div v-if="!paginatedInstanceRows.length" class="py-10 text-center text-sm text-slate-400">暂无下游任务实例</div>
        <div
          v-for="record in paginatedInstanceRows"
          :key="record.instanceId"
          class="impact-card group mb-2 cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
          :class="{ 'ring-2 ring-indigo-500/20 border-indigo-400 bg-indigo-50/30': isSelected(record) }"
          @click="handleSelect(record)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="text-[13px] font-bold leading-snug text-slate-800 break-words">
                {{ record.taskName }}
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600" title="实例 ID">
                  {{ record.instanceId }}
                </span>
                <span class="flex items-center gap-1">
                  <ClockCircleOutlined class="text-[10px]" /> {{ record.scheduleBatch }}
                </span>
                <span class="flex items-center gap-1">
                  <UserOutlined class="text-[10px]" /> {{ record.owner }}
                </span>
                <span
                  v-if="record.isDqcErrorBlocked"
                  class="rounded bg-[#fff1f0] px-1.5 py-0.5 text-[10px] font-medium text-[#cf1322] ring-1 ring-inset ring-[#ffa39e]"
                >
                  阻断
                </span>
                <span v-if="record.isCore" class="rounded bg-[#e6f4ff] px-1.5 py-0.5 text-[10px] font-medium text-[#1677ff] ring-1 ring-inset ring-[#91caff]">
                  核心任务
                </span>
                <span v-if="record.isPolluted" class="rounded bg-[#F9F0FF] px-1.5 py-0.5 text-[10px] font-medium text-[#722ED1] ring-1 ring-inset ring-[#D3ADF7]">
                  ☣ 可能污染
                </span>
              </div>
            </div>
            <div class="shrink-0 pt-0.5">
              <a-tag :color="getStatusColor(record.status)" class="m-0 border-0 font-medium">
                {{ getStatusText(record.status) }}
              </a-tag>
            </div>
          </div>
        </div>
      </template>

      <!-- 任务模式卡片列表 -->
      <template v-else>
        <div v-if="!paginatedTaskRows.length" class="py-10 text-center text-sm text-slate-400">暂无拓扑任务节点（请确认已加载拓扑）</div>
        <div
          v-for="record in paginatedTaskRows"
          :key="record.id"
          class="impact-card group mb-2 cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
          :class="{ 'ring-2 ring-indigo-500/20 border-indigo-400 bg-indigo-50/30': isSelected(record) }"
          @click="handleSelect(record)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="text-[13px] font-bold leading-snug text-slate-800 break-words">
                {{ record.taskName }}
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                  {{ record.taskType }}
                </span>
                <span class="flex items-center gap-1">
                  <UserOutlined class="text-[10px]" /> {{ record.owner }}
                </span>
                <span
                  v-if="record.isDqcErrorBlocked"
                  class="rounded bg-[#fff1f0] px-1.5 py-0.5 text-[10px] font-medium text-[#cf1322] ring-1 ring-inset ring-[#ffa39e]"
                >
                  阻断
                </span>
                <span v-if="record.isCore" class="rounded bg-[#e6f4ff] px-1.5 py-0.5 text-[10px] font-medium text-[#1677ff] ring-1 ring-inset ring-[#91caff]">
                  核心任务
                </span>
                <span v-if="record.isPolluted" class="rounded bg-[#F9F0FF] px-1.5 py-0.5 text-[10px] font-medium text-[#722ED1] ring-1 ring-inset ring-[#D3ADF7]">
                  ☣ 可能污染
                </span>
              </div>
            </div>
            <div class="shrink-0 pt-0.5">
              <a-tag :color="getStatusColor(record.impactStatus)" class="m-0 border-0 font-medium">
                {{ getStatusText(record.impactStatus) }}
              </a-tag>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalCount > 0" class="mt-3 flex shrink-0 justify-end border-t border-slate-100 pt-3">
      <a-pagination
        v-model:current="currentPage"
        v-model:pageSize="pageSize"
        :total="totalCount"
        size="small"
        show-size-changer
        :page-size-options="['50', '100', '200']"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  summary: { type: Object, default: null },
  topology: { type: Object, default: null },
  selectedNodeId: { type: String, default: null },
})

const emit = defineEmits(['select-task'])

const isInstanceMode = computed(() => props.summary?.listGranularity === 'instance')

const currentPage = ref(1)
const pageSize = ref(100)
const filterCoreOnly = ref(false)

watch(
  () => [props.summary, props.topology],
  () => {
    currentPage.value = 1
    filterCoreOnly.value = false
  },
  { deep: true }
)

watch(filterCoreOnly, () => {
  currentPage.value = 1
})

const taskRows = computed(() => {
  const rows = props.summary?.affectedTasks || []
  if (filterCoreOnly.value) {
    return rows.filter((r) => r.isCore)
  }
  return rows
})

const instanceRows = computed(() => {
  const rows = props.summary?.affectedTaskInstances || []
  if (filterCoreOnly.value) {
    return rows.filter((r) => r.isCore)
  }
  return rows
})

const totalCount = computed(() => {
  return isInstanceMode.value ? instanceRows.value.length : taskRows.value.length
})

const paginatedInstanceRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return instanceRows.value.slice(start, end)
})

const paginatedTaskRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return taskRows.value.slice(start, end)
})

function isSelected(record) {
  if (isInstanceMode.value) {
    return record.taskId === props.selectedNodeId
  }
  return record.id === props.selectedNodeId
}

function handleSelect(record) {
  const id = isInstanceMode.value ? record.taskId : record.id
  emit('select-task', { taskId: id, record })
}

function getStatusColor(status) {
  const map = {
    success: 'success',
    failed: 'error',
    timeout: 'error',
    stopped: 'error',
    running: 'warning',
    waiting: 'warning',
    delayed: 'warning',
    blocked: 'error',
    other: 'processing',
    pending: 'default',
    not_generated: 'default',
  }
  return map[status] || 'default'
}

function getStatusText(status) {
  const map = {
    success: '成功',
    failed: '已失败',
    timeout: '已超时',
    stopped: '已停止',
    running: '运行中',
    waiting: '依赖等待',
    delayed: '排队中',
    blocked: '强阻断等待',
    other: '串行等待',
    pending: '未运行',
    not_generated: '未生成',
  }
  return map[status] || status || '—'
}
</script>
