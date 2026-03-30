<template>
  <aside class="w-full h-full flex flex-col shrink-0 z-10 transition-colors duration-300 relative" :class="isDarkMode ? 'bg-[#001529]' : 'bg-white'">
    
    <!-- 收起按钮 -->
    <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-12 bg-white border border-slate-200 rounded-r-md flex items-center justify-center cursor-pointer shadow-sm z-20 hover:bg-slate-50 hover:text-primary transition-all"
         :class="isDarkMode ? '!bg-slate-800 !border-slate-700 !text-slate-400 hover:!text-white' : 'text-slate-400'"
         @click="$emit('collapse')">
      <MenuFoldOutlined class="text-[10px]" />
    </div>

    <!-- 新建对话 -->
    <div class="p-4">
      <a-button block size="large" class="flex items-center justify-center gap-2 rounded-xl border-none shadow-md font-medium text-[15px] transition-all" :style="{ backgroundColor: 'rgba(108,76,155,1)', color: 'white', boxShadow: '0 4px 12px rgba(108,76,155,0.2)' }" @click="handleNewChat">
        <template #icon><PlusOutlined /></template>
        新建对话
      </a-button>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 mb-2">
      <div 
        class="flex-1 text-center py-2 text-sm font-medium cursor-pointer transition-colors border-b-2"
        :class="[
          activeTab === 'history' 
            ? 'text-[rgba(108,76,155,1)] border-[rgba(108,76,155,1)]'
            : (isDarkMode ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-400 border-transparent hover:text-slate-700')
        ]"
        @click="activeTab = 'history'"
      >
        历史对话
      </div>
      <div 
        class="flex-1 text-center py-2 text-sm font-medium cursor-pointer transition-colors border-b-2"
        :class="[
          activeTab === 'workspace' 
            ? 'text-[rgba(108,76,155,1)] border-[rgba(108,76,155,1)]'
            : (isDarkMode ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-400 border-transparent hover:text-slate-700')
        ]"
        @click="activeTab = 'workspace'"
      >
        工作台
      </div>
    </div>

    <!-- 侧边栏内容区 -->
    <div class="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
      <!-- 历史记录面板 -->
      <div v-show="activeTab === 'history'" class="mt-2">
        <div v-for="group in historyGroups" :key="group.group" class="mb-5">
          <div class="text-xs font-semibold px-2 mb-2 tracking-wider transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">{{ group.group }}</div>
          <div 
            v-for="item in group.items" 
            :key="item.id"
            class="px-3 py-2.5 rounded-lg text-sm mb-1 cursor-pointer truncate transition-colors duration-300"
            :class="isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'"
          >
            <MessageOutlined class="mr-2 opacity-40" />{{ item.title }}
          </div>
        </div>
      </div>

      <!-- 工作台面板 -->
      <div v-show="activeTab === 'workspace'" class="mt-2">
        <div class="mb-5">
          <div class="text-xs font-semibold px-2 mb-3 tracking-wider flex items-center gap-1.5 transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
            <PushpinFilled class="text-yellow-500" /> 推荐数据表
          </div>
          
          <div 
            v-for="item in recommendations" 
            :key="item.id"
            class="rounded-xl p-3.5 mb-3 transition-all cursor-pointer group"
            :class="isDarkMode ? 'bg-white/5 ring-1 ring-white/10 hover:ring-[rgba(108,76,155,1)] hover:bg-white/10' : 'bg-white ring-1 ring-slate-200 hover:ring-[rgba(108,76,155,1)] hover:shadow-md'"
          >
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <div class="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors shrink-0" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.2)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white' : 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white'">
                <TableOutlined />
              </div>
              <span class="text-sm font-semibold transition-colors font-mono" :class="isDarkMode ? 'text-slate-200 group-hover:text-[rgba(108,76,155,1)]' : 'text-slate-800 group-hover:text-[rgba(108,76,155,1)]'">{{ item.fqn }}</span>
              <CopyOutlined class="transition-colors" :class="isDarkMode ? 'text-slate-500 hover:text-[rgba(108,76,155,1)]' : 'text-slate-400 hover:text-[rgba(108,76,155,1)]'" title="复制" @click.stop="copyText(item.fqn)" />
              <span class="px-1.5 py-0.5 text-[11px] rounded font-medium transition-colors duration-300" :class="isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'">{{ item.cnName }}</span>
            </div>
            <div class="text-xs pl-8 transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{ item.reason }}</div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, MessageOutlined, PushpinFilled, TableOutlined, CopyOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { getHistorySessions, getWorkspaceRecommendations } from '@/services/DataMap/Agent/index.js'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['collapse'])

const activeTab = ref('history')
const historyGroups = ref([])
const recommendations = ref([])

onMounted(async () => {
  try {
    historyGroups.value = await getHistorySessions()
    recommendations.value = await getWorkspaceRecommendations()
  } catch (error) {
    console.error('Failed to load sidebar data:', error)
  }
})

const handleNewChat = () => {
  // TODO: 触发新建对话逻辑
  message.info('新建分析对话')
}

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制表名')
  })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
