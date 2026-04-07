<template>
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t pt-12 pb-6 px-6 transition-colors duration-300" :class="isDarkMode ? 'from-[#0f172a] via-[#0f172a]' : 'from-[#fafafa] via-[#fafafa]'">
    <div class="max-w-4xl mx-auto relative">
      
      <!-- @ 提及下拉列表 (Popover)：本对话优先，下方「常用」；有筛选词时为「最佳匹配」合并列表 -->
      <transition name="fade-up">
        <div v-if="showMentionList" 
             class="absolute left-0 right-0 bottom-[calc(100%+10px)] rounded-[14px] border shadow-[0_12px_48px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden z-50 transition-colors duration-300"
             :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#f0f0f0]'">
          <div class="max-h-[280px] overflow-y-auto custom-scrollbar p-1.5 pt-0">
            <div v-if="isSearching" class="py-4 text-center text-sm flex items-center justify-center gap-2" :class="isDarkMode ? 'text-slate-500' : 'text-gray-400'">
              <LoadingOutlined /> 搜索中...
            </div>
            <div v-else-if="flatMentionItems.length === 0" class="py-4 text-center text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-gray-400'">
              没有找到匹配的表
            </div>
            <template v-else>
              <template v-for="(row, ri) in mentionRows" :key="'r-' + ri + (row.item?.fqn || row.label || '')">
                <div 
                  v-if="row.kind === 'header'" 
                  class="px-3 py-2 text-[11px] font-medium uppercase tracking-wide sticky top-0 z-[1] transition-colors duration-300"
                  :class="isDarkMode ? 'text-slate-500 bg-slate-800' : 'text-[#94a3b8] bg-white'"
                >
                  {{ row.label }}
                </div>
                <div 
                  v-else
                  class="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-colors mb-0.5"
                  :class="[
                    selectedIndex === row.flatIndex 
                      ? (isDarkMode ? 'bg-slate-700' : 'bg-[#f5f7fa]') 
                      : (isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-[#f5f7fa]')
                  ]"
                  @click="selectMention(row.item)"
                  @mouseenter="selectedIndex = row.flatIndex"
                >
                  <div class="flex flex-col min-w-0 flex-1 gap-0.5">
                    <span class="font-mono text-[14px] font-semibold truncate" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">{{ row.item.fqn }}</span>
                    <span class="text-[12px] truncate" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">
                      {{ row.item.cnName || '—' }} <span class="mx-1 opacity-50">|</span> {{ row.item.owner || '—' }}
                    </span>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </transition>

      <!-- 输入框 -->
      <div class="w-full rounded-xl border p-2 relative transition-all duration-300"
           :class="[
             isDarkMode ? 'bg-slate-800 border-slate-700 focus-within:border-[rgba(108,76,155,1)] focus-within:shadow-[0_0_0_2px_rgba(108,76,155,0.15)]' : 'bg-white border-[#d9d9d9] focus-within:border-[rgba(108,76,155,1)] focus-within:shadow-[0_0_0_2px_rgba(108,76,155,0.15)]',
             disabled ? 'opacity-90' : ''
           ]">
        <a-textarea 
          ref="textareaRef"
          v-model:value="inputValue"
          :auto-size="{ minRows: 1, maxRows: 5 }"
          placeholder="继续追问，或输入 @ 提及表名..."
          class="custom-textarea"
          :class="{ 'dark-textarea': isDarkMode }"
          :readonly="disabled"
          @keydown="handleKeyDown"
          @input="handleInput"
        />
        <span
          v-if="showCharHint && !disabled"
          class="absolute bottom-[52px] right-3 text-[11px] tabular-nums pointer-events-none transition-colors"
          :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
        >
          {{ charHintText }}
        </span>
        
        <div class="flex justify-between items-center px-2 pb-2 pt-2 mt-1">
          <div class="flex gap-2 items-center">
            <!-- @ 关联表按钮 -->
            <button 
              class="text-[13px] font-medium flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border-none cursor-pointer bg-transparent"
              :class="isDarkMode ? 'text-slate-400 hover:text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)]' : 'text-slate-500 hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              title="提及表名"
              @click="triggerMention"
            >
              <span class="font-bold text-base leading-none mt-[-2px]">@</span>
            </button>
            
            <div class="w-[1px] h-3.5 mx-0.5 transition-colors duration-300" :class="isDarkMode ? 'bg-slate-700' : 'bg-slate-200'"></div>
            
            <!-- 意图选择器 -->
            <button 
              class="text-[13px] font-medium flex items-center gap-1.5 px-3 h-8 rounded-lg transition-all duration-300 border-none cursor-pointer bg-transparent"
              :class="isDarkMode ? 'text-slate-400 hover:text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)]' : 'text-slate-500 hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/找表 ')"
            >
              <SearchOutlined class="text-[13px] opacity-80" />
              找表
            </button>
            <button 
              class="text-[13px] font-medium flex items-center gap-1.5 px-3 h-8 rounded-lg transition-all duration-300 border-none cursor-pointer bg-transparent"
              :class="isDarkMode ? 'text-slate-400 hover:text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)]' : 'text-slate-500 hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/看详情 @')"
            >
              <TableOutlined class="text-[13px] opacity-80" />
              看详情
            </button>
            <button 
              class="text-[13px] font-medium flex items-center gap-1.5 px-3 h-8 rounded-lg transition-all duration-300 border-none cursor-pointer bg-transparent"
              :class="isDarkMode ? 'text-slate-400 hover:text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)]' : 'text-slate-500 hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/查血缘 @')"
            >
              <NodeIndexOutlined class="text-[13px] opacity-80" />
              查血缘
            </button>
          </div>
          <a-tooltip v-if="disabled" placement="top" title="停止生成">
            <div 
              class="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 border border-slate-200"
              :class="isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800'"
              @click="emit('stop')"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </div>
          </a-tooltip>
          <div 
            v-else
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
            :class="[
              canClickSend
                ? 'cursor-pointer bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,1)] hover:text-white' 
                : (isDarkMode ? 'cursor-not-allowed bg-transparent text-slate-600' : 'cursor-not-allowed bg-transparent text-slate-300')
            ]"
            @click="handleSend"
          >
            <svg v-if="canClickSend" viewBox="0 0 1024 1024" width="18" height="18" fill="currentColor"><path d="M233.984 489.472l131.072 92.672c13.824 9.728 32.768 8.192 44.544-3.584l188.416-188.416c9.728-9.728 26.112-9.728 35.84 0 9.728 9.728 9.728 26.112 0 35.84L445.44 614.4c-11.776 11.776-13.824 30.72-3.584 44.544l92.672 131.072c32.768 46.592 104.448 35.84 122.368-18.432l158.208-475.136c17.92-54.272-33.792-105.984-88.064-88.064l-474.624 158.72c-54.272 17.92-64.512 89.6-18.432 122.368z"></path></svg>
            <svg v-else viewBox="0 0 1024 1024" width="18" height="18" fill="currentColor"><path d="M233.984 489.472l131.072 92.672c13.824 9.728 32.768 8.192 44.544-3.584l188.416-188.416c9.728-9.728 26.112-9.728 35.84 0 9.728 9.728 9.728 26.112 0 35.84L445.44 614.4c-11.776 11.776-13.824 30.72-3.584 44.544l92.672 131.072c32.768 46.592 104.448 35.84 122.368-18.432l158.208-475.136c17.92-54.272-33.792-105.984-88.064-88.064l-474.624 158.72c-54.272 17.92-64.512 89.6-18.432 122.368z"></path></svg>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-3 text-xs font-medium transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-[#999]'">
        DataPilot 生成内容仅供参考，请以实际数据为准
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { SearchOutlined, TableOutlined, NodeIndexOutlined, PauseCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import {
  DEFAULT_FREQUENT_MENTION_TABLES,
  MENTION_FREQUENT_SECTION_CAP
} from '@/utils/agentMentionTables.js'
import { searchAssets } from '@/services/DataMap/searchService.js'

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  },
  /** 当前会话中出现的表（由父组件从 messages 聚合） */
  sessionTables: {
    type: Array,
    default: () => []
  },
  /** 常用表，用于冷启动与补全；默认内置 mock，可换为接口数据 */
  frequentTables: {
    type: Array,
    default: () => [...DEFAULT_FREQUENT_MENTION_TABLES]
  },
  /** 生成中：只读输入，主按钮变为停止 */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'stop'])

