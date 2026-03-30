<template>
  <a-layout class="app-layout">
    <a-layout-sider
      v-if="!isAgentPage"
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :collapsedWidth="64"
      class="app-sider"
    >
      <div class="logo-area cursor-pointer" @click="goToAgent">
        <div class="logo-icon-small"></div>
        <div class="logo-title" v-show="!collapsed">DataPilot</div>
      </div>
      
      <Transition name="menu-fade" mode="out-in">
        <a-menu
          :key="currentModule"
          v-model:selectedKeys="selectedKeys"
          theme="dark"
          mode="inline"
          :items="menuItemsWithIcons"
          @click="handleMenuClick"
        />
      </Transition>

      <div class="sider-trigger" @click="collapsed = !collapsed">
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-header">
        <div class="header-left">
          <div class="header-logo cursor-pointer" v-if="collapsed || isAgentPage" @click="goToAgent">
            <div class="logo-icon-small"></div>
            <div v-if="isAgentPage" class="logo-title ml-3">DataPilot</div>
          </div>
          <a-menu
            v-model:selectedKeys="topMenuKey"
            theme="dark"
            mode="horizontal"
            class="top-menu"
            :items="topMenuItems"
            @click="handleTopMenuClick"
          />
        </div>
        <div class="header-right">
          <!-- Agent 页面专属的主题切换按钮 -->
          <a-switch v-if="isAgentPage" v-model:checked="agentStore.isDarkMode" size="small" class="mr-2">
            <template #checkedChildren><i class="fa-solid fa-moon text-[10px]"></i></template>
            <template #unCheckedChildren><i class="fa-solid fa-sun text-[10px] text-yellow-500"></i></template>
          </a-switch>

          <button class="header-copilot-btn" :class="{ active: copilotStore.visible }" @click="copilotStore.visible ? copilotStore.close() : copilotStore.open()">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" class="copilot-icon"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"></path></svg>
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
      <div class="main-body relative">
        <a-layout-content class="app-content" :class="{ '!p-0 !overflow-hidden': isAgentPage }">
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
  AlertOutlined,
  UserOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import { dataMapMenuItems, monitoringMenuItems } from '@/router/index.js'
import CopilotPanel from '@/components/Copilot/CopilotPanel.vue'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'
import { useAgentStore } from '@/stores/DataMap/agent.js'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const copilotStore = useCopilotStore()
const agentStore = useAgentStore()
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
  AlertOutlined,
  BellOutlined,
}

const currentModule = computed(() => route.meta?.module || 'datamap')
const isAgentPage = computed(() => route.path === '/datamap/agent')

const currentMenuItems = computed(() =>
  currentModule.value === 'monitoring' ? monitoringMenuItems : dataMapMenuItems
)

const menuItemsWithIcons = computed(() =>
  currentMenuItems.value.map((item) => ({
    key: item.key,
    label: item.label,
    icon: iconMap[item.icon] ? () => h(iconMap[item.icon]) : undefined,
  }))
)

const breadcrumbItems = computed(() => {
  const path = route.path
  const items = currentMenuItems.value
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
    const menuItem = items.find((m) => m.key === fullPath)
    const label = isLast ? (route.meta?.title || (menuItem?.label ?? p)) : (menuItem?.label ?? p)
    return { label, path: isLast ? null : fullPath }
  })
})

watch(
  () => route.path,
  (path) => {
    const items = currentMenuItems.value
    const match = items.find((m) => m.key === path || path.startsWith(m.key + '/'))
    selectedKeys.value = match ? [match.key] : [path]

    if (currentModule.value === 'monitoring') {
      topMenuKey.value = ['ops']
    } else {
      topMenuKey.value = ['map']
    }
  },
  { immediate: true }
)

function handleMenuClick({ key }) {
  router.push(key)
}

function goToAgent() {
  agentStore.isDarkMode = false // 每次通过 Logo 进入时，强制重置为白色主题
  router.push('/datamap/agent')
}

function handleTopMenuClick(info) {
  if (info.key === 'ops') {
    router.push('/monitoring/alerts')
  } else if (info.key === 'map') {
    router.push('/')
  } else if (info.key === 'dev') {
    router.push('/dev/alert-landing')
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sider.agent-sider {
  background: #001529 !important; /* 强制暗色 */
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
  background: rgba(255, 255, 255, 0.08) !important;
  font-weight: 600;
}

.top-menu :deep(.ant-menu-item-selected::after) {
  border-bottom: 2px solid #1677ff !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.header-copilot-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 14px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  height: 28px;
}

.header-copilot-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-copilot-btn.active {
  background: linear-gradient(90deg, #722ed1 0%, #9254de 100%);
  border-color: transparent;
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

/* Sidebar menu fade transition */
.menu-fade-enter-active {
  transition: opacity 0.25s ease;
}

.menu-fade-leave-active {
  transition: opacity 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
