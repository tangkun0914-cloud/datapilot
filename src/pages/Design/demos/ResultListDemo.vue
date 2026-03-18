<template>
  <div class="demo-wrapper">
    <div class="demo-toolbar">
      <span class="demo-result-count">共 <b>{{ mockData.length }}</b> 个结果</span>
      <a-switch v-model:checked="showLoading" size="small" />
      <span class="demo-switch-label">模拟加载</span>
    </div>
    <ResultList :data="showLoading ? [] : mockData" :loading="showLoading" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ResultList from '@/pages/Search/ResultList.vue'

const showLoading = ref(false)

const mockData = [
  {
    id: '1',
    name: 'dwa_cn_cus_df_complain_detail',
    fullyQualifiedName: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail',
    displayName: '催收每日催收员数据监控',
    serviceType: 'Hive',
    description: '催收每日催收员数据监控明细数据，包含催收员每日拨打、接通、承诺还款等数据监控。',
    database: { name: 'dwa_cn' },
    tags: [
      { tagFQN: '业务域.催收', source: 'Classification' },
      { tagFQN: '数仓分层.DWA', source: 'Classification' },
    ],
    owners: [{ name: '张三(zhangsan)' }],
    updatedAt: 1731542400000,
    usageSummary: { dailyStats: { count: 1250 } },
  },
  {
    id: '2',
    name: 'dm_cn_cus_df_call_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_call_detail',
    displayName: '国内统一客服热线宽表',
    serviceType: 'Hive',
    description: '国内统一客服热线拨打记录宽表，包含进线、转接、挂断等全流程明细数据。',
    database: { name: 'dm_cn' },
    tags: [
      { tagFQN: '业务域.客服', source: 'Classification' },
      { tagFQN: '数仓分层.DM', source: 'Classification' },
    ],
    owners: [{ name: '李四(lisi)' }],
    updatedAt: 1731456000000,
    usageSummary: { dailyStats: { count: 890 } },
  },
]
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
}

.demo-result-count b {
  color: #1677ff;
}

.demo-switch-label {
  font-size: 12px;
  color: #94a3b8;
}
</style>
