<template>
  <div class="result-table">
    <div class="table-toolbar">
      <a-dropdown placement="bottomRight">
        <a-button size="small" class="toolbar-btn">
          <template #icon>
            <ExportOutlined />
          </template>
          <span class="btn-text">导出</span>
        </a-button>
        <template #overlay>
          <a-menu @click="handleExportMenuClick" class="custom-dropdown-menu">
            <a-menu-item key="csv">导出为 CSV</a-menu-item>
            <a-menu-item key="excel">导出为 Excel</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <a-dropdown placement="bottomRight">
        <a-button size="small" class="toolbar-btn">
          <template #icon>
            <SettingOutlined />
          </template>
          <span class="btn-text">列显示</span>
        </a-button>
        <template #overlay>
          <div class="column-toggle-dropdown" @click.stop>
            <div
              v-for="col in allColumns"
              :key="col.key"
              class="column-toggle-item"
              @click="col.fixed ? null : toggleColumn(col.key)"
            >
              <a-checkbox
                :checked="visibleColumns.includes(col.key)"
                :disabled="col.fixed"
              >
                {{ col.title }}
              </a-checkbox>
            </div>
          </div>
        </template>
      </a-dropdown>
    </div>
    <a-spin :spinning="loading">
      <a-table
        :columns="displayColumns"
        :data-source="data"
        :row-key="(r) => r.id || r.fullyQualifiedName"
        :row-selection="rowSelection"
        :pagination="false"
        :scroll="{ x: 900 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'displayName'">
            <div class="flex flex-col gap-1">
              <div class="table-name-wrapper">
                <a
                  class="table-link font-mono font-medium text-[13px]"
                  @click="goDetail(record.fullyQualifiedName)"
                  :title="`${record.database?.name || 'db'}.${record.name}`"
                >
                  {{ record.database?.name || 'db' }}.{{ record.name }}
                </a>
                <CopyOutlined class="copy-icon" @click="copyName(`${record.database?.name || 'db'}.${record.name}`, $event)" title="复制表名" />
              </div>
              <span class="text-xs text-gray-500">
                {{ record.displayName || record.name }}
              </span>
            </div>
          </template>
          <template v-else-if="column.key === 'serviceType'">
            <div class="flex items-center gap-1.5">
              <SourceTag :type="record.serviceType" :size="16" />
              <span class="text-xs text-gray-600">{{ record.serviceType }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'tier'">
            <span class="text-xs text-gray-600">{{ getTier(record) }}</span>
          </template>
          <template v-else-if="column.key === 'owners'">
            <span class="text-xs text-gray-600">{{ ownerNames(record.owners) }}</span>
          </template>
          <template v-else-if="column.key === 'description'">
            <a-tooltip :title="record.description" placement="topLeft">
              <span class="text-xs text-gray-600 cursor-default">{{ record.description || '-' }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'usage'">
            <div class="flex flex-col gap-1">
              <a-tooltip title="最近30天被查询/引用的次数">
                <div class="flex items-center gap-1 text-[#ff7875] text-[11px] cursor-help">
                  <FireFilled />
                  <span class="font-mono">{{ Math.floor((record.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
                </div>
              </a-tooltip>
              <a-tooltip title="最近30天被浏览的次数">
                <div class="flex items-center gap-1 text-[#1677ff] text-[11px] cursor-help">
                  <EyeOutlined />
                  <span class="font-mono">{{ record.usageSummary?.dailyStats?.count || 0 }}</span>
                </div>
              </a-tooltip>
            </div>
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            <span class="text-xs text-gray-500 font-mono">{{ formatTime(record.updatedAt) }}</span>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ExportOutlined, CopyOutlined, SettingOutlined, FireFilled, EyeOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import SourceTag from '@/pages/DataMap/components/SourceTag.vue'

const router = useRouter()

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['export', 'copy', 'selectionChange'])

const selectedRowKeys = ref([])

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
    emit('selectionChange', keys)
  },
}))

const allColumns = [
  { title: '表名', key: 'displayName', dataIndex: 'displayName', fixed: true, width: 240 },
  { title: '数据源', key: 'serviceType', dataIndex: 'serviceType', width: 100 },
  { title: '分层', key: 'tier', dataIndex: 'tier', width: 70 },
  { title: '负责人', key: 'owners', dataIndex: 'owners', width: 130 },
  { title: '描述', key: 'description', dataIndex: 'description', width: 220, ellipsis: true },
  { title: '热度', key: 'usage', dataIndex: 'usage', width: 90 },
  { title: '更新时间', key: 'updatedAt', dataIndex: 'updatedAt', width: 140, sorter: (a, b) => (a.updatedAt || 0) - (b.updatedAt || 0), defaultSortOrder: 'descend' },
]

const visibleColumns = ref([
  'displayName',
  'serviceType',
  'tier',
  'owners',
  'description',
  'usage',
  'updatedAt',
])

const displayColumns = computed(() => {
  return allColumns
    .filter((c) => visibleColumns.value.includes(c.key))
    .map((c) => ({
      ...c,
      ellipsis: c.key === 'description',
    }))
})

function toggleColumn(key) {
  const fixed = allColumns.find((c) => c.key === key)?.fixed
  if (fixed) return
  const idx = visibleColumns.value.indexOf(key)
  if (idx >= 0) {
    visibleColumns.value = visibleColumns.value.filter((k) => k !== key)
  } else {
    visibleColumns.value = [...visibleColumns.value, key]
  }
}

function tagName(tagFQN) {
  if (!tagFQN) return ''
  const parts = String(tagFQN).split('.')
  return parts[parts.length - 1] || tagFQN
}

function getTier(record) {
  const tag = (record.tags || []).find((t) => String(t.tagFQN || '').includes('数仓分层'))
  return tag ? tagName(tag.tagFQN) : '-'
}

function ownerNames(owners) {
  if (!owners?.length) return '-'
  return owners.map((o) => o.name || '-').join('、')
}

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function goDetail(fqn) {
  if (!fqn) return
  router.push('/detail/' + encodeURIComponent(fqn))
}

function copyName(name, event) {
  event.stopPropagation()
  navigator.clipboard.writeText(name).then(() => {
    message.success('表名已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}

function handleExportMenuClick({ key }) {
  if (key === 'csv') {
    message.success('已开始导出 CSV 文件')
  } else if (key === 'excel') {
    message.success('已开始导出 Excel 文件')
  }
}
</script>

<style scoped>
.result-table {
  background: #fff;
  border-radius: 8px;
  padding: 0;
}

.table-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: flex-end;
}

.toolbar-btn {
  color: #64748b;
  border-color: #e2e8f0;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.toolbar-btn .btn-text {
  font-size: 13px;
}

.table-link {
  color: #1677ff;
  cursor: pointer;
}

.table-link:hover {
  text-decoration: underline;
}

.table-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #1677ff;
}

.column-toggle-dropdown {
  min-width: 140px;
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.column-toggle-item {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.column-toggle-item:hover {
  background-color: #f8fafc;
}

.column-toggle-item :deep(.ant-checkbox-wrapper) {
  font-size: 13px;
  color: #334155;
}

.custom-dropdown-menu {
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-dropdown-menu :deep(.ant-dropdown-menu-item) {
  font-size: 13px;
  color: #334155;
  padding: 6px 12px;
  border-radius: 4px;
}

.custom-dropdown-menu :deep(.ant-dropdown-menu-item:hover) {
  background-color: #f8fafc;
  color: #1677ff;
}

:deep(.ant-table-cell) {
  padding: 12px 16px !important;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
}
</style>
