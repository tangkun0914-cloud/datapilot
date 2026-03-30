<template>
  <div class="dislike-feedback-card">
    <div class="dislike-feedback-title">问题类型 (必选)</div>
    <div class="dislike-tag-list">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="dislike-tag"
        :class="{ 'dislike-tag--active': isSelected(opt.value) }"
        @click="toggleTag(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="dislike-textarea-wrap">
      <a-textarea
        v-model:value="localDetail"
        :rows="3"
        placeholder="具体描述问题 (可选)..."
        :maxlength="DETAIL_MAX"
        class="dislike-textarea"
      />
      <span class="dislike-char-count">{{ detailLen }} / {{ DETAIL_MAX }}</span>
    </div>

    <div class="dislike-footer">
      <a-button type="text" class="dislike-btn-cancel" @click="$emit('cancel')">取消</a-button>
      <a-button
        type="primary"
        class="dislike-btn-submit"
        :disabled="!selectedIds.length"
        @click="handleSubmit"
      >
        提交反馈
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { DISLIKE_REASON_OPTIONS } from '@/mock/DataMap/ai.js'

const DETAIL_MAX = 150

const props = defineProps({
  initialReasonIds: { type: Array, default: () => [] },
  initialDetail: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])

const options = DISLIKE_REASON_OPTIONS
const selectedIds = ref([])
const localDetail = ref('')

const detailLen = computed(() => (localDetail.value || '').length)

function initData() {
  selectedIds.value = Array.isArray(props.initialReasonIds)
    ? [...props.initialReasonIds]
    : []
  localDetail.value = props.initialDetail || ''
}

onMounted(initData)
watch(() => props.initialReasonIds, initData, { deep: true })

function isSelected(value) {
  return selectedIds.value.includes(value)
}

function toggleTag(value) {
  const i = selectedIds.value.indexOf(value)
  if (i >= 0) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(value)
}

function handleSubmit() {
  if (!selectedIds.value.length) {
    message.warning('请至少选择一个问题类型')
    return
  }
  emit('submit', {
    reasonIds: [...selectedIds.value],
    detail: (localDetail.value || '').trim(),
  })
}
</script>

<style scoped>
.dislike-feedback-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgb(15 23 42 / 0.08), 0 10px 15px -3px rgb(15 23 42 / 0.08);
  margin-top: 8px;
  width: 100%;
  max-width: 480px;
}

.dislike-feedback-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  letter-spacing: 0.01em;
}

.dislike-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.dislike-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dislike-tag:hover {
  border-color: #cbd5e1;
  color: #475569;
  background: #f1f5f9;
}

.dislike-tag--active {
  color: #2563eb;
  border-color: #3b82f6;
  background: #eff6ff;
}

.dislike-textarea-wrap {
  position: relative;
  margin-bottom: 16px;
}

.dislike-textarea-wrap :deep(textarea.ant-input) {
  border-radius: 8px;
  padding-bottom: 28px;
  resize: none;
  font-size: 13px;
}

.dislike-char-count {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.dislike-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.dislike-btn-cancel {
  color: #64748b !important;
}

.dislike-btn-cancel:hover {
  color: #334155 !important;
  background: transparent !important;
}

.dislike-btn-submit:disabled {
  opacity: 0.45;
}
</style>
