<template>
  <div class="filter-section">
    <div class="filter-grid" :class="{ collapsed: !expanded }">
      <!-- Row 1: always visible -->
      <div class="filter-item">
        <label class="filter-label">来源</label>
        <a-select
          v-model:value="form.source"
          placeholder="请选择"
          allowClear
          @change="handleSourceChange"
          class="filter-control"
        >
          <a-select-option v-for="s in filterOptions.sources" :key="s" :value="s">{{ s }}</a-select-option>
        </a-select>
      </div>

      <div class="filter-item" v-if="form.source !== '质量监控'">
        <label class="filter-label">任务名</label>
        <a-input v-model:value="form.taskName" placeholder="支持搜索任务名" allowClear class="filter-control" />
      </div>

      <div class="filter-item" v-if="form.source === '质量监控'">
        <label class="filter-label">数据表名</label>
        <a-input v-model:value="form.tableName" placeholder="支持搜索数据表名" allowClear class="filter-control" />
      </div>

      <div class="filter-item">
        <label class="filter-label">事件ID</label>
        <a-input v-model:value="form.eventId" placeholder="支持搜索事件ID" allowClear class="filter-control" />
      </div>

      <div class="filter-item">
        <label class="filter-label">监控事件</label>
        <a-select v-model:value="form.monitorEvent" placeholder="请选择" allowClear class="filter-control">
          <a-select-option v-for="e in availableEvents" :key="e" :value="e">{{ e }}</a-select-option>
        </a-select>
      </div>

      <div class="filter-item">
        <label class="filter-label">事件状态</label>
        <a-select 
          v-model:value="form.status" 
          mode="multiple"
          placeholder="请选择" 
          allowClear 
          class="filter-control"
          :maxTagCount="1"
        >
          <a-select-option v-for="s in filterOptions.statuses" :key="s" :value="s">{{ s }}</a-select-option>
        </a-select>
      </div>

      <!-- 收起：操作区在第一行末；展开：隐藏此行由下方 advanced 内操作区承接 -->
      <div v-show="!expanded" class="filter-item filter-actions-wrap filter-actions-row1">
        <div class="filter-actions">
          <button type="button" class="btn-reset" @click="handleReset">重置</button>
          <button type="button" class="btn-query" @click="handleQuery">查询</button>
          <button type="button" class="btn-link" @click="expanded = true">展开</button>
        </div>
      </div>

      <!-- Row 2: advanced (collapsible) -->
      <div class="filter-item advanced-item">
        <label class="filter-label">告警等级</label>
        <a-select v-model:value="form.severity" placeholder="请选择" allowClear class="filter-control">
          <a-select-option v-for="l in filterOptions.levels" :key="l" :value="l">{{ l }}</a-select-option>
        </a-select>
      </div>

      <div class="filter-item col-span-2 advanced-item" v-if="form.source !== '质量监控'">
        <label class="filter-label">调度批次</label>
        <a-range-picker
          v-model:value="scheduleDateRange"
          class="filter-control filter-schedule-batch"
          :placeholder="['开始日期', '结束日期']"
          separator="→"
          format="YYYY-MM-DD HH:mm:ss"
          :show-time="{ format: 'HH:mm:ss' }"
          allowClear
        />
      </div>

      <div class="filter-item advanced-item">
        <label class="filter-label">负责人</label>
        <a-select v-model:value="form.owner" placeholder="请选择" allowClear class="filter-control">
          <a-select-option v-for="o in filterOptions.owners" :key="o" :value="o">{{ o }}</a-select-option>
        </a-select>
      </div>

      <div class="filter-item advanced-item">
        <label class="filter-label">操作人</label>
        <a-select v-model:value="form.operator" placeholder="请选择" allowClear class="filter-control">
          <a-select-option v-for="op in filterOptions.operators" :key="op" :value="op">{{ op }}</a-select-option>
        </a-select>
      </div>

      <!-- 展开：操作区在第二行末（高级筛选项之后） -->
      <div v-show="expanded" class="filter-item filter-actions-wrap advanced-item filter-actions-row2">
        <div class="filter-actions">
          <button type="button" class="btn-reset" @click="handleReset">重置</button>
          <button type="button" class="btn-query" @click="handleQuery">查询</button>
          <button type="button" class="btn-link" @click="expanded = false">收起</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * FilterSection - 告警筛选区
 *
 * 告警列表顶部的多维度筛选组件。支持来源、任务名/数据表名（根据来源动态切换）、
 * 事件ID、监控事件（根据来源动态过滤枚举）、事件状态、告警等级、调度批次日期时间范围、
 * 负责人、操作人等筛选条件。内置展开/收起高级筛选；收起时「重置/查询/展开」在第一行末，
 * 展开时操作区移至第二行高级筛选项之后。
 *
 * @prop {Object} filterOptions - 筛选选项配置，含 sources, events, statuses, levels, owners, operators 数组
 *
 * @emits query (formData: Object) - 点击查询时触发，传递当前筛选表单值
 * @emits reset ()                 - 点击重置时触发
 */
