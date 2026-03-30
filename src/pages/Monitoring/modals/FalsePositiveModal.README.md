# FalsePositiveModal - 误报弹窗

将告警标记为误报的表单弹窗。选择误报原因，可选填补充说明。标记后告警关闭，不再通知。

## 用法

```vue
<template>
  <FalsePositiveModal v-model:open="fpOpen" @submit="handleFalsePositive" />
</template>

<script setup>
import FalsePositiveModal from '@/pages/Monitoring/modals/FalsePositiveModal.vue'
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
| submit | `{ reasonType: String, remark: String }` | 提交误报原因和备注 |

## 误报原因选项

- `expected` 预期内变化
- `threshold` 阈值不合理
- `test` 测试数据
- `other` 其他

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