const INPUT_MAX_LEN = 500
const CHAR_HINT_THRESHOLD = 400

const inputValue = ref('')
const textareaRef = ref(null)

const inputLen = computed(() => inputValue.value.length)
const showCharHint = computed(() => inputLen.value > CHAR_HINT_THRESHOLD)
const charHintText = computed(() => `${Math.max(0, INPUT_MAX_LEN - inputLen.value)}/${INPUT_MAX_LEN}`)
const isOverMaxLen = computed(() => inputLen.value > INPUT_MAX_LEN)
const canClickSend = computed(
  () => Boolean(inputValue.value.trim()) && !isOverMaxLen.value && !props.disabled
)

// --- @ 提及相关逻辑 ---
const showMentionList = ref(false)
const mentionSearchText = ref('')
const mentionStartIndex = ref(-1)
const selectedIndex = ref(0)
const isSearching = ref(false)
const searchResults = ref([])

const sessionFqnSet = computed(() => new Set((props.sessionTables || []).map((t) => t.fqn)))

const frequentExcludingSession = computed(() =>
  (props.frequentTables || []).filter((t) => !sessionFqnSet.value.has(t.fqn))
)

function filterTablesByKeyword(list, kw) {
  if (!kw) return list
  const k = kw.toLowerCase()
  return list.filter(
    (t) =>
      t.fqn.toLowerCase().includes(k) ||
      (t.cnName && String(t.cnName).toLowerCase().includes(k))
  )
}

