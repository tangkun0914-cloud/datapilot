<template>
  <div class="h-full flex flex-col overflow-hidden transition-colors duration-300"
       :class="isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-white text-[#333]'">
    
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
         :class="isDarkMode ? 'border-slate-700 bg-[#0f172a]' : 'border-[#e5e7eb] bg-white'">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-1.5 h-5 rounded-sm bg-[rgba(108,76,155,1)] shrink-0"></div>
        <span class="font-mono text-[15px] font-semibold truncate" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">
          {{ data.fqn }}
        </span>
        <span v-if="data.cnName" class="text-[12px] px-2 py-0.5 rounded shrink-0"
              :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-[#f1f5f9] text-[#64748b]'">
          {{ data.cnName }}
        </span>
      </div>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-3"
           :class="isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#334155]'"
           @click="$emit('close')">
        <CloseOutlined class="text-[14px]" />
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
      <a-tabs v-model:activeKey="activeTab" :animated="false" size="small" :class="{ 'dark-tabs': isDarkMode }">
        
        <!-- 字段详情 Tab -->
        <a-tab-pane key="fields" tab="字段详情">
          <div class="flex justify-between items-center mb-3 mt-1">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索字段"
              class="w-[220px]"
              allow-clear
              size="small"
              :class="{ 'dark-input': isDarkMode }"
            />
            <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">
              共 {{ filteredFields.length }} 个字段
            </span>
          </div>
          <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="fieldColumns" 
              :data-source="filteredFields" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
              :scroll="{ y: 'calc(100vh - 280px)' }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'ordinalPosition'">
                  <span class="text-[13px] font-mono" :class="isDarkMode ? 'text-slate-500' : 'text-gray-500'">{{ index + 1 }}</span>
                </template>
                <template v-else-if="column.key === 'name'">
                  <div class="flex items-center gap-1.5">
                    <KeyOutlined v-if="record.isPk" style="color: #f59e0b; font-size: 14px;" title="主键" />
                    <span class="font-mono text-[13px]" :class="record.isPk ? (isDarkMode ? 'font-semibold text-slate-200' : 'font-semibold text-gray-900') : (isDarkMode ? 'text-slate-300 font-medium' : 'text-[#334155] font-medium')">{{ record.name }}</span>
                    <span v-if="record.isPartition" class="px-1 py-0.5 text-[10px] rounded ml-1 transition-colors duration-300"
                          :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-[#f0f0f0] text-[#999]'">分区</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'dataType'">
                  <span class="text-[12px] px-1.5 py-0.5 rounded font-mono font-medium"
                        :class="isDarkMode ? 'bg-slate-700 border border-slate-600 text-[#38bdf8]' : 'bg-[#f1f5f9] border border-[#e2e8f0] text-[#0ea5e9]'">
                    {{ record.type }}
                  </span>
                </template>
                <template v-else-if="column.key === 'description'">
                  <span class="text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-600'">{{ record.desc || '-' }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 数据预览 Tab -->
        <a-tab-pane key="preview" tab="数据预览">
          <div class="flex justify-between items-center mb-3 mt-1">
            <div class="flex items-center gap-2 p-1 rounded-md" :class="isDarkMode ? 'bg-slate-800' : 'bg-[#f1f5f9]'">
              <div 
                class="px-3 py-1 text-[12px] font-medium rounded cursor-pointer transition-colors"
                :class="previewMode === 'preview' ? (isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-[#1677ff] shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#64748b] hover:text-[#334155]')"
                @click="previewMode = 'preview'"
              >
                数据预览
              </div>
              <div 
                class="px-3 py-1 text-[12px] font-medium rounded cursor-pointer transition-colors"
                :class="previewMode === 'profile' ? (isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-[#1677ff] shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#64748b] hover:text-[#334155]')"
                @click="previewMode = 'profile'"
              >
                数据探查
              </div>
            </div>
            <a-button v-if="previewMode === 'preview'" size="small" type="primary" ghost class="text-[12px] flex items-center gap-1" :class="isDarkMode ? 'border-slate-600 text-slate-300 hover:text-white hover:border-slate-500' : ''">
              <template #icon><ReloadOutlined /></template>
              重新抽样
            </a-button>
            <a-button v-if="previewMode === 'profile'" size="small" type="primary" class="text-[12px] flex items-center gap-1 bg-[rgba(108,76,155,1)] border-none hover:bg-[rgba(108,76,155,0.9)]">
              <template #icon><PlusOutlined /></template>
              新建探查任务
            </a-button>
          </div>
          <div v-if="previewMode === 'preview'" class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="previewColumns" 
              :data-source="previewRows" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
              :scroll="{ x: 'max-content', y: 'calc(100vh - 280px)' }"
            >
              <template #bodyCell="{ column, text }">
                <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-300' : 'text-[#475569]'">{{ text }}</span>
              </template>
            </a-table>
          </div>
          <div v-if="previewMode === 'profile'" class="flex flex-col gap-3">
            <div class="flex items-center gap-4">
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">总行数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">100,000</span>
              </div>
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">主键去重记录数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">98,520</span>
              </div>
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">重复记录数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">1,480</span>
              </div>
            </div>
            <div class="text-center py-8 border rounded-lg" :class="isDarkMode ? 'bg-slate-800/30 border-slate-700 text-slate-500' : 'bg-[#fafafa] border-[#eee] text-[#999]'">
              <p class="text-[13px] mb-2">更多字段级探查详情</p>
              <a-button size="small" type="link" class="text-[rgba(108,76,155,1)]">点击跳转至完整详情页查看</a-button>
            </div>
          </div>
        </a-tab-pane>

        <!-- 生产信息 Tab -->
        <a-tab-pane key="production" tab="生产信息">
          <div class="flex flex-wrap gap-4 p-4 rounded-lg border mb-4 mt-2" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">任务名称</span>
              <span class="font-mono text-[13px] font-medium truncate" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">dws_user_behavior_log_di</span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">调度周期</span>
              <span class="font-mono text-[13px] font-medium flex items-center gap-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">
                <ClockCircleOutlined class="text-[#1677ff]" /> 每日 02:00
              </span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">所属时区</span>
              <span class="text-[13px] font-medium">
                <span class="px-2 py-0.5 rounded text-[12px] bg-[#e6f4ff] text-[#1677ff]">中国时间</span>
              </span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">最近产出时间</span>
              <span class="font-mono text-[13px] font-medium" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">2026-03-30 02:15:30</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1 h-3.5 bg-[#1677ff] rounded-sm"></div>
            <span class="text-[14px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">执行记录</span>
          </div>
          <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="execColumns" 
              :data-source="execRows" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record.id }}</span>
                </template>
                <template v-else-if="column.key === 'status'">
                  <span class="px-2 py-0.5 rounded text-[12px]"
                        :class="record.status === 'SUCCESS' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')">
                    {{ record.status === 'SUCCESS' ? '成功' : '失败' }}
                  </span>
                </template>
                <template v-else-if="column.key === 'startTime' || column.key === 'endTime'">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record[column.key] }}</span>
                    <span class="text-[11px] px-1 rounded" :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'">中国时间</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'duration'">
                  <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record.duration }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 血缘关系 Tab -->
        <a-tab-pane key="lineage" tab="血缘关系">
          <div class="h-[calc(100vh-280px)] min-h-[600px] mt-2">
            <LineageTab v-if="activeTab === 'lineage'" :fqn="data.fqn" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  CloseOutlined, KeyOutlined, ReloadOutlined, PlusOutlined, 
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import LineageTab from '@/pages/DataMap/Detail/LineageTab.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  defaultTab: {
    type: String,
    default: 'fields'
  }
})

