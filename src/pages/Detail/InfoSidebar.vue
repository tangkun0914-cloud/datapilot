<template>
  <aside class="info-sidebar">
    <a-collapse v-model:activeKey="activeKeys" :bordered="false" class="custom-collapse">
      <!-- 基础信息 -->
      <a-collapse-panel key="basic" header="基础信息" class="custom-panel">
        <dl class="info-list">
          <div class="info-item info-item-block">
            <dt>表名</dt>
            <dd class="flex flex-col mt-1">
              <div class="flex items-center gap-2">
                <a-tooltip :title="table.database?.name + '.' + table.name">
                  <span class="table-name-en">{{ table.database?.name || 'db' }}.{{ table.name }}</span>
                </a-tooltip>
                <a-tooltip title="复制表名">
                  <CopyOutlined class="copy-icon" @click.stop="copyTableName" />
                </a-tooltip>
              </div>
              <a-tooltip :title="table.displayName || table.name">
                <span class="table-name-cn">{{ table.displayName || table.name }}</span>
              </a-tooltip>
            </dd>
          </div>
          <div class="info-item">
            <dt>数据源</dt>
            <dd class="flex items-center gap-1.5">
              <SourceTag :type="table.serviceType" :size="16" />
              <span class="text-[13px]">{{ table.serviceType }}</span>
            </dd>
          </div>
          <div class="info-item">
            <dt>数仓分层</dt>
            <dd>
              <a-tag color="blue">{{ warehouseLayer }}</a-tag>
            </dd>
          </div>
          <div class="info-item">
            <dt>负责人</dt>
            <dd class="flex items-center gap-1">
              <UserOutlined class="text-xs opacity-60" />
              {{ ownerName }}
            </dd>
          </div>
          <div class="info-item">
            <dt>表类型</dt>
            <dd>{{ table.tableType || '-' }}</dd>
          </div>
          <div class="info-item">
            <dt>分区类型</dt>
            <dd>{{ table.partitionType || '-' }}</dd>
          </div>
          <div class="info-item">
            <dt>创建时间</dt>
            <dd class="font-mono text-gray-500">{{ formatDate(table.createdAt) }}</dd>
          </div>
          <div class="info-item">
            <dt>更新时间</dt>
            <dd class="font-mono text-gray-500">{{ formatDate(table.updatedAt) }}</dd>
          </div>
          <div class="info-item">
            <dt>数据量</dt>
            <dd class="font-mono">{{ table.profile?.rowCount?.toLocaleString() }} 行</dd>
          </div>
          <div class="info-item">
            <dt>存储容量</dt>
            <dd class="font-mono">{{ formatSize(table.profile?.sizeInByte) }}</dd>
          </div>
        </dl>
      </a-collapse-panel>

      <!-- 业务信息 -->
      <a-collapse-panel key="business" header="业务信息" class="custom-panel">
        <dl class="info-list">
          <div class="info-item">
            <dt>业务域</dt>
            <dd>{{ table.domain?.name }}</dd>
          </div>
          <div class="info-item">
            <dt>所属主题</dt>
            <dd>交易分析</dd>
          </div>
          <div class="info-item">
            <dt>标签</dt>
            <dd class="flex flex-wrap gap-1">
              <a-tag v-for="tag in displayTags" :key="tag" class="mr-0">{{ tag }}</a-tag>
            </dd>
          </div>
          <div class="info-item info-item-block">
            <dt>描述</dt>
            <dd class="mt-1 text-[13px] leading-relaxed bg-gray-50 p-2 rounded">{{ table.description }}</dd>
          </div>
        </dl>
      </a-collapse-panel>

      <!-- Tableau数据源 -->
      <a-collapse-panel key="tableau" header="Tableau数据源（正式环境）" class="custom-panel">
        <dl class="info-list">
          <div class="info-item">
            <dt>是否推送</dt>
            <dd>
              <a-badge :status="table.tableauInfo?.isPushed ? 'success' : 'default'" :text="table.tableauInfo?.isPushed ? '已推送' : '未推送'" />
            </dd>
          </div>
          <div class="info-item">
            <dt>数据源名称</dt>
            <dd class="font-mono text-[13px]">{{ table.tableauInfo?.dataSourceName || '-' }}</dd>
          </div>
          <div class="info-item">
            <dt>最近状态</dt>
            <dd>
              <span :class="statusClass(table.tableauInfo?.lastExecStatus)">
                {{ statusText(table.tableauInfo?.lastExecStatus) }}
              </span>
            </dd>
          </div>
          <div class="info-item info-item-block">
            <dt>最近开始时间</dt>
            <dd class="mt-1 font-mono text-gray-500">{{ formatDateTime(table.tableauInfo?.lastExecStartTime) }}</dd>
          </div>
          <div class="info-item info-item-block">
            <dt>最近结束时间</dt>
            <dd class="mt-1 font-mono text-gray-500">{{ formatDateTime(table.tableauInfo?.lastExecEndTime) }}</dd>
          </div>
        </dl>
      </a-collapse-panel>
    </a-collapse>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UserOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import SourceTag from '@/components/SourceTag.vue'

