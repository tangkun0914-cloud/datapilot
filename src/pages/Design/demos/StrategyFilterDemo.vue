<template>
  <div class="demo-container">
    <StrategyFilter 
      v-model:searchName="searchName"
      v-model:searchCreator="searchCreator"
      @refresh="handleRefresh"
      @create="handleCreate"
    />
    <div class="demo-state">
      <p><strong>当前状态：</strong></p>
      <p>搜索名称: {{ searchName || '(空)' }}</p>
      <p>创建人: {{ searchCreator || '(空)' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StrategyFilter from '@/pages/Monitoring/NotifyStrategy/StrategyFilter.vue'
import { message } from 'ant-design-vue'

const searchName = ref('')
const searchCreator = ref(undefined)

const handleRefresh = () => {
  message.success('点击了刷新按钮')
}

const handleCreate = () => {
  message.success('点击了新建策略按钮')
}
</script>

<style scoped>
.demo-container {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.demo-state {
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
  font-size: 13px;
  color: #666;
}
.demo-state p {
  margin: 4px 0;
}
</style>
