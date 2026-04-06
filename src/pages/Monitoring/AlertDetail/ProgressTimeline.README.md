# ProgressTimeline - 水平进度时间线

展示告警生命周期各阶段的水平时间线，支持 completed/current/pending 三种步骤状态，以及 warning 特殊图标色（用于特殊强调）。

## 场景与步骤数据

各业务场景下的 `steps` 结构已集中在 **`alertProgressTimelineScenarios.js`**（与原型 `监控事件详情页进度补充*.html` 对齐），提供：

- `buildTimelineStepsFromAlert(alert)` — 详情抽屉默认使用，按告警字段自动匹配场景  
- `getTimelineStepsForScenario(scenarioId, ctx)` — 按场景 ID 取步骤，便于演示/测试  
- `TimelineScenarioId` — 场景常量枚举  

详见该文件顶部注释。

## 截图

访问 `/design` → 监控运维 Tab → ProgressTimeline 查看在线预览。

## 用法

```vue
<template>
  <ProgressTimeline :steps="steps" />
</template>

<script setup>
import ProgressTimeline from '@/pages/Monitoring/AlertDetail/ProgressTimeline.vue'

const steps = [
  { icon: 'alert-circle', title: '触发告警', time: '2025-03-18 10:00', status: 'completed' },
  { icon: 'send', title: '通知发送', multiTime: ['通知1次', '通知2次'], status: 'completed' },
  { icon: 'user-check', title: '已认领', person: '张三(zhangsan)', status: 'current' },
  { icon: 'check-circle', title: '已解决', status: 'pending' },
]
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| steps | Array | 否 | `[]` | 步骤数组，每项含 `{ icon, title, time?, person?, timeRange?, tag?, multiTime?, status }` |

### Step 对象字段

| 字段 | 类型 | 说明 |
|------|------|------|
| icon | String | 图标名：`alert-circle`/`send`/`user`/`user-check`/`check-circle`/`bell-off`/`warning`/`ban`/`chevrons-up`/`x-circle` |
| title | String | 步骤标题 |
| time | String | 时间文本（可选） |
| person | String | 人员信息（可选） |
| timeRange | String | 时间范围文案（可选，与 person 同级展示，如静默窗口「10:00 - 12:00」） |
| tag | String | 右侧标签文字，如「自动恢复」（可选） |
| multiTime | String[] | 多行时间文本（可选，优先于 time） |
| status | String | `completed`(蓝色实心)/`current`(蓝色实心)/`pending`(灰色空心) |

## 主题色规则

| 条件 | 圆圈色 | 连接线色 |
|------|--------|----------|
| completed/current | `#1890ff`(蓝) | 蓝色实线 |
| icon = warning | `#fa8c16`(橙) | - |
| pending | `#f1f5f9`(灰) | 灰色虚线 |

## 使用页面

- 告警详情抽屉 `AlertDetailDrawer.vue`
- 手机端落地页 `Mobile/AlertLanding.vue`
