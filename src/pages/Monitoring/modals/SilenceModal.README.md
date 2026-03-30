# SilenceModal - 屏蔽弹窗

设置告警屏蔽规则的表单弹窗。选择屏蔽时长（1h~24h），可选填屏蔽原因。屏蔽期间告警不发送通知。

## 用法

```vue
<template>
  <SilenceModal v-model:open="silenceOpen" @submit="handleSilence" />
</template>

<script setup>
import SilenceModal from '@/pages/Monitoring/modals/SilenceModal.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| open | Boolean | 否 | `false` | 弹窗显示状态（v-model:open） |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:open | `val: Boolean` | 弹窗开关变化 |
| submit | `{ duration: String, reason: String }` | 提交屏蔽时长和原因 |

## 屏蔽时长选项

1小时 | 2小时 | 3小时 | 6小时 | 8小时 | 12小时 | 24小时

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
