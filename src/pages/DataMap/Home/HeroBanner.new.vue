<template>
  <div class="hero-container">
    <!-- 背景装饰 -->
    <div class="hero-bg-decor">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- 主视觉区：居中搜索 -->
    <div class="hero-center">
      <h1 class="hero-title">智能检索，<span class="hero-title-highlight">洞见数据价值</span></h1>
      <p class="hero-subtitle">面向全域的企业级智能数据地图。支持表名、字段、描述的语义检索；本期 AI 问数仅开放智能找表（业务用途、关键词、项目范围、专题范围）。</p>

      <!-- 搜索框 -->
      <div
        class="search-box"
        :class="{
          'search-box-focused': isFocused,
          'search-box-focused-ai': isFocused && searchMode === 'ai',
        }"
      >
        <div class="search-mode-tabs">
          <button
            :class="['mode-tab', searchMode === 'ai' && 'mode-tab-active mode-tab-ai']"
            @click="switchToAI"
          >
            <PilotLogo :size="18" class="hero-ai-pilot-logo" /> AI 问数
          </button>
          <button
            :class="['mode-tab', searchMode === 'search' && 'mode-tab-active']"
            @click="searchMode = 'search'"
          >
            <SearchOutlined /> 搜索
          </button>
        </div>

        <div class="search-input-row">
          <a-auto-complete
            v-model:value="keyword"
            :options="options"
            class="search-autocomplete"
            @select="handleSelect"
            @search="handleInput"
            @focus="onFocus"
            @blur="onBlur"
            :dropdownMatchSelectWidth="true"
            dropdownClassName="hero-search-dropdown"
            :open="dropdownOpen"
          >
            <a-input
              ref="inputRef"
              class="search-input-field"
              :placeholder="searchMode === 'search'
                ? '搜索表名、字段、描述...'
                : '用自然语言提问，如：帮我找和订单相关的表'"
              :bordered="false"
              @pressEnter="handleAction"
            >
              <template #prefix>
                <SearchOutlined v-if="searchMode === 'search'" class="input-prefix-icon" />
                <PilotLogo v-else :size="18" class="input-prefix-icon input-prefix-pilot" />
              </template>
            </a-input>
          </a-auto-complete>
          <a-button
            type="primary"
            class="action-btn"
            :class="{ 'action-btn-ai': searchMode === 'ai' }"
            @click="handleAction"
          >
            {{ searchMode === 'search' ? '全域搜索' : 'AI 回答' }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 底部渐变装饰 -->
    <div class="hero-gradient-bottom"></div>
  </div>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  HistoryOutlined,
} from '@ant-design/icons-vue'
import PilotLogo from '@/components/Copilot/PilotLogo.vue'
import { getSuggestions } from '@/services/DataMap/searchService.js'
import { useCopilotStore } from '@/stores/DataMap/copilot.js'

const emit = defineEmits(['openCopilot'])
const router = useRouter()
const copilotStore = useCopilotStore()

const keyword = ref('')
const searchMode = ref('ai')
const options = ref([])
const isFocused = ref(false)
const dropdownOpen = ref(false)
const allSuggestions = ref([])
const searchHistory = ref(['order', '营收', 'user_profile', 'dwd_fact', '埋点'])

onMounted(async () => {
  allSuggestions.value = await getSuggestions('') || []
})

function onFocus() {
  isFocused.value = true
  if (!keyword.value && searchMode.value === 'search' && searchHistory.value.length > 0) {
    showHistory()
  }
}

function onBlur() {
  setTimeout(() => {
    isFocused.value = false
    dropdownOpen.value = false
  }, 200)
}

function showHistory() {
  const historyOptions = searchHistory.value.slice(0, 5).map(item => ({
    value: item,
    label: h('div', { class: 'dropdown-item history-item' }, [
      h(HistoryOutlined, { class: 'dropdown-item-icon' }),
      h('span', item),
    ]),
  }))
  options.value = [{
    label: h('div', { class: 'dropdown-group-label' }, '最近搜索'),
    options: historyOptions,
  }]
  dropdownOpen.value = true
}

function handleInput(val) {
  if (searchMode.value === 'ai') {
    options.value = []
    dropdownOpen.value = false
    return
  }
  if (!val || val.length < 2) {
    options.value = []
    dropdownOpen.value = false
    return
  }

  const suggests = allSuggestions.value.map(item => ({
    value: item.text,
    label: h('div', { class: 'dropdown-item suggest-item' }, [
      h('div', { class: 'suggest-main' }, [
        h('span', { class: 'suggest-title font-mono' }, `${item._source?.database?.name || 'db'}.${item.text}`),
        h('span', { class: 'suggest-desc' }, item._source?.description || '暂无描述'),
      ]),
    ]),
  }))

  options.value = [{
    label: h('div', { class: 'dropdown-group-label' }, '最佳匹配'),
    options: suggests,
  }]
  dropdownOpen.value = true
}

function handleSelect(val) {
  keyword.value = val
  dropdownOpen.value = false
  handleSearch(val)
}

function handleAction() {
  if (searchMode.value === 'search') {
    handleSearch(keyword.value)
  } else {
    handleAIQuestion(keyword.value)
  }
}

