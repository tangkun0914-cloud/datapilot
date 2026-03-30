<template>
  <div class="alert-list-page">
    <!-- 统计卡片 -->
    <StatsCards :cards="statsCards" :activeIndex="activeStatIndex" @select="handleStatSelect" />

    <!-- 筛选区 -->
    <FilterSection :filterOptions="filterOpts" @query="handleQuery" @reset="handleReset" />

    <!-- 全选 -->
    <div class="list-header">
      <label class="checkbox-container" @click="handleCheckAllClick">
        <a-checkbox
          :checked="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        />
        <span class="checkbox-label">全选本页</span>
      </label>
    </div>

    <!-- 告警列表 -->
    <a-spin :spinning="loading" tip="加载中...">
      <TransitionGroup name="list" tag="div" class="alert-list-container">
        <AlertCard
          v-for="item in alertData"
          :key="item.id"
          :alert="item"
          :checked="checkedIds.has(item.id)"
          @check="(val) => handleItemCheck(item.id, val)"
          @titleClick="handleTitleClick"
          @action="handleAction"
        />
      </TransitionGroup>
    </a-spin>

    <a-empty v-if="!alertData.length && !loading" description="暂无告警事件" />

    <!-- 批量操作栏 -->
    <BulkActionBar :count="checkedIds.size" @bulk="handleBulkAction" @cancel="clearSelection" />

    <!-- 详情抽屉 -->
    <AlertDetailDrawer
      :open="drawerOpen"
      :alert="currentAlert"
      @close="drawerOpen = false"
      @action="handleAction"
    />

    <!-- 弹窗 -->
    <SilenceModal v-model:open="silenceModalOpen" @submit="handleSilenceSubmit" />
    <ResolveModal v-model:open="resolveModalOpen" @submit="handleResolveSubmit" />
    <TransferModal v-model:open="transferModalOpen" :users="filterOpts.owners" @submit="handleTransferSubmit" />
    <FalsePositiveModal v-model:open="fpModalOpen" @submit="handleFPSubmit" />
    <HistoryModal v-model:open="historyModalOpen" :historyItems="historyItems" />
  </div>
</template>

