# FilterSection - 告警筛选区

告警列表顶部的多维度筛选组件。支持来源、任务名/数据表名（根据来源动态切换）、事件ID、监控事件（根据来源自动过滤枚举）、事件状态、告警等级、调度批次日期范围、负责人等条件。内置展开/收起高级筛选。

## 截图

访问 `/design` → 监控运维 Tab → FilterSection 查看在线预览。

## 用法

```vue
<template>
  <FilterSection
    :filterOptions="filterOptions"
    @query="handleQuery"
    @reset="handleReset"
  />
</template>

<script setup>
import FilterSection from '@/pages/Monitoring/AlertList/FilterSection.vue'
import { filterOptions } from '@/mock/Monitoring/monitoring.js'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| filterOptions | Object | 否 | `{ sources: [], events: [], statuses: [], levels: [], owners: [] }` | 筛选项配置，每个字段为 label/value 选项数组 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| query | `formData: Object` | 点击查询按钮时触发，传递当前表单值 |
| reset | - | 点击重置按钮时触发 |

## 内部逻辑

- 当来源选择「数据开发」或「数据集成」时，监控事件枚举自动切换为离线任务类事件
- 当来源选择「质量监控」时，枚举切换为质量监控类事件
- 来源切换时自动清空已选的监控事件值
- 表单字段根据来源动态展示 `taskName`（非质量监控）或 `tableName`（质量监控）

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
