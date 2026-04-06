# HistoryModal - 操作历史弹窗

以 Ant Design Timeline 展示告警事件的操作历史记录。每条记录包含时间、操作描述和可选详情。无操作时显示空状态。

## 用法

```vue
<template>
  <HistoryModal v-model:open="historyOpen" :historyItems="historyData" />
</template>

<script setup>
import HistoryModal from '@/pages/Monitoring/modals/HistoryModal.vue'

const historyData = [
  { time: '2026-03-19 14:00', action: '触发告警', color: 'red' },
  { time: '2026-03-19 14:05', action: '王蕊(wangrui) 认领了告警', color: 'blue' },
  { time: '2026-03-19 15:30', action: '王蕊(wangrui) 标记为已解决', detail: '根因：上游延迟', color: 'green' },
]
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| open | Boolean | 否 | `false` | 弹窗显示状态（v-model:open） |
| historyItems | Array | 否 | `[]` | 历史记录数组 |

### HistoryItem 对象字段

| 字段 | 类型 | 说明 |
|------|------|------|
| time | String | 操作时间 |
| action | String | 操作描述 |
| detail | String | 详情（可选） |
| color | String | 时间线节点颜色（可选，默认 `blue`） |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:open | `val: Boolean` | 弹窗开关变化 |

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
