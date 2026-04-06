<template>
  <div class="demo-wrap flex flex-col items-end gap-2">
    <UserBubble content="帮我看下订单汇总表的血缘关系" />
  </div>
</template>

<script setup>
import UserBubble from '@/pages/DataMap/MapAgent/components/Chat/UserBubble.vue'
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
</style>
