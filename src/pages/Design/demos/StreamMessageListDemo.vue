<template>
  <div class="demo-wrap">
    <p class="demo-desc">编排层：一组用户问 + AI 答（含步骤、Markdown 表格、追问 chip、底部操作）。</p>
    <div class="flex flex-col h-[480px] border border-slate-200 rounded-lg overflow-hidden bg-[#fafafa]">
      <MessageList
        :messages="messages"
        :is-dark-mode="false"
        :is-share-mode="false"
        @send="onSend"
        @update:is-share-mode="() => {}"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MessageList from '@/pages/DataMap/MapAgent/components/Chat/MessageList.vue'

const messages = ref([
  { id: 10, role: 'user', content: '帮我找订单相关的 Hive 表' },
  {
    id: 11,
    role: 'ai',
    status: 'success',
    content:
      '## 检索结果\n\n为您找到以下相关表：\n\n| FQN | 中文名 | 说明 |\n| --- | --- | --- |\n| dm_trade.dwd_order | 订单明细 | 核心交易明细 |\n| dm_trade.dws_order_sum | 订单汇总 | 日汇总指标 |\n\n> 建议继续追问血缘或字段含义。',
    steps: [
      { id: 's1', text: '解析用户意图：找表', status: 'done' },
      { id: 's2', text: '检索元数据目录', status: 'done' },
    ],
    suggestions: ['看下 dwd_order 的血缘', '列出订单表的负责人'],
  },
])

function onSend(text) {
  messages.value = [
    ...messages.value,
    { id: Date.now(), role: 'user', content: text },
    {
      id: Date.now() + 1,
      role: 'ai',
      status: 'success',
      content: '（Demo）已收到追问：**' + text + '**。',
      steps: [],
      suggestions: [],
    },
  ]
}
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
