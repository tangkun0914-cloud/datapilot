<template>
  <a-modal
    :open="open"
    title="批量转交表负责人"
    :confirm-loading="loading"
    ok-text="确认转交"
    cancel-text="取消"
    :ok-button-props="{ disabled: !targetOwner }"
    @ok="handleConfirm"
    @cancel="handleClose"
    :width="520"
    destroy-on-close
  >
    <div class="transfer-form">
      <div class="transfer-summary">
        <InfoCircleOutlined class="summary-icon" />
        <span>已选择 <strong>{{ tableCount }}</strong> 张表进行转交</span>
      </div>

      <div v-if="tableNames.length" class="transfer-table-list">
        <div class="table-list-label">转交表清单：</div>
        <div class="table-list-tags">
          <a-tag v-for="name in displayNames" :key="name">{{ name }}</a-tag>
          <a-tag v-if="tableNames.length > maxDisplay" class="more-tag">
            +{{ tableNames.length - maxDisplay }}
          </a-tag>
        </div>
      </div>

      <a-form layout="vertical" class="transfer-fields">
        <a-form-item label="接收人" required>
          <a-select
            v-model:value="targetOwner"
            show-search
            placeholder="搜索姓名或邮箱前缀..."
            :filter-option="filterUser"
            :options="userOptions"
            option-label-prop="label"
          />
        </a-form-item>
        <a-form-item label="转交原因">
          <a-textarea
            v-model:value="reason"
            placeholder="请输入转交原因（选填）"
            :rows="3"
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  tableCount: { type: Number, default: 0 },
  tableNames: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'confirm'])

const targetOwner = ref(undefined)
const reason = ref('')
const loading = ref(false)
const maxDisplay = 5

const mockUsers = [
  { name: '李四', email: 'lisi' },
  { name: '王五', email: 'wangwu' },
  { name: '赵六', email: 'zhaoliu' },
  { name: '孙七', email: 'sunqi' },
  { name: '周八', email: 'zhouba' },
  { name: '吴九', email: 'wujiu' },
]

const userOptions = computed(() =>
  mockUsers.map(u => ({
    value: u.email,
    label: `${u.name}(${u.email})`,
    name: u.name,
    email: u.email,
  }))
)

const displayNames = computed(() => props.tableNames.slice(0, maxDisplay))

function filterUser(input, option) {
  const kw = input.toLowerCase()
  return (
    option.name.toLowerCase().includes(kw) ||
    option.email.toLowerCase().includes(kw)
  )
}

function handleConfirm() {
  if (!targetOwner.value) return
  loading.value = true
  emit('confirm', {
    targetOwner: targetOwner.value,
    reason: reason.value,
  })
}

function handleClose() {
  targetOwner.value = undefined
  reason.value = ''
  loading.value = false
  emit('update:open', false)
}

defineExpose({ resetLoading: () => { loading.value = false } })
</script>

<style scoped>
.transfer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transfer-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f5ff;
  border-radius: 8px;
  color: #1d39c4;
  font-size: 14px;
}

.summary-icon {
  font-size: 16px;
  color: #597ef7;
}

.transfer-table-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-list-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.table-list-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.more-tag {
  color: #64748b;
  border-style: dashed;
}

.transfer-fields {
  margin-bottom: 0;
}

.transfer-fields :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.transfer-fields :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}
</style>
