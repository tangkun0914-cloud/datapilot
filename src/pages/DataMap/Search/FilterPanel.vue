<template>
  <div class="filter-panel">
    <div class="filter-header">
      <span class="filter-title">筛选</span>
      <div class="filter-actions">
        <a-button type="link" size="small" class="action-btn reset-btn" @click="resetFilters">重置</a-button>
        <a-button type="primary" size="small" class="action-btn save-btn">保存</a-button>
      </div>
    </div>

    <div class="filter-content">
      <!-- 数据类型 -->
      <div class="filter-section">
        <div class="section-title">
          <span>数据类型</span>
          <UpOutlined class="collapse-icon" />
        </div>
        <a-radio-group v-model:value="filterState.dataType" class="custom-radio-group">
          <a-radio value="all" class="custom-radio">
            <div class="radio-content">
              <span class="radio-label">全部 (42)</span>
            </div>
          </a-radio>
          <a-radio value="hive" class="custom-radio">
            <div class="radio-content">
              <img src="/icons/hive.svg" class="radio-icon" />
              <span class="radio-label">Hive表 (42)</span>
            </div>
          </a-radio>
        </a-radio-group>
      </div>

      <!-- 搜索范围 -->
      <div class="filter-section">
        <div class="section-title">
          <span>搜索范围</span>
          <UpOutlined class="collapse-icon" />
        </div>
        <a-radio-group v-model:value="filterState.searchScope" class="custom-radio-group">
          <a-radio value="all" class="custom-radio">全部</a-radio>
          <a-radio value="field" class="custom-radio">字段</a-radio>
          <a-radio value="table" class="custom-radio">表名</a-radio>
          <a-radio value="desc" class="custom-radio">描述</a-radio>
        </a-radio-group>
      </div>

      <!-- 库 -->
      <div class="filter-section">
        <div class="section-title">
          <span>库</span>
          <UpOutlined class="collapse-icon" />
        </div>
        <a-select
          v-model:value="filterState.database"
          placeholder="搜索数据库"
          style="width: 100%"
          allowClear
          showSearch
          :filter-option="filterOption"
          :options="filterOptions.databases"
        />
      </div>

      <!-- 负责人 -->
      <div class="filter-section">
        <div class="section-title">
          <span>负责人</span>
          <UpOutlined class="collapse-icon" />
        </div>
        <a-select
          v-model:value="filterState.owner"
          placeholder="搜索负责人"
          style="width: 100%"
          allowClear
          showSearch
          :filter-option="filterOption"
          :options="filterOptions.owners"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { UpOutlined } from '@ant-design/icons-vue'
import { getFilterOptions } from '@/services/DataMap/searchService.js'

const emit = defineEmits(['change'])

const filterOptions = ref({ databases: [], owners: [] })

onMounted(async () => {
  filterOptions.value = await getFilterOptions() || { databases: [], owners: [] }
})

const filterState = reactive({
  dataType: 'all',
  searchScope: 'all',
  database: undefined,
  owner: undefined,
})

function filterOption(input, option) {
  const label = (option.children?.[0]?.children || option.label || option.value || '').toString().toLowerCase()
  return label.includes(input.toLowerCase())
}

function resetFilters() {
  filterState.dataType = 'all'
  filterState.searchScope = 'all'
  filterState.database = undefined
  filterState.owner = undefined
  emit('change', { ...filterState })
}

watch(
  filterState,
  (val) => {
    emit('change', { ...val })
  },
  { deep: true }
)
</script>

<style scoped>
.filter-panel {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.filter-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  font-size: 13px;
  border-radius: 4px;
  padding: 0 8px;
}

.reset-btn {
  color: #64748b;
}

.reset-btn:hover {
  color: #1e293b;
  background-color: #f1f5f9;
}

.save-btn {
  box-shadow: none;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.filter-section {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.filter-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  cursor: pointer;
}

.collapse-icon {
  font-size: 10px;
  color: #94a3b8;
}

.custom-radio-group,
.custom-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-radio,
.custom-checkbox {
  font-size: 13px;
  color: #475569;
  margin-left: 0 !important;
  display: flex;
  align-items: center;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 1px;
}

.radio-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
</style>
