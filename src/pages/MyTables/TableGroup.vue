<template>
  <div>
    <a-table
      v-if="tables.length"
      :columns="columns"
      :data-source="tables"
      :row-selection="rowSelection"
      :pagination="{ 
        pageSize: 10, 
        showSizeChanger: true, 
        showTotal: (total, range) => `${range[0]}-${range[1]}行，共 ${total}行`,
        class: 'custom-pagination'
      }"
      row-key="id"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'displayName'">
          <div class="table-name-wrapper">
            <a class="table-name-link" @click="goDetail(record)">
              <span class="table-display-name font-mono">{{ record.database?.name || 'db' }}.{{ record.name }}</span>
              <span class="table-tech-name text-gray-500">{{ record.displayName || record.name }}</span>
            </a>
            <CopyOutlined class="copy-icon" @click="copyName(`${record.database?.name || 'db'}.${record.name}`, $event)" title="复制表名" />
          </div>
        </template>
        <template v-if="column.dataIndex === 'owners'">
          <div class="flex items-center gap-1.5">
            <UserOutlined class="text-gray-400 text-[12px]" />
            <span class="text-[13px] text-gray-600">{{ ownerNames(record.owners) }}</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'serviceType'">
          <div class="flex items-center gap-1.5">
            <SourceTag :type="record.serviceType" :size="16" />
            <span class="text-[13px] text-gray-600">{{ record.serviceType }}</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'layer'">
          <a-tag color="blue">{{ record.layer }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'description'">
          <a-tooltip :title="record.description" placement="topLeft">
            <span class="desc-text">{{ record.description || '-' }}</span>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'usage'">
          <div class="flex items-center gap-3">
            <a-tooltip title="最近30天被查询/引用的次数">
              <div class="flex items-center gap-1 text-[#ff7875] text-xs cursor-help">
                <FireFilled />
                <span class="font-mono">{{ Math.floor((record.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
              </div>
            </a-tooltip>
            <a-tooltip title="最近30天被浏览的次数">
              <div class="flex items-center gap-1 text-[#1677ff] text-xs cursor-help">
                <EyeOutlined />
                <span class="font-mono">{{ record.usageSummary?.dailyStats?.count || 0 }}</span>
              </div>
            </a-tooltip>
          </div>
        </template>
        <template v-if="column.dataIndex === 'updatedAt'">
          <span class="text-xs text-gray-500 font-mono">{{ formatTime(record.updatedAt) }}</span>
        </template>
      </template>
    </a-table>
    <a-empty v-else :description="emptyText" class="py-12" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { FireFilled, EyeOutlined, CopyOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import SourceTag from '@/components/SourceTag.vue'

const props = defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  selectedRowKeys: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selectedRowKeys'])

const rowSelection = computed(() => {
  if (!props.selectable) return null
  return {
    selectedRowKeys: props.selectedRowKeys,
    onChange: (keys) => emit('update:selectedRowKeys', keys),
  }
})

const router = useRouter()

const columns = [
  { title: '表名', dataIndex: 'displayName', width: '25%' },
  { title: '表负责人', dataIndex: 'owners', width: '12%' },
  { title: '数据源', dataIndex: 'serviceType', width: '10%' },
  { title: '分层', dataIndex: 'layer', width: '8%' },
  { title: '描述', dataIndex: 'description', ellipsis: true },
  { title: '热度', dataIndex: 'usage', width: '10%' },
  { 
    title: '更新时间', 
    dataIndex: 'updatedAt', 
    width: '15%',
    sorter: (a, b) => a.updatedAt - b.updatedAt,
    defaultSortOrder: 'descend'
  },
]

function goDetail(record) {
  router.push(`/detail/${encodeURIComponent(record.fullyQualifiedName)}`)
}

function ownerNames(owners) {
  if (!owners?.length) return '-'
  return owners.map((o) => o.name || '-').join('、')
}

function copyName(name, event) {
  event.stopPropagation()
  navigator.clipboard.writeText(name).then(() => {
    message.success('表名已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.table-name-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.table-name-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  color: #1677ff;
}

.table-name-link:hover .table-display-name {
  text-decoration: underline;
}

.table-display-name {
  font-weight: 600;
  font-size: 13px;
  font-family: 'Fira Code', 'SF Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.table-tech-name {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.copy-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
  margin-top: 2px;
}

.copy-icon:hover {
  color: #1677ff;
}

.desc-text {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  cursor: default;
}
</style>
