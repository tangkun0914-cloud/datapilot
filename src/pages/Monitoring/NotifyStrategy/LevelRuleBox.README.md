# LevelRuleBox - 告警等级通知规则配置块

单个告警等级（ERROR/WARN）的通知接收人和渠道配置面板。包含「任务负责人」「指定人员」「On-call 值班」三组独立开关 + 渠道选择，供 CreateStrategy 按等级复用。

## 截图

访问 `/design` → 监控运维 Tab → LevelRuleBox 查看在线预览。

## 用法

```vue
<template>
  <LevelRuleBox
    level="ERROR"
    :rules="form.errorRules"
    :userOptions="userOptions"
    :oncallOptions="oncallGroupOptions"
  />
</template>

<script setup>
import LevelRuleBox from '@/pages/Monitoring/NotifyStrategy/LevelRuleBox.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| level | String | 是 | - | `'ERROR'` 或 `'WARN'`，决定标题背景色和标签 |
| rules | Object | 是 | - | 规则对象，含 `owner`/`specific`/`oncall` 三组，每组含 `enabled`、`channels`、`users`/`groups` |
| userOptions | Array | 否 | `[]` | 人员选项 `[{ value, label }]` |
| oncallOptions | Array | 否 | `[]` | 值班组选项 `[{ value, label }]` |

## 主题色

| level | 头部背景 | 标签色 |
|-------|----------|--------|
| ERROR | `#fff1f0` | `#ff4d4f` 红 |
| WARN | `#fffbe6` | `#fa8c16` 橙 |

## 使用页面

- 新建通知策略 `NotifyStrategy/CreateStrategy.vue`
