<template>
  <div class="design-system">
    <!-- 侧栏 -->
    <div class="design-sidebar">
      <div class="sidebar-header">
        <h2>组件库</h2>
        <span class="sidebar-stats">{{ sidebarCountText }}</span>
      </div>

      <!-- 搜索 -->
      <div class="sidebar-search">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索组件..."
          class="search-input"
        />
      </div>

      <!-- Tab：全部 / 平台级（跨产品壳层） / 模块级（按产品：数据地图、数据集成…） / 子模块级 -->
      <div class="sidebar-level-tabs" role="tablist">
        <button
          v-for="tab in levelTabs"
          :key="tab.key"
          type="button"
          role="tab"
          :title="tab.hint"
          :aria-selected="levelTab === tab.key"
          :class="['level-tab', { active: levelTab === tab.key }]"
          @click="levelTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 分组导航 -->
      <div class="sidebar-nav">
        <!-- 子模块级：按 L3 扁平列表展示 -->
        <template v-if="levelTab === 'submodule'">
          <div class="nav-group">
            <div class="nav-group-title">
              <span class="nav-group-badge badge-L3">L3</span>
              子模块索引
            </div>
            <ul class="nav-list nav-list-l3">
              <li
                v-for="row in filteredL3Rows"
                :key="row.key"
                :class="{ active: activeId === row.parentId }"
                @click="activeId = row.parentId"
              >
                <span class="nav-item-name">{{ row.parentName }}</span>
                <span class="nav-item-label nav-l3-name">{{ row.childName }}</span>
              </li>
            </ul>
          </div>
          <div v-if="filteredL3Rows.length === 0" class="nav-empty">
            无匹配子模块
          </div>
        </template>

        <!-- 其余 Tab：按分组展示组件 -->
        <template v-else>
          <div v-for="group in filteredGroups" :key="group.groupName" class="nav-group">
            <div class="nav-group-title">
              <span
                v-if="group.groupBadge"
                class="nav-group-badge"
                :class="'badge-' + group.groupBadge"
              >{{ group.groupBadge }}</span>
              <span
                v-else
                class="nav-group-badge"
                :class="'badge-' + group.groupLevel"
              >{{ group.groupLevel }}</span>
              <span class="nav-group-title-text">{{ group.displayTitle || group.groupName.replace(/^L[12]\s+/, '') }}</span>
            </div>
            <p v-if="group.emptyHint" class="nav-group-empty-hint">{{ group.emptyHint }}</p>
            <ul v-if="group.items.length" class="nav-list">
              <li
                v-for="item in group.items"
                :key="item.id"
                :class="{ active: activeId === item.id }"
                @click="activeId = item.id"
              >
                <span class="nav-item-name">{{ item.name }}</span>
                <span class="nav-item-label">{{ item.label }}</span>
              </li>
            </ul>
          </div>

          <div v-if="showNavEmpty" class="nav-empty">
            无匹配组件
          </div>
        </template>
      </div>

    </div>

    <!-- 内容区 -->
    <div class="design-content">
      <DocRenderer v-if="activeConfig" :config="activeConfig" />
      <div v-else class="content-empty">
        <AppstoreOutlined class="empty-icon" />
        <p>请从左侧选择一个组件查看文档</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { AppstoreOutlined } from '@ant-design/icons-vue'
import DocRenderer from './DocRenderer.vue'
import { componentGroups } from './config.js'

/** 模块级 Tab 下产品模块展示顺序（未在列表中的模块若有组件会排在后面） */
const PRODUCT_MODULE_ORDER = ['数据地图', '数据集成']

const levelTabs = [
  { key: 'all', label: '全部', hint: '按源码目录分组，列出全部组件' },
  { key: 'platform', label: '平台级', hint: '跨产品的导航、布局与通用能力（非单一产品专属）' },
  { key: 'module', label: '模块级', hint: '按产品模块归类：如数据地图、数据集成' },
  { key: 'submodule', label: '子模块级', hint: '各组件文档中的 L3 子模块索引' },
]

const searchText = ref('')
const levelTab = ref('all')
const activeId = ref(componentGroups[0]?.items[0]?.id || '')

const totalCount = computed(() =>
  componentGroups.reduce((sum, g) => sum + g.items.length, 0)
)

