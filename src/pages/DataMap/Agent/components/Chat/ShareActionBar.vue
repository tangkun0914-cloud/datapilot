<template>
  <transition name="slide-up">
    <div v-if="visible" 
         class="sticky bottom-6 z-50 flex justify-center w-full mt-auto transition-colors duration-300">
      <div class="w-full max-w-3xl px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border flex items-center justify-between"
           :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'">
        <div class="flex items-center gap-2">
          <a-checkbox 
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="$emit('toggleAll', $event)"
            class="custom-checkbox"
          >
            <span class="text-[14px] font-medium" :class="isDarkMode ? 'text-slate-300' : 'text-gray-700'">
              全选
            </span>
          </a-checkbox>
          <span class="text-[13px] ml-2" :class="isDarkMode ? 'text-slate-500' : 'text-gray-500'">
            已选 {{ selectedCount }} 组
          </span>
        </div>
        <div class="flex items-center gap-3">
          <a-button class="rounded-lg px-6" :class="isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white' : ''" @click="$emit('cancel')">取消</a-button>
          <a-button type="primary" class="agent-share-primary rounded-lg px-6" @click="$emit('openModal')" :disabled="selectedCount === 0">
            分享
          </a-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  isAllSelected: {
    type: Boolean,
    default: false
  },
  isIndeterminate: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['toggleAll', 'cancel', 'openModal'])
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.custom-checkbox :deep(.ant-checkbox-inner) {
  border-color: #d9d9d9;
}
.custom-checkbox :deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: rgba(108,76,155,1);
  border-color: rgba(108,76,155,1);
}
.custom-checkbox :deep(.ant-checkbox-indeterminate .ant-checkbox-inner::after) {
  background-color: rgba(108,76,155,1);
}

.agent-share-primary {
  background-color: rgba(108,76,155,1) !important;
  border-color: rgba(108,76,155,1) !important;
}
.agent-share-primary:hover {
  background-color: rgba(108,76,155,0.9) !important;
  border-color: rgba(108,76,155,0.9) !important;
}
.agent-share-primary:disabled {
  background-color: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: rgba(0, 0, 0, 0.25) !important;
}
</style>