<template>
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t pt-12 pb-6 px-6 transition-colors duration-300" :class="isDarkMode ? 'from-[#0f172a] via-[#0f172a]' : 'from-[#fafafa] via-[#fafafa]'">
    <div class="max-w-4xl mx-auto">
      
      <!-- 输入框 -->
      <div class="w-full rounded-xl border p-2 relative transition-all duration-300"
           :class="isDarkMode ? 'bg-slate-800 border-slate-700 focus-within:border-[rgba(108,76,155,1)] focus-within:shadow-[0_0_0_2px_rgba(108,76,155,0.15)]' : 'bg-white border-[#d9d9d9] focus-within:border-[rgba(108,76,155,1)] focus-within:shadow-[0_0_0_2px_rgba(108,76,155,0.15)]'">
        <a-textarea 
          v-model:value="inputValue"
          :auto-size="{ minRows: 1, maxRows: 5 }"
          placeholder="继续追问，或输入 @ 提及表名..."
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
            
            <div class="w-[1px] h-3 mx-1 transition-colors duration-300" :class="isDarkMode ? 'bg-slate-700' : 'bg-[#e0e0e0]'"></div>
            
            <!-- 意图选择器 -->
            <a-button 
              type="text"
              size="small" 
              class="text-[12px] font-medium flex items-center gap-1.5 px-2.5 h-7 rounded-md transition-all duration-300"
              :class="isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/80' : 'text-[#666] hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/找表 ')"
            >
              <SearchOutlined class="text-[11px] opacity-70" />
              找表
            </a-button>
            <a-button 
              type="text"
              size="small" 
              class="text-[12px] font-medium flex items-center gap-1.5 px-2.5 h-7 rounded-md transition-all duration-300"
              :class="isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/80' : 'text-[#666] hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/看详情 @')"
            >
              <TableOutlined class="text-[11px] opacity-70" />
              看详情
            </a-button>
            <a-button 
              type="text"
              size="small" 
              class="text-[12px] font-medium flex items-center gap-1.5 px-2.5 h-7 rounded-md transition-all duration-300"
              :class="isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700/80' : 'text-[#666] hover:text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.08)]'"
              @click="fillInput('/查血缘 @')"
            >
              <NodeIndexOutlined class="text-[11px] opacity-70" />
              查血缘
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
      
      <div class="text-center mt-3 text-xs font-medium transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-[#999]'">
        DataPilot 生成内容仅供参考，请以实际数据为准
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SearchOutlined, TableOutlined, NodeIndexOutlined } from '@ant-design/icons-vue'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputValue = ref('')

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
</style>
