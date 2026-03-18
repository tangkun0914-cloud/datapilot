<template>
  <div class="preview-tab">
    <div class="preview-toolbar">
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
      <a-row :gutter="[16, 16]">
        <a-col v-for="col in columnProfiles" :key="col.name" :xs="24" :sm="12" :lg="8" :xl="6">
          <div class="profile-card">
            <div class="profile-card-header">
              <span class="profile-col-name">{{ col.name }}</span>
              <span class="profile-col-count font-mono text-[12px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{{ col.valuesCount?.toLocaleString() }} 行</span>
            </div>
            <div class="profile-stats">
              <div class="stat-row">
                <span class="stat-label">空值</span>
                <div class="stat-bar-wrap">
                  <div class="stat-bar stat-bar-null" :style="{ width: barWidth(col.nullProportion) }" />
                </div>
                <span class="stat-value">{{ col.nullCount?.toLocaleString() }}</span>
                <span class="stat-pct">({{ pctText(col.nullProportion) }})</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">唯一</span>
                <div class="stat-bar-wrap">
                  <div class="stat-bar stat-bar-unique" :style="{ width: barWidth(col.uniqueProportion) }" />
                </div>
                <span class="stat-value">{{ col.uniqueCount?.toLocaleString() }}</span>
                <span class="stat-pct">({{ pctText(col.uniqueProportion) }})</span>
              </div>
              <div v-if="col.min !== null && col.min !== undefined" class="stat-minmax">
                <span>Min: <b>{{ formatNumber(col.min) }}</b></span>
                <span>Max: <b>{{ formatNumber(col.max) }}</b></span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getTableSampleData, getTableColumnProfile } from '@/services/tableService.js'

const props = defineProps({
  tableId: { type: String, default: '' },
})

const mode = ref('preview')
const sampleData = ref({ columns: [], rows: [] })
const columnProfiles = ref([])

watch(() => props.tableId, async (id) => {
  if (!id) return
  const [sample, profiles] = await Promise.all([
    getTableSampleData(id),
    getTableColumnProfile(id),
  ])
  sampleData.value = sample || { columns: [], rows: [] }
  columnProfiles.value = profiles || []
}, { immediate: true })

const previewColumns = computed(() =>
  sampleData.value.columns.map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    width: 140,
    ellipsis: true,
  }))
)

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
</script>

<style scoped>
.preview-tab {
  padding: 0 0 16px;
}

.preview-toolbar {
  margin-bottom: 16px;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-col-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Fira Code', monospace;
}

.profile-col-count {
  font-size: 12px;
  color: #64748b;
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
  width: 32px;
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
</style>
