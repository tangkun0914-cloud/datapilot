<template>
  <div class="h-[560px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
    <MapAgentSidebar
      :is-dark-mode="false"
      :favorite-fqns="demoFavorites"
      @send="onSend"
      @new-chat="onNewChat"
      @select-history="onSelectHistory"
      @toggle-table-favorite="onToggleFav"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import MapAgentSidebar from '@/pages/DataMap/MapAgent/components/MapAgentSidebar.vue'

const demoFavorites = ref(['dm_trade.dws_order_summary_nd', 'dm_risk.dim_risk_rule'])

function onSend(text) {
  message.info(`Design Demo send: ${text}`)
}
function onNewChat() {
  message.success('新建对话')
}
function onSelectHistory(item) {
  message.info(`选中历史: ${item.title}`)
}
function onToggleFav(fqn) {
  const set = new Set(demoFavorites.value)
  if (set.has(fqn)) set.delete(fqn)
  else set.add(fqn)
  demoFavorites.value = [...set]
}
</script>
