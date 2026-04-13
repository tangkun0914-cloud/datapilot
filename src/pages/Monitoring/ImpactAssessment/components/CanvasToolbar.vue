<template>
  <div class="absolute top-4 right-4 z-10 flex flex-col items-end gap-3 pointer-events-none">
    <!-- 第一行：操作与筛选 -->
    <div class="flex items-center gap-3 pointer-events-auto">
      <!-- 筛选控制组 -->
      <div class="flex items-center rounded-full bg-white/90 backdrop-blur-md px-1.5 py-1 shadow-sm border border-slate-200/80 transition-all hover:bg-white hover:shadow">
        <!-- 影响层级 -->
        <div class="flex items-center px-3 border-r border-slate-200/60">
          <span class="text-xs text-slate-400 mr-1">层级</span>
          <a-select 
            size="small" 
            :bordered="false"
            class="w-[65px] !text-xs font-semibold text-slate-700" 
            :value="impactLevel" 
            @change="(v) => $emit('update:impactLevel', v)"
            :dropdown-match-select-width="false"
            :dropdown-style="{ borderRadius: '8px', padding: '4px', minWidth: '80px' }"
          >
            <a-select-option value="1"><span class="text-xs font-medium text-slate-700">1 层</span></a-select-option>
            <a-select-option value="2"><span class="text-xs font-medium text-slate-700">2 层</span></a-select-option>
            <a-select-option value="3"><span class="text-xs font-medium text-slate-700">3 层</span></a-select-option>
          </a-select>
        </div>

        <!-- 项目空间 -->
        <div class="flex items-center px-3 border-r border-slate-200/60 py-0.5">
          <span class="text-xs text-slate-400 mr-2">仅当前空间</span>
          <a-switch
            :checked="projectSpace === 'current'"
            size="small"
            @change="(v) => $emit('update:projectSpace', v ? 'current' : 'all')"
          />
        </div>

        <!-- 核心链路 -->
        <div class="flex items-center px-3 py-0.5">
          <span class="text-xs text-slate-400 mr-2">核心链路</span>
          <a-switch
            :checked="coreOnly"
            size="small"
            @change="(v) => $emit('update:coreOnly', v)"
          />
        </div>
      </div>

      <!-- 缩放控件组 -->
      <div class="flex items-center rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/80 text-slate-500 overflow-hidden transition-all hover:bg-white hover:shadow">
        <div class="px-3 py-1.5 cursor-pointer hover:bg-slate-100 hover:text-blue-600 border-r border-slate-200/60 transition-colors flex items-center justify-center" @click="$emit('zoom-in')" title="放大">
          <ZoomInOutlined class="text-[13px]" />
        </div>
        <div class="px-3 py-1.5 cursor-pointer hover:bg-slate-100 hover:text-blue-600 border-r border-slate-200/60 transition-colors flex items-center justify-center" @click="$emit('zoom-out')" title="缩小">
          <ZoomOutOutlined class="text-[13px]" />
        </div>
        <div class="px-3 py-1.5 cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center" @click="$emit('fit-view')" title="适应屏幕">
          <ExpandOutlined class="text-[13px]" />
        </div>
      </div>
    </div>

    <!-- 第二行：图例 -->
    <div class="flex items-center gap-3.5 rounded-full bg-white/80 backdrop-blur-sm px-4 py-1.5 border border-slate-200/60 pointer-events-auto transition-all hover:bg-white">
      <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#52C41A] ring-[3px] ring-[#52C41A]/10"></span><span class="text-[11px] font-medium text-slate-500">执行成功</span></div>
      <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#FF4D4F] ring-[3px] ring-[#FF4D4F]/10"></span><span class="text-[11px] font-medium text-slate-500">失败/停止</span></div>
      <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#FA8C16] ring-[3px] ring-[#FA8C16]/10"></span><span class="text-[11px] font-medium text-slate-500">运行/排队</span></div>
      <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#1890FF] ring-[3px] ring-[#1890FF]/10"></span><span class="text-[11px] font-medium text-slate-500">其他状态</span></div>
      <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#8c8c8c] ring-[3px] ring-[#8c8c8c]/10"></span><span class="text-[11px] font-medium text-slate-500">未生成</span></div>
    </div>
  </div>

  <!-- 左上角提示 -->
  <div class="absolute top-4 left-4 z-10 pointer-events-none">
    <div class="flex items-center gap-2.5 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 shadow-sm border border-slate-200/80 transition-all hover:bg-white hover:shadow">
      <div class="relative flex h-2 w-2 items-center justify-center">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
        <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
      </div>
      <span class="text-xs text-slate-700 font-medium">
        实时运行状态 <span class="text-slate-300 font-normal mx-1.5">|</span> <span class="text-slate-500 font-normal">节点恢复后显示为成功，但保留告警触发时的风险标识</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, InfoCircleFilled } from '@ant-design/icons-vue'

defineProps({
  coreOnly: { type: Boolean, default: false },
  impactLevel: { type: String, default: '1' },
  projectSpace: { type: String, default: 'all' },
})

defineEmits(['update:coreOnly', 'update:impactLevel', 'update:projectSpace', 'zoom-in', 'zoom-out', 'fit-view'])
</script>

<style scoped>
/* 覆盖下拉面板默认样式，使其更精致 */
:deep(.ant-select-dropdown) {
  padding: 4px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
}

:deep(.ant-select-item) {
  border-radius: 6px !important;
  padding: 5px 12px !important;
  min-height: 28px !important;
  line-height: 18px !important;
  margin-bottom: 2px !important;
  transition: all 0.2s ease;
}

:deep(.ant-select-item:last-child) {
  margin-bottom: 0 !important;
}

:deep(.ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background-color: #f1f5f9 !important;
}

:deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  background-color: #eff6ff !important;
}

:deep(.ant-select-item-option-selected:not(.ant-select-item-option-disabled) .text-slate-700) {
  color: #2563eb !important;
  font-weight: 600 !important;
}

/* 隐藏默认的选中对号，保持极简 */
:deep(.ant-select-item-option-state) {
  display: none !important;
}
</style>

