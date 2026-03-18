import { createRouter, createWebHistory } from 'vue-router'

export const menuItems = [
  { key: '/', icon: 'AppstoreOutlined', label: '工作台' },
  { key: '/home', icon: 'HomeOutlined', label: '数据地图首页' },
  { key: '/search', icon: 'SearchOutlined', label: '资产检索' },
  { key: '/topics', icon: 'FolderOutlined', label: '数据专题' },
  { key: '/mytables', icon: 'TableOutlined', label: '我的库表' },
  { key: '/copilot', icon: 'RobotOutlined', label: 'AI Copilot' },
]

const routes = [
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Workspace',
        component: () => import('@/pages/Portal/index.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/pages/Home/index.new.vue'),
        meta: { title: '数据地图首页' },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/pages/Search/index.vue'),
        meta: { title: '资产检索' },
      },
      {
        path: 'detail/:fqn',
        name: 'Detail',
        component: () => import('@/pages/Detail/index.vue'),
        meta: { title: '资产详情' },
      },
      {
        path: 'topics',
        name: 'Topics',
        component: () => import('@/pages/Topics/index.vue'),
        meta: { title: '数据专题' },
      },
      {
        path: 'topics/:id',
        name: 'TopicDetail',
        component: () => import('@/pages/Topics/TopicDetail.vue'),
        meta: { title: '专题详情' },
      },
      {
        path: 'mytables',
        name: 'MyTables',
        component: () => import('@/pages/MyTables/index.vue'),
        meta: { title: '我的库表' },
      },
      {
        path: 'copilot',
        name: 'CopilotFull',
        component: () => import('@/pages/CopilotFull/index.vue'),
        meta: { title: 'AI Copilot' },
      },
    ],
  },
  {
    path: '/design',
    name: 'DesignSystem',
    component: () => import('@/pages/Design/index.vue'),
    meta: { title: '组件库 Design' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
