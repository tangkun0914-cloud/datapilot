<template>
  <div class="stats-sla flex h-full min-h-0 flex-col space-y-6">
    <!-- 核心指标：禁止被下方 flex-1 区块挤扁 -->
    <div
      class="stats-nodes-card relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm transition-all hover:shadow-md"
    >
      <div class="flex items-center gap-2 text-sm font-medium text-slate-600">
        <ClusterOutlined class="text-blue-500" />
        受影响节点
      </div>
      <div class="mt-3 flex items-baseline gap-1.5">
        <span class="text-3xl font-bold tabular-nums leading-none text-slate-800">{{
          summary?.totalAffectedNodes ?? '-'
        }}</span>
        <span class="text-sm text-slate-400">个</span>
      </div>
    </div>

    <!-- 受影响负责人 -->
    <div class="shrink-0 flex-1 min-h-0 flex flex-col">
      <div class="mb-3 flex items-center gap-2 shrink-0">
        <TeamOutlined class="text-slate-400" />
        <span class="text-sm font-bold text-slate-800">受影响负责人</span>
      </div>
      <div class="overflow-y-auto rounded-lg border border-slate-200 bg-white flex-1">
        <a-table
          size="small"
          :columns="ownerCols"
          :data-source="summary?.ownerMatrix || []"
          :pagination="pagination"
          :locale="{ emptyText: '暂无责任人数据' }"
          row-key="name"
          class="custom-small-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <div class="flex items-center gap-1.5 text-slate-600">
                <UserOutlined class="text-[13px]" />
                <span class="text-[13px] truncate" :title="record.name">{{ record.name }}</span>
              </div>
            </template>
            <template v-if="column.dataIndex === 'taskCount'">
              <span class="font-medium text-slate-700">{{ record.taskCount }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ClusterOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

const props = defineProps({
  summary: { type: Object, default: null },
})

const ownerCols = [
  { title: '负责人', dataIndex: 'name', ellipsis: true },
  { title: '受影响任务数', dataIndex: 'taskCount', align: 'right' },
]

const pagination = computed(() => ({
  pageSize: 10,
  size: 'small',
  showSizeChanger: false,
  hideOnSinglePage: true,
  showTotal: (total) => `共 ${total} 人`
}))
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

