<template>
  <div class="data-source-icon" :class="sourceType" :title="type">
    <!-- Hive Official Icon -->
    <img v-if="sourceType === 'hive'" src="/icons/hive.svg" alt="Hive" />

    <!-- Default Icon (Data File) -->
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6C4.89543 2 4 2.89543 4 4Z"></path>
      <path d="M14 2V8H20"></path>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 28
  }
})

const sourceType = computed(() => props.type?.toLowerCase() || 'default')
</script>

<style scoped>
.data-source-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  transition: all 0.2s ease;
  background: transparent;
}

.data-source-icon img,
.data-source-icon svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 默认: 灰色 */
.data-source-icon.default {
  color: #64748b;
}
</style>