let searchTimeout = null
watch(mentionSearchText, async (newVal) => {
  const kw = newVal.trim()
  if (!kw) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      const res = await searchAssets({ q: kw, size: 20 })
      const hits = res?.hits?.hits || []
      searchResults.value = hits.map(hit => {
        const source = hit._source || {}
        return {
          fqn: source.fullyQualifiedName || source.name || '',
          cnName: source.displayName || '',
          owner: source.owners?.[0]?.name || ''
        }
      })
    } catch (e) {
      console.error('Search failed:', e)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
})

/** 无搜索：本对话 + 常用（常用去重且截断）；有搜索：合并列表「最佳匹配」 */
const mentionSections = computed(() => {
  const kw = mentionSearchText.value.trim()
  
  if (kw) {
    // 搜索状态下，直接展示 searchResults
    return searchResults.value.length ? [{ label: '最佳匹配', items: searchResults.value }] : []
  }

  // 默认状态下，展示本对话和常用表
  const session = filterTablesByKeyword([...(props.sessionTables || [])], '')
  const frequentAll = filterTablesByKeyword(frequentExcludingSession.value, '')
  const frequentCapped = frequentAll.slice(0, MENTION_FREQUENT_SECTION_CAP)

  const sections = []
  if (session.length) sections.push({ label: '本对话', items: session })
  if (frequentCapped.length) sections.push({ label: '常用', items: frequentCapped })
  return sections
})

const flatMentionItems = computed(() => mentionSections.value.flatMap((s) => s.items))

const mentionRows = computed(() => {
  const rows = []
  let flatIndex = 0
  for (const sec of mentionSections.value) {
    rows.push({ kind: 'header', label: sec.label })
    for (const item of sec.items) {
      rows.push({ kind: 'item', item, flatIndex: flatIndex++ })
    }
  }
  return rows
})

const triggerMention = () => {
  if (!inputValue.value.endsWith(' ')) {
    inputValue.value += ' '
  }
  inputValue.value += '@'
  mentionStartIndex.value = inputValue.value.length - 1
  mentionSearchText.value = ''
  showMentionList.value = true
  selectedIndex.value = 0
  textareaRef.value?.focus()
}

const handleInput = (e) => {
  const val = e.target.value
  
  const cursorPosition = e.target.selectionStart
  const lastChar = val.slice(cursorPosition - 1, cursorPosition)
  
  if (lastChar === '@') {
    showMentionList.value = true
    mentionStartIndex.value = cursorPosition - 1
    mentionSearchText.value = ''
    selectedIndex.value = 0
    return
  }

  if (showMentionList.value) {
    if (cursorPosition <= mentionStartIndex.value || val[mentionStartIndex.value] !== '@') {
      showMentionList.value = false
      return
    }
    
    const textAfterAt = val.slice(mentionStartIndex.value + 1, cursorPosition)
    if (textAfterAt.includes(' ')) {
      showMentionList.value = false
      return
    }
    
    mentionSearchText.value = textAfterAt
    selectedIndex.value = 0
  }
}

const handleKeyDown = (e) => {
  if (showMentionList.value) {
    const n = flatMentionItems.value.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (n === 0) return
      selectedIndex.value = (selectedIndex.value + 1) % n
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (n === 0) return
      selectedIndex.value = (selectedIndex.value - 1 + n) % n
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (n > 0) {
        selectMention(flatMentionItems.value[selectedIndex.value])
      }
    } else if (e.key === 'Escape') {
      showMentionList.value = false
    }
    return
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (props.disabled) return
    handleSend()
  }
}

const selectMention = (item) => {
  const beforeAt = inputValue.value.slice(0, mentionStartIndex.value)
  inputValue.value = beforeAt + `@${item.fqn} `
  showMentionList.value = false
  
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const fillInput = (text) => {
  inputValue.value = text
  textareaRef.value?.focus()
}

const handleSend = () => {
  if (props.disabled) return
  if (!inputValue.value.trim()) return
  if (isOverMaxLen.value) {
    antMessage.warning('内容超过 500 字限制，请精简后发送')
    return
  }
  emit('send', inputValue.value)
  inputValue.value = ''
  showMentionList.value = false
}
</script>

<style scoped>
.custom-textarea {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 14px 16px !important;
  font-size: 14px !important;
  color: #334155 !important;
}
.custom-textarea.dark-textarea {
  color: #f1f5f9 !important;
}
.custom-textarea:focus {
  box-shadow: none !important;
}
.custom-textarea::placeholder {
  color: #94a3b8 !important;
}
.custom-textarea.dark-textarea::placeholder {
  color: #64748b !important;
}
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
