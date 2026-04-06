import { createRouter, createWebHistory } from 'vue-router'

export const dataMapMenuItems = [
  { key: '/', icon: 'AppstoreOutlined', label: '工作台' },
  { key: '/datamap/agent', icon: 'RobotOutlined', label: '地图 Agent' },
  { key: '/datamap/map-agent', icon: 'RobotOutlined', label: '地图 Agent v2' },
  { key: '/home', icon: 'HomeOutlined', label: '数据地图首页' },
  { key: '/search', icon: 'SearchOutlined', label: '资产检索' },
  { key: '/topics', icon: 'FolderOutlined', label: '数据专题' },
  { key: '/mytables', icon: 'TableOutlined', label: '我的库表' },
]

export const monitoringMenuItems = [
  { key: '/monitoring/alerts', icon: 'AlertOutlined', label: '告警事件' },
  { key: '/monitoring/strategies', icon: 'BellOutlined', label: '通知策略' },
  { key: '/monitoring/impact-demo', icon: 'NodeIndexOutlined', label: '影响评估(Demo)' },
]

/** @deprecated 向后兼容，使用 dataMapMenuItems 代替 */
export const menuItems = dataMapMenuItems

const routes = [
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { module: 'datamap' },
    children: [
      {
        path: '',
        name: 'Workspace',
        component: () => import('@/pages/Portal/index.vue'),
        meta: { title: '工作台', module: 'datamap' },
      },
      {
        path: 'agent',
        redirect: '/datamap/agent',
      },
      {
        path: 'datamap/agent',
        name: 'DataMapAgent',
        component: () => import('@/pages/DataMap/Agent/index.vue'),
        meta: { title: '数据地图 Agent', module: 'datamap' },
      },
      {
        path: 'datamap/map-agent',
        name: 'MapAgent',
        component: () => import('@/pages/DataMap/MapAgent/index.vue'),
        meta: { title: '地图 Agent v2', module: 'datamap' },
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/pages/DataMap/Home/index.new.vue'),
        meta: { title: '数据地图首页', module: 'datamap' },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/pages/DataMap/Search/index.vue'),
        meta: { title: '资产检索', module: 'datamap' },
      },
      {
        path: 'detail/:fqn',
        name: 'Detail',
        component: () => import('@/pages/DataMap/Detail/index.vue'),
        meta: { title: '资产详情', module: 'datamap' },
      },
      {
        path: 'topics',
        name: 'Topics',
        component: () => import('@/pages/DataMap/Topics/index.vue'),
        meta: { title: '数据专题', module: 'datamap' },
      },
      {
        path: 'topics/:id',
        name: 'TopicDetail',
        component: () => import('@/pages/DataMap/Topics/TopicDetail.vue'),
        meta: { title: '专题详情', module: 'datamap' },
      },
      {
        path: 'mytables',
        name: 'MyTables',
        component: () => import('@/pages/DataMap/MyTables/index.vue'),
        meta: { title: '我的库表', module: 'datamap' },
      },
      {
        path: 'copilot',
        name: 'CopilotFull',
        component: () => import('@/components/Copilot/CopilotFull.vue'),
        meta: { title: 'AI Copilot', module: 'datamap' },
      },
    ],
  },
  {
    path: '/monitoring',
    component: () => import('@/components/AppLayout.vue'),
    meta: { module: 'monitoring' },
    children: [
      {
        path: '',
        redirect: '/monitoring/alerts',
      },
      {
        path: 'alerts',
        name: 'AlertList',
        component: () => import('@/pages/Monitoring/AlertList/index.vue'),
        meta: { title: '告警事件', module: 'monitoring' },
      },
      {
        path: 'strategies',
        name: 'NotifyStrategy',
        component: () => import('@/pages/Monitoring/NotifyStrategy/index.vue'),
        meta: { title: '通知策略', module: 'monitoring' },
      },
      {
        path: 'impact-demo',
        name: 'ImpactAssessmentDemo',
        component: () => import('@/pages/Monitoring/ImpactAssessment/Demo.vue'),
        meta: { title: '影响评估(Demo)', module: 'monitoring' },
      },
    ],
  },
  {
    path: '/monitoring/mobile/alert/:eventId',
    name: 'MobileAlertLanding',
    component: () => import('@/pages/Monitoring/Mobile/AlertLanding.vue'),
    meta: { title: '告警详情', module: 'monitoring' },
  },
  {
    path: '/dev/alert-landing',
    name: 'DataDevAlertLanding',
    component: () => import('@/pages/DataDev/AlertLanding.vue'),
    meta: { title: '告警详情' },
  },
  {
    path: '/portal-demo',
    name: 'PortalDemo',
    component: () => import('@/pages/Design/demos/CopilotPortalDemo.vue'),
    meta: { title: '新版 Copilot 首页概念' },
  },
  {
    path: '/design',
    name: 'DesignSystem',
    component: () => import('@/pages/Design/index.vue'),
    meta: { title: '组件库 Design' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
