<template>
  <a-modal
    v-model:open="visible"
    title="转交告警"
    :width="500"
    @ok="handleSubmit"
    @cancel="handleCancel"
    okText="确认转交"
    cancelText="取消"
  >
    <a-form layout="vertical">
      <a-form-item label="转交给" required>
        <a-select
          v-model:value="form.targetUsers"
          mode="multiple"
          placeholder="请选择或搜索用户"
          :options="userOptions"
          show-search
          :filter-option="filterOption"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
/**
 * TransferModal - 转交弹窗
 *
 * 将告警事件转交给其他用户的表单弹窗。支持多选目标用户，
 * 带搜索过滤功能。
 *
 * @prop {Boolean} open  - 弹窗显示状态（v-model:open）
 * @prop {Array}   users - 可选用户列表，字符串数组
 *
 * @emits update:open (val: Boolean) - 弹窗开关变化
 * @emits submit (data: Object)      - 提交，data 含 targetUsers 数组
 */
import { reactive, computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'submit'])

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const userOptions = computed(() =>
  props.users.map((u) => ({ label: u, value: u }))
)

const form = reactive({
  targetUsers: [],
})

function filterOption(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function handleSubmit() {
  emit('submit', { ...form })
  resetForm()
}

function handleCancel() {
  resetForm()
}

function resetForm() {
  form.targetUsers = []
}
</script>
