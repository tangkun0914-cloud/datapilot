<template>
  <div class="session-list-view">
    <div class="session-search-box">
      <a-select
        v-model:value="moduleFilter"
        size="small"
        :options="moduleOptions"
        popup-match-select-width
        class="module-select"
      />
      <a-input
        v-model:value="searchTerm"
        size="small"
        placeholder="搜索..."
        allow-clear
        class="search-input"
      >
        <template #prefix><SearchOutlined style="color: #ccc" /></template>
      </a-input>
    </div>

    <template v-if="filteredSessions.length > 0">
      <!-- 当前会话 -->
      <div v-if="activeSessions.length > 0">
        <div class="session-group-title">当前会话</div>
        <div
          v-for="s in activeSessions"
          :key="s.id"
          class="session-card"
          :class="{ active: isActive(s) }"
          @click="$emit('select', s)"
        >
          <div class="session-header">
            <template v-if="editingSessionId === s.id">
              <input
                class="edit-title-input"
                v-model="editTitleValue"
                @keydown.enter="saveTitle"
                @keydown.esc="cancelEdit"
                @blur="saveTitle"
                @click.stop
                autofocus
              />
            </template>
            <template v-else>
              <div class="session-title">
                <ThunderboltFilled v-if="!isFullscreen && s.status === 'ACTIVE'" style="color: rgba(108, 76, 155); font-size: 12px; margin-right: 6px;" />
                {{ s.title }}
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span class="module-tag">{{ s.module }}</span>
                <a-dropdown :trigger="['click']">
                  <div class="action-dots" @click.stop><MoreOutlined /></div>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="rename" @click="startEditing($event, s)">
                        <EditOutlined /> 重命名
                      </a-menu-item>
                      <a-menu-item key="delete" danger @click="handleDelete($event, s)">
                        <DeleteOutlined /> 删除会话
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </div>

          <div class="session-meta">
            <div class="session-summary">{{ s.summary }}</div>
          </div>

          <div v-if="s.tags && s.tags.length > 0" class="session-tags-container">
            <div v-for="(t, idx) in s.tags" :key="idx" class="session-mini-tag">
              <component :is="getTagIcon(t.type)" /> {{ t.label }}
            </div>
          </div>

          <div class="session-time">{{ formatSessionTime(s.ts) }}</div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div v-if="historySessions.length > 0">
        <div class="session-group-title" :class="{ 'mt-4': activeSessions.length > 0 }">历史会话</div>
        <div
          v-for="s in historySessions"
          :key="s.id"
          class="session-card"
          :class="{ active: isActive(s) }"
          @click="$emit('select', s)"
        >
          <div class="session-header">
            <template v-if="editingSessionId === s.id">
              <input
                class="edit-title-input"
                v-model="editTitleValue"
                @keydown.enter="saveTitle"
                @keydown.esc="cancelEdit"
                @blur="saveTitle"
                @click.stop
                autofocus
              />
            </template>
            <template v-else>
              <div class="session-title">
                <ThunderboltFilled v-if="!isFullscreen && s.status === 'ACTIVE'" style="color: rgba(108, 76, 155); font-size: 12px; margin-right: 6px;" />
                {{ s.title }}
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span class="module-tag">{{ s.module }}</span>
                <a-dropdown :trigger="['click']">
                  <div class="action-dots" @click.stop><MoreOutlined /></div>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="rename" @click="startEditing($event, s)">
                        <EditOutlined /> 重命名
                      </a-menu-item>
                      <a-menu-item key="delete" danger @click="handleDelete($event, s)">
                        <DeleteOutlined /> 删除会话
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </div>

          <div class="session-meta">
            <div class="session-summary">{{ s.summary }}</div>
          </div>

          <div v-if="s.tags && s.tags.length > 0" class="session-tags-container">
            <div v-for="(t, idx) in s.tags" :key="idx" class="session-mini-tag">
              <component :is="getTagIcon(t.type)" /> {{ t.label }}
            </div>
          </div>

          <div class="session-time">{{ formatSessionTime(s.ts) }}</div>
        </div>
      </div>
    </template>

    <a-empty v-else description="未找到相关会话" :image="simpleImage" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  SearchOutlined, ThunderboltFilled, EditOutlined, DeleteOutlined, MoreOutlined,
  FileTextOutlined, TableOutlined, LinkOutlined, ClusterOutlined, FileUnknownOutlined
} from '@ant-design/icons-vue'
import { Empty } from 'ant-design-vue'
import dayjs from 'dayjs'

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

const props = defineProps({
  sessions: { type: Array, default: () => [] },
  isFullscreen: { type: Boolean, default: false },
  viewingSessionId: { type: [Number, String, null], default: null },
})

const emit = defineEmits(['select', 'delete', 'rename'])

const searchTerm = ref('')
const moduleFilter = ref('ALL')
const editingSessionId = ref(null)
const editTitleValue = ref('')

