<template>
  <div class="timeline-demo">
    <div class="demo-intro">
      <p>
        步骤数据由
        <code>src/pages/Monitoring/AlertDetail/alertProgressTimelineScenarios.js</code>
        统一维护，与原型
        <strong>监控事件详情页进度补充.html</strong>、
        <strong>监控事件详情页进度补充_系统恢复.html</strong> 对齐。
      </p>
      <ul class="demo-api">
        <li><code>buildTimelineStepsFromAlert(alert)</code> — 详情抽屉按告警自动匹配</li>
        <li><code>getTimelineStepsForScenario(scenarioId, ctx)</code> — 按场景 ID 取步骤</li>
        <li><code>TimelineScenarioId</code> — 场景常量</li>
      </ul>
    </div>

    <div
      v-for="block in scenarioBlocks"
      :key="block.id"
      class="scenario-card"
    >
      <h3 class="scenario-title">{{ block.title }}</h3>
      <code class="scenario-id">{{ block.id }}</code>
      <div class="scenario-preview">
        <ProgressTimeline :steps="block.steps" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressTimeline from '@/pages/Monitoring/AlertDetail/ProgressTimeline.vue'
import {
  TimelineScenarioId,
  getTimelineStepsForScenario,
} from '@/pages/Monitoring/AlertDetail/alertProgressTimelineScenarios.js'

/** 演示用上下文（与原型示例时间一致风格） */
const baseCtx = {
  triggerTime: '2026-03-19 10:03:19',
  resolveTime: '2026-03-19 10:15:00',
  claimTime: '2026-03-19 10:05:22',
  notifyCount: 1,
  operator: '王蕊(ruiwang1)',
  owner: '李四(lisi)',
  transferFrom: '韩冬(donghan)',
  transferTo: '师建伟(jianweishi)',
  transferTime: '-',
  silenceUntil: '2026-03-20 08:00:00',
  upgradeInfo: '王蕊(ruiwang1)',
  upgradeTime: '2026-03-19 10:15:00',
  silenceTimeRange: '10:00:00 - 12:00:00',
  operatorBeforeFp: '王蕊(ruiwang1)',
}

const scenarioBlocks = computed(() => {
  const rows = [
    {
      id: TimelineScenarioId.FIRE_PENDING,
      title: '场景一：触发中 - 待认领',
      ctx: { ...baseCtx, notifyCount: 1 },
    },
    {
      id: TimelineScenarioId.ACKED_PROCESSING,
      title: '场景二：已认领 - 处理中',
      ctx: baseCtx,
    },
    {
      id: TimelineScenarioId.RESOLVED_MANUAL_WITH_ACK,
      title: '场景三：已解决（人工，含认领）',
      ctx: baseCtx,
    },
    {
      id: TimelineScenarioId.RESOLVED_MANUAL_NO_ACK,
      title: '场景三变体：已解决（人工，无认领信息）',
      ctx: { ...baseCtx, operator: '-' },
    },
    {
      id: TimelineScenarioId.SILENCED,
      title: '场景四：已屏蔽',
      ctx: baseCtx,
    },
    {
      id: TimelineScenarioId.TRANSFERRED,
      title: '已转交',
      ctx: baseCtx,
    },
    {
      id: TimelineScenarioId.FALSE_POSITIVE_DIRECT,
      title: '场景五：直接误报',
      ctx: { ...baseCtx, operator: '张伟(zhangwei02)', resolveTime: '2026-03-19 10:08:30' },
    },
    {
      id: TimelineScenarioId.FALSE_POSITIVE_AFTER_ACK,
      title: '场景六：认领后误报',
      ctx: {
        ...baseCtx,
        operator: '李四(lisi03)',
        operatorBeforeFp: '王蕊(ruiwang1)',
        resolveTime: '2026-03-19 10:25:00',
      },
    },
    {
      id: TimelineScenarioId.FIRING_SILENCED,
      title: '场景七：触发中 - 已静默',
      ctx: baseCtx,
    },
    {
      id: TimelineScenarioId.NOTIFY_ESCALATION,
      title: '场景八：通知升级',
      ctx: { ...baseCtx, notifyCount: 3 },
    },
    {
      id: TimelineScenarioId.SYSTEM_RECOVERY_SINGLE,
      title: '系统恢复：单次通知 → 自动恢复',
      ctx: { ...baseCtx, notifyCount: 1, owner: '李四(lisi)' },
    },
    {
      id: TimelineScenarioId.SYSTEM_RECOVERY_MULTI,
      title: '系统恢复：多次通知 → 自动恢复',
      ctx: { ...baseCtx, notifyCount: 2, owner: '李四(lisi)' },
    },
  ]

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    steps: getTimelineStepsForScenario(r.id, r.ctx),
  }))
})
</script>

<style scoped>
.timeline-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
}

.demo-intro {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.demo-intro p {
  margin: 0 0 10px;
}

.demo-api {
  margin: 0;
  padding-left: 18px;
}

.demo-api li {
  margin-bottom: 4px;
}

.demo-intro code,
.scenario-id {
  font-size: 12px;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.scenario-card {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.scenario-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.scenario-id {
  display: inline-block;
  margin-bottom: 12px;
  color: #64748b;
}

.scenario-preview {
  overflow-x: auto;
  padding-top: 4px;
}
</style>
