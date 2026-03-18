<template>
  <div class="layout-demo-wrapper">
    <div class="layout-demo">
      <!-- 侧边栏 -->
      <div class="demo-sider" :class="{ collapsed: siderCollapsed }">
        <div class="demo-logo">
          <div class="demo-logo-icon"></div>
          <span v-if="!siderCollapsed" class="demo-logo-text">DataPilot</span>
        </div>
        <div class="demo-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            :class="['demo-menu-item', { active: activeMenu === item.key }]"
            @click="activeMenu = item.key"
          >
            <component :is="item.icon" class="demo-menu-icon" />
            <span v-if="!siderCollapsed" class="demo-menu-label">{{ item.label }}</span>
          </div>
        </div>
        <div class="demo-trigger" @click="siderCollapsed = !siderCollapsed">
          <MenuUnfoldOutlined v-if="siderCollapsed" />
          <MenuFoldOutlined v-else />
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="demo-right">
        <!-- 顶部导航 -->
        <div class="demo-header">
          <div class="demo-top-menus">
            <span
              v-for="item in topMenus"
              :key="item.key"
              :class="['demo-top-item', { active: activeTop === item.key }]"
              @click="activeTop = item.key"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="demo-header-right">
            <span class="demo-copilot-btn">
              <ThunderboltOutlined /> Copilot
            </span>
            <span class="demo-region">Region: SG</span>
            <a-avatar :size="22" style="background: #ffb4a2; color: #fff; font-size: 11px;">王</a-avatar>
          </div>
        </div>
        <!-- 内容区 -->
        <div class="demo-content">
          <div class="demo-content-placeholder">
            <AppstoreOutlined style="font-size: 24px; color: #cbd5e1;" />
            <span>{{ activeMenuLabel }} 页面内容区</span>
          </div>
        </div>
      </div>
    </div>
    <p class="demo-hint">可交互：点击左侧菜单切换、点击折叠按钮收起侧栏、点击顶部导航切换</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  HomeOutlined,
  SearchOutlined,
  FolderOutlined,
  TableOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'

const siderCollapsed = ref(false)
const activeMenu = ref('/home')
const activeTop = ref('map')

const menuItems = [
  { key: '/home', icon: HomeOutlined, label: '首页' },
  { key: '/search', icon: SearchOutlined, label: '资产检索' },
  { key: '/topics', icon: FolderOutlined, label: '数据专题' },
  { key: '/mytables', icon: TableOutlined, label: '我的库表' },
  { key: '/copilot', icon: RobotOutlined, label: 'AI Copilot' },
]

const topMenus = [
  { key: 'integration', label: '数据集成' },
  { key: 'dev', label: '数据开发' },
  { key: 'schedule', label: '调度管理' },
  { key: 'quality', label: '数据质量' },
  { key: 'map', label: '数据地图' },
  { key: 'security', label: '安全中心' },
]

const activeMenuLabel = computed(() => {
  const item = menuItems.find(m => m.key === activeMenu.value)
  return item?.label || ''
})
</script>

<style scoped>
.layout-demo-wrapper {
  width: 100%;
}

.layout-demo {
  display: flex;
  height: 340px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  font-size: 12px;
}

/* 侧边栏 */
.demo-sider {
  width: 160px;
  background: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.demo-sider.collapsed {
  width: 48px;
}

.demo-logo {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.demo-logo-icon {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at center, #722ed1, #1677ff);
  border-radius: 4px;
  flex-shrink: 0;
}

.demo-logo-text {
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.demo-menu {
  flex: 1;
  padding: 6px 0;
}

.demo-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: all 0.15s;
}

.collapsed .demo-menu-item {
  justify-content: center;
  padding: 7px 0;
}

.demo-menu-item:hover {
  color: #fff;
}

.demo-menu-item.active {
  background: #1677ff;
  color: #fff;
}

.demo-menu-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.demo-menu-label {
  white-space: nowrap;
  overflow: hidden;
}

.demo-trigger {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  border-top: 1px solid rgba(255,255,255,0.06);
  transition: color 0.2s;
}

.demo-trigger:hover {
  color: #fff;
}

/* 右侧 */
.demo-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demo-header {
  height: 42px;
  background: #001529;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.demo-top-menus {
  display: flex;
  gap: 4px;
  overflow: hidden;
}

.demo-top-item {
  color: rgba(255,255,255,0.55);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.demo-top-item:hover {
  color: rgba(255,255,255,0.85);
}

.demo-top-item.active {
  color: #fff;
  font-weight: 500;
  border-bottom: 2px solid #1677ff;
  border-radius: 0;
}

.demo-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.demo-copilot-btn {
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
}

.demo-region {
  color: rgba(255,255,255,0.65);
  font-size: 11px;
}

.demo-content {
  flex: 1;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 13px;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
