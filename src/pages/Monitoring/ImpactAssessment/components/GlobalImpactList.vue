<template>
  <div class="global-impact-list flex flex-col h-full p-2">
    <!-- 过滤与统计栏 -->
    <div class="mb-3 flex shrink-0 items-center gap-2 px-1">
      <a-input
        v-model:value="taskNameKeyword"
        allow-clear
        size="small"
        placeholder="搜索任务名"
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
        placeholder="全部状态"
        class="w-[120px] shrink-0"
        :max-tag-count="1"
        :options="STATUS_OPTIONS"
      />
    </div>

    <div class="flex-1 overflow-y-auto min-h-[120px]">
      <!-- 实例模式卡片列表 -->
      <template v-if="isInstanceMode">
        <div v-if="!paginatedInstanceRows.length" class="py-10 text-center text-sm text-slate-400">
          {{ emptyFilterHint ? '暂无符合筛选条件的数据' : '暂无下游任务实例' }}
        </div>
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
        <div v-if="!paginatedTaskRows.length" class="py-10 text-center text-sm text-slate-400">
          {{ emptyFilterHint ? '暂无符合筛选条件的数据' : '暂无拓扑任务节点（请确认已加载拓扑）' }}
        </div>
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
import { UserOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  summary: { type: Object, default: null },
  topology: { type: Object, default: null },
  selectedNodeId: { type: String, default: null },
})

const emit = defineEmits(['select-task'])

const isInstanceMode = computed(() => props.summary?.listGranularity === 'instance')

const currentPage = ref(1)
const pageSize = ref(100)
/** 任务名子串搜索，trim 后空则不过滤 */
const taskNameKeyword = ref('')
const statusFilter = ref([])
const ownerFilter = ref([])

const STATUS_OPTIONS = [
  { value: 'SUCCESS', label: '成功' },
  { value: 'FAILURE', label: '失败' },
  { value: 'RUNNING_EXECUTION', label: '正在运行' },
  { value: 'WAITING_DEPEND', label: '等待依赖' },
  { value: 'WAITING_THREAD', label: '等待线程' },
  { value: 'DELAY_EXECUTION', label: '延时执行' },
  { value: 'PAUSE', label: '暂停' },
  { value: 'STOP', label: '停止' },
  { value: 'KILL', label: 'Kill' },
  { value: 'PENDING', label: '未运行' },
]

const ownerOptions = computed(() => {
  const rows = isInstanceMode.value 
    ? (props.summary?.affectedTaskInstances || []) 
    : (props.summary?.affectedTasks || [])
  const owners = new Set()
  rows.forEach(r => {
    if (r.owner) owners.add(r.owner)
  })
  return Array.from(owners).map(o => ({ value: o, label: o }))
})

const taskNameNeedle = computed(() => taskNameKeyword.value.trim().toLowerCase())

watch(
  () => [props.summary, props.topology],
  () => {
    currentPage.value = 1
    taskNameKeyword.value = ''
    statusFilter.value = []
    ownerFilter.value = []
  },
  { deep: true }
)

watch([taskNameKeyword, statusFilter, ownerFilter], () => {
  currentPage.value = 1
})

function matchesTaskNameFilter(record) {
  const needle = taskNameNeedle.value
  if (!needle) return true
  const name = (record.taskName || '').toLowerCase()
  return name.includes(needle)
}

const taskRows = computed(() => {
  const rows = props.summary?.affectedTasks || []
  let list = rows
  if (statusFilter.value && statusFilter.value.length > 0) {
    list = list.filter((r) => statusFilter.value.includes(r.impactStatus))
  }
  if (ownerFilter.value && ownerFilter.value.length > 0) {
    list = list.filter((r) => ownerFilter.value.includes(r.owner))
  }
  if (taskNameNeedle.value) {
    list = list.filter((r) => matchesTaskNameFilter(r))
  }
  return list
})

const instanceRows = computed(() => {
  const rows = props.summary?.affectedTaskInstances || []
  let list = rows
  if (statusFilter.value && statusFilter.value.length > 0) {
    list = list.filter((r) => statusFilter.value.includes(r.status))
  }
  if (ownerFilter.value && ownerFilter.value.length > 0) {
    list = list.filter((r) => ownerFilter.value.includes(r.owner))
  }
  if (taskNameNeedle.value) {
    list = list.filter((r) => matchesTaskNameFilter(r))
  }
  return list
})

const emptyFilterHint = computed(() => {
  if (isInstanceMode.value) {
    const raw = props.summary?.affectedTaskInstances || []
    return raw.length > 0 && instanceRows.value.length === 0
  }
  const raw = props.summary?.affectedTasks || []
  return raw.length > 0 && taskRows.value.length === 0
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
    SUCCESS: 'success',
    FORCED_SUCCESS: 'success',
    FAILURE: 'error',
    NEED_FAULT_TOLERANCE: 'error',
    KILL: 'error',
    STOP: 'error',
    READY_STOP: 'error',
    RUNNING_EXECUTION: 'warning',
    DISPATCH: 'warning',
    SUBMITTED_SUCCESS: 'warning',
    DELAY_EXECUTION: 'warning',
    WAITING_DEPEND: 'warning',
    WAITING_THREAD: 'warning',
    PAUSE: 'processing',
    READY_PAUSE: 'processing',
    PENDING: 'default',
  }
  return map[status] || 'default'
}

function getStatusText(status) {
  const map = {
    SUCCESS: '成功',
    FORCED_SUCCESS: '强制成功',
    FAILURE: '失败',
    NEED_FAULT_TOLERANCE: '需要容错',
    KILL: 'Kill',
    STOP: '停止',
    READY_STOP: '准备停止',
    RUNNING_EXECUTION: '正在运行',
    DISPATCH: '派发中',
    WAITING_DEPEND: '等待依赖',
    WAITING_THREAD: '等待线程',
    DELAY_EXECUTION: '延时执行',
    SUBMITTED_SUCCESS: '提交成功',
    PAUSE: '暂停',
    READY_PAUSE: '准备暂停',
    PENDING: '未运行',
  }
  return map[status] || status || '—'
}
</script>
