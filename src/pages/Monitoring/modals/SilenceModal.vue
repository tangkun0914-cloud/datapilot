<template>
  <a-modal
    v-model:open="visible"
    title="设置屏蔽规则"
    :width="520"
    @ok="handleSubmit"
    @cancel="handleCancel"
    okText="确认屏蔽"
    cancelText="取消"
    class="silence-modal"
  >
    <div class="modal-content-wrap">
      <div class="form-item-title">
        <span class="required-star">*</span> 屏蔽时长
      </div>
      <a-radio-group v-model:value="form.duration" class="duration-radio-group">
        <a-radio v-for="opt in durationOptions" :key="opt.value" :value="opt.value" class="duration-radio-item">
          {{ opt.label }}
        </a-radio>
      </a-radio-group>

      <div class="form-item-title mt-16">
        屏蔽原因(选填)
      </div>
      <a-textarea
        v-model:value="form.reason"
        placeholder="请输入屏蔽原因,例如:等待上游修复..."
        :rows="4"
        class="reason-textarea"
      />
    </div>
  </a-modal>
</template>

<script setup>
/**
 * SilenceModal - 屏蔽弹窗
 *
 * 设置告警屏蔽规则的表单弹窗。选择屏蔽时长（1h~24h），
 * 可选填屏蔽原因。屏蔽期间告警不发送通知。
 *
 * @prop {Boolean} open - 弹窗显示状态（v-model:open）
 *
 * @emits update:open (val: Boolean) - 弹窗开关变化
 * @emits submit (data: Object)      - 提交，data 含 duration, reason
 */
import { reactive, computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'submit'])

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const durationOptions = [
  { label: '1小时', value: '1h' },
  { label: '2小时', value: '2h' },
  { label: '3小时', value: '3h' },
  { label: '6小时', value: '6h' },
  { label: '8小时', value: '8h' },
  { label: '12小时', value: '12h' },
  { label: '24小时', value: '24h' },
]

const form = reactive({
  duration: '1h',
  reason: '',
})

function handleSubmit() {
  emit('submit', { ...form })
  resetForm()
}

function handleCancel() {
  resetForm()
}

function resetForm() {
  form.duration = '1h'
  form.reason = ''
}
</script>

<style scoped>
.modal-content-wrap {
  padding: 12px 0 8px;
}

.form-item-title {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 12px;
  font-weight: 500;
}

.required-star {
  color: #ff4d4f;
  margin-right: 4px;
  font-family: SimSun, sans-serif;
}

.mt-16 {
  margin-top: 24px;
}

.duration-radio-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
  width: 100%;
}

.duration-radio-item {
  font-size: 14px;
  color: #334155;
}

.reason-textarea {
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}
</style>

<style>
/* 覆盖弹窗默认样式以匹配设计图 */
.silence-modal .ant-modal-header {
  margin-bottom: 0;
  padding: 20px 24px 16px;
}
.silence-modal .ant-modal-title {
  font-size: 16px;
  font-weight: 600;
}
.silence-modal .ant-modal-body {
  padding: 0 24px;
}
.silence-modal .ant-modal-footer {
  padding: 16px 24px 20px;
  margin-top: 0;
}
.silence-modal .ant-btn {
  border-radius: 6px;
  height: 36px;
  padding: 0 20px;
}
.silence-modal .ant-btn-primary {
  background-color: #1677ff;
}
</style>
