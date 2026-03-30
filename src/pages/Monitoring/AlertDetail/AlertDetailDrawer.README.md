# AlertDetailDrawer - 告警详情抽屉

右侧 900px 宽度滑出抽屉，展示完整的告警详情信息。包含标题行（等级标签 + 告警标题 + 复制 + 状态徽章）、基础属性表格、水平进度时间线、质量规则明细表（仅质量监控来源）、告警日志片段，以及底部操作按钮栏。

## 截图

访问 `/design` → 监控运维 Tab → AlertDetailDrawer 查看在线预览。

## 用法

```vue
<template>
  <AlertDetailDrawer
    :open="drawerOpen"
    :alert="currentAlert"
    @close="drawerOpen = false"
    @action="handleAction"
  />
</template>

<script setup>
import AlertDetailDrawer from '@/pages/Monitoring/AlertDetail/AlertDetailDrawer.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| open | Boolean | 否 | `false` | 控制抽屉显示/隐藏 |
| alert | Object | 否 | `null` | 告警对象，null 时不渲染内容。数据结构见 `src/mock/monitoring.js` |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| close | - | 关闭抽屉 |
| action | `type: String, alert: Object` | 操作按钮点击。`type` 值：`claim`/`silence`/`resolve`/`transfer`/`falsePositive` |

## 内部逻辑

- 根据 `alert.status` 动态生成时间线步骤（firing/acked/silenced/transferred/resolved/falsePositive 各不同）
- 根据 `alert.source` 判断是否为质量监控，动态显示质量规则明细表或调度信息
- 状态徽章颜色：firing(红)、acked(蓝)、silenced(紫)、transferred(青)、resolved(绿)、falsePositive(橙)
- 抽屉加了 `marginTop: 64px` 避免遮挡顶部导航

## 子依赖

- `ProgressTimeline`：水平进度时间线
- `AlertLogSection`：日志片段展示
- `RuleDetailTable`：质量规则明细表

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
