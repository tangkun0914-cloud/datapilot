<template>
  <div class="demo-wrap">
    <p class="demo-desc">
      页面级入口，预览区高度受限；完整布局与交互请跳转真实路由。
    </p>
    <a-button type="primary" class="mb-3" @click="$router.push('/datamap/map-agent')">
      打开地图 Agent v2
    </a-button>
    <div class="preview-frame h-[520px] border border-slate-200 rounded-lg overflow-hidden bg-[#f8fafc]">
      <MapAgentPage class="h-full" />
    </div>
  </div>
</template>

<script setup>
import MapAgentPage from '@/pages/DataMap/MapAgent/index.vue'
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
