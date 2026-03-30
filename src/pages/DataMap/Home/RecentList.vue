<template>
  <div class="section-card">
    <div class="tabs-header">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="recent" tab="最近浏览">
          <div class="list-items">
            <div
              v-for="item in recentViewed"
              :key="item.id"
              class="asset-list-item"
              @click="goDetail(item)"
            >
              <div class="item-icon-wrapper">
                <DataSourceIcon :type="item.serviceType" :size="24" />
              </div>
              <div class="item-content">
                <div class="item-header">
                  <span class="item-title-link font-mono" :title="getFullTableName(item)">{{ getFullTableName(item) }}</span>
                  <a-tooltip title="复制表名">
                    <CopyOutlined class="copy-icon" @click="copyName(getFullTableName(item), $event)" />
                  </a-tooltip>
                </div>
                <div class="item-desc">
                  <span class="text-xs text-gray-500">{{ item.displayName || item.name }}</span>
                  <span class="owner-info">
                    <UserOutlined class="owner-icon" /> {{ ownerName(item) }}
                  </span>
                </div>
                <div class="item-description mt-1">
                  <a-tooltip :title="item.description" placement="topLeft">
                    <span class="text-xs text-gray-400 truncate block w-full">{{ item.description || '暂无描述' }}</span>
                  </a-tooltip>
                </div>
              </div>
        <div class="item-meta">
          <a-tooltip title="最近30天被查询/引用的次数">
            <div class="meta-unit stat-item">
              <FireFilled class="stat-icon fire" />
              <span class="stat-count">{{ Math.floor((item.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
            </div>
          </a-tooltip>
          <a-tooltip title="最近30天被浏览的次数">
            <div class="meta-unit stat-item">
              <EyeOutlined class="stat-icon eye" />
              <span class="stat-count">{{ item.usageSummary?.dailyStats?.count || 0 }}</span>
            </div>
          </a-tooltip>
          <div class="divider"></div>
          <a-tooltip :title="item.isFavorite ? '取消收藏' : '加入收藏'">
            <div class="meta-unit fav" @click.stop="toggleFav(item)">
              <StarFilled v-if="item.isFavorite" class="star-filled active" />
              <StarOutlined v-else class="star-outlined" />
            </div>
          </a-tooltip>
        </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="favorites" tab="我的收藏">
          <div class="list-items">
            <div
              v-for="item in favorites"
              :key="item.id"
              class="asset-list-item"
              @click="goDetail(item)"
            >
              <div class="item-icon-wrapper">
                <DataSourceIcon :type="item.serviceType" :size="24" />
              </div>
              <div class="item-content">
                <div class="item-header">
                  <span class="item-title-link font-mono" :title="getFullTableName(item)">{{ getFullTableName(item) }}</span>
                  <a-tooltip title="复制表名">
                    <CopyOutlined class="copy-icon" @click="copyName(getFullTableName(item), $event)" />
                  </a-tooltip>
                </div>
                <div class="item-desc">
                  <span class="text-xs text-gray-500">{{ item.displayName || item.name }}</span>
                  <span class="owner-info">
                    <UserOutlined class="owner-icon" /> {{ ownerName(item) }}
                  </span>
                </div>
                <div class="item-description mt-1">
                  <a-tooltip :title="item.description" placement="topLeft">
                    <span class="text-xs text-gray-400 truncate block w-full">{{ item.description || '暂无描述' }}</span>
                  </a-tooltip>
                </div>
              </div>
        <div class="item-meta">
          <a-tooltip title="最近30天被查询/引用的次数">
            <div class="meta-unit stat-item">
              <FireFilled class="stat-icon fire" />
              <span class="stat-count">{{ Math.floor((item.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
            </div>
          </a-tooltip>
          <a-tooltip title="最近30天被浏览的次数">
            <div class="meta-unit stat-item">
              <EyeOutlined class="stat-icon eye" />
              <span class="stat-count">{{ item.usageSummary?.dailyStats?.count || 0 }}</span>
            </div>
          </a-tooltip>
          <div class="divider"></div>
          <a-tooltip :title="item.isFavorite ? '取消收藏' : '加入收藏'">
            <div class="meta-unit fav" @click.stop="toggleFav(item)">
              <StarFilled v-if="item.isFavorite" class="star-filled active" />
              <StarOutlined v-else class="star-outlined" />
            </div>
          </a-tooltip>
        </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="hot" tab="热度榜">
          <div class="list-items">
            <div
              v-for="(item, index) in hotRank"
              :key="item.id"
              class="asset-list-item"
              @click="goDetail(item)"
            >
              <div :class="['rank-badge', rankClass(index)]">{{ index + 1 }}</div>
              <div class="item-icon-wrapper">
                <DataSourceIcon :type="item.serviceType" :size="24" />
              </div>
              <div class="item-content">
                <div class="item-header">
                  <span class="item-title-link font-mono" :title="getFullTableName(item)">{{ getFullTableName(item) }}</span>
                  <a-tooltip title="复制表名">
                    <CopyOutlined class="copy-icon" @click="copyName(getFullTableName(item), $event)" />
                  </a-tooltip>
                </div>
                <div class="item-desc">
                  <span class="text-xs text-gray-500">{{ item.displayName || item.name }}</span>
                  <span class="owner-info">
                    <UserOutlined class="owner-icon" /> {{ ownerName(item) }}
                  </span>
                </div>
                <div class="item-description mt-1">
                  <a-tooltip :title="item.description" placement="topLeft">
                    <span class="text-xs text-gray-400 truncate block w-full">{{ item.description || '暂无描述' }}</span>
                  </a-tooltip>
                </div>
              </div>
              <div class="item-meta">
                <a-tooltip title="最近30天被查询/引用的次数">
                  <div class="meta-unit stat-item">
                    <FireFilled class="stat-icon fire" />
                    <span class="stat-count">{{ Math.floor((item.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
                  </div>
                </a-tooltip>
                <a-tooltip title="最近30天被浏览的次数">
                  <div class="meta-unit stat-item">
                    <EyeOutlined class="stat-icon eye" />
                    <span class="stat-count">{{ item.usageSummary?.dailyStats?.count || 0 }}</span>
                  </div>
                </a-tooltip>
                <div class="divider"></div>
                <a-tooltip :title="item.isFavorite ? '取消收藏' : '加入收藏'">
                  <div class="meta-unit fav" @click.stop="toggleFav(item)">
                    <StarFilled v-if="item.isFavorite" class="star-filled active" />
                    <StarOutlined v-else class="star-outlined" />
                  </div>
                </a-tooltip>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="view-more-footer">
      <div class="view-more-btn" @click="goSearch">
        查看更多 <RightOutlined class="arrow-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, FireFilled, StarFilled, StarOutlined, RightOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import DataSourceIcon from '@/pages/DataMap/components/DataSourceIcon.vue'
import { getRecentViewed, getFavorites } from '@/services/DataMap/tableService.js'
import { getHotRank } from '@/services/DataMap/searchService.js'

const router = useRouter()
const activeTab = ref('recent')
const recentViewed = ref([])
const favorites = ref([])
const hotRank = ref([])

onMounted(async () => {
  const [recent, favs, rank] = await Promise.all([
    getRecentViewed(),
    getFavorites(),
    getHotRank(),
  ])
  recentViewed.value = recent || []
  favorites.value = favs || []
  hotRank.value = rank || []
})

function rankClass(index) {
  if (index === 0) return 'top'
  if (index === 1) return 'top'
  if (index === 2) return 'top'
  return ''
}

function ownerName(item) {
  return item.owners?.[0]?.name ?? '-'
}

function getFullTableName(item) {
  // Extract database name from fullyQualifiedName if available
  // Format is usually: service.database.schema.table or service.database.table
  if (item.fullyQualifiedName) {
    const parts = item.fullyQualifiedName.split('.')
    if (parts.length >= 3) {
      // Return database.table (e.g., dwa_cn.dwa_cn_cus_df_complain_detail)
      return `${parts[1]}.${item.name}`
    }
  }
  return item.name
}

function goDetail(item) {
  router.push('/detail/' + encodeURIComponent(item.fullyQualifiedName))
}

function goSearch() {
  if (activeTab.value === 'recent') {
    router.push({ path: '/search', query: { sort: 'recent' } })
  } else if (activeTab.value === 'favorites') {
    router.push({ path: '/search', query: { sort: 'favorites' } })
  } else if (activeTab.value === 'hot') {
    router.push({ path: '/search', query: { sort: 'hot' } })
  } else {
    router.push('/search')
  }
}

function toggleFav(item) {
  item.isFavorite = !item.isFavorite
}

function copyName(name, event) {
  event.stopPropagation()
  navigator.clipboard.writeText(name).then(() => {
    message.success('表名已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}
</script>

<style scoped>
.section-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  height: 580px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-header :deep(.ant-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.tabs-header :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow-y: auto;
}

.list-items {
  display: flex;
  flex-direction: column;
}

.asset-list-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 8px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  cursor: pointer;
}

.asset-list-item:hover {
  background-color: #f8fafc;
  border-radius: 8px;
}

.asset-list-item:last-child {
  border-bottom: none;
}

.rank-badge {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  margin-right: 12px;
  flex-shrink: 0;
  background: #f0f0f0;
  color: #8c8c8c;
  margin-top: 4px;
}

.rank-badge.top {
  background: #fff1f0;
  color: #ff4d4f;
}

.item-icon-wrapper {
  margin-right: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.item-content {
  flex: 1;
  min-width: 0;
  margin-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-title-link {
  font-size: 15px;
  font-weight: 600;
  color: #3b82f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.item-title-link:hover {
  color: #4096ff;
  text-decoration: underline;
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

.item-description {
  width: 100%;
}

.item-description .truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 100%;
}

.item-desc {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.owner-info {
  margin-left: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
}

.owner-icon {
  font-size: 11px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  color: #64748b;
  font-size: 13px;
  margin-top: 2px;
}

.meta-unit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item {
  cursor: help;
  padding: 4px 6px;
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
  color: #3b82f6;
}

.stat-count {
  font-family: monospace;
  font-weight: 500;
}

.meta-unit.fav {
  min-width: 24px;
  justify-content: flex-end;
  cursor: pointer;
}

.star-filled {
  color: #ffc53d;
  font-size: 16px;
}

.star-outlined {
  color: #d9d9d9;
  font-size: 16px;
  transition: color 0.2s;
}

.meta-unit.fav:hover .star-outlined {
  color: #ffc53d;
  opacity: 0.8;
}

.divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  margin: 0 4px;
}

.view-more-footer {
  border-top: 1px solid #f0f0f0;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  margin-top: 8px;
  flex-shrink: 0;
}
</style>
