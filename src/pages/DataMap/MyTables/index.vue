<template>
  <div class="mytables-page">
    <div class="mytables-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="header-title">我的库表</h1>
          <p class="header-desc">管理您负责、收藏和最近访问的数据表</p>
        </div>
      </div>
    </div>
    <div class="mytables-body">
      <!-- 工具栏：Tab + 搜索 -->
      <div class="mytables-toolbar">
        <div class="filter-tab-group">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['filter-tab', activeTab === tab.key && 'filter-tab-active']"
            @click="activeTab = tab.key; searchKeyword = ''"
          >
            {{ tab.label }}
            <span class="filter-tab-count" v-if="tab.count > 0">{{ tab.count }}</span>
          </button>
        </div>
        <div class="toolbar-right">
          <a-button
            v-if="activeTab === 'owned'"
            type="primary"
            :disabled="selectedRowKeys.length === 0"
            @click="showTransferModal = true"
          >
            <template #icon><SwapOutlined /></template>
            批量转交
            <span v-if="selectedRowKeys.length > 0">({{ selectedRowKeys.length }})</span>
          </a-button>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索表名或中文名..."
            class="search-input"
            allow-clear
          />
        </div>
      </div>

      <div class="table-card">
        <TableGroup
          v-if="activeTab === 'owned'"
          :tables="filteredOwned"
          empty-text="暂无负责的表"
          selectable
          time-type="updatedAt"
          v-model:selectedRowKeys="selectedRowKeys"
        />
        <TableGroup 
          v-else-if="activeTab === 'favorites'" 
          :tables="filteredFavorites" 
          empty-text="暂无收藏的表" 
          time-type="favoritedAt"
        />
        <TableGroup 
          v-else-if="activeTab === 'recent'" 
          :tables="filteredRecent" 
          empty-text="暂无访问记录" 
          time-type="viewedAt"
        />
      </div>
    </div>

    <TransferModal
      :open="showTransferModal"
      :table-count="selectedRowKeys.length"
      :table-names="selectedTableNames"
      ref="transferModalRef"
      @update:open="showTransferModal = $event"
      @confirm="handleTransferConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import TableGroup from './TableGroup.vue'
import TransferModal from './TransferModal.vue'
import { transferTables } from '@/services/DataMap/tableService'

const activeTab = ref('owned')
const searchKeyword = ref('')
const selectedRowKeys = ref([])
const showTransferModal = ref(false)
const transferModalRef = ref(null)

watch(activeTab, () => {
  selectedRowKeys.value = []
})

const myOwned = [
  {
    id: '1',
    name: 'dwa_cn_cus_df_complain_detail',
    fullyQualifiedName: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail',
    displayName: '催收每日催收员数据监控',
    serviceType: 'Hive',
    layer: 'DWA',
    description: '催收每日催收员数据监控明细数据，包含催收员每日拨打、接通、承诺还款等数据监控。',
    updatedAt: 1731542400000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 1250 } },
  },
  {
    id: '13',
    name: 'dm_cn_cus_df_call_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_call_detail',
    displayName: '国内统一客服热线宽表',
    serviceType: 'Hive',
    layer: 'DM',
    description: '国内统一客服热线拨打记录宽表，包含进线、转接、挂断等全流程明细数据。',
    updatedAt: 1731456000000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 890 } },
  },
  {
    id: '3',
    name: 'dm_cn_cus_df_complain_ticket_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_complain_ticket_detail',
    displayName: '客诉投诉工单明细(客诉工单宽表',
    serviceType: 'Hive',
    layer: 'DM',
    description: '客诉投诉工单明细宽表，记录客户投诉工单的创建、流转、处理结果及满意度等信息。',
    updatedAt: 1731369600000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 640 } },
  },
  {
    id: '7',
    name: 'dwd_payment_flow',
    fullyQualifiedName: 'hive.dm_trade.dwd.dwd_payment_flow',
    displayName: '支付流水表',
    serviceType: 'Hive',
    layer: 'DWD',
    description: '支付成功流水事实表，含支付渠道、金额、状态',
    updatedAt: 1731283200000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 560 } },
  },
  {
    id: '15',
    name: 'ads_order_summary',
    fullyQualifiedName: 'hive.dm_report.ads.ads_order_summary',
    displayName: '订单汇总表',
    serviceType: 'Hive',
    layer: 'ADS',
    description: '订单维度汇总指标',
    updatedAt: 1731196800000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 420 } },
  },
]

