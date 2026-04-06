<template>
  <div class="stats-sla flex flex-col h-full space-y-6">
    <!-- 核心指标 -->
    <div class="grid grid-cols-2 gap-3">
      <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center gap-2 text-sm font-medium text-slate-600">
          <ClusterOutlined class="text-blue-500" />
          受影响节点
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-slate-800">{{ summary?.totalAffectedNodes ?? '-' }}</span>
          <span class="text-xs text-slate-400">个</span>
        </div>
      </div>
      <div class="relative overflow-hidden rounded-lg border border-blue-100 bg-blue-50/30 p-4 shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center gap-2 text-sm font-medium text-blue-600">
          <ExclamationCircleOutlined />
          核心任务
        </div>
        <div class="mt-2 flex items-baseline gap-1">
          <span class="text-2xl font-bold text-blue-600">{{ summary?.highRiskNodes ?? '-' }}</span>
          <span class="text-xs text-blue-400">个</span>
        </div>
        <div class="absolute -right-2 -top-2 text-5xl text-blue-500/5">
          <ExclamationCircleFilled />
        </div>
      </div>
    </div>

    <!-- 受影响负责人 -->
    <div>
      <div class="mb-3 flex items-center gap-2">
        <TeamOutlined class="text-slate-400" />
        <span class="text-sm font-bold text-slate-800">受影响负责人</span>
      </div>
      <div class="overflow-hidden rounded-lg border border-slate-200">
        <a-table
          size="small"
          :columns="ownerCols"
          :data-source="summary?.ownerMatrix || []"
          :pagination="false"
          :locale="{ emptyText: '暂无责任人数据' }"
          row-key="name"
          class="custom-small-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <div class="flex items-center gap-1.5 text-slate-600">
                <UserOutlined class="text-[13px]" />
                <span class="text-[13px]">{{ record.name }}</span>
              </div>
            </template>
            <template v-if="column.dataIndex === 'taskCount'">
              <span class="font-medium text-slate-700">{{ record.taskCount }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- SLA 破线预估 -->
    <div class="flex flex-col flex-1 min-h-[300px]">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 shrink-0">
        <div class="flex items-center gap-2">
          <ClockCircleOutlined class="text-slate-400" />
          <span class="text-sm font-bold text-slate-800">SLA 破线风险</span>
        </div>
        <span v-if="slaTotalCount > 0" class="text-xs text-slate-500 whitespace-nowrap">
          共 {{ slaTotalCount }} 项
        </span>
      </div>
      
      <!-- 卡片式列表展示 SLA (带滚动条) -->
      <div class="space-y-2 flex-1 overflow-y-auto pr-1 pb-4">
        <div v-if="!slaTotalCount" class="text-center text-sm text-slate-400 py-4 border border-slate-200 rounded-lg border-dashed">
          暂无 SLA 预估
        </div>
        <div
          v-for="(item, idx) in slaList"
          :key="`${item.taskName}-${idx}`"
          class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all"
        >
          <!-- 第一行：任务名 + 状态标签 -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="font-bold text-[13px] text-slate-800 leading-tight break-words flex-1">
              {{ item.taskName }}
            </div>
            <div class="shrink-0">
              <span v-if="item.isStartBreached && item.isFinishBreached" class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
                <CloseCircleFilled class="text-[10px]" /> SLA双重破线
              </span>
              <span v-else-if="item.isStartBreached" class="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 ring-1 ring-inset ring-orange-500/20">
                <WarningFilled class="text-[10px]" /> SLA启动破线
              </span>
              <span v-else-if="item.isFinishBreached && item.slaFinishRiskLabel" class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
                <CloseCircleFilled class="text-[10px]" /> SLA完成风险
              </span>
              <span v-else-if="item.isFinishBreached" class="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
                <CloseCircleFilled class="text-[10px]" /> SLA完成破线
              </span>
              <span v-else class="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600 ring-1 ring-inset ring-green-500/20">
                <CheckCircleFilled class="text-[10px]" /> 可控
              </span>
            </div>
          </div>

          <!-- 第二行：时间对比 -->
          <div class="flex flex-col gap-1.5 text-xs bg-slate-50 rounded p-2">
            <!-- 启动时间 -->
            <div class="flex items-center justify-between">
              <span class="text-slate-500">启动 SLA ({{ item.slaStartDeadline }})</span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">预计</span>
                <span :class="item.isStartBreached ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'">
                  {{ item.predictedStartTime }}
                </span>
              </div>
            </div>
            <!-- 完成时间 -->
            <div class="flex items-center justify-between">
              <span class="text-slate-500">完成 SLA ({{ item.slaFinishDeadline }})</span>
              <div class="flex items-center gap-1.5">
                <span class="text-slate-400">预计</span>
                <span :class="item.isFinishBreached ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'">
                  {{ item.predictedFinishTime }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ClusterOutlined,
  ExclamationCircleOutlined,
  ExclamationCircleFilled,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  UserOutlined,
} from '@ant-design/icons-vue'

const props = defineProps({
  summary: { type: Object, default: null },
})

const slaList = computed(() =>
  Array.isArray(props.summary?.slaPredictions) ? props.summary.slaPredictions : []
)

const slaTotalCount = computed(() => slaList.value.length)

const ownerCols = [
  { title: '负责人', dataIndex: 'name', ellipsis: true },
  { title: '任务数', dataIndex: 'taskCount', width: 72 },
]
</script>

<style scoped>
:deep(.custom-small-table .ant-table-thead > tr > th) {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 500;
  border-bottom: 1px solid #e2e8f0;
}
:deep(.custom-small-table .ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f1f5f9;
}
:deep(.custom-small-table .ant-table-tbody > tr:last-child > td) {
  border-bottom: none;
}
</style>
