<template>
  <a-modal
    v-model:open="visible"
    title="操作历史"
    :width="600"
    :footer="null"
  >
    <a-timeline>
      <a-timeline-item
        v-for="(item, idx) in historyItems"
        :key="idx"
        :color="item.color || 'blue'"
      >
        <div class="text-xs text-gray-400 mb-1">{{ item.time }}</div>
        <div class="font-medium text-sm">{{ item.action }}</div>
        <div v-if="item.detail" class="text-xs text-gray-500 mt-1">{{ item.detail }}</div>
      </a-timeline-item>
    </a-timeline>

    <a-empty v-if="!historyItems.length" description="暂无操作历史" />
  </a-modal>
</template>

<script setup>
/**
 * HistoryModal - 操作历史弹窗
 *
 * 以 Ant Design Timeline 展示告警事件的操作历史记录。
 * 每条记录包含时间、操作描述和可选详情。无操作时显示空状态。
 *
 * @prop {Boolean} open         - 弹窗显示状态（v-model:open）
 * @prop {Array}   historyItems - 历史记录数组，每项含 { time, action, detail?, color? }
 *
 * @emits update:open (val: Boolean) - 弹窗开关变化
 */
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  historyItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open'])

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})
</script>
