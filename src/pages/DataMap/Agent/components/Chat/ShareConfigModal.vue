<template>
  <a-modal
    :open="open"
    :width="440"
    :class="isDarkMode ? 'dark-modal' : ''"
    :closable="false"
    destroyOnClose
    @update:open="$emit('update:open', $event)"
  >
    <!-- 自定义标题 -->
    <template #title>
      <div class="flex items-center gap-2.5 pt-1 pb-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.2)] text-[rgba(168,140,210,1)]' : 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)]'">
          <ShareAltOutlined class="text-[15px]" />
        </div>
        <span class="text-[16px] font-bold tracking-wide" :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'">分享对话记录</span>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3 pt-2 pb-1">
        <a-button class="rounded-lg px-5 h-9" @click="$emit('update:open', false)" :class="isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white' : ''">取消</a-button>
        <a-button type="primary" class="agent-share-primary rounded-lg px-5 h-9 font-medium" @click="handleConfirm">
          <template #icon><LinkOutlined /></template>
          生成并复制链接
        </a-button>
      </div>
    </template>

    <div class="flex flex-col gap-5 py-3">
      <!-- 已选数量提示框 -->
      <div class="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors"
           :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#fafafa] border-slate-200'">
        <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors" :class="isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white shadow-sm border border-slate-100 text-slate-500'">
          <MessageOutlined class="text-[15px]" />
        </div>
        <div class="flex-1 text-[13.5px]" :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'">
          已选择 <span class="font-bold text-[16px] mx-1.5 font-mono" :class="isDarkMode ? 'text-[rgba(168,140,210,1)]' : 'text-[rgba(108,76,155,1)]'">{{ selectedCount }}</span> 组对话进行分享
        </div>
      </div>

      <!-- 有效期设置 -->
      <div class="flex flex-col gap-2.5">
        <div class="text-[13.5px] font-semibold" :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'">链接有效期</div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="opt in expireOptions" :key="opt.value"
               class="flex flex-col items-center justify-center py-2.5 rounded-lg border cursor-pointer transition-all duration-200"
               :class="[
                 shareExpire === opt.value 
                   ? (isDarkMode ? 'bg-[rgba(108,76,155,0.2)] border-[rgba(108,76,155,0.5)] text-[rgba(168,140,210,1)]' : 'bg-[rgba(108,76,155,0.06)] border-[rgba(108,76,155,0.4)] text-[rgba(108,76,155,1)] shadow-sm')
                   : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50')
               ]"
               @click="shareExpire = opt.value">
            <span class="text-[13.5px] font-semibold">{{ opt.label }}</span>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-[12.5px] leading-relaxed mt-1 transition-colors"
           :class="isDarkMode ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-blue-50 text-blue-600 border border-blue-100'">
        <InfoCircleOutlined class="mt-0.5 shrink-0 text-[14px]" />
        <span>分享链接仅公司内网环境可访问，请注意数据安全，切勿将敏感数据外传。</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { LinkOutlined, InfoCircleOutlined, ShareAltOutlined, MessageOutlined } from '@ant-design/icons-vue'

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:open', 'confirm'])

const shareExpire = ref('7days')

const expireOptions = [
  { label: '7 天', value: '7days' },
  { label: '30 天', value: '30days' },
  { label: '永久有效', value: 'permanent' }
]

const handleConfirm = () => {
  emit('confirm', { expire: shareExpire.value })
}
</script>

<style scoped>
.agent-share-primary {
  background-color: rgba(108,76,155,1) !important;
  border-color: rgba(108,76,155,1) !important;
}
.agent-share-primary:hover {
  background-color: rgba(108,76,155,0.9) !important;
  border-color: rgba(108,76,155,0.9) !important;
}
</style>