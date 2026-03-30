# RuleDetailTable - 质量规则明细表

展示质量监控告警的规则检测明细，使用 Ant Design Table 组件渲染。仅在告警来源为「质量监控」时使用。

## 截图

访问 `/design` → 监控运维 Tab → RuleDetailTable 查看在线预览。

## 用法

```vue
<template>
  <RuleDetailTable :rules="qualityRules" />
</template>

<script setup>
import RuleDetailTable from '@/pages/Monitoring/AlertDetail/RuleDetailTable.vue'

const qualityRules = [
  {
    ruleName: '表行数波动',
    field: 'row_count',
    collectedValue: '1200',
    baseValue: '10000',
    threshold: '±20%',
    status: 'alert',
  },
]
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| rules | Array | 否 | `[]` | 规则数组，为空时组件自动隐藏 |

### Rule 对象字段

| 字段 | 类型 | 说明 |
|------|------|------|
| ruleName | String | 规则名称 |
| field | String | 监控字段名 |
| collectedValue | String | 本次采集值，非 `-` 时标橙色加粗 |
| baseValue | String | 基准值 |
| threshold | String | 阈值范围 |
| status | String | `alert`(告警/红标签)、`failed`(运行失败/橙标签)、`normal`(正常/绿标签) |

## 表格列

规则名称 | 监控字段 | 采集值 | 基准值 | 阈值范围 | 状态

## 使用页面

- 告警详情抽屉 `AlertDetailDrawer.vue`（仅 `source === '质量监控'` 时渲染）