const myFavorites = [
  {
    id: '2',
    name: 'dwa_cn_cus_df_complain_detail',
    fullyQualifiedName: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail',
    displayName: '催收每日催收员数据监控',
    serviceType: 'Hive',
    layer: 'DWA',
    description: '催收每日催收员数据监控明细数据，包含催收员每日拨打、接通、承诺还款等数据监控。',
    updatedAt: 1731456000000,
    favoritedAt: 1731556000000,
    owners: [{ name: '李四(lisi)' }],
    usageSummary: { dailyStats: { count: 890 } },
  },
  {
    id: '5',
    name: 'dm_cn_cus_df_call_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_call_detail',
    displayName: '国内统一客服热线宽表',
    serviceType: 'Hive',
    layer: 'DM',
    description: '国内统一客服热线拨打记录宽表，包含进线、转接、挂断等全流程明细数据。',
    updatedAt: 1731196800000,
    favoritedAt: 1731496800000,
    owners: [{ name: '孙七(sunqi)' }],
    usageSummary: { dailyStats: { count: 310 } },
  },
  {
    id: '8',
    name: 'ads_funnel_analysis',
    fullyQualifiedName: 'hive.dm_marketing.ads.ads_funnel_analysis',
    displayName: '漏斗分析表',
    serviceType: 'Hive',
    layer: 'ADS',
    description: '转化漏斗各环节统计，供运营分析使用',
    updatedAt: 1731283200000,
    favoritedAt: 1731383200000,
    owners: [{ name: '赵六(zhaoliu)' }],
    usageSummary: { dailyStats: { count: 430 } },
  },
  {
    id: '10',
    name: 'dws_marketing_effect',
    fullyQualifiedName: 'hive.dm_marketing.dws.dws_marketing_effect',
    displayName: '营销效果表',
    serviceType: 'Hive',
    layer: 'DWS',
    description: '营销活动效果汇总，含 ROI、转化率',
    updatedAt: 1730764800000,
    favoritedAt: 1730864800000,
    owners: [{ name: '李四(lisi)' }],
    usageSummary: { dailyStats: { count: 620 } },
  },
]

