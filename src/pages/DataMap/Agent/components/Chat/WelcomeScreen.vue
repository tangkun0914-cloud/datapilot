<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-3xl mx-auto transition-opacity duration-300">
    <!-- Logo & Title -->
    <div class="text-center mb-10">
      <div class="flex items-center justify-center gap-3 mb-4">
        <PilotLogo :size="36" type="color" />
        <h1 class="text-2xl font-bold tracking-tight m-0 transition-colors duration-300" :class="isDarkMode ? 'text-white' : 'text-slate-800'">你好，我是数据地图 Agent</h1>
      </div>
      <p class="font-medium transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">我能帮你找表、查血缘、写 SQL，今天想探索什么？</p>
    </div>

    <!-- 大输入框 -->
    <div class="w-full relative">
      <div class="w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 p-1.5 relative transition-all duration-300 bg-white" 
           :class="[
             isDarkMode ? 'bg-slate-800 ring-slate-700 focus-within:ring-[rgba(108,76,155,1)] focus-within:shadow-[0_8px_30px_rgba(108,76,155,0.15)]' : 'bg-white ring-slate-200 focus-within:ring-[rgba(108,76,155,1)] focus-within:shadow-[0_8px_30px_rgba(108,76,155,0.15)]'
           ]">
        <a-textarea 
          ref="textareaRef"
          v-model:value="inputValue"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          placeholder="请输入你想要查询的数据内容，支持 @ 提及表名..."
          class="custom-textarea"
          :class="{ 'dark-textarea': isDarkMode }"
          @keydown="handleKeyDown"
          @input="handleInput"
        />
      
        <div class="flex justify-between items-center px-2 pb-2 pt-2 mt-1">
          <div class="flex gap-1.5 items-center">
            <!-- @ 关联表按钮 -->
            <a-button 
              type="text"
              size="small" 
              class="text-[12px] font-medium flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300"
              :class="isDarkMode ? 'text-slate-400 bg-slate-700/50 hover:text-white hover:bg-slate-700' : 'text-[#666] bg-[#f5f5f5] hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              title="提及表名"
              @click="triggerMention"
            >
              <span class="font-bold text-sm leading-none mt-[-2px]">@</span>
            </a-button>
          </div>
          <div 
            class="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300"
            :class="[
              inputValue.trim() 
                ? 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,1)] hover:text-white' 
                : (isDarkMode ? 'bg-transparent text-slate-500' : 'bg-transparent text-[#ccc]')
            ]"
            @click="handleSend"
          >
            <svg v-if="inputValue.trim()" viewBox="0 0 1024 1024" width="18" height="18" fill="currentColor"><path d="M233.984 489.472l131.072 92.672c13.824 9.728 32.768 8.192 44.544-3.584l188.416-188.416c9.728-9.728 26.112-9.728 35.84 0 9.728 9.728 9.728 26.112 0 35.84L445.44 614.4c-11.776 11.776-13.824 30.72-3.584 44.544l92.672 131.072c32.768 46.592 104.448 35.84 122.368-18.432l158.208-475.136c17.92-54.272-33.792-105.984-88.064-88.064l-474.624 158.72c-54.272 17.92-64.512 89.6-18.432 122.368z"></path></svg>
            <svg v-else viewBox="0 0 1024 1024" width="18" height="18" fill="currentColor"><path d="M233.984 489.472l131.072 92.672c13.824 9.728 32.768 8.192 44.544-3.584l188.416-188.416c9.728-9.728 26.112-9.728 35.84 0 9.728 9.728 9.728 26.112 0 35.84L445.44 614.4c-11.776 11.776-13.824 30.72-3.584 44.544l92.672 131.072c32.768 46.592 104.448 35.84 122.368-18.432l158.208-475.136c17.92-54.272-33.792-105.984-88.064-88.064l-474.624 158.72c-54.272 17.92-64.512 89.6-18.432 122.368z"></path></svg>
          </div>
        </div>
      </div>

      <!-- @ 提及下拉列表：紧贴输入框下方 -->
      <transition name="fade-up">
        <div
          v-if="showMentionList"
          class="absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-xl overflow-hidden z-50 transition-colors duration-300 w-full"
          :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
        >
          <div class="px-3 py-2 text-xs font-medium border-b" :class="isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'">
            {{ mentionSearchText ? '搜索结果' : '最近访问的表' }}
          </div>
          <div class="max-h-[240px] overflow-y-auto custom-scrollbar p-1">
            <div v-if="isSearching" class="py-4 text-center text-sm flex items-center justify-center gap-2" :class="isDarkMode ? 'text-slate-500' : 'text-gray-400'">
              <LoadingOutlined /> 搜索中...
            </div>
            <div v-else-if="filteredMentionList.length === 0" class="py-4 text-center text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-gray-400'">
              没有找到匹配的表
            </div>
            <div
              v-else
              v-for="(item, index) in filteredMentionList"
              :key="item.fqn"
              class="flex items-start px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
              :class="[
                selectedIndex === index
                  ? (isDarkMode ? 'bg-slate-700' : 'bg-gray-100')
                  : (isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50')
              ]"
              @click="selectMention(item)"
              @mouseenter="selectedIndex = index"
            >
              <div class="flex flex-col min-w-0 flex-1 gap-1">
                <div class="flex items-baseline gap-2 min-w-0 flex-wrap">
                  <span
                    class="font-mono text-[13px] font-semibold truncate"
                    :class="isDarkMode ? 'text-slate-100' : 'text-slate-800'"
                    :title="item.fqn"
                  >{{ item.fqn }}</span>
                  <span
                    class="text-[13px] font-medium truncate"
                    :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'"
                    :title="item.cnName"
                  >{{ item.cnName }}</span>
                </div>
                <div
                  class="text-[11px] leading-snug line-clamp-2"
                  :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
                >
                  <span>{{ item.desc || '暂无描述' }}</span>
                  <span class="mx-1.5 opacity-50">·</span>
                  <span class="inline-flex items-center gap-1 align-middle">
                    <UserOutlined class="text-[11px] opacity-80 shrink-0" />
                    <span>{{ item.owner || '未知(unknown)' }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div class="w-full mt-12">
      <div class="text-sm font-semibold mb-4 flex items-center gap-2 transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
        <ExperimentFilled class="text-yellow-500" /> 试试这样问
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="(q, index) in suggestedQuestions" 
          :key="index"
          class="rounded-xl p-4 cursor-pointer transition-all group"
          :class="isDarkMode ? 'bg-slate-800/50 ring-1 ring-slate-700 hover:ring-[rgba(108,76,155,1)] hover:bg-slate-800' : 'bg-white ring-1 ring-slate-200 hover:ring-[rgba(108,76,155,1)] hover:shadow-md'"
          @click="fillInput(q.query)"
        >
          <div class="text-sm font-semibold mb-1.5 transition-colors duration-300" :class="isDarkMode ? 'text-slate-200 group-hover:text-[rgba(108,76,155,1)]' : 'text-slate-800 group-hover:text-[rgba(108,76,155,1)]'">{{ q.title }}</div>
          <div class="text-xs leading-relaxed transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{ q.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { ExperimentFilled, UserOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import PilotLogo from '@/components/Copilot/PilotLogo.vue'
import { searchAssets } from '@/services/DataMap/searchService.js'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputValue = ref('')
const textareaRef = ref(null)

// --- @ 提及相关逻辑 ---
const showMentionList = ref(false)
const mentionSearchText = ref('')
const mentionStartIndex = ref(-1)
const selectedIndex = ref(0)
const isSearching = ref(false)
const searchResults = ref([])

// 默认常用表（冷启动展示）
const defaultFrequentTables = [
  { fqn: 'dm_trade.dws_order_summary_nd', cnName: '订单汇总表', owner: '张三(zhangsan)', desc: '包含每日订单量、GMV、客单价等核心交易指标汇总，T+1 更新。' },
  { fqn: 'dm_trade.dwd_order_detail_di', cnName: '订单明细表', owner: '李四(lisi)', desc: '全渠道订单原子粒度明细，含订单状态、支付金额、优惠明细等。' },
  { fqn: 'default.user_behavior_log', cnName: '用户行为日志表', owner: '王五(wangwu)', desc: '用户在 App 内的点击、浏览、曝光等行为日志，用于画像与推荐。' },
  { fqn: 'dm_risk.dws_risk_order_intercept_nd', cnName: '风控拦截订单汇总表', owner: '赵六(zhaoliu)', desc: '每日被风控规则拦截的异常订单汇总，用于风控运营看数。' },
  { fqn: 'dm_trade.dim_pay_type', cnName: '支付方式维表', owner: '郑十(zhengshi)', desc: '支付方式枚举与说明，如微信、支付宝、银行卡等，供订单分析关联。' },
]

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
          owner: source.owners?.[0]?.name || '',
          desc: source.description || ''
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

const filteredMentionList = computed(() => {
  if (!mentionSearchText.value.trim()) {
    return defaultFrequentTables
  }
  return searchResults.value
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
  
  // 检查是否刚刚输入了 @
  const cursorPosition = e.target.selectionStart
  const lastChar = val.slice(cursorPosition - 1, cursorPosition)
  
  if (lastChar === '@') {
    showMentionList.value = true
    mentionStartIndex.value = cursorPosition - 1
    mentionSearchText.value = ''
    selectedIndex.value = 0
    return
  }

  // 如果处于 @ 搜索状态
  if (showMentionList.value) {
    // 如果光标移到了 @ 之前，或者删除了 @，则关闭列表
    if (cursorPosition <= mentionStartIndex.value || val[mentionStartIndex.value] !== '@') {
      showMentionList.value = false
      return
    }
    
    // 提取 @ 之后的搜索词
    const textAfterAt = val.slice(mentionStartIndex.value + 1, cursorPosition)
    // 如果包含空格，说明 @ 结束了
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
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % filteredMentionList.value.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + filteredMentionList.value.length) % filteredMentionList.value.length
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredMentionList.value.length > 0) {
        selectMention(filteredMentionList.value[selectedIndex.value])
      }
    } else if (e.key === 'Escape') {
      showMentionList.value = false
    }
    return // 拦截默认行为
  }

  // 正常的发送逻辑
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const selectMention = (item) => {
  const beforeAt = inputValue.value.slice(0, mentionStartIndex.value)
  // 插入表名并加一个空格
  inputValue.value = beforeAt + `@${item.fqn} `
  showMentionList.value = false
  
  // 重新聚焦并把光标移到最后
  nextTick(() => {
    textareaRef.value?.focus()
  })
}
// --- 结束 @ 提及逻辑 ---

const suggestedQuestions = [
  { title: '查找订单相关表', desc: '帮我找一下包含交易、订单明细或汇总数据的表', query: '帮我查找订单相关的数据表' },
  { title: '查看表详细信息', desc: '查看 @dm_trade.dws_order_summary_nd 表的字段和描述', query: '查看 @dm_trade.dws_order_summary_nd 表的详细信息' },
  { title: '分析数据血缘', desc: '探查 @dm_trade.dws_order_summary_nd 的上游来源和下游依赖', query: '分析 @dm_trade.dws_order_summary_nd 的血缘关系' },
  { title: '生成查询 SQL', desc: '帮我生成查询 @dm_trade.dws_order_summary_nd 前 100 条数据的 SQL', query: '帮我生成查询 @dm_trade.dws_order_summary_nd 的 SELECT 语句' }
]

const fillInput = (text) => {
  inputValue.value = text
}

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (!inputValue.value.trim()) return
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
  padding: 16px !important;
  font-size: 16px !important;
  color: #334155 !important;
}
.custom-textarea:focus {
  box-shadow: none !important;
}
.custom-textarea::placeholder {
  color: #94a3b8 !important;
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
