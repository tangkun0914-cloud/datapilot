<template>
  <div class="change-history-tab">
    <div class="history-toolbar">
      <a-button size="small" class="diff-btn" @click="diffVisible = true">
        <template #icon><DiffOutlined /></template>
        版本对比
      </a-button>
    </div>

    <a-timeline class="history-timeline">
      <a-timeline-item v-for="item in changeHistory" :key="item.id" :color="dotColor(item.changeType)">
        <div class="timeline-card">
          <div class="timeline-header" style="gap: 24px;">
            <span class="timeline-time">{{ formatDateTime(item.timestamp) }}</span>
            <a-tag :color="tagColor(item.changeType)" class="m-0">{{ getChangeTypeText(item.changeType) }}</a-tag>
          </div>
          <div class="timeline-body">
            <div class="timeline-desc">{{ item.changeDescription }}</div>
            <div class="timeline-user">
              <UserOutlined class="mr-1" />
              {{ item.user }}
            </div>
          </div>
          <div v-if="item.before || item.after" class="timeline-change">
            <span v-if="item.before" class="change-before">{{ item.before }}</span>
            <span v-if="item.before && item.after" class="change-arrow">→</span>
            <span v-if="item.after" class="change-after">{{ item.after }}</span>
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>

    <!-- 版本对比 Modal -->
    <a-modal v-model:open="diffVisible" title="版本对比" width="760px" :footer="null">
      <div class="diff-container">
        <div class="diff-col">
          <div class="diff-col-title">变更前</div>
          <div class="diff-content">
            <div v-for="item in changeHistory" :key="'b-' + item.id" class="diff-row">
              <span class="diff-time">{{ formatDate(item.timestamp) }}</span>
              <span :class="diffBeforeClass(item)">{{ item.before || '(无)' }}</span>
            </div>
          </div>
        </div>
        <div class="diff-col">
          <div class="diff-col-title">变更后</div>
          <div class="diff-content">
            <div v-for="item in changeHistory" :key="'a-' + item.id" class="diff-row">
              <span class="diff-time">{{ formatDate(item.timestamp) }}</span>
              <span :class="diffAfterClass(item)">{{ item.after || '(无)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { UserOutlined, DiffOutlined } from '@ant-design/icons-vue'
import { getTableVersions } from '@/services/tableService.js'

const props = defineProps({
  tableId: { type: String, default: '' },
})

const diffVisible = ref(false)
const changeHistory = ref([])

watch(() => props.tableId, async (id) => {
  if (!id) return
  changeHistory.value = await getTableVersions(id) || []
}, { immediate: true })

const changeTypeMap = {
  ADD_COLUMN: '新增字段',
  DROP_COLUMN: '删除字段',
  MODIFY_COLUMN: '变更字段',
  ALTER_TABLE: '数据表变更',
}

const changeTypeColors = {
  ADD_COLUMN: 'green',
  DROP_COLUMN: 'red',
  MODIFY_COLUMN: 'orange',
  ALTER_TABLE: 'blue',
}

function getChangeTypeText(type) {
  return changeTypeMap[type] || type
}

function tagColor(type) {
  return changeTypeColors[type] || 'default'
}

function dotColor(type) {
  const map = { ADD_COLUMN: '#52c41a', DROP_COLUMN: '#ff4d4f', MODIFY_COLUMN: '#fa8c16', ALTER_TABLE: '#1677ff' }
  return map[type] || '#d9d9d9'
}

function formatDateTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function diffBeforeClass(item) {
  if (item.changeType === 'DROP_COLUMN') return 'diff-text diff-removed'
  if (item.changeType === 'MODIFY_COLUMN') return 'diff-text diff-modified'
  return 'diff-text'
}

function diffAfterClass(item) {
  if (item.changeType === 'ADD_COLUMN') return 'diff-text diff-added'
  if (item.changeType === 'MODIFY_COLUMN') return 'diff-text diff-modified'
  return 'diff-text'
}
</script>

<style scoped>
.change-history-tab {
  padding: 0 0 16px;
}

.history-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.diff-btn {
  font-size: 13px;
  color: #475569;
  border-color: #d9d9d9;
  border-radius: 6px;
  height: 28px;
  padding: 0 12px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.diff-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
  background-color: #f0f5ff;
}

.history-timeline {
  padding-top: 4px;
}

.timeline-card {
  padding: 12px 16px;
  background: #fafbfc;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  max-width: 600px;
}

.timeline-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-time {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: 'Fira Code', monospace;
}

.timeline-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.timeline-desc {
  font-size: 13px;
  color: var(--color-text-body);
  line-height: 1.6;
}

.timeline-user {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.timeline-change {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  font-size: 12px;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.change-before {
  color: #ff4d4f;
  text-decoration: line-through;
}

.change-arrow {
  color: var(--color-text-muted);
}

.change-after {
  color: #52c41a;
}

/* Diff Modal */
.diff-container {
  display: flex;
  gap: 0;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.diff-col {
  flex: 1;
  min-width: 0;
}

.diff-col:first-child {
  border-right: 1px solid #f0f0f0;
}

.diff-col-title {
  padding: 8px 12px;
  background: #fafafa;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-title);
  border-bottom: 1px solid #f0f0f0;
}

.diff-content {
  max-height: 400px;
  overflow-y: auto;
}

.diff-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid #fafafa;
  font-size: 12px;
}

.diff-time {
  flex-shrink: 0;
  width: 48px;
  color: var(--color-text-muted);
}

.diff-text {
  font-family: monospace;
  color: var(--color-text-body);
}

.diff-removed {
  background: #fff2f0;
  color: #ff4d4f;
  text-decoration: line-through;
  padding: 1px 4px;
  border-radius: 2px;
}

.diff-added {
  background: #f6ffed;
  color: #52c41a;
  padding: 1px 4px;
  border-radius: 2px;
}

.diff-modified {
  background: #fffbe6;
  color: #fa8c16;
  padding: 1px 4px;
  border-radius: 2px;
}
</style>
