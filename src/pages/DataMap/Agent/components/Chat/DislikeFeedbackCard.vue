<template>
  <div class="flex flex-col gap-4 pt-2">
    <!-- 快捷标签 -->
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="tag in feedbackTags" 
        :key="tag.id"
        class="px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-colors border"
        :class="[
          selectedTags.includes(tag.id)
            ? (isDarkMode ? 'bg-[rgba(108,76,155,0.2)] border-[rgba(108,76,155,1)] text-[rgba(108,76,155,1)]' : 'bg-[rgba(108,76,155,0.05)] border-[rgba(108,76,155,1)] text-[rgba(108,76,155,1)]')
            : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500' : 'bg-[#f9f9f9] border-[#e0e0e0] text-[#666] hover:border-[#ccc]')
        ]"
        @click="toggleTag(tag.id)"
      >
        {{ tag.label }}
      </div>
    </div>

    <!-- 详细输入框 -->
    <a-textarea
      v-model:value="feedbackText"
      placeholder="请详细描述您遇到的问题，帮助我们更好地改进..."
      :auto-size="{ minRows: 3, maxRows: 5 }"
      class="custom-feedback-textarea transition-colors duration-300"
      :class="{ 'dark-textarea': isDarkMode }"
    />

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 mt-2">
      <a-button 
        @click="$emit('cancel')"
        :class="isDarkMode ? 'bg-transparent border-slate-600 text-slate-300 hover:text-white hover:border-slate-500' : ''"
      >
        取消
      </a-button>
      <a-button 
        type="primary" 
        :disabled="selectedTags.length === 0 && !feedbackText.trim()"
        @click="handleSubmit"
        :class="isDarkMode ? 'bg-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.9)] border-none' : 'bg-[rgba(108,76,155,1)] hover:bg-[rgba(108,76,155,0.9)] border-none'"
      >
        提交反馈
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const feedbackTags = [
  { id: '1', label: '答非所问' },
  { id: '2', label: '信息不准确' },
  { id: '3', label: '表名/字段错误' },
  { id: '4', label: '血缘关系错误' },
  { id: '5', label: 'SQL语法错误' },
  { id: '6', label: '其他' }
]

const selectedTags = ref([])
const feedbackText = ref('')

const toggleTag = (id) => {
  const index = selectedTags.value.indexOf(id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(id)
  }
}

const handleSubmit = () => {
  emit('submit', {
    tags: selectedTags.value.map(id => feedbackTags.find(t => t.id === id).label),
    text: feedbackText.value
  })
  // 重置状态
  selectedTags.value = []
  feedbackText.value = ''
}
</script>

<style scoped>
.custom-feedback-textarea {
  border-radius: 8px;
  padding: 8px 12px;
}
.custom-feedback-textarea:focus {
  border-color: rgba(108,76,155,1) !important;
  box-shadow: 0 0 0 2px rgba(108,76,155,0.1) !important;
}
.dark-textarea {
  background-color: #0f172a !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}
.dark-textarea::placeholder {
  color: #64748b !important;
}
.dark-textarea:focus {
  background-color: #0f172a !important;
}
</style>
