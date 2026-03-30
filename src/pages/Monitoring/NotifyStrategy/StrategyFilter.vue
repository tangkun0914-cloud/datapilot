<template>
  <div class="filter-area">
    <div class="filter-row">
      <div class="filter-item">
        <label class="filter-label">策略名称</label>
        <a-input 
          :value="searchName" 
          @update:value="$emit('update:searchName', $event)"
          placeholder="搜索策略名称" 
          allowClear 
          class="filter-input" 
        />
      </div>
      <div class="filter-item">
        <label class="filter-label">创建人</label>
        <a-select 
          :value="searchCreator" 
          @update:value="$emit('update:searchCreator', $event)"
          placeholder="请选择创建人" 
          allowClear 
          class="filter-input"
        >
          <a-select-option value="王博(bowang1)">王博(bowang1)</a-select-option>
          <a-select-option value="王蕊(ruiwang1)">王蕊(ruiwang1)</a-select-option>
        </a-select>
      </div>
      <div class="filter-actions">
        <button class="btn-icon-only" @click="$emit('refresh')" title="刷新">
          <ReloadOutlined />
        </button>
        <button class="btn-primary" @click="$emit('create')">
          <PlusOutlined />
          <span>新建策略</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'

defineProps({
  searchName: {
    type: String,
    default: ''
  },
  searchCreator: {
    type: String,
    default: undefined
  }
})

defineEmits(['update:searchName', 'update:searchCreator', 'refresh', 'create'])
</script>

<style scoped>
.filter-area {
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 24px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
}

.filter-label {
  font-size: 13px;
  color: #666;
}

.filter-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.btn-icon-only {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon-only:hover {
  color: #3b73f6;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.btn-primary {
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #3b73f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #2c63e4;
}
</style>
