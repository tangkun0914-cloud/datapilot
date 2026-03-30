# ResolveModal - 已解决弹窗

标记告警为已解决时弹出的表单弹窗。要求填写故障根因（级联选择），可选填诊断备注。提交后告警事件关闭，不再发送通知。

## 用法

```vue
<template>
  <ResolveModal v-model:open="resolveOpen" @submit="handleResolveSubmit" />
</template>

<script setup>
import ResolveModal from '@/pages/Monitoring/modals/ResolveModal.vue'
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
| submit | `{ rootCause: Array, remark: String }` | 提交故障根因和诊断备注 |

## 根因选项

程序代码（逻辑错误/空指针/OOM） | 数据问题（延迟/缺失/脏数据/激增） | 基础设施（网络/磁盘/资源） | 上游依赖（延迟/失败） | 其他

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
