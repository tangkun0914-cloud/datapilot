<template>
  <div class="demo-container">
    <StrategyTable 
      :dataSource="mockData"
      :pagination="false"
      @statusChange="handleStatusChange"
      @edit="handleAction('编辑')"
      @view="handleAction('查看')"
      @copy="handleAction('复制')"
      @delete="handleAction('删除')"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StrategyTable from '@/pages/Monitoring/NotifyStrategy/StrategyTable.vue'
import { message } from 'ant-design-vue'

const mockData = ref([
  {
    key: '1',
    name: '系统内置默认通知策略',
    isDefault: true,
    description: '系统内置默认通知策略',
    updateTime: '2026-03-04 19:29:20',
    creator: '王博(bowang1)',
    interval: '10分钟',
    maxSend: '3次',
    status: true,
  },
  {
    key: '2',
    name: '核心业务告警通知策略',
    isDefault: false,
    description: '用于核心业务表及高优先级任务的告警通知',
    updateTime: '2026-03-11 10:15:30',
    creator: '王蕊(ruiwang1)',
    interval: '5分钟',
    maxSend: '5次',
    status: false,
  }
])

const handleStatusChange = (record, val) => {
  record.status = val
  message.success(`策略 [${record.name}] 状态已${val ? '开启' : '关闭'}`)
}

const handleAction = (action) => (record) => {
  message.info(`点击了 [${action}] 操作：${record.name}`)
}
</script>

<style scoped>
.demo-container {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
