<template>
  <div class="border rounded-xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] w-full max-w-3xl group relative mt-2 transition-colors duration-300"
       :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#eef0f2]'">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b" :class="isDarkMode ? 'border-slate-700' : 'border-[#e5e7eb]'">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="px-2 py-0.5 text-[11px] font-bold rounded border shrink-0"
              :class="isDarkMode 
                ? 'bg-[rgba(108,76,155,0.2)] text-[rgba(168,140,210,1)] border-[rgba(108,76,155,0.4)]' 
                : 'bg-[rgba(108,76,155,0.08)] text-[rgba(108,76,155,1)] border-[rgba(108,76,155,0.2)]'">
          HIVE
        </span>
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[15px] font-semibold transition-colors" :class="isDarkMode ? 'text-[rgba(108,76,155,1)]' : 'text-[rgba(108,76,155,1)]'">
            {{ data.fqn }}
          </span>
          <CopyOutlined class="text-[14px] cursor-pointer transition-colors" 
                        :class="isDarkMode ? 'text-slate-500 hover:text-[rgba(108,76,155,1)]' : 'text-[#cbd5e1] hover:text-[rgba(108,76,155,1)]'" 
                        title="复制表名" @click="copyText(data.fqn)" />
        </div>
        <span v-if="data.cnName" class="text-[13px] px-2 py-0.5 rounded ml-1 shrink-0" :class="isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-[#f1f5f9] text-[#64748b]'">
          {{ data.cnName }}
        </span>
      </div>
    </div>
    
    <!-- AI 洞察 -->
    <div class="mb-5 p-3.5 rounded-xl flex items-start gap-3 relative overflow-hidden" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.08)] border border-[rgba(108,76,155,0.2)]' : 'bg-[#faf8fc] border border-[rgba(108,76,155,0.15)]'">
      <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[rgba(108,76,155,0.8)] to-[rgba(108,76,155,0.2)]"></div>
      <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.2)]' : 'bg-[rgba(108,76,155,0.1)]'">
        <RobotOutlined class="text-[13px]" :class="isDarkMode ? 'text-[rgba(168,140,210,1)]' : 'text-[rgba(108,76,155,1)]'" />
      </div>
      <div class="text-[13.5px] leading-relaxed flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#475569]'" v-html="formattedInsight"></div>
    </div>

    <!-- 核心血缘链路简图 -->
    <div class="mb-5 px-1">
      <div class="text-[13px] font-semibold mb-4 flex items-center gap-1.5" :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'">
        <NodeIndexOutlined class="text-[rgba(108,76,155,1)]" />
        核心上下游链路
      </div>
      
      <div class="flex flex-col relative pl-4">
        <!-- 左侧连接线 -->
        <div class="absolute left-[23px] top-4 bottom-4 w-px border-l-2 border-dashed" :class="isDarkMode ? 'border-slate-700' : 'border-slate-200'"></div>

        <!-- 上游 -->
        <div class="flex flex-col gap-2.5 z-10 mb-3">
          <div v-for="up in data.upstream" :key="up.fqn" class="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all group relative bg-white"
               :class="isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-[rgba(108,76,155,0.5)] hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:border-[rgba(108,76,155,0.3)] hover:shadow-sm'"
               @click="$emit('send', `查看 ${up.fqn} 表的详细信息`)">
            <!-- 节点圆点 -->
            <div class="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-white transition-colors"
                 :class="isDarkMode ? 'border-slate-500 group-hover:border-[rgba(108,76,155,1)] bg-slate-800' : 'border-slate-300 group-hover:border-[rgba(108,76,155,1)]'"></div>
            
            <span class="text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0" :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'">上游</span>
            <span class="font-mono text-[13px] truncate flex-1 transition-colors" :class="isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-[rgba(108,76,155,1)]'">{{ up.fqn }}</span>
          </div>
        </div>

        <!-- 当前表 -->
        <div class="flex items-center gap-3 p-3 rounded-xl border-2 z-10 my-1 relative shadow-sm"
             :class="isDarkMode ? 'bg-[rgba(108,76,155,0.15)] border-[rgba(108,76,155,0.5)]' : 'bg-[#faf8fc] border-[rgba(108,76,155,0.3)]'">
          <!-- 节点圆点 (高亮) -->
          <div class="absolute -left-[18px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-white"
               :class="isDarkMode ? 'border-[rgba(168,140,210,1)] bg-[rgba(108,76,155,1)]' : 'border-[rgba(108,76,155,1)]'"></div>
          
          <StarFilled class="text-[15px] text-[rgba(108,76,155,1)] shrink-0" />
          <span class="font-mono text-[14px] font-bold truncate flex-1" :class="isDarkMode ? 'text-[rgba(168,140,210,1)]' : 'text-[rgba(108,76,155,1)]'">{{ data.fqn }}</span>
          <span class="text-[11px] px-2 py-0.5 rounded font-medium shrink-0" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.3)] text-[rgba(198,170,235,1)]' : 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)]'">当前表</span>
        </div>

        <!-- 下游 -->
        <div class="flex flex-col gap-2.5 z-10 mt-3">
          <div v-for="down in data.downstream" :key="down.fqn" class="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all group relative bg-white"
               :class="isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-[rgba(108,76,155,0.5)] hover:bg-slate-800/80' : 'bg-white border-slate-200 hover:border-[rgba(108,76,155,0.3)] hover:shadow-sm'"
               @click="$emit('send', `查看 ${down.fqn} 表的详细信息`)">
            <!-- 节点圆点 -->
            <div class="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-white transition-colors"
                 :class="isDarkMode ? 'border-slate-500 group-hover:border-[rgba(108,76,155,1)] bg-slate-800' : 'border-slate-300 group-hover:border-[rgba(108,76,155,1)]'"></div>
            
            <span class="text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0" :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'">下游</span>
            <span class="font-mono text-[13px] truncate flex-1 transition-colors" :class="isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-[rgba(108,76,155,1)]'">{{ down.fqn }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区 -->
    <div class="flex flex-wrap items-center justify-start pt-4 transition-colors duration-300">
      <div 
        class="px-4 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-colors flex items-center gap-1.5 border"
        :class="isDarkMode ? 'text-[rgba(168,140,210,1)] border-[rgba(108,76,155,0.4)] bg-[rgba(108,76,155,0.1)] hover:bg-[rgba(108,76,155,0.2)]' : 'text-[rgba(108,76,155,1)] border-[rgba(108,76,155,0.2)] bg-[rgba(108,76,155,0.04)] hover:bg-[rgba(108,76,155,0.08)]'"
        @click="$emit('viewDetail', { ...data, defaultTab: 'lineage' })"
      >
        <FullscreenOutlined class="text-[12px]" />
        查看完整血缘图
      </div>
    </div>
    
    <!-- 追问建议 -->
    <div v-if="data.suggestions && data.suggestions.length" class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t transition-colors duration-300"
         :class="isDarkMode ? 'border-slate-700' : 'border-[#f0f0f0]'">
      <span class="text-[13px] transition-colors duration-300 mr-1" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">您可以继续问：</span>
      <div 
        v-for="sug in data.suggestions" 
        :key="sug"
        class="px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-all duration-300 flex items-center"
        :class="isDarkMode 
          ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.1)] border border-[rgba(108,76,155,0.2)] hover:bg-[rgba(108,76,155,0.2)] hover:border-[rgba(108,76,155,0.4)]' 
          : 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.04)] border border-[rgba(108,76,155,0.15)] hover:bg-[rgba(108,76,155,0.08)] hover:border-[rgba(108,76,155,0.3)]'"
        @click="$emit('send', sug)"
      >
        {{ sug }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  CopyOutlined, FullscreenOutlined, RobotOutlined, 
  NodeIndexOutlined, ArrowDownOutlined, StarFilled
} from '@ant-design/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['send', 'viewDetail'])

const formattedInsight = computed(() => {
  if (!props.data.insight) return ''
  // 简单处理一下 markdown 的 code 块高亮
  return props.data.insight.replace(/`([^`]+)`/g, '<span class="font-mono text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.1)] px-1 py-0.5 rounded mx-0.5">$1</span>')
})

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制表名')
  })
}
</script>
