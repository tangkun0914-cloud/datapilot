# CreateStrategy - 新建通知策略抽屉

右侧 800px 抽屉，分三步配置通知策略：基础信息 → 告警通知规则（ERROR/WARN） → 发送策略配置（频次控制、静默时间、通知升级）。

## 截图

访问 `/design` → 监控运维 Tab → CreateStrategy 查看在线预览。

## 用法

```vue
<template>
  <CreateStrategy
    :open="drawerOpen"
    @close="drawerOpen = false"
    @submit="handleSubmit"
  />
</template>

<script setup>
import CreateStrategy from '@/pages/Monitoring/NotifyStrategy/CreateStrategy.vue'
</script>
```

## Props

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| open | Boolean | 否 | `false` | 控制抽屉显示/隐藏 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| close | - | 关闭抽屉 |
| submit | `data: Object` | 提交策略配置，含 name, description, errorRules, warnRules, policies |

## 表单结构

- **Step 1** 基础信息：策略名称（必填）、描述
- **Step 2** 告警通知规则：ERROR 和 WARN 各一组 LevelRuleBox（任务负责人/指定人员/On-call）
- **Step 3** 发送策略配置：
  - 发送频次控制（间隔 + 最大次数）
  - 静默时间（仅 WARN，时段范围）
  - 通知升级（仅 ERROR，多级升级链）

## 子依赖

- `LevelRuleBox`：告警等级通知规则配置块

## 使用页面

- 通知策略列表 `/monitoring/strategies`（`NotifyStrategy/index.vue`）