const recentAccess = [
  {
    id: '1',
    name: 'dwa_cn_cus_df_complain_detail',
    fullyQualifiedName: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail',
    displayName: '催收每日催收员数据监控',
    serviceType: 'Hive',
    layer: 'DWA',
    description: '催收每日催收员数据监控明细数据，包含催收员每日拨打、接通、承诺还款等数据监控。',
    updatedAt: 1731542400000,
    viewedAt: 1731562400000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 1250 } },
  },
  {
    id: '2',
    name: 'dm_cn_cus_df_call_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_call_detail',
    displayName: '国内统一客服热线宽表',
    serviceType: 'Hive',
    layer: 'DM',
    description: '国内统一客服热线拨打记录宽表，包含进线、转接、挂断等全流程明细数据。',
    updatedAt: 1731456000000,
    viewedAt: 1731466000000,
    owners: [{ name: '李四(lisi)' }],
    usageSummary: { dailyStats: { count: 890 } },
  },
  {
    id: '4',
    name: 'dm_cn_cus_df_complain_ticket_detail',
    fullyQualifiedName: 'hive.dm_cn.dm_cn_cus_df_complain_ticket_detail',
    displayName: '客诉投诉工单明细(客诉工单宽表',
    serviceType: 'Hive',
    layer: 'DM',
    description: '客诉投诉工单明细宽表，记录客户投诉工单的创建、流转、处理结果及满意度等信息。',
    updatedAt: 1731283200000,
    viewedAt: 1731383200000,
    owners: [{ name: '赵六(zhaoliu)' }],
    usageSummary: { dailyStats: { count: 420 } },
  },
  {
    id: '5',
    name: 'dim_product',
    fullyQualifiedName: 'hive.product_db.dim.dim_product',
    displayName: '商品维表',
    serviceType: 'Hive',
    layer: 'DIM',
    description: '商品基础信息维表，含类目、品牌、SKU 属性',
    updatedAt: 1731196800000,
    viewedAt: 1731296800000,
    owners: [{ name: '孙七(sunqi)' }],
    usageSummary: { dailyStats: { count: 310 } },
  },
  {
    id: '6',
    name: 'ods_user_log',
    fullyQualifiedName: 'hive.dm_user.ods.ods_user_log',
    displayName: '用户日志表',
    serviceType: 'Hive',
    layer: 'ODS',
    description: '用户行为埋点日志原始数据',
    updatedAt: 1731110400000,
    viewedAt: 1731210400000,
    owners: [{ name: '张三(zhangsan)' }],
    usageSummary: { dailyStats: { count: 180 } },
  },
  {
    id: '9',
    name: 'ods_inventory',
    fullyQualifiedName: 'hive.dm_product.ods.ods_inventory',
    displayName: '库存表',
    serviceType: 'Hive',
    layer: 'ODS',
    description: '库存日快照表，按 SKU 维度',
    updatedAt: 1730851200000,
    viewedAt: 1730951200000,
    owners: [{ name: '孙七(sunqi)' }],
    usageSummary: { dailyStats: { count: 756 } },
  },
]

const tabs = computed(() => [
  { key: 'owned', label: '我负责的', count: myOwned.length },
  { key: 'favorites', label: '我收藏的', count: myFavorites.length },
  { key: 'recent', label: '最近访问', count: recentAccess.length },
])

function filterTables(list) {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter(t => 
    t.name.toLowerCase().includes(kw) || 
    (t.displayName && t.displayName.toLowerCase().includes(kw))
  )
}

const filteredOwned = computed(() => filterTables(myOwned))
const filteredFavorites = computed(() => filterTables(myFavorites))
const filteredRecent = computed(() => filterTables(recentAccess))

const selectedTableNames = computed(() =>
  myOwned
    .filter(t => selectedRowKeys.value.includes(t.id))
    .map(t => t.fullyQualifiedName.replace(/^[^.]+\./, ''))
)

async function handleTransferConfirm({ targetOwner, reason }) {
  try {
    await transferTables(selectedRowKeys.value, targetOwner, reason)
    message.success(`已成功转交 ${selectedRowKeys.value.length} 张表`)
    selectedRowKeys.value = []
    showTransferModal.value = false
  } catch {
    message.error('转交失败，请重试')
  } finally {
    transferModalRef.value?.resetLoading()
  }
}
</script>

<style scoped>
.mytables-page {
  height: 100%;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

/* ===== Banner ===== */
.mytables-header {
  background: #fff;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.header-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* ===== Body ===== */
.mytables-body {
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
}

/* ===== 工具栏 ===== */
.mytables-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.filter-tab-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  padding: 4px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  color: #1e293b;
  background: #f8fafc;
}

.filter-tab-active {
  color: #2563eb;
  background: #eff6ff;
}

.filter-tab-active:hover {
  color: #2563eb;
  background: #eff6ff;
}

.filter-tab-count {
  font-size: 11px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.filter-tab-active .filter-tab-count {
  color: #3b82f6;
  background: #dbeafe;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.search-input :deep(.ant-input) {
  border-radius: 10px 0 0 10px;
}

.search-input :deep(.ant-input-group-addon) {
  border-radius: 0 10px 10px 0;
  overflow: hidden;
}

.search-input :deep(.ant-input-search-button) {
  border-radius: 0 10px 10px 0 !important;
}

.search-input :deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  border-color: #e2e8f0;
}

/* ===== 表格卡片 ===== */
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-card :deep(.ant-table-thead > tr > th) {
  background: #fafbfc;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
</style>
