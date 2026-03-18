<template>
  <div class="production-tab">
    <!-- 概览信息条 -->
    <div class="summary-bar">
      <a-row :gutter="[16, 12]">
        <a-col :xs="24" :sm="8">
          <div class="summary-item">
            <span class="summary-label">任务名称</span>
            <span class="summary-value font-mono">{{ productionInfo.pipelineName }}</span>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="summary-item">
            <span class="summary-label">调度周期</span>
            <span class="summary-value font-mono">
              <ClockCircleOutlined class="mr-1 text-blue-500 text-[13px]" />
              {{ cronText }}
            </span>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="summary-item">
            <span class="summary-label">最近产出时间</span>
            <span class="summary-value font-mono">{{ productionInfo.lastRunAt ? formatDateTime(productionInfo.lastRunAt) : '-' }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 执行记录 -->
    <h4 class="section-title">执行记录</h4>
    <a-table
      :columns="execColumns"
      :data-source="productionInfo.executions"
      :pagination="{
        total: productionInfo.executions.length,
        showTotal: (total) => `共 ${total} 条`,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 10,
        class: 'custom-pagination'
      }"
      size="small"
      row-key="id"
      class="exec-table"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          <span class="text-gray-500 font-mono text-[13px]">{{ record.id }}</span>
        </template>
        <template v-else-if="column.key === 'taskName'">
          <span class="text-gray-800 font-medium font-mono text-[13px]">{{ record.taskName }}</span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag
            :color="statusColor(record.status)"
            :class="{
              'border-transparent m-0 text-[12px]': true,
              'bg-green-50 text-green-600': record.status === 'SUCCESS',
              'bg-red-50 text-red-600': record.status === 'FAILED',
              'bg-blue-50 text-blue-600': record.status === 'RUNNING',
              'bg-gray-50 text-gray-600': record.status === 'PENDING',
            }"
          >
            {{ statusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'startTime'">
          <span class="text-gray-500 font-mono text-[13px]">{{ record.startTime ? formatDateTime(record.startTime) : '-' }}</span>
        </template>
        <template v-else-if="column.key === 'endTime'">
          <span class="text-gray-500 font-mono text-[13px]">{{ record.endTime ? formatDateTime(record.endTime) : '-' }}</span>
        </template>
        <template v-else-if="column.key === 'duration'">
          <span class="text-gray-500 font-mono text-[13px]">{{ record.duration ? formatDuration(record.duration) : '-' }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import { getProductionInfo } from '@/services/tableService.js'

const props = defineProps({
  tableId: { type: String, default: '' },
})

const productionInfo = ref({ pipelineName: '', scheduleInterval: '', lastRunAt: null, executions: [] })

watch(() => props.tableId, async (id) => {
  if (!id) return
  productionInfo.value = await getProductionInfo(id) || { pipelineName: '', scheduleInterval: '', lastRunAt: null, executions: [] }
}, { immediate: true })

const cronText = computed(() => {
  const cron = productionInfo.value.scheduleInterval
  if (cron === '0 2 * * *') return '每日 02:00'
  return cron
})

const execColumns = [
  { title: '实例ID', dataIndex: 'id', key: 'id', width: 90 },
  { title: '实例名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
  { title: '状态', key: 'status', width: 90 },
  { title: '开始时间', key: 'startTime', width: 160 },
  { title: '结束时间', key: 'endTime', width: 160 },
  { title: '耗时', key: 'duration', width: 80 },
]

const statusMap = {
  SUCCESS: '成功',
  FAILED: '失败',
  RUNNING: '运行中',
  PENDING: '等待中',
}

function statusText(status) {
  return statusMap[status] || status
}

function statusColor(status) {
  const map = { SUCCESS: 'success', FAILED: 'error', RUNNING: 'processing', PENDING: 'default' }
  return map[status] || 'default'
}

function formatDateTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDuration(seconds) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}分${s}秒`
}
</script>

<style scoped>
.production-tab {
  padding: 0 0 16px;
}

.summary-bar {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px;
  padding-left: 10px;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #3b82f6;
  border-radius: 2px;
}

.exec-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.exec-table :deep(.ant-table-cell) {
  font-size: 13px;
  padding: 10px 16px !important;
  white-space: nowrap;
}

.exec-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
}

.exec-table :deep(.ant-pagination) {
  margin: 16px 16px !important;
}
</style>
