<template>
  <div class="preview-tab">
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <div class="segment-control">
          <button
            :class="['segment-btn', mode === 'preview' && 'segment-btn-active']"
            @click="mode = 'preview'"
          >
            数据预览
          </button>
          <button
            :class="['segment-btn', mode === 'profile' && 'segment-btn-active']"
            @click="mode = 'profile'"
          >
            数据探查
          </button>
        </div>
        <div v-if="mode === 'profile' && tableProfileStats.generatedAt" class="profile-time-info">
          探查生成时间：{{ tableProfileStats.generatedAt }}
        </div>
      </div>

      <div class="toolbar-actions">
        <a-button v-if="mode === 'preview'" type="primary" ghost @click="handleResample" :loading="resampling">
          <template #icon><ReloadOutlined /></template>
          重新抽样
        </a-button>
        <a-button v-if="mode === 'profile'" type="primary" @click="handleCreateProfileTask">
          <template #icon><PlusOutlined /></template>
          新建探查任务
        </a-button>
      </div>
    </div>

    <!-- 数据预览 -->
    <div v-if="mode === 'preview'" class="preview-table-wrap">
      <a-table
        :columns="previewColumns"
        :data-source="previewRows"
        :pagination="false"
        size="small"
        :scroll="{ x: 'max-content', y: 460 }"
        row-key="_idx"
        class="preview-table"
      />
    </div>

    <!-- 数据探查 -->
    <div v-else>
      <!-- 探查字段工具栏 -->
      <div class="profile-fields-toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchField"
            placeholder="搜索字段名..."
            style="width: 240px"
            allow-clear
          />
          <a-select
            v-model:value="filterType"
            style="width: 120px"
            :options="[
              { label: '全部类型', value: 'all' },
              { label: '数值型', value: 'numeric' },
              { label: '字符型', value: 'string' },
              { label: '日期型', value: 'date' },
              { label: '枚举型', value: 'enum' },
            ]"
          />
          <span class="field-count">共 {{ filteredColumnProfiles.length }} 个字段</span>
        </div>
        <div class="toolbar-right">
          <a-radio-group v-model:value="viewMode" button-style="solid">
            <a-radio-button value="card"><AppstoreOutlined /> 卡片</a-radio-button>
            <a-radio-button value="table"><BarsOutlined /> 列表</a-radio-button>
          </a-radio-group>
        </div>
      </div>

      <!-- 探查核心指标 -->
      <div class="profile-overview">
        <div class="profile-overview-item">
          <div class="overview-label">总行数</div>
          <div class="overview-value font-mono">{{ tableProfileStats.rowCount?.toLocaleString() || '-' }}</div>
        </div>
        <div class="profile-overview-item">
          <div class="overview-label">主键去重记录数</div>
          <div class="overview-value font-mono">{{ tableProfileStats.uniqueCount?.toLocaleString() || '-' }}</div>
        </div>
        <div class="profile-overview-item">
          <div class="overview-label">重复记录数</div>
          <div class="overview-value font-mono">{{ tableProfileStats.duplicateCount?.toLocaleString() || '-' }}</div>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'">
        <a-row :gutter="[16, 16]">
          <a-col v-for="col in paginatedCardProfiles" :key="col.name" :xs="24" :sm="12" :lg="8" :xl="8">
            <div class="profile-card">
            <div class="profile-card-header">
              <div class="profile-col-name-wrap">
                <KeyOutlined v-if="col.name === 'id' || col.name.includes('_id')" class="pk-icon" title="主键" />
                <span class="profile-col-name" :title="col.name">{{ col.name }}</span>
                <a-tag color="blue" style="margin-left: 4px; font-size: 10px; line-height: 16px; padding: 0 4px; border-radius: 4px;">{{ typeLabel(col.type) }}</a-tag>
              </div>
            </div>
            <div class="profile-stats">
              <!-- 通用：NULL 数量和占比 -->
              <div class="stat-row">
                <span class="stat-label">NULL</span>
                <div class="stat-bar-wrap">
                  <div class="stat-bar stat-bar-null" :style="{ width: barWidth(col.nullProportion) }" />
                </div>
                <span class="stat-value">{{ col.nullCount?.toLocaleString() }}</span>
                <span class="stat-pct">({{ pctText(col.nullProportion) }})</span>
              </div>

              <!-- 字符型 -->
              <template v-if="col.type === 'string'">
                <div class="stat-row">
                  <span class="stat-label">空字符串</span>
                  <div class="stat-bar-wrap">
                    <div class="stat-bar stat-bar-empty" :style="{ width: barWidth(col.emptyStringProportion) }" />
                  </div>
                  <span class="stat-value">{{ col.emptyStringCount?.toLocaleString() }}</span>
                  <span class="stat-pct">({{ pctText(col.emptyStringProportion) }})</span>
                </div>
              </template>

              <!-- 数值型 -->
              <template v-else-if="col.type === 'numeric'">
                <div class="stat-row">
                  <span class="stat-label">0值</span>
                  <div class="stat-bar-wrap">
                    <div class="stat-bar stat-bar-zero" :style="{ width: barWidth(col.zeroProportion) }" />
                  </div>
                  <span class="stat-value">{{ col.zeroCount?.toLocaleString() }}</span>
                  <span class="stat-pct">({{ pctText(col.zeroProportion) }})</span>
                </div>
                <div class="stat-grid">
                  <div class="stat-grid-item"><span>Max:</span> <b>{{ formatNumber(col.max) }}</b></div>
                  <div class="stat-grid-item"><span>Min:</span> <b>{{ formatNumber(col.min) }}</b></div>
                  <div class="stat-grid-item"><span>Avg:</span> <b>{{ formatNumber(col.mean) }}</b></div>
                  <div class="stat-grid-item"><span>Std:</span> <b>{{ formatNumber(col.stdDev) }}</b></div>
                </div>
              </template>

              <!-- 枚举型 -->
              <template v-else-if="col.type === 'enum'">
                <div class="stat-row">
                  <span class="stat-label">空字符串</span>
                  <div class="stat-bar-wrap">
                    <div class="stat-bar stat-bar-empty" :style="{ width: barWidth(col.emptyStringProportion) }" />
                  </div>
                  <span class="stat-value">{{ col.emptyStringCount?.toLocaleString() }}</span>
                  <span class="stat-pct">({{ pctText(col.emptyStringProportion) }})</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">枚举值</span>
                  <div class="stat-bar-wrap">
                    <div class="stat-bar stat-bar-unique" :style="{ width: barWidth(col.uniqueProportion) }" />
                  </div>
                  <span class="stat-value">{{ col.uniqueCount?.toLocaleString() }}</span>
                  <span class="stat-pct">({{ pctText(col.uniqueProportion) }})</span>
                </div>
                <div class="top-values" v-if="col.top5Values && col.top5Values.length">
                  <div class="top-values-title">Top 5</div>
                  <div class="top-value-item" v-for="(tv, i) in col.top5Values" :key="i">
                    <span class="tv-label">{{ tv.value }}</span>
                    <span class="tv-count">{{ tv.count?.toLocaleString() }}</span>
                  </div>
                </div>
              </template>

              <!-- 日期型 -->
              <template v-else-if="col.type === 'date'">
                <div class="stat-grid">
                  <div class="stat-grid-item" style="width: 100%"><span>Max:</span> <b>{{ col.max || '-' }}</b></div>
                  <div class="stat-grid-item" style="width: 100%"><span>Min:</span> <b>{{ col.min || '-' }}</b></div>
                </div>
              </template>
            </div>
            </div>
          </a-col>
        </a-row>
        
        <!-- 卡片视图分页 -->
        <div v-if="filteredColumnProfiles.length > 0" class="card-pagination">
          <a-pagination
            v-model:current="cardCurrentPage"
            :total="filteredColumnProfiles.length"
            :pageSize="9"
            show-less-items
            :show-size-changer="false"
            @change="handleCardPageChange"
          />
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="profile-table-wrap">
        <a-table
          :dataSource="filteredColumnProfiles"
          :columns="profileTableColumns"
          size="small"
          :pagination="{ pageSize: 20, showSizeChanger: true, showTotal: total => `共 ${total} 条` }"
          :scroll="{ x: 'max-content', y: 600 }"
          rowKey="name"
          class="profile-list-table"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              <span class="text-gray-400">{{ index + 1 }}</span>
            </template>
            <template v-else-if="column.key === 'name'">
              <div class="profile-col-name-wrap">
                <KeyOutlined v-if="record.name === 'id' || record.name.includes('_id')" class="pk-icon" title="主键" />
                <span class="font-mono font-semibold text-slate-800">{{ record.name }}</span>
              </div>
            </template>
            <template v-else-if="column.key === 'dataType'">
              <span class="type-code text-[12px]">{{ record.dataType || 'VARCHAR' }}</span>
            </template>
            <template v-else-if="column.key === 'type'">
              <a-tag color="blue" style="margin: 0;">{{ typeLabel(record.type) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'nullProportion'">
              <div class="table-stat-cell">
                <span class="stat-count">{{ record.nullCount?.toLocaleString() || 0 }} <span class="stat-pct">({{ pctText(record.nullProportion) }})</span></span>
                <div class="stat-bar-wrap"><div class="stat-bar stat-bar-null" :style="{ width: barWidth(record.nullProportion) }"></div></div>
              </div>
            </template>
            <template v-else-if="column.key === 'emptyStringProportion'">
              <div class="table-stat-cell" v-if="record.type === 'string' || record.type === 'enum'">
                <span class="stat-count">{{ record.emptyStringCount?.toLocaleString() || 0 }} <span class="stat-pct">({{ pctText(record.emptyStringProportion) }})</span></span>
                <div class="stat-bar-wrap"><div class="stat-bar stat-bar-empty" :style="{ width: barWidth(record.emptyStringProportion) }"></div></div>
              </div>
              <span v-else class="text-gray-300">-</span>
            </template>
            <template v-else-if="column.key === 'zeroProportion'">
              <div class="table-stat-cell" v-if="record.type === 'numeric'">
                <span class="stat-count">{{ record.zeroCount?.toLocaleString() || 0 }} <span class="stat-pct">({{ pctText(record.zeroProportion) }})</span></span>
                <div class="stat-bar-wrap"><div class="stat-bar stat-bar-zero" :style="{ width: barWidth(record.zeroProportion) }"></div></div>
              </div>
              <span v-else class="text-gray-300">-</span>
            </template>
            <template v-else-if="column.key === 'uniqueProportion'">
              <div class="table-stat-cell" v-if="record.type === 'enum'">
                <span class="stat-count">{{ record.uniqueCount?.toLocaleString() || 0 }} <span class="stat-pct">({{ pctText(record.uniqueProportion) }})</span></span>
                <div class="stat-bar-wrap"><div class="stat-bar stat-bar-unique" :style="{ width: barWidth(record.uniqueProportion) }"></div></div>
              </div>
              <span v-else class="text-gray-300">-</span>
            </template>
            <template v-else-if="['min', 'max', 'mean'].includes(column.key)">
              <span v-if="record[column.key] !== undefined && record[column.key] !== null" class="font-mono text-slate-600">{{ formatNumber(record[column.key]) }}</span>
              <span v-else class="text-gray-300">-</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 新建探查任务弹窗 -->
    <a-modal
      v-model:open="isProfileModalVisible"
      title="新建数据探查任务"
      @ok="submitProfileTask"
      :confirmLoading="isSubmittingProfile"
      destroyOnClose
      width="720px"
      :bodyStyle="{ padding: '24px 24px 0' }"
      cancelText="取消"
      okText="执行"
    >
      <a-form 
        layout="vertical" 
        :model="profileForm" 
        :rules="profileFormRules"
        ref="profileFormRef"
        class="profile-form"
      >
        <a-form-item 
          label="探查分区日期" 
          name="partitionDate" 
          :extra="isPartitionedTable ? '当前表为分区表，必须指定探查的分区日期' : '非分区表无需填写'"
          :required="isPartitionedTable"
        >
          <a-date-picker
            v-model:value="profileForm.partitionDate"
            valueFormat="YYYYMMDD"
            placeholder="请选择分区日期"
            style="width: 100%"
            size="large"
            :disabled="!isPartitionedTable"
          />
        </a-form-item>
        
        <a-form-item label="选择探查字段" name="selectedColumns" class="mb-0">
          <a-transfer
            v-model:target-keys="profileForm.selectedColumns"
            :data-source="transferDataSource"
            :render="item => item.title"
            :titles="['可选字段', '已选字段']"
            :list-style="{ width: '100%', height: '320px' }"
            class="custom-transfer"
            show-search
          >
            <template #render="item">
              <span class="font-mono text-[13px] text-slate-700">{{ item.title }}</span>
            </template>
          </a-transfer>
        </a-form-item>

        <a-form-item v-if="profileForm.selectedColumns.length > 0" class="mt-4">
          <template #label>
            <div class="flex items-center justify-between w-full">
              <span>字段类型打标</span>
              <span class="text-xs text-gray-400 font-normal">系统已自动推断，可手动修正</span>
            </div>
          </template>
          <div class="tagging-table-wrapper">
            <a-table
              :data-source="selectedColumnsData"
              :columns="taggingColumns"
              size="small"
              :pagination="{ pageSize: 10, showSizeChanger: false }"
              :scroll="{ y: 280 }"
              class="tagging-table"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'type'">
                  <a-select
                    v-model:value="profileForm.columnTypes[record.key]"
                    :options="columnTypeOptions"
                    style="width: 100%"
                    placeholder="请选择类型"
                    :bordered="false"
                    class="type-select"
                  />
                </template>
                <template v-if="column.dataIndex === 'name'">
                  <span class="font-mono text-[13px] text-slate-700">{{ record.name }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined, PlusOutlined, KeyOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons-vue'
import { getTableSampleData, getTableColumnProfile } from '@/services/DataMap/tableService.js'

const props = defineProps({
  tableId: { type: String, default: '' },
})

const mode = ref('preview')
const sampleData = ref({ columns: [], rows: [] })
const columnProfiles = ref([])
const tableProfileStats = ref({ rowCount: 0, uniqueCount: 0, duplicateCount: 0, generatedAt: '' })

const resampling = ref(false)

// 探查字段过滤与视图状态
const searchField = ref('')
const filterType = ref('all')
const viewMode = ref('card')

const cardCurrentPage = ref(1)

const filteredColumnProfiles = computed(() => {
  return columnProfiles.value.filter(col => {
    const matchName = col.name.toLowerCase().includes(searchField.value.toLowerCase())
    const matchType = filterType.value === 'all' || col.type === filterType.value
    return matchName && matchType
  })
})

// 卡片视图分页数据
const paginatedCardProfiles = computed(() => {
  const start = (cardCurrentPage.value - 1) * 9
  const end = start + 9
  return filteredColumnProfiles.value.slice(start, end)
})

function handleCardPageChange(page) {
  cardCurrentPage.value = page
}

// 监听搜索或过滤条件变化，重置卡片页码
watch([searchField, filterType], () => {
  cardCurrentPage.value = 1
})

const profileTableColumns = [
  { title: '序号', key: 'index', width: 60, fixed: 'left', align: 'center' },
  { title: '字段名', dataIndex: 'name', key: 'name', width: 180, fixed: 'left' },
  { title: '类型', dataIndex: 'dataType', key: 'dataType', width: 120, fixed: 'left' },
  { title: '打标类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: 'NULL值', key: 'nullProportion', width: 180 },
  { title: '空字符串', key: 'emptyStringProportion', width: 180 },
  { title: '0值', key: 'zeroProportion', width: 180 },
  { title: '枚举值', key: 'uniqueProportion', width: 180 },
  { title: '最小值', dataIndex: 'min', key: 'min', width: 100 },
  { title: '最大值', dataIndex: 'max', key: 'max', width: 100 },
  { title: '平均值', dataIndex: 'mean', key: 'mean', width: 100 },
]

const isProfileModalVisible = ref(false)
const isSubmittingProfile = ref(false)
const profileFormRef = ref(null)

// 模拟当前表是否为分区表 (实际项目中应从表元数据中获取)
// 这里为了演示，我们假设包含 'dt' 或 'ds' 字段的表为分区表
const isPartitionedTable = computed(() => {
  return sampleData.value.columns.some(col => col.toLowerCase() === 'dt' || col.toLowerCase() === 'ds')
})

const profileForm = ref({
  partitionDate: null,
  selectedColumns: [],
  columnTypes: {}
})

const profileFormRules = computed(() => {
  return {
    partitionDate: [
      { 
        required: isPartitionedTable.value, 
        message: '该表为分区表，请选择要探查的分区日期', 
        trigger: 'change' 
      }
    ],
    selectedColumns: [
      { 
        required: true, 
        type: 'array', 
        min: 1, 
        message: '请至少选择一个要探查的字段', 
        trigger: 'change' 
      }
    ]
  }
})

const transferDataSource = computed(() => {
  const cols = sampleData.value.columns || []
  return cols.map(c => ({ key: c, title: c }))
})

const columnTypeOptions = [
  { label: '数值型', value: 'numeric' },
  { label: '字符型', value: 'string' },
  { label: '日期型', value: 'date' },
  { label: '枚举型', value: 'enum' },
]

const selectedColumnsData = computed(() => {
  return profileForm.value.selectedColumns.map(col => ({ key: col, name: col }))
})

const taggingColumns = [
  { title: '字段名', dataIndex: 'name', width: '50%' },
  { title: '字段类型', dataIndex: 'type', width: '50%' },
]

watch(() => profileForm.value.selectedColumns, (newCols) => {
  const newTypes = {}
  newCols.forEach(col => {
    newTypes[col] = profileForm.value.columnTypes[col] || 'string'
  })
  profileForm.value.columnTypes = newTypes
})

watch(() => props.tableId, async (id) => {
  if (!id) return
  const [sample, profiles] = await Promise.all([
    getTableSampleData(id),
    getTableColumnProfile(id),
  ])
  sampleData.value = sample || { columns: [], rows: [] }
  
  // 注入 Mock 的探查类型及对应指标
  columnProfiles.value = (profiles || []).map(p => {
    let type = 'string'
    if (['order_id', 'user_id', 'product_id', 'order_amount'].includes(p.name)) type = 'numeric'
    if (['pay_channel', 'order_status', 'is_deleted'].includes(p.name)) type = 'enum'
    if (['create_time', 'update_time', 'dt'].includes(p.name)) type = 'date'

    const valuesCount = p.valuesCount || 100000
    const emptyStringCount = Math.floor(valuesCount * Math.random() * 0.05)
    const zeroCount = Math.floor(valuesCount * Math.random() * 0.1)

    return {
      ...p,
      type,
      emptyStringCount,
      emptyStringProportion: emptyStringCount / valuesCount,
      stdDev: p.mean ? p.mean * 0.2 : null,
      zeroCount,
      zeroProportion: zeroCount / valuesCount,
      top5Values: type === 'enum' ? [
        { value: 'A', count: Math.floor(valuesCount * 0.4) },
        { value: 'B', count: Math.floor(valuesCount * 0.3) },
        { value: 'C', count: Math.floor(valuesCount * 0.15) },
        { value: 'D', count: Math.floor(valuesCount * 0.1) },
        { value: 'E', count: Math.floor(valuesCount * 0.05) },
      ] : []
    }
  })

  // 如果字段超过 12 个，默认使用列表视图，方便全表探查查看
  if (columnProfiles.value.length > 12) {
    viewMode.value = 'table'
  } else {
    viewMode.value = 'card'
  }
  
  // 模拟表级探查指标数据
  if (profiles && profiles.length > 0) {
    const rowCount = profiles[0].valuesCount || 100000
    const uniqueCount = Math.floor(rowCount * 0.98)
    tableProfileStats.value = {
      rowCount,
      uniqueCount,
      duplicateCount: rowCount - uniqueCount,
      generatedAt: '2026-03-23 10:30:00'
    }
  }
}, { immediate: true })

const previewColumns = computed(() => {
  const cols = sampleData.value.columns.map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    width: 140,
    ellipsis: true,
  }))
  
  cols.unshift({
    title: '序号',
    dataIndex: '_idx',
    key: '_idx',
    width: 70,
    align: 'center',
    customRender: ({ text }) => text + 1
  })
  
  return cols
})

const previewRows = computed(() =>
  sampleData.value.rows.map((row, idx) => {
    const obj = { _idx: idx }
    sampleData.value.columns.forEach((col, ci) => {
      obj[col] = row[ci]
    })
    return obj
  })
)

function barWidth(proportion) {
  const pct = Math.min((proportion || 0) * 100, 100)
  return pct < 1 && pct > 0 ? '2%' : `${pct}%`
}

function pctText(proportion) {
  if (!proportion) return '0%'
  return (proportion * 100).toFixed(2) + '%'
}

function formatNumber(num) {
  if (num === null || num === undefined) return '-'
  if (typeof num !== 'number') return num
  return num.toLocaleString()
}

function typeLabel(type) {
  const map = {
    'string': '字符型',
    'numeric': '数值型',
    'enum': '枚举型',
    'date': '日期型'
  }
  return map[type] || '未知'
}

async function handleResample() {
  if (!props.tableId) return
  resampling.value = true
  try {
    const sample = await getTableSampleData(props.tableId)
    sampleData.value = sample || { columns: [], rows: [] }
    message.success('重新抽样成功')
  } catch (err) {
    message.error('重新抽样失败')
  } finally {
    resampling.value = false
  }
}

function handleCreateProfileTask() {
  if (!props.tableId) return
  const allCols = transferDataSource.value.map(item => item.key)
  const initialTypes = {}
  allCols.forEach(col => {
    initialTypes[col] = 'string'
  })
  profileForm.value = {
    partitionDate: null,
    selectedColumns: allCols, // 默认全选
    columnTypes: initialTypes
  }
  isProfileModalVisible.value = true
}

async function submitProfileTask() {
  if (!profileFormRef.value) return
  
  try {
    // 提交前先校验表单
    await profileFormRef.value.validate()
    
    isSubmittingProfile.value = true
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('数据探查任务已创建，请稍后查看结果')
    isProfileModalVisible.value = false
  } catch (err) {
    if (err.errorFields) {
      // 表单校验失败，不需要弹 message.error，表单下方会有红字提示
      return
    }
    message.error('创建探查任务失败')
  } finally {
    isSubmittingProfile.value = false
  }
}
</script>

<style scoped>
.preview-tab {
  padding: 0 0 16px;
}

.preview-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-time-info {
  font-size: 13px;
  color: #64748b;
  font-family: 'Fira Code', monospace;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.segment-control {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 3px;
  gap: 2px;
}

.segment-btn {
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-btn:hover {
  color: #334155;
}

.segment-btn-active {
  background: #fff;
  color: #1677ff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.profile-overview {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-overview-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-label {
  font-size: 13px;
  color: #64748b;
}

.overview-value {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.preview-table-wrap {
  max-height: 520px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-table {
  overflow: hidden;
}

.preview-table :deep(.ant-table-cell) {
  font-size: 13px;
  white-space: nowrap;
  padding: 10px 16px !important;
  font-family: 'Fira Code', monospace;
  color: #475569;
}

.preview-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
  font-size: 13px;
}

.profile-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  transition: all 0.2s;
}

.profile-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.profile-card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-col-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.pk-icon {
  color: #f59e0b;
  font-size: 14px;
}

.profile-col-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Fira Code', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-col-count {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.profile-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.stat-label {
  flex-shrink: 0;
  width: 48px;
  color: #64748b;
}

.stat-bar-wrap {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.stat-bar-null {
  background: #f87171;
}

.stat-bar-unique {
  background: #3b82f6;
}

.stat-bar-empty {
  background: #fcd34d;
}

.stat-bar-zero {
  background: #93c5fd;
}

.stat-value {
  flex-shrink: 0;
  font-size: 12px;
  color: #334155;
  min-width: 40px;
  text-align: right;
  font-family: 'Fira Code', monospace;
  font-weight: 500;
}

.stat-pct {
  flex-shrink: 0;
  font-size: 12px;
  color: #94a3b8;
  min-width: 48px;
  font-family: 'Fira Code', monospace;
  font-weight: 500;
}

.stat-minmax {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  padding-top: 6px;
  margin-top: 2px;
  border-top: 1px dashed #e2e8f0;
}

.stat-minmax b {
  color: #334155;
  font-family: 'Fira Code', monospace;
  font-weight: 500;
}

.stat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
}

.stat-grid-item {
  width: calc(50% - 3px);
  font-size: 12px;
  color: #64748b;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.stat-grid-item b {
  color: #1e293b;
  font-family: 'Fira Code', monospace;
}

.top-values {
  margin-top: 4px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
}

.top-values-title {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.top-value-item {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 4px;
}

.top-value-item:last-child {
  margin-bottom: 0;
}

.tv-label {
  color: #334155;
  font-family: 'Fira Code', monospace;
}

.tv-count {
  color: #64748b;
  font-family: 'Fira Code', monospace;
}

/* ===== 探查字段工具栏与列表视图 ===== */
.profile-fields-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.profile-fields-toolbar .toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-count {
  font-size: 13px;
  color: #64748b;
  margin-left: 4px;
}

.profile-table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.table-stat-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-stat-cell .stat-count {
  font-size: 12px;
  font-family: 'Fira Code', monospace;
  color: #334155;
  white-space: nowrap;
}

.table-stat-cell .stat-pct {
  color: #94a3b8;
  font-size: 11px;
  margin-left: 2px;
}

.table-stat-cell .stat-bar-wrap {
  width: 100px;
  flex: none;
  height: 4px;
}

.table-stat-cell .stat-pct {
  font-size: 12px;
  font-family: 'Fira Code', monospace;
  color: #64748b;
  width: 48px;
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

.profile-list-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
}

.card-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* ===== 探查任务弹窗样式 ===== */
.profile-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #334155;
}

.custom-transfer {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.custom-transfer :deep(.ant-transfer-list) {
  flex: 1;
  border-radius: 8px;
  border-color: #e2e8f0;
  background: #fff;
}

.custom-transfer :deep(.ant-transfer-list-header) {
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 16px;
}

.custom-transfer :deep(.ant-transfer-list-header-title) {
  font-weight: 600;
  color: #1e293b;
}

.custom-transfer :deep(.ant-transfer-list-body-search-wrapper) {
  padding: 12px 16px 8px;
}

.custom-transfer :deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
  background: #f8fafc;
  border-color: #e2e8f0;
}

.custom-transfer :deep(.ant-input-affix-wrapper:hover),
.custom-transfer :deep(.ant-input-affix-wrapper-focused) {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.custom-transfer :deep(.ant-transfer-list-content-item) {
  padding: 8px 16px;
  transition: all 0.2s;
}

.custom-transfer :deep(.ant-transfer-list-content-item:hover) {
  background-color: #f1f5f9;
}

.custom-transfer :deep(.ant-transfer-operation) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
}

.custom-transfer :deep(.ant-transfer-operation .ant-btn) {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.custom-transfer :deep(.ant-transfer-operation .ant-btn:not([disabled]):hover) {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.custom-transfer :deep(.ant-transfer-operation .ant-btn[disabled]) {
  background: #f8fafc;
  border-color: #f1f5f9;
  color: #cbd5e1;
}

.tagging-table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.tagging-table :deep(.ant-table-thead > tr > th) {
  background: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  padding: 10px 16px;
}

.tagging-table :deep(.ant-table-tbody > tr > td) {
  padding: 6px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.type-select {
  background: #f8fafc;
  border-radius: 6px;
  transition: all 0.2s;
}

.type-select:hover {
  background: #f1f5f9;
}

.type-select :deep(.ant-select-selector) {
  padding: 0 12px !important;
}
</style>
