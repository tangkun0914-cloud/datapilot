<template>
  <transition name="slide-up">
    <div v-if="count > 0" class="bulk-bar">
      <span class="sel-count">已选择 {{ count }} 项</span>
      <a-divider type="vertical" />
      <a-button shape="round" size="small" @click="$emit('bulk', 'claim')">
        👤 批量认领
      </a-button>
      <a-button shape="round" size="small" @click="$emit('bulk', 'falsePositive')">
        ⚠️ 批量误报
      </a-button>
      <a-button shape="round" size="small" @click="$emit('bulk', 'silence')">
        🔇 批量屏蔽
      </a-button>
      <a-button shape="round" size="small" @click="$emit('bulk', 'transfer')">
        ↩ 批量转交
      </a-button>
      <a-button shape="round" size="small" class="bulk-resolve" @click="$emit('bulk', 'resolve')">
        ✅ 批量解决
      </a-button>
      <a-button type="text" size="small" @click="$emit('cancel')">取消</a-button>
    </div>
  </transition>
</template>

<script setup>
/**
 * BulkActionBar - 批量操作悬浮栏
 *
 * 告警列表底部悬浮操作栏，当有告警被勾选时滑入显示。
 * 展示已选数量，提供批量认领、误报、屏蔽、转交、已解决和取消操作。
 *
 * @prop {Number} count - 当前勾选的告警数量，为 0 时自动隐藏
 *
 * @emits bulk   (action: String) - 批量操作，action: claim/falsePositive/silence/transfer/resolve
 * @emits cancel ()               - 取消全部勾选
 */
defineProps({
  count: { type: Number, default: 0 },
})
defineEmits(['bulk', 'cancel'])
</script>

<style scoped>
.bulk-bar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 12px 24px;
  border-radius: 50px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 999;
}

.sel-count {
  font-weight: 600;
  color: #1677ff;
  font-size: 13px;
  white-space: nowrap;
}

.bulk-resolve {
  color: #52c41a !important;
  border-color: #b7eb8f !important;
}

.bulk-resolve:hover {
  background: #f6ffed !important;
  color: #389e0d !important;
  border-color: #389e0d !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}
</style>
