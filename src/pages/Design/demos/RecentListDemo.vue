<template>
  <div class="demo-wrapper">
    <RecentList />
    <p class="demo-hint">数据来自 mock 服务，可切换"最近浏览"、"我的收藏"、"热度榜"三个 Tab，列表支持收藏操作</p>
  </div>
</template>

<script setup>
import RecentList from '@/pages/DataMap/Home/RecentList.vue'
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
