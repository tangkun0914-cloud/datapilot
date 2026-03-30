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
    
    <!-- 查看更多按钮 -->
    <div v-if="showMore" class="result-card-more" @click="goSearch">
      查看更多推荐表 <RightOutlined class="ml-1 text-[10px]" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { RightOutlined } from '@ant-design/icons-vue'
import SourceTag from '@/pages/DataMap/components/SourceTag.vue'

const props = defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
  /** 是否显示查看更多按钮 */
  showMore: {
    type: Boolean,
    default: false,
  },
  /** 查看更多的搜索关键词或意图，用于跳转搜索页 */
  moreKeyword: {
    type: String,
    default: '',
  }
})

const router = useRouter()

function goDetail(table) {
  router.push(`/detail/${encodeURIComponent(table.fullyQualifiedName)}`)
}

function goSearch() {
  // 跳转到搜索页，带上推荐参数或关键词
  const query = props.moreKeyword ? `?q=${encodeURIComponent(props.moreKeyword)}` : ''
  router.push(`/search${query}`)
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

.result-card-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-primary);
  background: rgba(22, 119, 255, 0.04);
  border: 1px dashed rgba(22, 119, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card-more:hover {
  background: rgba(22, 119, 255, 0.08);
  border-color: var(--color-primary);
}
</style>
