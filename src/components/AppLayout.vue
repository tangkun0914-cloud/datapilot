<template>
  <a-layout class="app-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :collapsedWidth="64"
      class="app-sider"
    >
      <div class="logo-area">
        <div class="logo-icon-small"></div>
        <div class="logo-title" v-show="!collapsed">DataPilot</div>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        :items="menuItemsWithIcons"
        @click="handleMenuClick"
      />
      <div class="sider-trigger" @click="collapsed = !collapsed">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-header">
        <div class="header-left">
          <div class="header-logo" v-if="collapsed">
            <div class="logo-icon-small"></div>
          </div>
          <a-menu
            v-model:selectedKeys="topMenuKey"
            theme="dark"
            mode="horizontal"
            class="top-menu"
            :items="topMenuItems"
          />
        </div>
        <div class="header-right">
          <button class="header-copilot-btn" @click="copilotStore.open()">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="copilot-icon"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            Copilot
          </button>
          <div class="header-divider"></div>
          <div class="header-region">Region: SG <DownOutlined class="text-xs ml-1" /></div>
          <div class="header-space">Space: marketing_dev <DownOutlined class="text-xs ml-1" /></div>
          <QuestionCircleOutlined class="header-icon-btn" />
          <BellOutlined class="header-icon-btn" />
          <a-avatar :size="32" class="user-avatar" style="background-color: #ffb4a2; color: #fff;">王</a-avatar>
          <span class="header-username">王睿(wangrui)</span>
        </div>
      </a-layout-header>
      <div class="main-body">
        <a-layout-content class="app-content">
          <router-view />
        </a-layout-content>
        <transition name="copilot-slide">
          <CopilotPanel v-if="copilotStore.visible" />
        </transition>
      </div>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { h } from 'vue'
import {
  AppstoreOutlined,
  HomeOutlined,
  SearchOutlined,
  FolderOutlined,
  TableOutlined,
  RobotOutlined,
  UserOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import { menuItems } from '@/router/index.js'
import CopilotPanel from '@/components/Copilot/CopilotPanel.vue'
import { useCopilotStore } from '@/stores/copilot.js'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const copilotStore = useCopilotStore()
const selectedKeys = ref([route.path])
const topMenuKey = ref(['map'])

const topMenuItems = [
  { key: 'integration', label: '数据集成' },
  { key: 'dev', label: '数据开发' },
  { key: 'publish', label: '发布中心' },
  { key: 'schedule', label: '调度管理' },
  { key: 'ops', label: '监控运维' },
  { key: 'quality', label: '数据质量' },
  { key: 'map', label: '数据地图' },
  { key: 'security', label: '安全中心' },
  { key: 'project', label: '项目管理' },
]

const iconMap = {
  AppstoreOutlined,
  HomeOutlined,
  SearchOutlined,
  FolderOutlined,
  TableOutlined,
  RobotOutlined,
}

const menuItemsWithIcons = computed(() =>
  menuItems.map((item) => ({
    key: item.key,
    label: item.label,
    icon: iconMap[item.icon] ? () => h(iconMap[item.icon]) : undefined,
  }))
)

const breadcrumbItems = computed(() => {
  const path = route.path
  if (path === '/' || path === '') {
    return [{ label: '工作台', path: null }]
  }
  if (path === '/home') {
    return [{ label: '数据地图首页', path: null }]
  }
  const parts = path.split('/').filter(Boolean)
  return parts.map((p, i) => {
    const fullPath = '/' + parts.slice(0, i + 1).join('/')
    const isLast = i === parts.length - 1
    const menuItem = menuItems.find((m) => m.key === fullPath)
    const label = isLast ? (route.meta?.title || (menuItem?.label ?? p)) : (menuItem?.label ?? p)
    return { label, path: isLast ? null : fullPath }
  })
})

watch(
  () => route.path,
  (path) => {
    const basePath = path.split('/').slice(0, 2).join('/') || '/'
    const match = menuItems.find((m) => m.key === basePath || path.startsWith(m.key + '/'))
    selectedKeys.value = match ? [match.key] : [path]
  },
  { immediate: true }
)

function handleMenuClick({ key }) {
  router.push(key)
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-sider {
  background: #001529 !important;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-sider :deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
}

.logo-area {
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

.logo-icon-small {
  width: 28px;
  height: 28px;
  background: radial-gradient(circle at center, #722ed1 0%, #1677ff 100%);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.4);
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.app-sider :deep(.ant-menu) {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sider-trigger {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sider-trigger:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.app-header {
  background: #001529 !important;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  z-index: 10;
  gap: 24px;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 0;
}

.header-logo {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.top-menu {
  flex: 1;
  background: transparent !important;
  border-bottom: none !important;
  line-height: 64px !important;
}

.top-menu :deep(.ant-menu-item) {
  color: rgba(255,255,255,0.65) !important;
  font-size: 14px;
  padding: 0 12px !important;
  transition: all 0.3s;
}

.top-menu :deep(.ant-menu-item:hover) {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important; /* 鼠标放上去的覆盖层背景色 */
}

.top-menu :deep(.ant-menu-item-selected) {
  color: #fff !important;
  background: transparent !important;
  font-weight: 500;
}

.top-menu :deep(.ant-menu-item-selected::after) {
  border-bottom-color: #1677ff !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.header-copilot-btn {
  color: #fff;
  background: transparent; /* 与顶部导航背景色一致 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 0 8px; /* 减小宽度 */
  height: 28px; /* 明确设置高度为 28px，远小于顶部导航的 64px */
  display: flex;
  align-items: center;
  gap: 4px; /* 减小图标和文字的间距 */
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.header-copilot-btn:hover {
  background: #6b9fff;
  border-color: #6b9fff;
  color: #fff;
}

.copilot-icon {
  margin-top: -1px;
}

.header-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
}

.header-region,
.header-space {
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.header-icon-btn {
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s;
}

.header-icon-btn:hover {
  color: #fff;
}

.user-avatar {
  cursor: pointer;
}

.header-username {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
}

.main-body {
  display: flex;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.app-content {
  background: #f5f7fa;
  padding: 24px;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Copilot 面板滑入动画 */
.copilot-slide-enter-active,
.copilot-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copilot-slide-enter-from,
.copilot-slide-leave-to {
  width: 0 !important;
  opacity: 0;
  border-left-color: transparent;
}
</style>
