<template>
  <div class="alert-card-demo">
    <div class="demo-controls">
      <span class="demo-label">切换状态：</span>
      <a-radio-group v-model:value="activeIndex" button-style="solid" size="small">
        <a-radio-button v-for="(item, idx) in demoAlerts" :key="idx" :value="idx">
          {{ item._label }}
        </a-radio-button>
      </a-radio-group>
    </div>

    <div class="demo-card-area">
      <AlertCard
        :alert="demoAlerts[activeIndex]"
        :checked="checked"
        @check="checked = $event"
        @titleClick="handleTitleClick"
        @action="handleAction"
      />
    </div>

    <div class="demo-event-log" v-if="eventLog.length">
      <div class="event-title">事件日志（最近 5 条）</div>
      <div class="event-item" v-for="(e, i) in eventLog.slice(-5)" :key="i">
        <code>{{ e }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AlertCard from '@/pages/Monitoring/AlertList/AlertCard.vue'
import { alertList } from '@/mock/Monitoring/monitoring.js'

const activeIndex = ref(0)
const checked = ref(false)
const eventLog = ref([])

const stateLabels = {
  firing: 'ERROR-触发中',
  acked: 'WARN-处理中',
  silenced: 'ERROR-已屏蔽',
  transferred: 'WARN-已转交',
  resolved: 'ERROR-已解决(人工)',
  falsePositive: 'WARN-误报',
}

const demoAlerts = alertList.slice(0, 7).map(a => ({
  ...a,
  _label: stateLabels[a.status] || a.status,
}))

function handleTitleClick(alert) {
  eventLog.value.push(`[titleClick] ${alert.id} - ${alert.title}`)
}

function handleAction(type, alert) {
  eventLog.value.push(`[action] ${type} → ${alert.id}`)
}
</script>

<style scoped>
.alert-card-demo {
  max-width: 960px;
}

.demo-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.demo-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.demo-card-area {
  margin-bottom: 20px;
}

.demo-event-log {
  background: #f9fafb;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px 16px;
}

.event-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.event-item {
  font-size: 12px;
  color: #333;
  padding: 2px 0;
}

.event-item code {
  background: #e6f4ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 11px;
}
</style>
