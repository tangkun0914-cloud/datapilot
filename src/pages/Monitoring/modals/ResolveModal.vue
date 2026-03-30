<template>
  <a-modal
    v-model:open="visible"
    title="填写故障根因"
    :width="560"
    @ok="handleSubmit"
    @cancel="handleCancel"
    okText="确认提交"
    cancelText="取消"
  >
    <a-alert
      type="info"
      show-icon
      message="已解决说明：当用户点击已解决，该告警事件结束，不会再进行告警通知"
      class="mb-4"
    />

    <a-form layout="vertical">
      <a-form-item label="故障根因" required>
        <a-cascader
          v-model:value="form.rootCause"
          :options="rootCauseOptions"
          placeholder="请选择故障根因"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="诊断备注">
        <a-textarea
          v-model:value="form.remark"
          placeholder="请输入诊断备注..."
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
/**
 * ResolveModal - 已解决弹窗
 *
 * 标记告警为已解决时弹出的表单弹窗。要求填写故障根因（级联选择：
 * 程序代码/数据问题/基础设施/上游依赖/其他），可选填诊断备注。
 * 提交后告警事件关闭，不再发送通知。
 *
 * @prop {Boolean} open - 弹窗显示状态（v-model:open）
 *
 * @emits update:open (val: Boolean) - 弹窗开关变化
 * @emits submit (data: Object)      - 提交，data 含 rootCause, remark
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

const rootCauseOptions = [
  {
    value: 'code',
    label: '程序代码',
    children: [
      { value: 'logic', label: '逻辑错误' },
      { value: 'null_pointer', label: '空指针异常' },
      { value: 'oom', label: '内存溢出' },
    ],
  },
  {
    value: 'data',
    label: '数据问题',
    children: [
      { value: 'data_delay', label: '数据延迟' },
      { value: 'data_missing', label: '数据缺失' },
      { value: 'data_dirty', label: '脏数据' },
      { value: 'data_surge', label: '数据量激增' },
    ],
  },
  {
    value: 'infra',
    label: '基础设施',
    children: [
      { value: 'network', label: '网络故障' },
      { value: 'disk', label: '磁盘空间不足' },
      { value: 'resource', label: '资源不足' },
    ],
  },
  {
    value: 'dependency',
    label: '上游依赖',
    children: [
      { value: 'upstream_delay', label: '上游延迟' },
      { value: 'upstream_fail', label: '上游失败' },
    ],
  },
  {
    value: 'other',
    label: '其他',
    children: [
      { value: 'unknown', label: '未知原因' },
      { value: 'custom', label: '自定义 (请填写备注)' },
    ],
  },
]

const form = reactive({
  rootCause: [],
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
  form.rootCause = []
  form.remark = ''
}
</script>
