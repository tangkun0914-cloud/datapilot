<template>
  <div class="portal">
    <header class="portal-hero">
      <div class="portal-hero-inner">
        <p class="portal-kicker">DataPilot · 数据地图</p>
        <h1 class="portal-title">工作台</h1>
        <p class="portal-sub">
          产品功能一键直达；业务组件库集中查阅 Props / 预览 / 使用页面。
        </p>
      </div>
    </header>

    <div class="portal-body">
      <!-- 产品矩阵 -->
      <section class="portal-section" v-for="prod in products" :key="prod.key">
        <div class="section-head">
          <h2 class="section-title">
            <component :is="prod.icon" class="section-icon" :style="{ color: prod.color }" />
            {{ prod.title }}
          </h2>
          <p class="section-desc">{{ prod.desc }}</p>
        </div>
        <div class="card-grid">
          <a-card
            v-for="p in prod.entries"
            :key="p.to"
            class="portal-card"
            :class="{ 'portal-card--map-agent': prod.key === 'mapagent' }"
            :hoverable="true"
            @click="go(p.to)"
          >
            <template #title>
              <component :is="p.icon" class="card-title-icon" />
              {{ p.title }}
            </template>
            <p class="card-desc">{{ p.desc }}</p>
            <div class="card-meta">{{ p.to }}</div>
          </a-card>
        </div>
      </section>

      <!-- 业务组件库 -->
      <section class="portal-section">
        <div class="section-head">
          <h2 class="section-title">
            <AppstoreOutlined class="section-icon design" />
            业务组件库
          </h2>
          <p class="section-desc">Config 驱动文档：预览、API、L3 拆解、跨模块归类</p>
        </div>
        <a-card class="portal-card design-card" :hoverable="true" @click="go('/design')">
          <div class="design-card-inner">
            <div class="design-card-text">
              <h3>打开组件库</h3>
              <p>侧栏支持「全部 / 平台级 / 模块级 / 子模块级」筛选，右侧为统一文档模板。</p>
            </div>
            <a-button type="primary" size="large" class="design-cta" @click.stop="go('/design')">
              进入 /design
              <RightOutlined />
            </a-button>
          </div>
        </a-card>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAgentStore } from '@/stores/DataMap/agent.js'
import {
  HomeOutlined,
  SearchOutlined,
  FolderOutlined,
  TableOutlined,
  RobotOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  RightOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  AlertOutlined,
  FileProtectOutlined,
  NodeIndexOutlined,
  BellOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const agentStore = useAgentStore()

function go(path) {
  // 与顶部 Logo 进入 Agent 一致：从工作台进入时默认浅色主题
  if (path === '/datamap/agent' || path === '/agent') {
    agentStore.isDarkMode = false
  }
  router.push(path === '/agent' ? '/datamap/agent' : path)
}

const products = [
  {
    key: 'mapagent',
    title: '地图 Agent',
    desc: '对话式数据探索、智能检索与血缘分析',
    icon: MessageOutlined,
    color: '#7c3aed',
    entries: [
      {
        title: '地图 Agent 首页',
        desc: '对话式交互、工作台与资产详情分屏',
        to: '/datamap/agent',
        icon: RobotOutlined,
      }
    ]
  },
  {
    key: 'datamap',
    title: '数据地图 (Data Map)',
    desc: '数据资产的发现、理解与管理',
    icon: DatabaseOutlined,
    color: '#0ea5e9',
    entries: [
      {
        title: '数据地图首页',
        desc: '智能检索、最近访问、平台概览',
        to: '/home',
        icon: HomeOutlined,
      },
      {
        title: '资产检索',
        desc: '筛选、搜索、列表/表格结果',
        to: '/search',
        icon: SearchOutlined,
      },
      {
        title: '资产详情（示例）',
        desc: '表详情、Tab、血缘等',
        to: '/detail/example',
        icon: FileSearchOutlined,
      },
      {
        title: '数据专题',
        desc: '专题列表与卡片',
        to: '/topics',
        icon: FolderOutlined,
      },
      {
        title: '专题详情（示例）',
        desc: '专题内表管理与说明',
        to: '/topics/1',
        icon: FolderOpenOutlined,
      },
      {
        title: '我的库表',
        desc: '负责表列表、转让',
        to: '/mytables',
        icon: TableOutlined,
      },
      {
        title: 'AI Copilot',
        desc: '全屏对话与快捷能力',
        to: '/copilot',
        icon: RobotOutlined,
      },
    ]
  },
  {
    key: 'dataops',
    title: '监控运维 (DataOps)',
    desc: '数据质量监控、告警与影响评估',
    icon: DashboardOutlined,
    color: '#10b981',
    entries: [
      {
        title: '告警列表',
        desc: '数据质量告警事件处理',
        to: '/monitoring/alerts',
        icon: AlertOutlined,
      },
      {
        title: '通知策略',
        desc: '告警路由与通知状态管理',
        to: '/monitoring/strategies',
        icon: BellOutlined,
      },
      {
        title: '手机端落地页（示例）',
        desc: '移动端告警详情展示',
        to: '/monitoring/mobile/alert/1',
        icon: FileProtectOutlined,
      },
      {
        title: '监控大盘 (开发中)',
        desc: '全链路监控视图与核心指标',
        to: '/monitoring/dashboard',
        icon: DashboardOutlined,
      },
      {
        title: '影响评估 (开发中)',
        desc: 'DataOps 影响评估与智能协同',
        to: '/monitoring/impact',
        icon: NodeIndexOutlined,
      },
    ]
  }
]
</script>

<style scoped>
.portal {
  min-height: 100%;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 40%, #fff 100%);
}

.portal-hero {
  padding: 36px 40px 28px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0c4a6e 100%);
  color: #fff;
}

.portal-hero-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.portal-kicker {
  margin: 0 0 8px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.portal-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.portal-sub {
  margin: 0;
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.portal-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 40px 48px;
}

.portal-section {
  margin-bottom: 40px;
}

.section-head {
  margin-bottom: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.section-icon {
  font-size: 20px;
}

.section-icon.design {
  color: #7c3aed;
}

.section-desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.portal-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.portal-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.portal-card--map-agent:hover {
  border-color: #c4b5fd;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12);
}

.portal-card--map-agent :deep(.card-title-icon) {
  color: #7c3aed;
}

.portal-card :deep(.ant-card-head-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.card-title-icon {
  font-size: 18px;
  color: #1677ff;
}

.card-desc {
  margin: 0 0 10px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  min-height: 40px;
}

.card-meta {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: #94a3b8;
}

.design-card {
  max-width: 720px;
  border-radius: 12px;
  border: 1px solid #ddd6fe;
  background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #fff 100%);
}

.design-card-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.design-card-text h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #5b21b6;
}

.design-card-text p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 420px;
}

.design-cta {
  border-radius: 8px;
  height: 44px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
