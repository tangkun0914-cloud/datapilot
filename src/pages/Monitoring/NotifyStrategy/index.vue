<template>
  <div class="strategy-page">
    <div class="strategy-container">
      <StrategyFilter 
        v-model:searchName="searchName"
        v-model:searchCreator="searchCreator"
        @refresh="handleRefresh"
        @create="openDrawer('create')"
      />

      <div class="section-divider"></div>

      <StrategyTable 
        :dataSource="filteredData"
        :pagination="pagination"
        @statusChange="handleStatusChange"
        @edit="(r) => openDrawer('edit', r)"
        @view="(r) => openDrawer('view', r)"
        @copy="handleCopy"
        @delete="handleDelete"
      />
    </div>

    <CreateStrategy
      :open="drawerOpen"
      :mode="drawerMode"
      :initialData="currentRecord"
      @close="drawerOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
/**
 * NotifyStrategyList - 通知策略列表页
 *
 * 监控运维模块的通知策略管理页面，包含策略名称筛选、表格列表（含
 * StatusSwitch 状态开关和操作列）、新建/编辑/查看策略抽屉。
 */
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import StrategyFilter from './StrategyFilter.vue'
import StrategyTable from './StrategyTable.vue'
import CreateStrategy from './CreateStrategy.vue'
import { getNotifyStrategyList } from '@/services/Monitoring/monitoringService.js'

const strategyData = ref([])
const searchName = ref('')
const searchCreator = ref(undefined)

const drawerOpen = ref(false)
const drawerMode = ref('create')
const currentRecord = ref(null)

const pagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]}行，共 ${total} 行`,
  defaultPageSize: 10,
}

const filteredData = computed(() => {
  let list = [...strategyData.value]
  if (searchName.value) {
    list = list.filter((s) => s.name.includes(searchName.value))
  }
  if (searchCreator.value) {
    list = list.filter((s) => s.creator === searchCreator.value)
  }
  return list
})

onMounted(async () => {
  strategyData.value = await getNotifyStrategyList()
})

function openDrawer(mode, record = null) {
  drawerMode.value = mode
  currentRecord.value = record
  drawerOpen.value = true
}

async function handleRefresh() {
  strategyData.value = await getNotifyStrategyList()
  searchName.value = ''
  searchCreator.value = undefined
  message.success('列表已刷新')
}

function handleStatusChange(record, val) {
  record.status = val
}

function handleCopy(record) {
  const newRecord = {
    ...JSON.parse(JSON.stringify(record)),
    key: String(Date.now()),
    name: `${record.name}_copy`,
    isDefault: false,
    updateTime: new Date().toLocaleString(),
    creator: '王蕊(ruiwang1)',
  }
  strategyData.value.unshift(newRecord)
  message.success(`已复制策略：${newRecord.name}`)
}

function handleDelete(record) {
  const index = strategyData.value.findIndex(item => item.key === record.key)
  if (index !== -1) {
    strategyData.value.splice(index, 1)
    message.success(`已删除策略：${record.name}`)
  }
}

function handleSubmit(data) {
  const freq = data.policies?.frequency

  if (drawerMode.value === 'edit' && currentRecord.value) {
    const target = strategyData.value.find(item => item.key === currentRecord.value.key)
    if (target) {
      Object.assign(target, {
        name: data.name,
        description: data.description,
        errorRules: data.errorRules,
        warnRules: data.warnRules,
        policies: data.policies,
        interval: freq?.enabled ? `${freq.interval}分钟` : '-',
        maxSend: freq?.enabled ? `${freq.maxSend}次` : '-',
        updateTime: new Date().toLocaleString(),
      })
    }
  } else {
    strategyData.value.unshift({
      key: String(Date.now()),
      name: data.name,
      isDefault: false,
      description: data.description,
      updateTime: new Date().toLocaleString(),
      creator: '王蕊(ruiwang1)',
      interval: freq?.enabled ? `${freq.interval}分钟` : '-',
      maxSend: freq?.enabled ? `${freq.maxSend}次` : '-',
      status: true,
      errorRules: data.errorRules,
      warnRules: data.warnRules,
      policies: data.policies,
    })
  }
}
</script>

<style scoped>
.strategy-page {
  min-height: 400px;
}

.strategy-container {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* Divider */
.section-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 24px;
}
</style>
