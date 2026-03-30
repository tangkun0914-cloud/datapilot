# TransferModal - 转交弹窗

将告警事件转交给其他用户的表单弹窗。支持多选目标用户，带搜索过滤功能。

## 用法

```vue
<template>
  <TransferModal v-model:open="transferOpen" :users="userList" @submit="handleTransfer" />
</template>

<script setup>
import TransferModal from '@/pages/Monitoring/modals/TransferModal.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| open | Boolean | 否 | `false` | 弹窗显示状态（v-model:open） |
| users | Array | 否 | `[]` | 可选用户列表，字符串数组 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:open | `val: Boolean` | 弹窗开关变化 |
| submit | `{ targetUsers: Array }` | 提交转交目标用户 |

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
