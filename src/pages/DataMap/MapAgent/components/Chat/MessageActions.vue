<template>
  <div class="flex items-center gap-2 mt-1 px-1 transition-opacity duration-300">
    <a-tooltip title="复制">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="isDarkMode
          ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
          : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]'"
        @click="$emit('copy', msgId)"
      >
        <CopyOutlined class="text-[14px]" />
      </div>
    </a-tooltip>
    <a-tooltip v-if="showTableFavorite" :title="tableFavorited ? '已收藏此表' : '收藏此表'">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="tableFavorited
          ? (isDarkMode ? 'text-orange-400 bg-orange-400/10' : 'text-orange-500 bg-orange-50')
          : (isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]')"
        @click="$emit('toggleTableFavorite', msgId)"
      >
        <StarFilled v-if="tableFavorited" class="text-[14px]" />
        <StarOutlined v-else class="text-[14px]" />
      </div>
    </a-tooltip>
    <a-tooltip v-if="showRegenerate" title="重新生成">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="isDarkMode
          ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
          : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]'"
        @click="$emit('regenerate', msgId)"
      >
        <ReloadOutlined class="text-[14px]" />
      </div>
    </a-tooltip>
    <a-tooltip title="有帮助">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="[
          actionState?.like 
            ? (isDarkMode ? 'text-teal-400 bg-teal-400/10' : 'text-teal-500 bg-teal-50') 
            : (isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]')
        ]"
        @click="$emit('like', msgId)"
      >
        <LikeFilled v-if="actionState?.like" class="text-[14px]" />
        <LikeOutlined v-else class="text-[14px]" />
      </div>
    </a-tooltip>
    <a-tooltip title="没帮助">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="[
          actionState?.dislike 
            ? (isDarkMode ? 'text-orange-400 bg-orange-400/10' : 'text-orange-500 bg-orange-50') 
            : (isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'text-[#999] hover:bg-[#f0f0f0] hover:text-[#666]')
        ]"
        @click="$emit('dislike', msgId)"
      >
        <DislikeFilled v-if="actionState?.dislike" class="text-[14px]" />
        <DislikeOutlined v-else class="text-[14px]" />
      </div>
    </a-tooltip>
    <a-tooltip title="分享">
      <div 
        class="w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors duration-300"
        :class="isDarkMode
          ? 'text-[rgba(168,140,210,1)] hover:bg-[rgba(108,76,155,0.2)] hover:text-[rgba(198,170,235,1)]'
          : 'text-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.1)] hover:text-[rgba(88,56,135,1)]'"
        @click="$emit('share', msgId)"
      >
        <ShareAltOutlined class="text-[14px]" />
      </div>
    </a-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  CopyOutlined,
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  msgId: { type: [Number, String], required: true },
  /** AI 消息状态：用于控制「重新生成」展示 */
  msgStatus: { type: String, default: '' },
  isDarkMode: { type: Boolean, default: false },
  actionState: { type: Object, default: () => ({}) },
  showTableFavorite: { type: Boolean, default: false },
  tableFavorited: { type: Boolean, default: false }
})

const showRegenerate = computed(() =>
  ['success', 'stopped', 'error'].includes(props.msgStatus)
)

defineEmits(['copy', 'like', 'dislike', 'share', 'toggleTableFavorite', 'regenerate'])
</script>
