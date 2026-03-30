<template>
  <div class="demo-wrapper">
    <p class="demo-hint">基于 G6 渲染的血缘关系图，数据来自 mock/lineage.js。可拖拽节点、点击展开上下游。</p>
    <div class="lineage-container">
      <LineageTab fqn="hive.dwa_cn.dwa_cn_cus_df_complain_detail" />
    </div>
  </div>
</template>

<script setup>
import LineageTab from '@/pages/DataMap/Detail/LineageTab.vue'
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.demo-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #94a3b8;
}

.lineage-container {
  width: 100%;
  height: 520px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
