<template>
  <div class="rule-detail-section" v-if="rules && rules.length">
    <div class="section-header">
      <h3 class="section-title">告警明细</h3>
      <a-button type="link" size="small">查看运行记录</a-button>
    </div>
    <a-table
      :dataSource="rules"
      :columns="columns"
      :pagination="false"
      size="small"
      bordered
      rowKey="ruleName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'collectedValue'">
          <span :class="{ 'text-orange-500 font-bold': record.collectedValue !== '-' }">
            {{ record.collectedValue }}
          </span>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag v-if="record.status === 'alert'" color="red">告警</a-tag>
          <a-tag v-else-if="record.status === 'failed'" color="orange">运行失败</a-tag>
          <a-tag v-else-if="record.status === 'normal'" color="green">正常</a-tag>
          <a-tag v-else>{{ record.status }}</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
/**
 * RuleDetailTable - 质量规则明细表
 *
 * 展示数据质量（DQC）类告警的规则检测明细，包括规则名称、监控字段、采集值、基准值、
 * 阈值范围和状态（告警/运行失败/正常）。仅在告警来源为「数据质量」时使用。
 * 标题栏右侧为「查看运行记录」链接按钮（占位，可对接运行记录页）。
 *
 * @prop {Array} rules - 规则数组，每项含 { ruleName, field, collectedValue, baseValue, threshold, status }
 *                       status: 'alert'|'failed'|'normal'
 */
defineProps({
  rules: { type: Array, default: () => [] },
})

const columns = [
  { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName' },
  { title: '监控字段', dataIndex: 'field', key: 'field' },
  { title: '采集值', dataIndex: 'collectedValue', key: 'collectedValue' },
  { title: '基准值', dataIndex: 'baseValue', key: 'baseValue' },
  { title: '阈值范围', dataIndex: 'threshold', key: 'threshold' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]
</script>

<style scoped>
.rule-detail-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
</style>
