<template>
  <div class="home-page">
    <HeroBanner @open-copilot="openCopilot" />

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

          <!-- AI Copilot 入口 -->
          <div class="copilot-entry" @click="copilotStore.open()">
            <div class="copilot-entry-icon">
              <RobotOutlined />
            </div>
            <div class="copilot-entry-text">
              <span class="copilot-entry-title">AI 数据助手</span>
              <span class="copilot-entry-desc">智能找表、血缘追溯、字段释义</span>
            </div>
            <RightOutlined class="copilot-entry-arrow" />
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
  RobotOutlined,
  TableOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import HeroBanner from './HeroBanner.new.vue'
import RecentList from './RecentList.vue'
import { useCopilotStore } from '@/stores/copilot.js'
import { getTopics } from '@/services/topicService.js'

const router = useRouter()
const copilotStore = useCopilotStore()

function openCopilot() {
  copilotStore.open()
}

const stats = [
  { value: '12,846', label: '数据表', icon: TableOutlined, iconBg: 'rgba(59, 130, 246, 0.08)', iconColor: '#3b82f6' },
  { value: '386', label: '数据库', icon: DatabaseOutlined, iconBg: 'rgba(16, 185, 129, 0.08)', iconColor: '#10b981' },
  { value: '5', label: '数据源', icon: CloudServerOutlined, iconBg: 'rgba(245, 158, 11, 0.08)', iconColor: '#f59e0b' },
  { value: '1,240', label: '日活跃查询', icon: ThunderboltOutlined, iconBg: 'rgba(139, 92, 246, 0.08)', iconColor: '#8b5cf6' },
]

const topics = ref([])

onMounted(async () => {
  const list = await getTopics()
  topics.value = (list || []).slice(0, 4).map(t => ({
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

/* ===== AI Copilot 入口 ===== */
.copilot-entry {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%);
  border: 1px solid rgba(191, 219, 254, 0.6);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copilot-entry:hover {
  border-color: #93c5fd;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.1);
  transform: translateY(-2px);
}

.copilot-entry-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.copilot-entry-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.copilot-entry-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.copilot-entry-desc {
  font-size: 12px;
  color: #64748b;
}

.copilot-entry-arrow {
  color: #94a3b8;
  font-size: 12px;
  transition: transform 0.2s;
}

.copilot-entry:hover .copilot-entry-arrow {
  transform: translateX(3px);
  color: #3b82f6;
}
</style>
