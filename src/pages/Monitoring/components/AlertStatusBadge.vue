<template>
  <span class="status-badge" :class="badgeClass">
    <ThunderboltFilled v-if="status === 'firing'" class="status-icon firing-icon" />
    <LoadingOutlined v-else-if="status === 'acked'" class="status-icon acked-icon" />
    <BellFilled v-else-if="status === 'silenced'" class="status-icon silenced-icon" />
    <span v-else-if="status === 'transferred'" class="status-icon">↩</span>
    <span v-else-if="status === 'resolved'" class="status-icon">✅</span>
    <WarningOutlined v-else-if="status === 'falsePositive'" class="status-icon fp-icon" />
    {{ statusLabel }}
  </span>
</template>

<script setup>
/**
 * AlertStatusBadge - 告警状态徽章组件
 * 
 * 用于统一展示告警的不同状态（触发中、处理中、已屏蔽、已转交、已解决、误报）。
 * 包含对应的图标和颜色样式。
 * 
 * @prop {String} status - 告警状态枚举值
 */
import { computed } from 'vue'
import { ThunderboltFilled, LoadingOutlined, BellFilled, WarningOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusMap = {
  firing: { badge: 'bdg-firing', label: '触发中' },
  acked: { badge: 'bdg-ack', label: '处理中' },
  silenced: { badge: 'bdg-silence', label: '已屏蔽' },
  transferred: { badge: 'bdg-transfer', label: '已转交' },
  resolved: { badge: 'bdg-resolved', label: '已解决' },
  falsePositive: { badge: 'bdg-fp', label: '误报' },
}

const badgeClass = computed(() => statusMap[props.status]?.badge || '')
const statusLabel = computed(() => statusMap[props.status]?.label || props.status)
</script>

<style scoped>
.status-badge {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  height: 22px;
  gap: 2px;
  white-space: nowrap;
  font-weight: 500;
}

.status-icon {
  font-size: 12px;
  margin-right: 2px;
}

.bdg-firing { color: #f5222d; background: #fff1f0; border: 1px solid #ffa39e; }
.bdg-ack { color: #1677ff; background: #f0f5ff; border: 1px solid #91caff; }
.acked-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.bdg-silence { color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; }
.silenced-icon { position: relative; }
.silenced-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -10%;
  width: 120%;
  height: 1.5px;
  background-color: currentColor;
  transform: translateY(-50%) rotate(-45deg);
}

.bdg-transfer { color: #13c2c2; background: #e6fffb; border: 1px solid #87e8de; }
.bdg-resolved { color: #52c41a; background: #f6ffed; border: 1px solid #b7eb8f; }
.bdg-fp { color: #d86829; background: transparent; border: 1px solid #f3d19e; }
</style>
