<template>
  <div class="stats-row">
    <div
      v-for="(card, idx) in cards"
      :key="idx"
      class="stat-card"
      :class="{ active: activeIndex === idx }"
      @click="$emit('select', idx)"
    >
      <div class="stat-label">{{ card.label }}</div>
      <div class="stat-num">{{ card.value }}</div>
    </div>
  </div>
</template>

<script setup>
/**
 * StatsCards - 告警统计卡片组
 *
 * 告警列表顶部的统计概览卡片行，展示「我的待处理」「我的新增」「全部待处理」
 * 「今日新增」等指标。支持点击切换激活态以联动列表筛选。
 *
 * @prop {Array}  cards       - 卡片数组，每项含 { label: String, value: Number, color: String }
 * @prop {Number} activeIndex - 当前激活卡片索引，-1 表示无选中
 *
 * @emits select (index: Number) - 点击卡片时触发
 */
defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  activeIndex: {
    type: Number,
    default: -1,
  },
})

defineEmits(['select'])
</script>

<style scoped>
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  flex: 1;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-card.active {
  border-color: #1677ff;
  box-shadow: 0 0 0 1px #1677ff;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.stat-num {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  font-family: 'Helvetica Neue', sans-serif;
  line-height: 1;
}

.stat-card.active .stat-num {
  color: #1677ff;
}
</style>
