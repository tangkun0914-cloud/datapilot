<template>
  <div class="detail-page">
    <PageHeader :breadcrumbs="breadcrumbs" :hoverable="true">
      <template #title>
        <span class="db-name">{{ table.database?.name || 'db' }}.</span><span class="tb-name">{{ table.name }}</span>
      </template>
      <template #title-suffix>
        <a-tooltip title="复制表名">
          <CopyOutlined class="copy-icon ml-3" @click="copyTableName" />
        </a-tooltip>
        <div class="table-cn-name ml-4">
          {{ table.displayName }}
        </div>
        <span class="ml-5 flex items-center gap-3 text-sm">
          <a-tooltip title="最近30天被查询/引用的次数">
            <div class="stat-item">
              <FireFilled class="stat-icon fire" />
              <span class="stat-count">{{ Math.floor((table.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
            </div>
          </a-tooltip>
          <a-tooltip title="最近30天被浏览的次数">
            <div class="stat-item">
              <EyeOutlined class="stat-icon eye" />
              <span class="stat-count">{{ table.usageSummary?.dailyStats?.count || 0 }}</span>
            </div>
          </a-tooltip>
          <div class="divider"></div>
          <a-tooltip :title="starred ? '取消收藏' : '加入收藏'">
            <div class="fav-btn" @click="starred = !starred">
              <StarFilled v-if="starred" class="star-icon active" />
              <StarOutlined v-else class="star-icon" />
            </div>
          </a-tooltip>
        </span>
      </template>
      <template #extra>
        <a-button :icon="h(LockOutlined)" class="apply-perm-btn">申请权限</a-button>
      </template>
    </PageHeader>

    <div class="detail-body">
      <InfoSidebar :table="table" class="detail-sidebar" />
      <div class="detail-main">
        <a-tabs v-model:activeKey="activeTab" class="detail-tabs">
          <a-tab-pane key="fields" tab="字段详情">
            <FieldDetailTab :columns="table.columns" :table-constraints="table.tableConstraints" />
          </a-tab-pane>
          <a-tab-pane key="preview" tab="预览探查">
            <PreviewTab :tableId="table.id" />
          </a-tab-pane>
          <a-tab-pane key="usage" tab="使用说明">
            <UsageTab :description="table.description" />
          </a-tab-pane>
          <a-tab-pane key="script" tab="脚本信息">
            <ScriptTab :table="table" />
          </a-tab-pane>
          <a-tab-pane key="production" tab="生产信息">
            <ProductionTab :tableId="table.id" />
          </a-tab-pane>
          <a-tab-pane key="lineage" tab="血缘关系">
            <LineageTab :fqn="fqn" />
          </a-tab-pane>
          <a-tab-pane key="history" tab="变更历史">
            <ChangeHistoryTab :tableId="table.id" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { StarOutlined, StarFilled, LockOutlined, FireFilled, EyeOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import PageHeader from '@/components/PageHeader.vue'
import InfoSidebar from './InfoSidebar.vue'
import FieldDetailTab from './FieldDetailTab.vue'
import PreviewTab from './PreviewTab.vue'
import UsageTab from './UsageTab.vue'
import ProductionTab from './ProductionTab.vue'
import ScriptTab from './ScriptTab.vue'
import LineageTab from './LineageTab.vue'
import ChangeHistoryTab from './ChangeHistoryTab.vue'
import { getTableByFqn } from '@/services/tableService.js'

const route = useRoute()
const fqn = computed(() => route.params.fqn)
const table = ref({})
const loading = ref(false)
const starred = ref(false)
const activeTab = ref('fields')

const breadcrumbs = computed(() => [
  { label: '首页', path: '/home' },
  { label: '资产检索', path: '/search' },
  { label: `${table.value.database?.name || 'db'}.${table.value.name || ''}` },
])

async function fetchDetail(fqnValue) {
  if (!fqnValue) return
  loading.value = true
  try {
    const data = await getTableByFqn(fqnValue)
    table.value = data || {}
  } finally {
    loading.value = false
  }
}

watch(fqn, (newFqn) => {
  activeTab.value = 'fields'
  fetchDetail(newFqn)
}, { immediate: true })

function copyTableName() {
  const textToCopy = `${table.value.database?.name || 'db'}.${table.value.name}`
  navigator.clipboard.writeText(textToCopy).then(() => {
    message.success('表名已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 占满整个视口高度 */
  margin: -24px;
}

.detail-body {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0; /* 关键：允许子元素在 flex 容器中滚动 */
  padding: 24px 32px 32px;
  background: var(--color-bg-page);
  overflow: hidden; /* 防止外层滚动 */
}

.detail-sidebar {
  flex-shrink: 0;
  width: 30%;
  min-width: 260px;
  max-width: 380px;
  /* 侧边栏内部滚动已经在 InfoSidebar.vue 中处理了 (overflow-y: auto) */
}

.detail-main {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止溢出 */
  height: 100%; /* 占满父容器高度 */
}

.detail-tabs {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-tabs :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow-y: auto; /* 右侧内容区独立滚动 */
  padding-right: 8px; /* 滚动条预留空间 */
  padding-bottom: 24px;
}

.detail-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 20px;
  flex-shrink: 0; /* 防止 tab 头部被压缩 */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
  cursor: help;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background-color: #f1f5f9;
}

.stat-icon {
  font-size: 14px;
}

.stat-icon.fire {
  color: #ff7875;
}

.stat-icon.eye {
  color: #1677ff;
}

.stat-count {
  font-family: monospace;
  font-weight: 500;
}

.divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  margin: 0 4px;
}

.fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #d9d9d9;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
}

.fav-btn:hover .star-icon:not(.active) {
  color: #ffc53d;
  opacity: 0.8;
}

.star-icon.active {
  color: #ffc53d;
}

.apply-perm-btn {
  font-size: 13px;
  color: #475569;
  border-color: #d9d9d9;
  border-radius: 6px;
  height: 32px;
  padding: 0 14px;
  transition: all 0.2s;
}

.apply-perm-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
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

.db-name {
  font-weight: 400;
  opacity: 0.6;
  font-size: 0.9em;
  font-family: 'Fira Code', monospace;
}

.tb-name {
  font-weight: 600;
  font-family: 'Fira Code', monospace;
}

.table-cn-name {
  font-size: 13px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
</style>