function allItemsFlat() {
  return componentGroups.flatMap(g => g.items)
}

function itemMatchesQuery(item, q) {
  if (!q) return true
  return (
    item.name.toLowerCase().includes(q) ||
    (item.label && item.label.includes(q)) ||
    (item.desc && item.desc.toLowerCase().includes(q)) ||
    (item.productModule && item.productModule.includes(q))
  )
}

function buildProductModuleGroups() {
  const map = new Map()
  for (const item of allItemsFlat()) {
    if (item.catalogTier !== 'productModule') continue
    const m = item.productModule || '未分类'
    if (!map.has(m)) map.set(m, [])
    map.get(m).push(item)
  }
  const groups = []
  for (const name of PRODUCT_MODULE_ORDER) {
    const items = map.get(name) || []
    if (name === '数据集成' && !items.length) {
      groups.push({
        groupKey: `product-${name}`,
        groupName: name,
        displayTitle: name,
        groupBadge: '模块',
        groupLevel: 'L2',
        items: [],
        emptyHint:
          '暂无登记组件。数据集成模块接入后，在 config 中为条目设置 catalogTier: \'productModule\' 与 productModule: \'数据集成\'。',
      })
    } else if (items.length) {
      groups.push({
        groupKey: `product-${name}`,
        groupName: name,
        displayTitle: name,
        groupBadge: '模块',
        groupLevel: 'L2',
        items,
      })
    }
  }
  for (const [name, items] of map) {
    if (!PRODUCT_MODULE_ORDER.includes(name) && items.length) {
      groups.push({
        groupKey: `product-${name}`,
        groupName: name,
        displayTitle: name,
        groupBadge: '模块',
        groupLevel: 'L2',
        items,
      })
    }
  }
  return groups
}

/** 所有含 L3 的扁平行（用于子模块 Tab） */
const l3Rows = computed(() => {
  const list = []
  for (const g of componentGroups) {
    for (const item of g.items) {
      const children = item.children || []
      for (const c of children) {
        list.push({
          key: `${item.id}-${c.id}`,
          parentId: item.id,
          parentName: item.name,
          childName: c.name,
          childData: c.data || '',
        })
      }
    }
  }
  return list
})

const filteredL3Rows = computed(() => {
  const q = searchText.value.toLowerCase().trim()
  if (!q) return l3Rows.value
  return l3Rows.value.filter(
    row =>
      row.parentName.toLowerCase().includes(q) ||
      row.childName.includes(q) ||
      (row.childData && row.childData.toLowerCase().includes(q))
  )
})

const filteredGroups = computed(() => {
  if (levelTab.value === 'submodule') return []
  const q = searchText.value.toLowerCase().trim()

  if (levelTab.value === 'all') {
    if (!q) return componentGroups
    return componentGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => itemMatchesQuery(item, q)),
      }))
      .filter(group => group.items.length > 0)
  }

  if (levelTab.value === 'platform') {
    const items = allItemsFlat().filter(i => i.catalogTier === 'platform' && itemMatchesQuery(i, q))
    return items.length
      ? [
          {
            groupKey: 'catalog-platform',
            groupName: '平台级',
            displayTitle: '平台级（跨产品壳层与通用能力）',
            groupBadge: '平台',
            groupLevel: 'L1',
            items,
          },
        ]
      : []
  }

  if (levelTab.value === 'module') {
    const base = buildProductModuleGroups()
    if (!q) return base
    return base
      .map(g => {
        const items = g.items.filter(item => itemMatchesQuery(item, q))
        return {
          ...g,
          items,
          emptyHint: items.length ? undefined : g.emptyHint && !q ? g.emptyHint : undefined,
        }
      })
      .filter(g => g.items.length > 0 || g.emptyHint)
  }

  return componentGroups
})

const platformItemCount = computed(
  () => allItemsFlat().filter(i => i.catalogTier === 'platform').length
)
const productModuleItemCount = computed(
  () => allItemsFlat().filter(i => i.catalogTier === 'productModule').length
)

const showNavEmpty = computed(() => {
  if (levelTab.value === 'submodule') return false
  const groups = filteredGroups.value
  if (!groups.length) return true
  const hasItems = groups.some(g => g.items.length)
  const hasPlaceholder = groups.some(g => g.emptyHint)
  return !hasItems && !hasPlaceholder
})