const props = defineProps({
  table: { type: Object, required: true },
})

const activeKeys = ref(['basic', 'business', 'tableau'])

function copyTableName() {
  const textToCopy = `${props.table.database?.name || 'db'}.${props.table.name}`
  navigator.clipboard.writeText(textToCopy).then(() => {
    message.success('表名已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

const ownerName = computed(() => props.table.owners?.[0]?.name || '-')

const warehouseLayer = computed(() => {
  const tag = props.table.tags?.find((t) => t.tagFQN?.startsWith('数仓分层.'))
  return tag ? tag.tagFQN.split('.').pop() : '-'
})

const displayTags = computed(() =>
  (props.table.tags || []).map((t) => t.tagFQN.split('.').pop())
)

function formatDate(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(1) + ' KB'
}

function formatDateTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const statusMap = {
  SUCCESS: { text: '成功', color: 'text-green-500' },
  FAILED: { text: '失败', color: 'text-red-500' },
  RUNNING: { text: '运行中', color: 'text-blue-500' },
}

function statusText(status) {
  if (!status) return '-'
  return statusMap[status]?.text || status
}

function statusClass(status) {
  if (!status) return ''
  return statusMap[status]?.color || ''
}
</script>

<style scoped>
.info-sidebar {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 8px 0;
  margin-right: 24px;
  overflow-y: auto;
  height: 100%; /* 占满父容器高度 */
}

.custom-collapse {
  background-color: transparent !important;
}

.custom-collapse :deep(.ant-collapse-item) {
  border-bottom: 1px solid #f1f5f9;
}

.custom-collapse :deep(.ant-collapse-item:last-child) {
  border-bottom: none;
}

.custom-collapse :deep(.ant-collapse-header) {
  padding: 16px 20px !important;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  align-items: center;
  background-color: transparent !important;
}

.custom-collapse :deep(.ant-collapse-content) {
  background-color: transparent !important;
  border-top: none;
}

.custom-collapse :deep(.ant-collapse-content-box) {
  padding: 0 20px 16px !important;
}

.custom-panel :deep(.ant-collapse-header::before) {
  content: '';
  display: inline-block;
  width: 4px;
  height: 14px;
  background: #1677ff;
  border-radius: 2px;
  margin-right: 8px;
  margin-left: -12px;
}

.custom-panel :deep(.ant-collapse-expand-icon) {
  color: #94a3b8;
}

.info-list {
  margin: 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.info-item dt {
  flex-shrink: 0;
  width: 72px;
  font-size: 13px;
  color: #64748b;
  line-height: 24px;
}

.info-item dd {
  flex: 1;
  font-size: 13px;
  color: #334155;
  margin: 0;
  line-height: 24px;
}

.info-item-block {
  flex-direction: column;
}

.info-item-block dt {
  width: auto;
  margin-bottom: 4px;
}

.info-item-block dd {
  color: #475569;
}

.table-name-en {
  font-weight: 600;
  color: #1e293b;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
  cursor: pointer;
  transition: color 0.2s;
}

.table-name-en:hover {
  color: #1677ff;
}

.table-name-cn {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
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
</style>