<script setup>
/**
 * AlertList - 告警事件列表页
 *
 * 监控运维模块的主页面，组合 StatsCards、FilterSection、AlertCard、
 * BulkActionBar、AlertDetailDrawer 和 5 个操作弹窗，实现告警的
 * 浏览、筛选、全选/批量操作、详情查看和状态流转完整交互。
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import StatsCards from './StatsCards.vue'
import FilterSection from './FilterSection.vue'
import AlertCard from './AlertCard.vue'
import BulkActionBar from './BulkActionBar.vue'
import SilenceModal from '../modals/SilenceModal.vue'
import ResolveModal from '../modals/ResolveModal.vue'
import TransferModal from '../modals/TransferModal.vue'
import FalsePositiveModal from '../modals/FalsePositiveModal.vue'
import HistoryModal from '../modals/HistoryModal.vue'
import AlertDetailDrawer from '../AlertDetail/AlertDetailDrawer.vue'
import {
  getAlertStats,
  getAlertList,
  getFilterOptions,
  claimAlert,
  silenceAlert,
  resolveAlert,
  transferAlert,
  markFalsePositive,
} from '@/services/Monitoring/monitoringService.js'

const loading = ref(false)
const alertData = ref([])
const stats = ref({ myPending: 0, myNew: 0, allPending: 0, todayNew: 0 })
const activeStatIndex = ref(2)
const filterOpts = ref({ sources: [], events: [], statuses: [], levels: [], owners: [], operators: [] })

const statsCards = computed(() => [
  { label: '我的待处理', value: stats.value.myPending },
  { label: '我的新增', value: stats.value.myNew },
  { label: '全部待处理', value: stats.value.allPending },
  { label: '今日新增', value: stats.value.todayNew },
])

const checkedIds = reactive(new Set())
const currentAlert = ref(null)
const drawerOpen = ref(false)

const isAllChecked = computed(
  () => alertData.value.length > 0 && checkedIds.size === alertData.value.length
)
const isIndeterminate = computed(
  () => checkedIds.size > 0 && checkedIds.size < alertData.value.length
)

const silenceModalOpen = ref(false)
const resolveModalOpen = ref(false)
const transferModalOpen = ref(false)
const fpModalOpen = ref(false)
const historyModalOpen = ref(false)
const historyItems = ref([])

onMounted(async () => {
  loading.value = true
  try {
    const [statsData, listData, opts] = await Promise.all([
      getAlertStats(),
      getAlertList(),
      getFilterOptions(),
    ])
    stats.value = statsData
    alertData.value = listData.list
    filterOpts.value = opts
  } finally {
    loading.value = false
  }
})

function handleStatSelect(idx) {
  activeStatIndex.value = idx === activeStatIndex.value ? -1 : idx
}

async function handleQuery(filters) {
  loading.value = true
  try {
    const data = await getAlertList(filters)
    alertData.value = data.list
    clearSelection()
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  loading.value = true
  try {
    const data = await getAlertList()
    alertData.value = data.list
    clearSelection()
  } finally {
    loading.value = false
  }
}

function handleCheckAll(e) {
  if (e.target.checked) {
    alertData.value.forEach((item) => checkedIds.add(item.id))
  } else {
    checkedIds.clear()
  }
}

function handleItemCheck(id, val) {
  if (val) {
    checkedIds.add(id)
  } else {
    checkedIds.delete(id)
  }
}

function clearSelection() {
  checkedIds.clear()
}

function handleTitleClick(alert) {
  currentAlert.value = alert
  drawerOpen.value = true
}

function handleAction(action, alert) {
  currentAlert.value = alert
  switch (action) {
    case 'claim':
      handleClaim(alert)
      break
    case 'silence':
      silenceModalOpen.value = true
      break
    case 'resolve':
      resolveModalOpen.value = true
      break
    case 'transfer':
      transferModalOpen.value = true
      break
    case 'falsePositive':
      fpModalOpen.value = true
      break
  }
}

async function handleClaim(alert) {
  await claimAlert(alert.id)
  message.success('认领成功')
  alert.status = 'acked'
  alert.operator = '王蕊(ruiwang1)'
  
  // 模拟当前认领时间
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  alert.claimTime = `${now.getFullYear()}-${month}-${date} ${hh}:${mm}:${ss}`
}

async function handleSilenceSubmit(payload) {
  if (currentAlert.value) {
    await silenceAlert(currentAlert.value.id, payload)
    message.success('屏蔽设置成功')
    currentAlert.value.status = 'silenced'
    currentAlert.value.operator = '王蕊(ruiwang1)'
    // 计算屏蔽结束时间
    const hours = parseInt(payload.duration) || 1
    const until = new Date()
    until.setHours(until.getHours() + hours)
    // 格式化为 MM-DD HH:mm
    const month = String(until.getMonth() + 1).padStart(2, '0')
    const date = String(until.getDate()).padStart(2, '0')
    const hh = String(until.getHours()).padStart(2, '0')
    const mm = String(until.getMinutes()).padStart(2, '0')
    currentAlert.value.silenceUntil = `${month}-${date} ${hh}:${mm}`
    currentAlert.value.silenceReason = payload.reason || '未填写原因'
  } else if (checkedIds.size > 0) {
    // 批量屏蔽逻辑
    const hours = parseInt(payload.duration) || 1
    const until = new Date()
    until.setHours(until.getHours() + hours)
    const month = String(until.getMonth() + 1).padStart(2, '0')
    const date = String(until.getDate()).padStart(2, '0')
    const hh = String(until.getHours()).padStart(2, '0')
    const mm = String(until.getMinutes()).padStart(2, '0')
    const untilStr = `${month}-${date} ${hh}:${mm}`
    const reasonStr = payload.reason || '未填写原因'

    alertData.value.forEach(alert => {
      if (checkedIds.has(alert.id)) {
        alert.status = 'silenced'
        alert.operator = '王蕊(ruiwang1)'
        alert.silenceUntil = untilStr
        alert.silenceReason = reasonStr
      }
    })
    message.success(`已批量屏蔽 ${checkedIds.size} 条告警`)
    clearSelection()
  }
  silenceModalOpen.value = false
}

async function handleResolveSubmit(payload) {
  if (currentAlert.value) {
    await resolveAlert(currentAlert.value.id, payload)
    message.success('已标记为解决')
    currentAlert.value.status = 'resolved'
    currentAlert.value.operator = '王蕊(ruiwang1)'
    currentAlert.value.resolveTime = new Date().toLocaleString()
    currentAlert.value.rootCause = payload.rootCause && payload.rootCause.length 
      ? payload.rootCause.join('-') 
      : (payload.remark || '未知')
    currentAlert.value.recoveryType = 'manual'
  } else if (checkedIds.size > 0) {
    alertData.value.forEach(alert => {
      if (checkedIds.has(alert.id)) {
        alert.status = 'resolved'
        alert.operator = '王蕊(ruiwang1)'
        alert.resolveTime = new Date().toLocaleString()
        alert.rootCause = payload.rootCause && payload.rootCause.length 
          ? payload.rootCause.join('-') 
          : (payload.remark || '未知')
        alert.recoveryType = 'manual'
      }
    })
    message.success(`已批量解决 ${checkedIds.size} 条告警`)
    clearSelection()
  }
  resolveModalOpen.value = false
}

async function handleTransferSubmit(payload) {
  if (currentAlert.value) {
    await transferAlert(currentAlert.value.id, payload)
    message.success('转交成功')
    currentAlert.value.status = 'transferred'
    currentAlert.value.operator = '王蕊(ruiwang1)'
  } else if (checkedIds.size > 0) {
    alertData.value.forEach(alert => {
      if (checkedIds.has(alert.id)) {
        alert.status = 'transferred'
        alert.operator = '王蕊(ruiwang1)'
        alert.transferTo = payload.targetUser
        alert.transferFrom = '王蕊(ruiwang1)'
      }
    })
    message.success(`已批量转交 ${checkedIds.size} 条告警`)
    clearSelection()
  }
  transferModalOpen.value = false
}

async function handleFPSubmit(payload) {
  const reasonMap = {
    expected: '预期内变化',
    threshold: '阈值不合理',
    test: '测试数据',
    other: '其他'
  }
  
  if (currentAlert.value) {
    await markFalsePositive(currentAlert.value.id, payload)
    message.success('已标记为误报')
    currentAlert.value.status = 'falsePositive'
    currentAlert.value.operator = '王蕊(ruiwang1)'
    currentAlert.value.fpReason = reasonMap[payload.reasonType] || '其他'
    currentAlert.value.fpRemark = payload.remark
  } else if (checkedIds.size > 0) {
    alertData.value.forEach(alert => {
      if (checkedIds.has(alert.id)) {
        alert.status = 'falsePositive'
        alert.operator = '王蕊(ruiwang1)'
        alert.fpReason = reasonMap[payload.reasonType] || '其他'
        alert.fpRemark = payload.remark
      }
    })
    message.success(`已批量标记 ${checkedIds.size} 条误报`)
    clearSelection()
  }
  fpModalOpen.value = false
}

function handleBulkAction(action) {
  // 清空 currentAlert，表示当前是批量操作模式
  currentAlert.value = null
  
  switch (action) {
    case 'claim':
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const date = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const claimTimeStr = `${now.getFullYear()}-${month}-${date} ${hh}:${mm}:${ss}`

      alertData.value.forEach(alert => {
        if (checkedIds.has(alert.id)) {
          alert.status = 'acked'
          alert.operator = '王蕊(ruiwang1)'
          alert.claimTime = claimTimeStr
        }
      })
      message.success(`已批量认领 ${checkedIds.size} 条告警`)
      clearSelection()
      break
    case 'silence':
      silenceModalOpen.value = true
      break
    case 'resolve':
      resolveModalOpen.value = true
      break
    case 'transfer':
      transferModalOpen.value = true
      break
    case 'falsePositive':
      fpModalOpen.value = true
      break
  }
}
</script>

<style scoped>
.alert-list-page {
  min-height: 400px;
}

.list-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 8px;
}

.checkbox-label {
  font-size: 13px;
  color: #666;
}

/* List enter/leave animation */
.list-enter-active {
  transition: all 0.35s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.list-leave-active {
  transition: all 0.25s ease;
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