const sidebarCountText = computed(() => {
  if (levelTab.value === 'submodule') {
    const total = l3Rows.value.length
    const n = filteredL3Rows.value.length
    return searchText.value.trim() ? `${n} / ${total} 个子模块` : `${total} 个子模块`
  }
  const visible = filteredGroups.value.reduce((s, g) => s + g.items.length, 0)
  const q = searchText.value.trim()
  if (levelTab.value === 'all' && !q) {
    return `${totalCount.value} 个组件`
  }
  if (levelTab.value === 'platform') {
    return q ? `${visible} / ${platformItemCount.value} 个组件` : `${platformItemCount.value} 个平台级`
  }
  if (levelTab.value === 'module') {
    return q ? `${visible} / ${productModuleItemCount.value} 个组件` : `${productModuleItemCount.value} 个产品模块内`
  }
  return q ? `${visible} / ${totalCount.value} 个组件` : `${visible} 个组件`
})

watch([levelTab, searchText], () => {
  if (levelTab.value === 'submodule') {
    if (filteredL3Rows.value.length && !filteredL3Rows.value.some(r => r.parentId === activeId.value)) {
      activeId.value = filteredL3Rows.value[0].parentId
    }
    return
  }
  const groups = filteredGroups.value
  const exists = groups.some(g => g.items.some(i => i.id === activeId.value))
  if (!exists && groups.length) {
    activeId.value = groups[0].items[0].id
  }
})

const activeConfig = computed(() => {
  for (const group of componentGroups) {
    const found = group.items.find(item => item.id === activeId.value)
    if (found) return found
  }
  return null
})
</script>

<style scoped>
.design-system {
  display: flex;
  height: 100vh;
  background: #fff;
}

/* ===== 侧栏 ===== */
.design-sidebar {
  width: 280px;
  border-right: 1px solid #e2e8f0;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.sidebar-stats {
  font-size: 12px;
  color: #94a3b8;
}

/* 搜索 */
.sidebar-search {
  padding: 12px 16px;
}

.search-input {
  width: 100%;
  padding: 7px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.search-input:focus {
  border-color: #1677ff;
}

.search-input::placeholder {
  color: #cbd5e1;
}

/* 层级 Tab */
.sidebar-level-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.level-tab {
  flex: 1;
  min-width: 0;
  padding: 5px 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.level-tab:hover {
  color: #1677ff;
  border-color: #91caff;
}

.level-tab.active {
  color: #fff;
  background: #1677ff;
  border-color: #1677ff;
}

.badge-L3 {
  background: #8b5cf6;
  color: #fff;
}

.badge-平台 {
  background: #0f172a;
  color: #fff;
}

.badge-模块 {
  background: #0d9488;
  color: #fff;
}

.nav-group-title-text {
  flex: 1;
  min-width: 0;
}

.nav-group-empty-hint {
  margin: 0 20px 12px 32px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
}

.nav-list-l3 li {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.nav-l3-name {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.nav-list-l3 li.active .nav-l3-name {
  color: #1677ff;
}

/* 分组导航 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 16px;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.nav-group-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  line-height: 16px;
}

.badge-L1 {
  background: #0f172a;
  color: #fff;
}

.badge-L2 {
  background: #3b82f6;
  color: #fff;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  padding: 8px 20px 8px 32px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-list li:hover {
  background: #f1f5f9;
}

.nav-list li.active {
  background: #e6f4ff;
  border-right: 3px solid #1677ff;
}

.nav-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.nav-list li.active .nav-item-name {
  color: #1677ff;
  font-weight: 600;
}

.nav-item-label {
  font-size: 11px;
  color: #94a3b8;
}

.nav-list li.active .nav-item-label {
  color: #6cb3ff;
}

.nav-empty {
  text-align: center;
  padding: 40px 20px;
  color: #cbd5e1;
  font-size: 13px;
}

/* ===== 内容区 ===== */
.design-content {
  flex: 1;
  padding: 40px 48px;
  overflow-y: auto;
  background: #fff;
}

.content-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #cbd5e1;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.content-empty p {
  font-size: 14px;
}
</style>