import { reactive, ref, computed } from 'vue'

const props = defineProps({
  filterOptions: {
    type: Object,
    default: () => ({ sources: [], events: [], statuses: [], levels: [], owners: [], operators: [] }),
  },
})

const emit = defineEmits(['query', 'reset'])

const expanded = ref(false)

const form = reactive({
  source: undefined,
  taskName: '',
  tableName: '',
  eventId: '',
  monitorEvent: undefined,
  status: [],
  severity: undefined,
  dateStart: null,
  dateEnd: null,
  owner: undefined,
  operator: undefined,
})

/** 调度批次：与 a-range-picker 双向绑定，对外仍保留 form.dateStart / dateEnd 供查询提交 */
const scheduleDateRange = computed({
  get() {
    if (form.dateStart && form.dateEnd) {
      return [form.dateStart, form.dateEnd]
    }
    return null
  },
  set(val) {
    if (Array.isArray(val) && val?.[0] && val?.[1]) {
      form.dateStart = val[0]
      form.dateEnd = val[1]
    } else {
      form.dateStart = null
      form.dateEnd = null
    }
  },
})

const availableEvents = computed(() => {
  if (form.source === '数据开发' || form.source === '数据集成') {
    return ['离线任务失败', '离线任务超时', '离线SLA完成超时', '离线SLA启动超时']
  } else if (form.source === '质量监控') {
    return ['质量监控-运行失败', '质量监控-触发异常阈值']
  }
  return [
    '离线任务失败', '离线任务超时', '离线SLA完成超时', '离线SLA启动超时',
    '质量监控-运行失败', '质量监控-触发异常阈值'
  ]
})

function handleSourceChange() {
  form.taskName = ''
  form.tableName = ''
  form.monitorEvent = undefined
}

function handleQuery() {
  emit('query', { ...form })
}

function handleReset() {
  Object.assign(form, {
    source: undefined,
    taskName: '',
    tableName: '',
    eventId: '',
    monitorEvent: undefined,
    status: [],
    severity: undefined,
    dateStart: null,
    dateEnd: null,
    owner: undefined,
    operator: undefined,
  })
  emit('reset')
}
</script>

<style scoped>
.filter-section {
  background: #fff;
  padding: 20px 24px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px 24px;
}

/* Hide advanced row when collapsed */
.filter-grid.collapsed .advanced-item {
  display: none !important;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item.col-span-2 {
  grid-column: span 2;
}

.filter-label {
  font-size: 13px;
  color: #333333;
}

.filter-control {
  width: 100%;
}

.filter-control :deep(.ant-input),
.filter-control :deep(.ant-select-selector),
.filter-control :deep(.ant-picker) {
  height: 32px !important;
  font-size: 13px;
}

/* 范围选择器：单行高度与筛选项对齐 */
.filter-schedule-batch.filter-control :deep(.ant-picker-range) {
  height: 32px !important;
  min-height: 32px;
}

.filter-schedule-batch.filter-control :deep(.ant-picker-input > input) {
  font-size: 13px;
}

/* Actions */
.filter-actions-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-reset {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-reset:hover {
  color: #3b73f6;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.btn-query {
  height: 32px;
  padding: 0 16px;
  background: #3b73f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-query:hover { background: #2c63e4; }

.btn-link {
  color: #3b73f6;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
}

.btn-link:hover { text-decoration: underline; }
</style>