defineEmits(['close'])

const activeTab = ref(props.defaultTab)

// 监听 defaultTab 变化，当从外部传入新的 defaultTab 时（例如点击血缘卡片），更新内部 activeTab
watch(() => props.defaultTab, (newVal) => {
  if (newVal) {
    activeTab.value = newVal
  }
})
const searchKeyword = ref('')
const previewMode = ref('preview')

// 字段相关
const fieldColumns = [
  { title: '序号', key: 'ordinalPosition', width: 60, align: 'center' },
  { title: '字段名', key: 'name', width: 180 },
  { title: '类型', key: 'dataType', width: 120 },
  { title: '描述', key: 'description', ellipsis: true },
]

const baseFields = [
  { key: '1', name: 'user_id', type: 'string', desc: '全局唯一用户标识', isPk: true },
  { key: '2', name: 'event_type', type: 'string', desc: '事件类型 (click, view, add_cart)' },
  { key: '3', name: 'page_id', type: 'string', desc: '发生事件的页面ID' },
  { key: '4', name: 'device_os', type: 'string', desc: '设备操作系统 (iOS, Android)' },
  { key: '5', name: 'device_model', type: 'string', desc: '设备型号' },
  { key: '6', name: 'ip_address', type: 'string', desc: '客户端 IP 地址' },
  { key: '7', name: 'session_id', type: 'string', desc: '会话 ID' },
  { key: '8', name: 'app_version', type: 'string', desc: 'App 版本号' },
]

