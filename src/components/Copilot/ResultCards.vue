<template>
  <div class="result-cards">
    <div
      v-for="table in tables"
      :key="table.id"
      class="result-card"
      @click="goDetail(table)"
    >
      <div class="result-card-header">
        <div class="flex flex-col overflow-hidden mr-2">
          <span class="result-card-name font-mono">{{ table.database?.name || 'db' }}.{{ table.name }}</span>
          <span class="text-[10px] text-gray-500 mt-0.5 truncate">{{ table.displayName || table.name }}</span>
        </div>
        <SourceTag :type="table.serviceType" class="flex-shrink-0" />
      </div>
      <p class="result-card-desc">{{ table.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SourceTag from '@/components/SourceTag.vue'

defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

function goDetail(table) {
  router.push(`/detail/${encodeURIComponent(table.fullyQualifiedName)}`)
}
</script>

<style scoped>
.result-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.result-card {
  background: var(--color-bg-card);
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.1);
}

.result-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.result-card-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-card-desc {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
