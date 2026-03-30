<template>
  <a-switch
    v-if="disabled"
    :checked="checked"
    checked-children="开启"
    un-checked-children="关闭"
    disabled
  />
  <a-popconfirm
    v-else-if="checked"
    title="关闭策略"
    description="关闭策略可能导致遗漏重要告警，是否确认关闭？"
    ok-text="确认关闭"
    cancel-text="取消"
    :ok-button-props="{ danger: true }"
    @confirm="handleConfirmClose"
  >
    <a-switch
      :checked="checked"
      checked-children="开启"
      un-checked-children="关闭"
    />
  </a-popconfirm>
  <a-switch
    v-else
    :checked="checked"
    checked-children="开启"
    un-checked-children="关闭"
    @change="handleOpen"
  />
</template>

<script setup>
/**
 * StatusSwitch - 策略状态开关
 *
 * 通知策略列表中的启用/禁用开关。开启时直接切换并提示成功；
 * 关闭时弹出 Popconfirm 二次确认，防止误操作导致告警通知遗漏。
 *
 * @prop {Boolean} value - 当前开关状态
 * @prop {Boolean} disabled - 是否禁用开关
 *
 * @emits change (checked: Boolean) - 状态变更后触发
 */
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  value: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['change'])

const checked = ref(props.value)

watch(() => props.value, (val) => {
  checked.value = val
})

function handleOpen() {
  checked.value = true
  emit('change', true)
  message.success('通知策略已开启')
}

function handleConfirmClose() {
  checked.value = false
  emit('change', false)
  message.success('通知策略已关闭')
}
</script>
