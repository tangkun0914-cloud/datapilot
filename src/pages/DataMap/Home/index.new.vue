<template>
  <div class="home-page">
    <HeroBanner />

    <!-- 下方内容区 -->
    <div class="home-content">
      <a-row :gutter="24">
        <!-- 左侧：最近浏览 -->
        <a-col :span="16">
          <RecentList />
        </a-col>

        <!-- 右侧：快速入口 + 数据专题 -->
        <a-col :span="8">
          <!-- 数据概览 -->
          <div class="stat-overview">
            <div class="stat-item" v-for="(stat, i) in stats" :key="stat.label">
              <div class="stat-icon-wrap" :style="{ background: stat.iconBg }">
                <component :is="stat.icon" :style="{ color: stat.iconColor }" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- 数据专题 -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <h3 class="sidebar-card-title">数据专题</h3>
              <span class="view-more-link" @click="router.push('/topics')">查看全部 <RightOutlined /></span>
            </div>
            <div class="topic-list">
              <div
                v-for="topic in topics"
                :key="topic.id"
                class="topic-row"
                @click="router.push('/topics/' + topic.id)"
              >
                <div class="topic-row-main">
                  <span class="topic-row-title">{{ topic.title }}</span>
                  <span class="topic-row-desc">{{ topic.desc }}</span>
                </div>
                <a-tag class="topic-row-count">{{ topic.count }} 表</a-tag>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  RightOutlined,
  TableOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import HeroBanner from './HeroBanner.new.vue'
import RecentList from './RecentList.vue'
import { getTopics } from '@/services/DataMap/topicService.js'

/** 首页侧边栏「数据专题」最多展示的热门条数 */
const HOME_HOT_TOPIC_LIMIT = 6

const router = useRouter()

const stats = [
  { value: '12,846', label: '数据表', icon: TableOutlined, iconBg: 'rgba(59, 130, 246, 0.08)', iconColor: '#3b82f6' },
  { value: '386', label: '数据库', icon: DatabaseOutlined, iconBg: 'rgba(16, 185, 129, 0.08)', iconColor: '#10b981' },
  { value: '5', label: '数据源', icon: CloudServerOutlined, iconBg: 'rgba(245, 158, 11, 0.08)', iconColor: '#f59e0b' },
  { value: '1,240', label: '日活跃查询', icon: ThunderboltOutlined, iconBg: 'rgba(139, 92, 246, 0.08)', iconColor: '#8b5cf6' },
]

const topics = ref([])

onMounted(async () => {
  const list = await getTopics()
  const sorted = [...(list || [])].sort((a, b) => {
    const byFollow = (b.followerCount || 0) - (a.followerCount || 0)
    if (byFollow !== 0) return byFollow
    return (b.tableCount || 0) - (a.tableCount || 0)
  })
  topics.value = sorted.slice(0, HOME_HOT_TOPIC_LIMIT).map(t => ({
    id: t.id,
    title: t.name,
    desc: t.description,
    count: t.tableCount || 0,
  }))
})
</script>

<style scoped>
.home-page {
  min-height: 100%;
  background: #f8fafc;
}

.home-content {
  padding: 28px 32px 32px;
}

/* ===== 数据概览 ===== */
.stat-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.stat-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Fira Code', 'SF Mono', monospace;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}

/* ===== 侧边卡片 ===== */
.sidebar-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.sidebar-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sidebar-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.view-more-link {
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.view-more-link:hover {
  color: #2563eb;
}

/* ===== 专题列表 ===== */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-row:hover {
  background: #f8fafc;
}

.topic-row-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.topic-row-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.topic-row-desc {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-row-count {
  flex-shrink: 0;
  font-size: 11px;
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
  border-radius: 6px;
  margin: 0;
}
</style>