const generatedFields = Array.from({ length: 91 }, (_, i) => ({
  key: String(i + 9),
  name: `ext_attribute_${i + 1}`,
  type: i % 3 === 0 ? 'bigint' : (i % 5 === 0 ? 'double' : 'string'),
  desc: `扩展业务属性字段 ${i + 1}，用于记录额外维度的上下文信息`,
}))

const mockFields = [
  ...baseFields,
  ...generatedFields,
  { key: '100', name: 'dt', type: 'string', desc: '日期分区 (yyyyMMdd)', isPartition: true },
]

const filteredFields = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return mockFields
  return mockFields.filter(
    (c) => c.name?.toLowerCase().includes(kw) || c.desc?.toLowerCase().includes(kw)
  )
})

// 数据预览
const previewColumns = computed(() => {
  const cols = baseFields.map((col) => ({
    title: col.name,
    dataIndex: col.name,
    key: col.name,
    width: 150,
    ellipsis: true,
  }))
  cols.unshift({
    title: '序号',
    dataIndex: '_idx',
    key: '_idx',
    width: 70,
    align: 'center',
    customRender: ({ text }) => text + 1
  })
  return cols
})

const previewRows = Array.from({ length: 20 }, (_, idx) => ({
  _idx: idx,
  user_id: `U${10000 + Math.floor(Math.random() * 90000)}`,
  event_type: ['click', 'view', 'add_cart', 'purchase'][Math.floor(Math.random() * 4)],
  page_id: `page_${Math.floor(Math.random() * 20)}`,
  device_os: ['iOS', 'Android', 'Web'][Math.floor(Math.random() * 3)],
  device_model: ['iPhone 14', 'Xiaomi 13', 'Huawei P60', 'MacBook'][Math.floor(Math.random() * 4)],
  ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  session_id: `sess_${Date.now().toString().slice(-6)}_${idx}`,
  app_version: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.0`
}))

// 生产信息
const execColumns = [
  { title: '实例ID', dataIndex: 'id', key: 'id', width: 90 },
  { title: '实例名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
  { title: '状态', key: 'status', width: 90 },
  { title: '开始时间', key: 'startTime', width: 190 },
  { title: '结束时间', key: 'endTime', width: 190 },
  { title: '耗时', key: 'duration', width: 80 },
]

const execRows = [
  { id: '100456', taskName: 'dws_user_behavior_log_di_20260330', status: 'SUCCESS', startTime: '2026-03-30 02:00:00', endTime: '2026-03-30 02:15:30', duration: '15分30秒' },
  { id: '100455', taskName: 'dws_user_behavior_log_di_20260329', status: 'SUCCESS', startTime: '2026-03-29 02:00:00', endTime: '2026-03-29 02:14:20', duration: '14分20秒' },
  { id: '100454', taskName: 'dws_user_behavior_log_di_20260328', status: 'SUCCESS', startTime: '2026-03-28 02:00:00', endTime: '2026-03-28 02:16:10', duration: '16分10秒' },
  { id: '100453', taskName: 'dws_user_behavior_log_di_20260327', status: 'FAILED', startTime: '2026-03-27 02:00:00', endTime: '2026-03-27 02:05:00', duration: '5分0秒' },
  { id: '100452', taskName: 'dws_user_behavior_log_di_20260326', status: 'SUCCESS', startTime: '2026-03-26 02:00:00', endTime: '2026-03-26 02:15:45', duration: '15分45秒' },
]
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

.field-table :deep(.ant-table-cell) {
  font-size: 13px;
  padding: 10px 16px !important;
}

.field-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-table :deep(.ant-table-thead > tr > th) {
  background-color: #1e293b !important;
  color: #94a3b8;
  border-bottom: 1px solid #334155;
}

.dark-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #334155;
}

.dark-table :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background-color: #334155 !important;
}

.dark-input :deep(.ant-input) {
  background-color: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
.dark-input :deep(.ant-input-group-addon) {
  background-color: #1e293b;
  border-color: #334155;
}
.dark-input :deep(.ant-input-search-button) {
  background-color: #334155;
  border-color: #334155;
  color: #94a3b8;
}
.dark-input :deep(.ant-input-affix-wrapper) {
  background-color: #1e293b;
  border-color: #334155;
}
.dark-input :deep(.ant-input-affix-wrapper > input.ant-input) {
  background-color: transparent;
}
</style>
