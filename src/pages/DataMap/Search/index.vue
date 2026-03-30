<template>
  <div class="search-page">
    <div class="search-body">
      <FilterPanel class="filter-panel" @change="onFilterChange" />
      <div class="main-content">
        <div class="search-top">
          <SearchBar
            v-model="keyword"
            @search="handleSearch"
            @open-copilot="openCopilot"
          />
        </div>
        <div class="result-area">
          <div class="result-toolbar">
            <div class="toolbar-left">
              <a-select
                v-model:value="sortBy"
                class="sort-select custom-select"
                style="width: 120px"
                :bordered="false"
                @change="applySort"
              >
                <a-select-option value="updatedAt">更新时间</a-select-option>
                <a-select-option value="usage">热度</a-select-option>
              </a-select>
              <a-radio-group v-model:value="viewMode" size="small" class="mode-toggle custom-radio-group">
                <a-radio-button value="list">
                  <UnorderedListOutlined /> 列表
                </a-radio-button>
                <a-radio-button value="table">
                  <TableOutlined /> 表格
                </a-radio-button>
              </a-radio-group>
            </div>
            <div class="toolbar-right">
              <template v-if="keyword.trim()">
                <span class="text-gray-500 text-[13px]">为您找到 <span class="text-blue-600 font-semibold">{{ totalCount }}</span> 个{{ route.query?.sort === 'favorites' ? '收藏' : '搜索' }}结果，下方展示前 {{ Math.min(totalCount, pageSize) }} 条</span>
              </template>
            </div>
          </div>
          <ResultList
            v-if="viewMode === 'list'"
            :data="paginatedData"
            :loading="loading"
            @filter-by-tag="onFilterByTag"
          />
          <ResultTable
            v-else
            :data="paginatedData"
            :loading="loading"
          />
          <div class="pagination-wrap">
            <a-pagination
              v-model:current="currentPage"
              v-model:page-size="pageSize"
              :total="totalCount"
              :show-size-changer="true"
              :page-size-options="['10', '20', '50']"
              :show-total="(total, range) => `${range[0]}-${range[1]}行，共 ${total}行`"
              class="custom-pagination"
              @change="onPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UnorderedListOutlined, TableOutlined } from '@ant-design/icons-vue'
import SearchBar from './SearchBar.vue'
import FilterPanel from './FilterPanel.vue'
import ResultList from './ResultList.vue'
import ResultTable from './ResultTable.vue'
import { searchAssets, getHotRank } from '@/services/DataMap/searchService.js'

const router = useRouter()
const route = useRoute()

const keyword = ref('')
const loading = ref(false)
const viewMode = ref('list')
const sortBy = ref('updatedAt')
const currentPage = ref(1)
const pageSize = ref(10)
const filters = ref({})

const hotRankData = ref([])

const hotRankMap = computed(() => {
  const m = new Map()
  hotRankData.value.forEach((r) => {
    m.set(r.id, r)
    m.set(r.fullyQualifiedName, r)
  })
  return m
})

const rawResults = ref([])
const totalCount = ref(0)

const enrichedResults = computed(() => {
  return rawResults.value.map((item) => {
    const extra = hotRankMap.value.get(item.id) || hotRankMap.value.get(item.fullyQualifiedName) || {}
    return {
      ...item,
      updatedAt: item.updatedAt ?? extra.updatedAt ?? Date.now(),
      usageSummary: item.usageSummary ?? extra.usageSummary ?? { dailyStats: { count: 0 } },
    }
  })
})

const sortedResults = computed(() => {
  let list = [...enrichedResults.value]

  if (route.query?.sort === 'favorites') {
    const favs = new Set(JSON.parse(localStorage.getItem('datamap_favorites') || '[]'))
    list = list.filter(item => favs.has(item.fullyQualifiedName))
  }

  if (sortBy.value === 'updatedAt') {
    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  } else if (sortBy.value === 'usage') {
    list.sort((a, b) => {
      const ca = a?.usageSummary?.dailyStats?.count ?? 0
      const cb = b?.usageSummary?.dailyStats?.count ?? 0
      return cb - ca
    })
  }
  return list
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedResults.value.slice(start, start + pageSize.value)
})

