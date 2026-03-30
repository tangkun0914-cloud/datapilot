# StatsCards - 告警统计卡片组

告警列表顶部的统计概览卡片行，展示各维度告警计数指标。支持点击选中态联动列表筛选。

## 截图

访问 `/design` → 监控运维 Tab → StatsCards 查看在线预览。

## 用法

```vue
<template>
  <StatsCards
    :cards="statsCards"
    :activeIndex="currentIndex"
    @select="handleSelect"
  />
</template>

<script setup>
import StatsCards from '@/pages/Monitoring/AlertList/StatsCards.vue'

const statsCards = [
  { label: '我的待处理', value: 5 },
  { label: '我的新增', value: 2 },
  { label: '全部待处理', value: 18 },
  { label: '今日新增', value: 7 },
]
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| cards | Array | 否 | `[]` | 卡片数组，每项含 `{ label: String, value: Number }` |
| activeIndex | Number | 否 | `-1` | 当前选中卡片索引，-1 表示无选中 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| select | `index: Number` | 点击卡片时触发，传递卡片索引 |

## 使用页面

- 告警事件列表 `/monitoring/alerts`（`AlertList/index.vue`）
