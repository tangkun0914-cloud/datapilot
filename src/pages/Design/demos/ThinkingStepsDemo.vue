<template>
  <div class="demo-wrap">
    <p class="demo-desc">一步进行中、一步已完成。</p>
    <ThinkingSteps :steps="steps" :is-dark-mode="false" />
  </div>
</template>

<script setup>
import ThinkingSteps from '@/pages/DataMap/MapAgent/components/Chat/ThinkingSteps.vue'

const steps = [
  { id: 'a', text: '正在检索元数据目录…', status: 'running' },
  { id: 'b', text: '已解析用户意图', status: 'done' },
]
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
