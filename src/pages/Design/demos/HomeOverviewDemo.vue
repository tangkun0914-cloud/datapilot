<template>
  <div class="demo-wrapper">
    <!-- 数据概览 -->
    <div class="stat-overview">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
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
        <span class="view-more">查看全部 ></span>
      </div>
      <div class="topic-list">
        <div v-for="topic in topics" :key="topic.id" class="topic-row">
          <div class="topic-main">
            <span class="topic-title">{{ topic.title }}</span>
            <span class="topic-desc">{{ topic.desc }}</span>
          </div>
          <span class="topic-count">{{ topic.count }} 表</span>
        </div>
      </div>
    </div>

    <!-- AI Copilot 入口 -->
    <div class="copilot-entry">
      <div class="copilot-icon">
        <RobotOutlined />
      </div>
      <div class="copilot-text">
        <span class="copilot-title">AI 数据助手</span>
        <span class="copilot-desc">智能找表、血缘追溯、字段释义</span>
      </div>
      <RightOutlined class="copilot-arrow" />
    </div>
  </div>
</template>

<script setup>
import {
  TableOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'

const stats = [
  { value: '12,846', label: '数据表', icon: TableOutlined, iconBg: 'rgba(59, 130, 246, 0.08)', iconColor: '#3b82f6' },
  { value: '386', label: '数据库', icon: DatabaseOutlined, iconBg: 'rgba(16, 185, 129, 0.08)', iconColor: '#10b981' },
  { value: '5', label: '数据源', icon: CloudServerOutlined, iconBg: 'rgba(245, 158, 11, 0.08)', iconColor: '#f59e0b' },
  { value: '1,240', label: '日活跃查询', icon: ThunderboltOutlined, iconBg: 'rgba(139, 92, 246, 0.08)', iconColor: '#8b5cf6' },
]

const topics = [
  { id: 1, title: '营销活动', desc: '双11/618大促全链路数据', count: 128 },
  { id: 2, title: '用户增长', desc: '拉新留存与生命周期分析', count: 85 },
  { id: 3, title: '供应链', desc: '库存流转与物流履约效率', count: 210 },
  { id: 4, title: '财务经营', desc: '营收利润与成本分摊', count: 64 },
]
</script>

<style scoped>
.demo-wrapper {
  max-width: 360px;
}

.stat-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #f0f0f0;
}

.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Fira Code', monospace;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  color: #94a3b8;
}

.sidebar-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  margin-bottom: 14px;
}

.sidebar-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sidebar-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.view-more {
  font-size: 11px;
  color: #94a3b8;
  cursor: pointer;
}

.topic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.topic-row:hover {
  background: #f8fafc;
}

.topic-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.topic-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.topic-desc {
  font-size: 11px;
  color: #94a3b8;
}

.topic-count {
  font-size: 11px;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 1px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.copilot-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%);
  border: 1px solid rgba(191, 219, 254, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copilot-entry:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.1);
}

.copilot-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
}

.copilot-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.copilot-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.copilot-desc {
  font-size: 11px;
  color: #64748b;
}

.copilot-arrow {
  color: #94a3b8;
  font-size: 11px;
}
</style>