const moduleOptions = computed(() => {
  return [
    { value: 'ALL', label: '全部模块' },
    { value: '数据地图', label: '数据地图' },
    { value: '数据开发', label: '数据开发' },
    { value: '数据质量', label: '数据质量' },
    { value: '数据集成', label: '数据集成' },
  ]
})

const filteredSessions = computed(() => {
  return props.sessions.filter(s => {
    const term = searchTerm.value.toLowerCase()
    const matchesSearch =
      s.title.toLowerCase().includes(term) ||
      s.summary.toLowerCase().includes(term) ||
      (s.tags && s.tags.some(t => t.label.toLowerCase().includes(term)))
    const matchesModule = moduleFilter.value === 'ALL' || s.module === moduleFilter.value
    return matchesSearch && matchesModule
  })
})

const activeSessions = computed(() => filteredSessions.value.filter(s => s.status === 'ACTIVE'))
const historySessions = computed(() => filteredSessions.value.filter(s => s.status !== 'ACTIVE'))

function isActive(session) {
  if (props.isFullscreen) return props.viewingSessionId === session.id
  return session.status === 'ACTIVE'
}

function startEditing(e, session) {
  // Prevent dropdown click from triggering session selection
  if (e && e.domEvent) {
    e.domEvent.stopPropagation()
  } else if (e && e.stopPropagation) {
    e.stopPropagation()
  }
  editingSessionId.value = session.id
  editTitleValue.value = session.title
}

function saveTitle() {
  if (editingSessionId.value) {
    emit('rename', editingSessionId.value, editTitleValue.value)
    editingSessionId.value = null
  }
}

function cancelEdit() {
  editingSessionId.value = null
}

function handleDelete(e, session) {
  if (e && e.domEvent) {
    e.domEvent.stopPropagation()
  } else if (e && e.stopPropagation) {
    e.stopPropagation()
  }
  emit('delete', session)
}

function formatSessionTime(isoString) {
  const date = dayjs(isoString)
  const now = dayjs()
  if (date.isSame(now, 'day')) return `今天 ${date.format('HH:mm')}`
  if (date.isSame(now.subtract(1, 'day'), 'day')) return `昨天 ${date.format('HH:mm')}`
  if (date.isSame(now, 'year')) return date.format('MM-DD HH:mm')
  return date.format('YYYY-MM-DD')
}

const tagIconMap = {
  task: FileTextOutlined,
  table: TableOutlined,
  issue: LinkOutlined,
  layer: ClusterOutlined,
}

function getTagIcon(type) {
  return tagIconMap[type] || FileUnknownOutlined
}
</script>

<style scoped>
.session-list-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

.session-search-box {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.module-select {
  width: 110px;
}

.search-input {
  flex: 1;
}

.session-search-box :deep(.ant-input-affix-wrapper),
.session-search-box :deep(.ant-select-selector) {
  height: 24px !important;
  min-height: 24px;
  border-radius: 6px;
  font-size: 12px;
}

.session-search-box :deep(.ant-input) {
  font-size: 12px;
}

.session-search-box :deep(.ant-select-selector) {
  padding: 0 8px !important;
}

.session-search-box :deep(.ant-select-single .ant-select-selection-item),
.session-search-box :deep(.ant-select-single .ant-select-selection-placeholder) {
  line-height: 22px !important;
  font-size: 12px;
}

.session-search-box :deep(.ant-input-affix-wrapper:focus),
.session-search-box :deep(.ant-input-affix-wrapper-focused),
.session-search-box :deep(.ant-select-focused .ant-select-selector) {
  border-color: rgba(108, 76, 155) !important;
  box-shadow: 0 0 0 2px rgba(108, 76, 155, 0.15) !important;
}

.session-group-title {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 8px;
  text-transform: uppercase;
  padding-left: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.session-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  margin-bottom: 10px;
}

.session-card:last-child {
  margin-bottom: 0;
}

.session-card:hover {
  border-color: rgba(108, 76, 155);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.session-card.active {
  border-color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.07);
}

.session-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.session-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  word-break: break-all;
  flex: 1;
  margin-right: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.module-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid #e0e0e0;
}

.action-dots {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-dots:hover {
  background: #f0f0f0;
  color: #666;
}

.session-meta {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.session-summary {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

.session-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.session-mini-tag {
  font-size: 10px;
  color: #666;
  background: #fafafa;
  padding: 2px 6px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px dashed #e0e0e0;
}

.session-time {
  font-size: 10px;
  color: #bbb;
  margin-top: auto;
  text-align: right;
}

.edit-title-input {
  font-size: 13px;
  padding: 0 4px;
  height: 24px;
  border: 1px solid rgba(108, 76, 155);
  border-radius: 2px;
  outline: none;
  width: 100%;
}
</style>