async function doSearch(q) {
  loading.value = true
  try {
    const res = await searchAssets({ q })
    const hits = res?.hits?.hits || []
    rawResults.value = hits.map((h) => ({ ...h._source }))

    if (route.query?.sort === 'favorites') {
      const favs = new Set(JSON.parse(localStorage.getItem('datamap_favorites') || '[]'))
      totalCount.value = rawResults.value.filter(item => favs.has(item.fullyQualifiedName)).length
    } else {
      totalCount.value = res?.hits?.total?.value ?? rawResults.value.length
    }

    currentPage.value = 1
  } finally {
    loading.value = false
  }
}

// 用于防止 watch 和 handleSearch 同时触发导致重复请求
let lastSearchKey = ''

function handleSearch(q) {
  const term = (q || keyword.value || '').trim()

  const query = { q: term }
  if (route.query?.sort) {
    query.sort = route.query.sort
  }

  keyword.value = term
  // 标记当前搜索，让 watch 跳过本次路由变化
  lastSearchKey = JSON.stringify({ q: term, sort: query.sort })
  router.replace({ path: '/search', query })
  doSearch(term)
}

function onFilterChange(f) {
  filters.value = f
  doSearch(keyword.value)
}

function onFilterByTag(tag) {
  handleSearch(keyword.value)
}

function openCopilot() {
  router.push('/copilot')
}

function applySortFromQuery(sort) {
  if (sort === 'hot') {
    sortBy.value = 'usage'
  } else if (sort === 'recent' || sort === 'favorites') {
    sortBy.value = 'updatedAt'
  }
}

onMounted(async () => {
  const q = route.query?.q || ''
  const sort = route.query?.sort

  // 并行加载热度数据和搜索结果
  const [rankData] = await Promise.all([
    getHotRank(),
    (async () => {
      if (sort) applySortFromQuery(sort)
      keyword.value = q
      lastSearchKey = JSON.stringify({ q, sort })
      await doSearch(q)
    })(),
  ])
  hotRankData.value = rankData || []
})

watch(
  () => route.query,
  (query, oldQuery) => {
    const q = query?.q ?? ''
    const sort = query?.sort

    // 跳过由 handleSearch 触发的路由变化，避免重复请求
    const currentKey = JSON.stringify({ q, sort })
    if (currentKey === lastSearchKey) return
    lastSearchKey = currentKey

    if (sort) applySortFromQuery(sort)
    keyword.value = q
    doSearch(q)
  }
)
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}

.search-body {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.filter-panel {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 16px;
}

.search-top {
  width: 100%;
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
}

.result-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px;
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  font-size: 13px;
  color: #64748b;
}

.mode-toggle {
  flex-shrink: 0;
}

.custom-radio-group {
  background-color: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
  border: none;
  display: inline-flex;
}

.custom-radio-group :deep(.ant-radio-button-wrapper) {
  border: none !important;
  background: transparent;
  box-shadow: none !important;
  color: #64748b;
  border-radius: 4px;
  height: 24px;
  line-height: 24px;
  padding: 0 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.custom-radio-group :deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

.custom-radio-group :deep(.ant-radio-button-wrapper-checked) {
  background: #fff !important;
  color: #1677ff !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  font-weight: 500;
}

.sort-select {
  flex-shrink: 0;
}

.custom-select {
  background-color: #f1f5f9;
  border-radius: 6px;
  height: 28px;
}

.custom-select :deep(.ant-select-selector) {
  padding: 0 12px !important;
  height: 28px !important;
  display: flex;
  align-items: center;
}

.custom-select :deep(.ant-select-selection-item) {
  line-height: 28px !important;
  font-size: 13px;
  color: #475569;
}

.custom-select :deep(.ant-select-arrow) {
  color: #94a3b8;
}

.pagination-wrap {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
