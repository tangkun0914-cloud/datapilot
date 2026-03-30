<template>
  <a-modal
    v-model:open="visible"
    title="标记为误报"
    :width="500"
    @ok="handleSubmit"
    @cancel="handleCancel"
    okText="确认提交"
    cancelText="取消"
  >
    <a-alert
      type="error"
      message="注意:标记误报后,该告警将被关闭,并且系统会记录反馈以优化算法。"
      class="mb-4"
    />
    <a-form layout="vertical">
      <a-form-item label="误报说明 / 备注" required>
        <a-textarea
          v-model:value="form.remark"
          placeholder="请描述误报原因,例如:测试数据干扰..."
          :rows="4"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
/**
 * FalsePositiveModal - 误报弹窗
 *
 * 将告警标记为误报的表单弹窗。填写误报说明/备注。
 * 标记后告警关闭，并且系统会记录反馈以优化算法。
 *
 * @prop {Boolean} open - 弹窗显示状态（v-model:open）
 *
 * @emits update:open (val: Boolean) - 弹窗开关变化
 * @emits submit (data: Object)      - 提交，data 含 remark
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

const form = reactive({
  remark: '',
})

function handleSubmit() {
  emit('submit', { ...form })
  resetForm()
}

function handleCancel() {
  resetForm()
}

function resetForm() {
  form.remark = ''
}
</script>
