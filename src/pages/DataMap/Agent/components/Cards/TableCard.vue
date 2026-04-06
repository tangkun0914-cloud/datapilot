<template>
  <div class="border rounded-xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] w-full max-w-3xl group relative mt-2 transition-colors duration-300"
       :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#eef0f2]'">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b" :class="isDarkMode ? 'border-slate-700' : 'border-[#e5e7eb]'">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 text-[11px] font-bold rounded border"
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
        <span v-if="data.cnName" class="text-[13px] ml-2 px-2 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-[#f1f5f9] text-[#64748b]'">
          {{ data.cnName }}
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        <a-tooltip title="最近30天被查询/引用的次数">
          <div class="flex items-center gap-1 text-[13px] cursor-help px-2 py-1 rounded transition-colors" :class="isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-[#64748b] hover:bg-[#f1f5f9]'">
            <FireFilled class="text-[14px]" style="color: #ff7875;" />
            <span class="font-mono font-medium">{{ data.hotness || 120 }}</span>
          </div>
        </a-tooltip>
        <a-tooltip title="最近30天被浏览的次数">
          <div class="flex items-center gap-1 text-[13px] cursor-help px-2 py-1 rounded transition-colors" :class="isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-[#64748b] hover:bg-[#f1f5f9]'">
            <EyeOutlined class="text-[14px]" style="color: rgba(108,76,155,1);" />
            <span class="font-mono font-medium">963</span>
          </div>
        </a-tooltip>
        <div class="w-[1px] h-[12px]" :class="isDarkMode ? 'bg-slate-600' : 'bg-[#e2e8f0]'"></div>
        <a-tooltip :title="isFavorited ? '取消收藏' : '收藏'">
          <div class="flex items-center justify-center w-6 h-6 cursor-pointer group/fav" @click="toggleFavorite">
            <StarFilled v-if="isFavorited" class="text-[16px] text-[#ffc53d]" />
            <StarOutlined v-else class="text-[16px] transition-colors" :class="isDarkMode ? 'text-slate-500 group-hover/fav:text-[#ffc53d]' : 'text-[#d9d9d9] group-hover/fav:text-[#ffc53d] group-hover/fav:opacity-80'" />
          </div>
        </a-tooltip>
      </div>
    </div>
    
    <!-- Body -->
    <div class="mb-4">
      <a-row :gutter="[16, 12]">
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">所属库：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">
            <span class="font-mono px-2 py-0.5 rounded border" :class="isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-[#f1f5f9] border-[#e2e8f0]'">{{ data.fqn.split('.')[0] || 'default' }}</span>
          </span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">负责人：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.owner }}</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">更新时间：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.updateFreq }}</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">业务域：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">-</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">分层：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">
            <span v-if="data.layers && data.layers.length" class="text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.1)] border border-[rgba(108,76,155,0.2)] px-2 py-0.5 rounded text-[12px]">{{ data.layers[0] }}</span>
            <span v-else>-</span>
          </span>
        </a-col>
        <a-col :span="24" class="flex items-start mb-2">
          <span class="text-[13px] w-[70px] shrink-0 mt-0.5" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">描述：</span>
          <span class="text-[13px] flex-1 leading-relaxed" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.desc || '-' }}</span>
        </a-col>
      </a-row>
    </div>

    <!-- 操作按钮区 -->
    <div class="flex flex-wrap items-center justify-start pt-4 border-t transition-colors duration-300"
         :class="isDarkMode ? 'border-slate-700' : 'border-[#f0f0f0]'">
      <div class="flex items-center gap-2">
        <!-- 查看完整详情 -->
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]'"
          @click="$emit('viewDetail', data)"
        >
          <FullscreenOutlined />
          查看完整详情
        </div>
        
        <!-- 生成 DDL -->
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="[
            activeSqlType === 'ddl' 
              ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.05)] border border-[rgba(108,76,155,0.2)]' 
              : (isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]')
          ]"
          @click="toggleSql('ddl')"
        >
          <CodeOutlined />
          生成 DDL
        </div>
        
        <!-- 生成 SELECT -->
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="[
            activeSqlType === 'select' 
              ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.05)] border border-[rgba(108,76,155,0.2)]' 
              : (isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]')
          ]"
          @click="toggleSql('select')"
        >
          <ConsoleSqlOutlined />
          生成 SELECT
        </div>
      </div>
    </div>
    
    <!-- DDL/SELECT 代码面板（保留在卡片内） -->
    <div v-if="activeSqlType" class="mt-3 bg-[#1e293b] rounded-lg overflow-hidden relative border" :class="isDarkMode ? 'border-slate-700' : 'border-slate-800'">
      <div class="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-white/10">
        <span class="text-slate-300 text-[12px] font-medium">{{ activeSqlType === 'ddl' ? '建表语句 (DDL)' : '查询语句 (SELECT)' }}</span>
        <div class="flex items-center gap-2">
          <a-tooltip title="复制">
            <CopyOutlined class="text-slate-400 hover:text-white cursor-pointer transition-colors p-1" @click="copySql" />
          </a-tooltip>
        </div>
      </div>
      <pre class="text-[#e2e8f0] font-mono text-[13px] leading-relaxed overflow-x-auto custom-scrollbar m-0 p-4 max-h-[400px]"><code>{{ sqlContent }}</code></pre>
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
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  CopyOutlined, StarOutlined, StarFilled, FireFilled, EyeOutlined,
  FullscreenOutlined, CodeOutlined, ConsoleSqlOutlined
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

const emit = defineEmits(['send', 'viewDetail'])

const activeSqlType = ref('')
const isFavorited = ref(false)

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  if (isFavorited.value) {
    message.success('已加入收藏')
  } else {
    message.success('已取消收藏')
  }
}

const sqlData = {
  ddl: `CREATE TABLE default.user_behavior_log (
  user_id STRING COMMENT '全局唯一用户标识',
  event_type STRING COMMENT '事件类型 (click, view, add_cart)',
  page_id STRING COMMENT '发生事件的页面ID',
  device_os STRING COMMENT '设备操作系统 (iOS, Android)'
)
COMMENT '用户行为日志表'
PARTITIONED BY (dt STRING COMMENT '日期分区 (yyyyMMdd)')
STORED AS PARQUET;`,
  select: `SELECT 
  user_id,
  event_type,
  page_id,
  device_os,
  dt
FROM default.user_behavior_log
WHERE dt = '\${bizdate}'
LIMIT 100;`
}

const sqlContent = computed(() => activeSqlType.value ? sqlData[activeSqlType.value] : '')

const toggleSql = (type) => {
  activeSqlType.value = activeSqlType.value === type ? '' : type
}

const copySql = () => {
  navigator.clipboard.writeText(sqlContent.value).then(() => {
    message.success('SQL 已复制')
  })
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
