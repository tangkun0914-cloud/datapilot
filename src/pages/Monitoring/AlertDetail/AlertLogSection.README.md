# AlertLogSection - 告警日志片段

根据告警类型智能提取并展示关键日志片段，提供复制和放大（全屏查看完整日志）功能。

## 截图

访问 `/design` → 监控运维 Tab → AlertLogSection 查看在线预览。

## 用法

```vue
<template>
  <AlertLogSection :alert="alertItem" />
</template>

<script setup>
import AlertLogSection from '@/pages/Monitoring/AlertDetail/AlertLogSection.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| alert | Object | 是 | - | 告警对象，需包含 `monitorEvent`, `source`, `logSnippet`, `fullLog` 等字段 |

## 日志提取规则

| monitorEvent | 提取逻辑 |
|------|------|
| 质量监控（source=质量监控） | 直接展示 `logSnippet` |
| 离线SLA完成超时 | 生成 SLA 摘要：已运行时长 + 当前状态 |
| 离线SLA启动超时 | 生成 SLA 摘要：已超时时长 + 当前状态 |
| 离线任务失败 | 从 `fullLog` 反向搜索 ERROR/Exception/FAILED 等关键词，取前3行 + 后10行；无匹配则取末尾10行 |
| 离线任务超时 | 取 `fullLog` 末尾 30 行 |

## 使用页面

- 告警详情抽屉 `AlertDetailDrawer.vue`
- 告警卡片 `AlertCard.vue`（卡片底部日志摘要）
