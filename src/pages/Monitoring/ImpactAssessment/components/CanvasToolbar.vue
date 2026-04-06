<template>
  <div class="absolute top-4 right-4 z-10 flex flex-col items-end gap-3 pointer-events-none">
    <!-- 第一行：图例 + 缩放控件 -->
    <div class="flex items-center gap-3 pointer-events-auto">
      <!-- 图例 -->
      <div class="flex items-center gap-4 rounded-md bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm border border-slate-200">
        <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#52C41A]"></span><span class="text-xs text-slate-600">执行成功</span></div>
        <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#FF4D4F]"></span><span class="text-xs text-slate-600">失败/停止</span></div>
        <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#FA8C16]"></span><span class="text-xs text-slate-600">运行/排队</span></div>
        <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#1890FF]"></span><span class="text-xs text-slate-600">其他状态</span></div>
        <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#8c8c8c]"></span><span class="text-xs text-slate-600">未生成</span></div>
      </div>
      
      <!-- 缩放控件 -->
      <div class="flex items-center rounded-md bg-white/90 backdrop-blur shadow-sm border border-slate-200 overflow-hidden text-slate-600">
        <div class="px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 border-r border-slate-200 transition-colors" @click="$emit('zoom-in')" title="放大">
          <ZoomInOutlined />
        </div>
        <div class="px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 border-r border-slate-200 transition-colors" @click="$emit('zoom-out')" title="缩小">
          <ZoomOutOutlined />
        </div>
        <div class="px-2.5 py-1.5 cursor-pointer hover:bg-slate-100 transition-colors" @click="$emit('fit-view')" title="适应屏幕">
          <ExpandOutlined />
        </div>
      </div>
    </div>

    <!-- 第二行：核心链路 -->
    <div class="flex items-center gap-3 rounded-md bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm border border-slate-200 pointer-events-auto">
      <span class="text-xs text-slate-600">核心链路</span>
      <a-switch
        :checked="coreOnly"
        size="small"
        checked-children="开"
        un-checked-children="关"
        @change="(v) => $emit('update:coreOnly', v)"
      />
    </div>
  </div>

  <!-- 左上角提示 -->
  <div class="absolute top-4 left-4 z-10 pointer-events-none">
    <div class="flex items-center gap-1.5 rounded-md bg-white/80 backdrop-blur px-3 py-1.5 shadow-sm border border-slate-200 text-xs text-slate-500">
      <InfoCircleOutlined />
      <span>滚轮缩放/拖拽画布/点击节点左右两侧+/-符号进行(展开/收起)</span>
    </div>
  </div>
</template>

<script setup>
import { ZoomInOutlined, ZoomOutOutlined, ExpandOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

defineProps({
  coreOnly: { type: Boolean, default: false },
})

defineEmits(['update:coreOnly', 'zoom-in', 'zoom-out', 'fit-view'])
</script>
