<!--
  用户自然语言消息行内编辑（覆盖重写 / 仅回退 / 取消）
  供 ChatPanel 在用户消息上点击「编辑」后展示
-->
<template>
  <div class="user-msg-inline-editor">
    <textarea
      ref="textareaRef"
      v-model="text"
      class="user-msg-inline-editor__input"
      rows="3"
      @keydown.esc.prevent="$emit('cancel')"
    />
    <div class="user-msg-inline-editor__footer">
      <div class="user-msg-inline-editor__actions-left">
        <button type="button" class="user-msg-inline-editor__btn" @click="emitConfirm('rewrite')">
          <RetweetOutlined />
          <span>覆盖重写</span>
        </button>
        <button type="button" class="user-msg-inline-editor__btn" @click="emitConfirm('rollback')">
          <RollbackOutlined />
          <span>仅回退</span>
        </button>
      </div>
      <button type="button" class="user-msg-inline-editor__cancel" @click="$emit('cancel')">
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { RetweetOutlined, RollbackOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'UserMessageInlineEditor' })

const props = defineProps({
  initialContent: { type: String, default: '' },
})

const emit = defineEmits(['cancel', 'confirm'])

const text = ref(props.initialContent)
const textareaRef = ref(null)

watch(
  () => props.initialContent,
  (v) => {
    text.value = v
  }
)

onMounted(() => {
  nextTick(() => {
    textareaRef.value?.focus()
    textareaRef.value?.select()
  })
})

function emitConfirm(action) {
  emit('confirm', { action, text: text.value })
}
</script>

<style scoped>
.user-msg-inline-editor {
  width: 100%;
  max-width: 100%;
  background: #fff;
  border: 1px solid #adc6ff;
  border-radius: 10px;
  padding: 12px;
  box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(108, 76, 155, 0.06);
}

.user-msg-inline-editor__input {
  width: 100%;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 72px;
  font-size: 13px;
  line-height: 1.55;
  color: #333;
  background: transparent;
}

.user-msg-inline-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.user-msg-inline-editor__actions-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.user-msg-inline-editor__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: #595959;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.user-msg-inline-editor__btn:hover {
  border-color: rgba(108, 76, 155);
  color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.08);
}

.user-msg-inline-editor__cancel {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-msg-inline-editor__cancel:hover {
  color: #333;
  background: #f5f5f5;
}
</style>
