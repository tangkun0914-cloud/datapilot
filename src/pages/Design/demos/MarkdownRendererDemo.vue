<template>
  <div class="demo-wrap">
    <p class="demo-desc">含表格（hover 右上角可复制）、代码与引用块。</p>
    <MarkdownRenderer
      :content="md"
      status="success"
      :is-dark-mode="false"
      :has-steps="false"
    />
    <p class="demo-desc mt-6">流式光标示例（status=streaming）：</p>
    <MarkdownRenderer
      content="正在输出**更多**内容…"
      status="streaming"
      :is-dark-mode="false"
      :has-steps="false"
    />
  </div>
</template>

<script setup>
import MarkdownRenderer from '@/pages/DataMap/MapAgent/components/Chat/MarkdownRenderer.vue'

const md = `### 表概况

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | string | 订单号 |
| amt | decimal | 金额 |

` + '```sql\nSELECT * FROM dm_trade.dwd_order LIMIT 10\n```' + `

> 该表 T+1 增量同步。`
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
.demo-desc {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