function handleSearch(value) {
  const q = (value || keyword.value || '').trim()
  if (q) {
    router.push({ path: '/search', query: { q } })
  } else {
    router.push({ path: '/search' })
  }
}

function handleAIQuestion(value) {
  const q = (value || keyword.value || '').trim()
  copilotStore.open(q)
}

function switchToAI() {
  searchMode.value = 'ai'
  options.value = []
  dropdownOpen.value = false
}
</script>

<style scoped>
.hero-container {
  position: relative;
  min-height: 360px;
  background: linear-gradient(175deg, #f0f4ff 0%, #f6f8fc 40%, #fafbff 70%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 28px;
  overflow: hidden;
}

/* ===== 背景装饰 ===== */
.hero-bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.bg-glow-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #bfdbfe 0%, transparent 70%);
  top: -120px;
  right: -80px;
  animation: glowFloat 8s ease-in-out infinite alternate;
}

.bg-glow-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ddd6fe 0%, transparent 70%);
  bottom: -80px;
  left: -60px;
  animation: glowFloat 10s ease-in-out infinite alternate-reverse;
}

@keyframes glowFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, -15px); }
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
}

/* ===== 标题区 ===== */
.hero-center {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.hero-title {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
  text-align: center;
}

.hero-title-highlight {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 36px;
  text-align: center;
  line-height: 1.7;
  max-width: 560px;
}

/* ===== 搜索框 ===== */
.search-box {
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 4px 24px rgba(22, 119, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  border: 1.5px solid rgba(226, 232, 240, 0.8);
  padding: 8px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box-focused {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow:
    0 8px 40px rgba(22, 119, 255, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 4px rgba(59, 130, 246, 0.06);
  transform: translateY(-2px);
}

/* AI 问数模式聚焦：与 Copilot 主色 rgba(108, 76, 155) 一致 */
.search-box-focused.search-box-focused-ai {
  border-color: rgba(108, 76, 155, 0.38);
  box-shadow:
    0 8px 40px rgba(108, 76, 155, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 4px rgba(108, 76, 155, 0.08);
}

/* AI 问数 Tab / 输入框前缀：与 Copilot PilotLogo 一致 */
.hero-ai-pilot-logo {
  display: inline-flex;
  vertical-align: middle;
  flex-shrink: 0;
}

/* Mode Tabs */
.search-mode-tabs {
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  margin-bottom: 2px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab:hover {
  color: #64748b;
  background: #f1f5f9;
}

.mode-tab-active {
  color: #2563eb;
  background: #eff6ff;
  border-color: rgba(59, 130, 246, 0.15);
}

.mode-tab-active:not(.mode-tab-ai):hover {
  color: #2563eb;
  background: #eff6ff;
}

.mode-tab-ai.mode-tab-active {
  color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.08);
  border-color: rgba(108, 76, 155, 0.22);
}

.mode-tab-ai.mode-tab-active:hover {
  color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.11);
  border-color: rgba(108, 76, 155, 0.28);
}

/* Input Row */
.search-input-row {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  gap: 8px;
}

.search-autocomplete {
  flex: 1;
}

.search-autocomplete :deep(.ant-select-selector) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.search-input-field {
  height: 48px;
  font-size: 15px;
}

.search-input-field :deep(input) {
  color: #1e293b;
  font-weight: 400;
}

.search-input-field :deep(input::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

.input-prefix-icon {
  font-size: 18px;
  color: #94a3b8;
  margin-right: 6px;
  transition: color 0.2s;
}

/* AI 模式前缀：PilotLogo 自带品牌渐变，无需再设 color */
.input-prefix-icon.input-prefix-pilot {
  vertical-align: middle;
}

/* Action Button */
.action-btn {
  height: 44px;
  padding: 0 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  transition: all 0.25s;
}

.action-btn:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
  transform: translateY(-1px);
}

.action-btn-ai {
  background: linear-gradient(135deg, rgba(108, 76, 155) 0%, rgba(88, 58, 128) 100%);
  box-shadow: 0 4px 14px rgba(108, 76, 155, 0.38);
}

.action-btn-ai:hover {
  background: linear-gradient(135deg, rgba(122, 95, 168) 0%, rgba(108, 76, 155) 100%) !important;
  box-shadow: 0 6px 20px rgba(108, 76, 155, 0.45) !important;
}

/* ===== 底部渐变 ===== */
.hero-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, transparent 0%, #f8fafc 100%);
  pointer-events: none;
}

/* ===== 下拉框全局样式 ===== */
:global(.hero-search-dropdown) {
  padding: 6px;
  border-radius: 14px !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid #f0f0f0;
  background: #fff !important;
}

:global(.hero-search-dropdown .ant-select-item) {
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 2px;
}

:global(.hero-search-dropdown .ant-select-item-option-active) {
  background-color: #f5f7fa !important;
}

:global(.dropdown-group-label) {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 4px 2px;
}

:global(.dropdown-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:global(.dropdown-item-icon) {
  color: #cbd5e1;
  font-size: 13px;
}

:global(.history-item) {
  color: #475569;
  font-size: 13px;
}

:global(.suggest-item) {
  padding: 2px 0;
}

:global(.suggest-main) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:global(.suggest-title) {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

:global(.suggest-desc) {
  font-size: 12px;
  color: #94a3b8;
}
</style>
