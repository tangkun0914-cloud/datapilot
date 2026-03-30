# StatusSwitch - 策略状态开关

通知策略列表中的启用/禁用开关。开启时直接切换；关闭时弹出 Popconfirm 二次确认，防止误操作导致告警通知遗漏。

## 截图

访问 `/design` → 监控运维 Tab → StatusSwitch 查看在线预览。

## 用法

```vue
<template>
  <StatusSwitch :value="record.status" @change="handleStatusChange(record, $event)" />
</template>

<script setup>
import StatusSwitch from '@/pages/Monitoring/NotifyStrategy/StatusSwitch.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| value | Boolean | 否 | `false` | 当前开关状态 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| change | `checked: Boolean` | 状态变更后触发 |

## 交互说明

- 关闭 → 开启：直接切换，提示「通知策略已开启」
- 开启 → 关闭：弹出确认框「关闭策略可能导致遗漏重要告警，是否确认关闭？」，确认后提示「通知策略已关闭」

## 使用页面

- 通知策略列表 `/monitoring/strategies`（`NotifyStrategy/index.vue`）
