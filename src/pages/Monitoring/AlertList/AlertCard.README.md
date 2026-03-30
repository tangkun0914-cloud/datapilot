# AlertCard - 告警事件卡片

单条告警事件的展示卡片，集成了状态标识、操作按钮组、元信息区、日志摘要等完整交互。根据 `alert.severity` 和 `alert.status` 自动切换主题色和按钮集。

## 截图

访问 `/design` → 监控运维 Tab → AlertCard 查看在线预览。

## 用法

```vue
<template>
  <AlertCard
    :alert="alertItem"
    :checked="selectedIds.includes(alertItem.id)"
    @check="handleCheck"
    @titleClick="openDrawer"
    @action="handleAction"
  />
</template>

<script setup>
import AlertCard from '@/pages/Monitoring/AlertList/AlertCard.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| alert | Object | 是 | - | 告警对象，数据结构见 `src/mock/monitoring.js`。核心字段：`id`, `title`, `severity`(ERROR/WARN), `status`(firing/acked/silenced/transferred/resolved/falsePositive), `source`, `monitorEvent`, `triggerTime`, `owner` 等 |
| checked | Boolean | 否 | false | 是否被勾选（用于列表批量操作场景） |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| check | `checked: Boolean` | 勾选状态变化 |
| titleClick | `alert: Object` | 点击告警标题，通常用于打开详情抽屉 |
| action | `type: String, alert: Object` | 操作按钮点击。`type` 值：`claim`(认领)、`silence`(屏蔽)、`resolve`(已解决)、`transfer`(转交)、`falsePositive`(误报) |

## 主题色规则

| 条件 | 左边框色 | 说明 |
|------|----------|------|
| severity = ERROR 且未结束 | 红色 | `theme-error` |
| severity = WARN 且未结束 | 蓝色 | `theme-warn` |
| status = resolved | 绿色 | `theme-resolved` |
| status = falsePositive | 橙色 | `theme-fp` |

## 子依赖

- `AlertLogSection`：卡片底部的日志摘要区，根据告警类型智能提取关键片段。

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
