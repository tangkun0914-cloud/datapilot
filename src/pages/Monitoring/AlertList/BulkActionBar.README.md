# BulkActionBar - 批量操作悬浮栏

告警列表底部悬浮操作栏，当有告警被勾选时从底部滑入显示。展示已选数量，提供批量认领、误报、屏蔽、转交、已解决和取消操作。

## 截图

访问 `/design` → 监控运维 Tab → BulkActionBar 查看在线预览。

## 用法

```vue
<template>
  <BulkActionBar
    :count="selectedIds.length"
    @bulk="handleBulkAction"
    @cancel="clearSelection"
  />
</template>

<script setup>
import BulkActionBar from '@/pages/Monitoring/AlertList/BulkActionBar.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| count | Number | 否 | `0` | 当前勾选数量，为 0 时自动隐藏 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| bulk | `action: String` | 批量操作，action: `claim`/`falsePositive`/`silence`/`transfer`/`resolve` |
| cancel | - | 取消全部勾选 |

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
