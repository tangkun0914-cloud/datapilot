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
    <div class="w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 p-1.5 relative transition-all duration-300" 
         :class="[
           isDarkMode ? 'bg-slate-800 ring-slate-700 focus-within:ring-[rgba(108,76,155,1)] focus-within:shadow-[0_8px_30px_rgba(108,76,155,0.15)]' : 'bg-white ring-slate-200 focus-within:ring-[rgba(108,76,155,1)] focus-within:shadow-[0_8px_30px_rgba(108,76,155,0.15)]'
         ]">
      <a-textarea 
        v-model:value="inputValue"
        :auto-size="{ minRows: 3, maxRows: 6 }"
        placeholder="请输入你想要查询的数据内容，支持 @ 提及表名..."
        class="custom-textarea"
        :class="{ 'dark-textarea': isDarkMode }"
        @pressEnter="handleEnter"
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

    <!-- 推荐问题 -->
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
import { ref } from 'vue'
import { ExperimentFilled } from '@ant-design/icons-vue'
import PilotLogo from '@/components/Copilot/PilotLogo.vue'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputValue = ref('')

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
</style>
