<template>
  <div class="field-detail-tab">
    <!-- 工具栏 -->
    <div class="tab-toolbar">
      <a-input-search
        v-model:value="searchKeyword"
        placeholder="搜索字段"
        class="field-search"
        allow-clear
        size="small"
      />
      <a-space>
        <a-button type="link" size="small" class="code-gen-btn" @click="showSelectModal = true">
          <template #icon><CodeOutlined /></template>
          生成 SELECT
        </a-button>
        <a-button type="link" size="small" class="code-gen-btn" @click="showDdlModal = true">
          <template #icon><FileTextOutlined /></template>
          生成 DDL
        </a-button>
      </a-space>
    </div>

    <!-- 非分区字段 -->
    <div class="field-section">
      <h4 class="field-section-title">非分区字段</h4>
      <a-table
        :columns="tableColumns"
        :data-source="filteredNormalFields"
        :pagination="false"
        size="small"
        row-key="name"
        class="field-table"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ordinalPosition'">
            <span class="text-gray-500 font-mono text-[13px]">{{ record.ordinalPosition }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="flex items-center gap-1.5">
              <KeyOutlined v-if="isPrimaryKey(record)" class="text-blue-500 text-[14px] bg-transparent" />
              <span :class="['font-mono text-[13px]', isPrimaryKey(record) ? 'font-semibold text-gray-900' : 'text-[#334155] font-medium']">{{ record.name }}</span>
            </span>
          </template>
          <template v-else-if="column.key === 'dataType'">
            <span class="type-code text-[12px]">{{ formatType(record) }}</span>
          </template>
          <template v-else-if="column.key === 'description'">
            <span class="text-gray-600 text-[13px]">{{ record.description || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'tags'">
            <template v-if="getFieldTags(record).length">
              <a-tag v-for="tag in getFieldTags(record)" :key="tag" class="mr-1 mb-0 border-gray-200 bg-slate-50 text-slate-600 text-[12px]">
                {{ tag }}
              </a-tag>
            </template>
            <span v-else class="text-gray-400">-</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分区字段 -->
    <div v-if="filteredPartitionFields.length" class="field-section">
      <h4 class="field-section-title">分区字段</h4>
      <a-table
        :columns="tableColumns"
        :data-source="filteredPartitionFields"
        :pagination="false"
        size="small"
        row-key="name"
        class="field-table"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ordinalPosition'">
            <span class="text-gray-500 font-mono text-[13px]">{{ record.ordinalPosition }}</span>
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="flex items-center gap-1.5">
              <KeyOutlined v-if="isPrimaryKey(record)" class="text-blue-500 text-[14px] bg-transparent" />
              <span :class="['font-mono text-[13px]', isPrimaryKey(record) ? 'font-semibold text-gray-900' : 'text-[#334155] font-medium']">{{ record.name }}</span>
            </span>
          </template>
          <template v-else-if="column.key === 'dataType'">
            <span class="type-code text-[12px]">{{ formatType(record) }}</span>
          </template>
          <template v-else-if="column.key === 'description'">
            <span class="text-gray-600 text-[13px]">{{ record.description || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'tags'">
            <template v-if="getFieldTags(record).length">
              <a-tag v-for="tag in getFieldTags(record)" :key="tag" class="mr-1 mb-0 border-gray-200 bg-slate-50 text-slate-600 text-[12px]">
                {{ tag }}
              </a-tag>
            </template>
            <span v-else class="text-gray-400">-</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- SELECT Modal -->
    <a-modal v-model:open="showSelectModal" title="生成 SELECT 语句" width="640px" :footer="null">
      <div class="code-block-wrapper">
        <pre class="code-block">{{ selectSql }}</pre>
      </div>
    </a-modal>

    <!-- DDL Modal -->
    <a-modal v-model:open="showDdlModal" title="生成 DDL 语句" width="640px" :footer="null">
      <div class="code-block-wrapper">
        <pre class="code-block">{{ ddlSql }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CodeOutlined, FileTextOutlined, KeyOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  tableConstraints: { type: Array, default: () => [] },
})

const showSelectModal = ref(false)
const showDdlModal = ref(false)
const searchKeyword = ref('')

const partitionFieldNames = ['dt', 'ds', 'pt', 'partition_date']

const normalFields = computed(() =>
  props.columns.filter((c) => !partitionFieldNames.includes(c.name))
)

const partitionFields = computed(() =>
  props.columns.filter((c) => partitionFieldNames.includes(c.name))
)

const filteredNormalFields = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return normalFields.value
  return normalFields.value.filter(
    (c) => c.name?.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw)
  )
})

const filteredPartitionFields = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return partitionFields.value
  return partitionFields.value.filter(
    (c) => c.name?.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw)
  )
})

