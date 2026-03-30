<template>
  <div class="demo-wrap">
    <p class="demo-desc">告警状态徽章：根据 <code>status</code> 展示图标与文案，可在列表、详情等场景复用。</p>
    <div class="badge-row">
      <div v-for="s in statuses" :key="s" class="badge-cell">
        <AlertStatusBadge :status="s" />
        <span class="code">{{ s }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertStatusBadge from '@/pages/Monitoring/components/AlertStatusBadge.vue'

const statuses = [
  'firing',
  'acked',
  'silenced',
  'transferred',
  'resolved',
  'falsePositive',
]
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
.demo-desc {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 16px;
}
.demo-desc code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
}
.badge-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.code {
  font-size: 11px;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
}
</style>
