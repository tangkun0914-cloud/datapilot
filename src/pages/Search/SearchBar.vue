<template>
  <div class="search-bar">
    <a-dropdown
      v-model:open="dropdownVisible"
      trigger="custom"
      placement="bottomLeft"
      overlay-class-name="search-bar-dropdown"
      @open-change="onDropdownOpenChange"
    >
      <div class="search-input-wrap">
        <div class="search-input-box">
          <a-input
            ref="inputRef"
            v-model:value="keyword"
            placeholder="输入关键词进行查询，支持空格分割符检索多个关键词"
            class="search-input"
            :bordered="false"
            allow-clear
            @focus="onInputFocus"
            @keyup.enter="handleSearch"
            @input="onInput"
          />
          <a-button
            type="primary"
            size="small"
            class="search-btn-inner"
            @click="handleSearch"
          >
            <SearchOutlined /> 搜索
          </a-button>
        </div>
        <a-button
          size="small"
          :class="['fav-btn', { 'fav-btn-active': route.query?.sort === 'favorites' }]"
          @click="goToFavorites"
        >
          <StarOutlined /> 我的收藏
        </a-button>
      </div>
      <template #overlay>
        <div class="search-dropdown-content">
          <template v-if="keyword.trim()">
            <div class="dropdown-section">
              <div class="section-title">搜索建议</div>
              <div
                v-for="(item, idx) in filteredSuggestions"
                :key="idx"
                class="dropdown-item"
                @click="selectSuggestion(item)"
              >
                <span class="item-text">{{ item.text }}</span>
                <SourceTag
                  v-if="item._source?.serviceType"
                  :type="item._source.serviceType"
                  class="ml-2"
                />
              </div>
              <a-empty
                v-if="filteredSuggestions.length === 0"
                description="暂无匹配建议"
                :image="null"
                class="py-4"
              />
            </div>
          </template>
          <template v-else>
            <div class="dropdown-section">
              <div class="section-header">
                <span class="section-title">历史搜索</span>
                <a-button
                  v-if="searchHistory.length > 0"
                  type="link"
                  size="small"
                  class="clear-history"
                  @click.stop="clearHistory"
                >
                  清空
                </a-button>
              </div>
              <div class="history-tags">
                <div
                  v-for="(h, idx) in searchHistory"
                  :key="idx"
                  class="history-tag"
                  @click="selectHistory(h)"
                >
                  {{ h }}
                </div>
              </div>
              <a-empty
                v-if="searchHistory.length === 0"
                description="暂无搜索历史"
                :image="null"
                class="py-4"
              />
            </div>
          </template>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchOutlined, StarOutlined } from '@ant-design/icons-vue'
import SourceTag from '@/components/SourceTag.vue'
import { getSuggestions } from '@/services/searchService.js'

const HISTORY_KEY = 'datamap_search_history'
const HISTORY_MAX = 10

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search'])
const router = useRouter()
const route = useRoute()

const keyword = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const dropdownVisible = ref(false)
const inputRef = ref(null)
const allSuggestions = ref([])

const searchHistory = ref([])

onMounted(async () => {
  allSuggestions.value = await getSuggestions('') || []
})

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    searchHistory.value = raw ? JSON.parse(raw) : []
  } catch {
    searchHistory.value = []
  }
}

function saveHistory(q) {
  const trimmed = (q || '').trim()
  if (!trimmed) return
  let list = searchHistory.value.filter((h) => h !== trimmed)
  list = [trimmed, ...list].slice(0, HISTORY_MAX)
  searchHistory.value = list
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
  dropdownVisible.value = false
}

const filteredSuggestions = computed(() => {
  const q = (keyword.value || '').trim().toLowerCase()
  if (!q) return allSuggestions.value
  return allSuggestions.value.filter((s) =>
    (s.text || '').toLowerCase().includes(q)
  )
})

function onDropdownOpenChange(open) {
  if (open) loadHistory()
}

function onInputFocus() {
  dropdownVisible.value = true
  loadHistory()
}

function onInput() {
  dropdownVisible.value = true
}

function selectSuggestion(item) {
  const text = item.text || item._source?.name || ''
  keyword.value = text
  dropdownVisible.value = false
  emit('search', text)
  saveHistory(text)
}

function selectHistory(h) {
  keyword.value = h
  dropdownVisible.value = false
  emit('search', h)
}

function handleSearch() {
  const q = (keyword.value || '').trim()
  if (q) {
    saveHistory(q)
  }
  
  // 保持当前的 sort 状态（例如 favorites）
  const query = { q }
  if (route.query?.sort) {
    query.sort = route.query.sort
  }
  
  router.replace({ path: '/search', query })
  emit('search', q)
  dropdownVisible.value = false
}

function goToFavorites() {
  const isFavorites = route.query?.sort === 'favorites'
  const query = { ...route.query }
  
  if (isFavorites) {
    // 取消收藏状态
    delete query.sort
  } else {
    // 激活收藏状态
    query.sort = 'favorites'
  }
  
  router.replace({ path: '/search', query })
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 1000px;
}

.search-input-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 2px 4px 2px 0;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  height: 36px;
}

.search-input-box:focus-within {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.search-input {
  flex: 1;
  height: 100%;
}

.search-input :deep(.ant-input) {
  font-size: 14px;
  height: 100%;
}

.search-btn-inner {
  flex-shrink: 0;
  border-radius: 4px;
  height: 28px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
}

.fav-btn {
  flex-shrink: 0;
  border-radius: 6px;
  height: 36px;
  font-size: 13px;
  color: #64748b;
  border-color: #d9d9d9;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
}

.fav-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.fav-btn-active {
  color: #1677ff;
  border-color: #1677ff;
  background-color: #e6f4ff;
}

.dropdown-section {
  min-width: 360px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 4px;
}

.section-title {
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
}

.clear-history {
  padding: 0;
  font-size: 12px;
  color: #94a3b8;
}

.clear-history:hover {
  color: #1677ff;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px 16px;
}

.history-tag {
  padding: 4px 12px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-tag:hover {
  background: #e2e8f0;
  color: #1677ff;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