const tableColumns = [
  { title: '序号', key: 'ordinalPosition', width: 60, align: 'center' },
  { title: '字段名', key: 'name', width: 160 },
  { title: '类型', key: 'dataType', width: 110 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '标签', key: 'tags', width: 240 },
]

function isPrimaryKey(record) {
  return record.constraint === 'PRIMARY_KEY'
}

function formatType(record) {
  if (record.dataLength) return `${record.dataType}(${record.dataLength})`
  return record.dataType
}

function getFieldTags(record) {
  if (!record.tags?.length) return []
  return record.tags
    .filter((t) => !t.tagFQN?.startsWith('PII.'))
    .map((t) => t.tagFQN.split('.').pop())
}

const selectSql = computed(() => {
  const cols = props.columns.map((c) => `  \`${c.name}\``).join(',\n')
  return `SELECT\n${cols}\nFROM dwa_cn.dwa_cn_cus_df_complain_detail\nWHERE dt = '2024-11-10'\nLIMIT 100;`
})

const ddlSql = computed(() => {
  const cols = props.columns
    .map((c) => {
      const type = c.dataLength ? `${c.dataType}(${c.dataLength})` : c.dataType
      const pk = c.constraint === 'PRIMARY_KEY' ? ' PRIMARY KEY' : ''
      const comment = c.description ? ` COMMENT '${c.description}'` : ''
      return `  \`${c.name}\` ${type}${pk}${comment}`
    })
    .join(',\n')
  return `CREATE TABLE dwa_cn.dwa_cn_cus_df_complain_detail (\n${cols}\n)\nPARTITIONED BY (\`dt\` VARCHAR(10))\nSTORED AS ORC;`
})
</script>

<style scoped>
.field-detail-tab {
  padding: 0 0 16px;
}

.tab-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-search {
  width: 220px;
}

.field-search :deep(.ant-input) {
  border-radius: 6px 0 0 6px;
}

.field-search :deep(.ant-input-group-addon) {
  border-radius: 0 6px 6px 0;
  overflow: hidden;
}

.field-search :deep(.ant-input-search-button) {
  border-radius: 0 6px 6px 0 !important;
}

.field-search :deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

.code-gen-btn {
  font-size: 13px;
  color: #475569;
  padding: 0 8px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.code-gen-btn:hover {
  color: #1677ff;
}

.field-section {
  margin-bottom: 20px;
}

.field-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px;
  padding-left: 10px;
  position: relative;
}

.field-section-title::before {
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

.field-table {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.field-table :deep(.ant-table-cell) {
  font-size: 13px;
  padding: 10px 16px !important;
}

.field-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
}

.type-code {
  font-size: 12px;
  padding: 2px 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #0ea5e9;
  font-family: 'Fira Code', monospace;
  font-weight: 500;
}

.code-block-wrapper {
  background: #1e293b;
  border-radius: 8px;
  overflow: hidden;
}

.code-block {
  background: transparent;
  color: #e2e8f0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Fira Code', monospace;
}
</style>
