/**
 * 告警详情 - 水平进度时间线场景定义
 *
 * 与原型对齐：
 * - dataPilot/监控运维/监控事件详情页进度补充.html（场景 1～8）
 * - dataPilot/监控运维/监控事件详情页进度补充_系统恢复.html（系统自动恢复）
 *
 * 使用方式：
 * - 业务页：`import { buildTimelineStepsFromAlert } from './alertProgressTimelineScenarios.js'`
 * - 指定场景：`import { TimelineScenarioId, getTimelineStepsForScenario } from '...'`
 */

/** @typedef {'completed'|'current'|'pending'} StepStatus */

/**
 * 场景 ID（与设计/原型章节对应，便于文档引用）
 */
export const TimelineScenarioId = Object.freeze({
  /** 场景一：触发中 - 待认领 */
  FIRE_PENDING: 'fire_pending',
  /** 场景二：已认领 - 处理中 */
  ACKED_PROCESSING: 'acked_processing',
  /** 场景三：已解决（人工，含认领） */
  RESOLVED_MANUAL_WITH_ACK: 'resolved_manual_with_ack',
  /** 场景三变体：已解决（人工，无认领信息） */
  RESOLVED_MANUAL_NO_ACK: 'resolved_manual_no_ack',
  /** 场景四：已屏蔽 */
  SILENCED: 'silenced',
  /** 已转交（列表业务状态） */
  TRANSFERRED: 'transferred',
  /** 场景五：直接误报 */
  FALSE_POSITIVE_DIRECT: 'false_positive_direct',
  /** 场景六：认领后误报 */
  FALSE_POSITIVE_AFTER_ACK: 'false_positive_after_ack',
  /** 场景七：触发中 - 已静默（通知静默窗口） */
  FIRING_SILENCED: 'firing_silenced',
  /** 场景八：通知升级 */
  NOTIFY_ESCALATION: 'notify_escalation',
  /** 系统恢复 - 单次通知 */
  SYSTEM_RECOVERY_SINGLE: 'system_recovery_single',
  /** 系统恢复 - 多次通知 */
  SYSTEM_RECOVERY_MULTI: 'system_recovery_multi',
})

function triggerStep(ctx, status = 'completed') {
  return {
    icon: 'alert-circle',
    title: '触发告警',
    time: ctx.triggerTime || '-',
    status,
  }
}

/**
 * @param {object} ctx
 * @param {StepStatus} status
 */
function notifyStep(ctx, status = 'completed') {
  const n = Number(ctx.notifyCount) || 0
  if (n > 1) {
    return {
      icon: 'send',
      title: '通知发送',
      multiTime: Array.from({ length: Math.min(n, 5) }, (_, i) => {
        const base = ctx.triggerTime || '-'
        return `${base} (通知${i + 1}次)`
      }),
      status,
    }
  }
  return {
    icon: 'send',
    title: '通知发送',
    time: ctx.triggerTime || '-',
    status,
  }
}

function hasMeaningfulOperator(op) {
  return Boolean(op && String(op).trim() && String(op).trim() !== '-')
}

/** ---------- 按场景 ID 生成（供组件库 / 测试 / 显式引用） ---------- */

export function scenarioFirePending(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    { icon: 'user', title: '待认领', time: '-', status: 'pending' },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

export function scenarioAckedProcessing(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'user-check',
      title: '已认领',
      person: ctx.operator || ctx.owner,
      time: ctx.claimTime || '-',
      status: 'completed',
    },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

export function scenarioResolvedManualWithAck(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'user-check',
      title: '已认领',
      person: ctx.operator || ctx.owner,
      time: ctx.claimTime || '-',
      status: 'completed',
    },
    {
      icon: 'check-circle',
      title: '已解决',
      tag: '人工恢复',
      person: ctx.operator || ctx.owner,
      time: ctx.resolveTime || '-',
      status: 'completed',
    },
  ]
}

export function scenarioResolvedManualNoAck(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'check-circle',
      title: '已解决',
      tag: '人工恢复',
      person: ctx.operator || ctx.owner,
      time: ctx.resolveTime || '-',
      status: 'completed',
    },
  ]
}

export function scenarioSilenced(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'ban',
      title: '已屏蔽',
      person: ctx.operator || ctx.owner,
      time: ctx.silenceUntil ? `屏蔽至 ${ctx.silenceUntil}` : ctx.resolveTime || '-',
      status: 'completed',
    },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

export function scenarioTransferred(ctx) {
  const person =
    ctx.transferFrom && ctx.transferTo
      ? `${ctx.transferFrom} → ${ctx.transferTo}`
      : ctx.transferTo || ctx.transferFrom || '-'
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'user',
      title: '已转交',
      person,
      time: ctx.transferTime || '-',
      status: 'current',
    },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

export function scenarioFalsePositiveDirect(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'x-circle',
      title: '已误报',
      person: ctx.operator || ctx.owner,
      time: ctx.resolveTime || '-',
      status: 'completed',
    },
  ]
}

export function scenarioFalsePositiveAfterAck(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'user-check',
      title: '已认领',
      person: ctx.operatorBeforeFp || ctx.operator || ctx.owner,
      time: ctx.claimTime || '-',
      status: 'completed',
    },
    {
      icon: 'x-circle',
      title: '已误报',
      person: ctx.operator || ctx.owner,
      time: ctx.resolveTime || '-',
      status: 'completed',
    },
  ]
}

/** 场景七：触发中 + 静默窗口（需 ctx.silenceTimeRange） */
export function scenarioFiringSilenced(ctx) {
  return [
    triggerStep(ctx),
    {
      icon: 'bell-off',
      title: '已静默',
      timeRange: ctx.silenceTimeRange || '-',
      time: ctx.triggerTime || '-',
      status: 'completed',
    },
    { icon: 'user', title: '待认领', time: '-', status: 'pending' },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

/** 场景八：通知升级（5 步） */
export function scenarioNotifyEscalation(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'chevrons-up',
      title: '通知升级',
      person: ctx.upgradeInfo || ctx.upgradeContact || '—',
      time: ctx.upgradeTime || '-',
      status: 'completed',
    },
    { icon: 'user', title: '待认领', time: '-', status: 'pending' },
    { icon: 'check-circle', title: '已解决', time: '-', status: 'pending' },
  ]
}

/**
 * 系统恢复（原型：系统恢复 HTML）
 * notifyStep 会根据 notifyCount 自动输出单次 time 或多条 multiTime
 */
export function scenarioSystemRecovery(ctx) {
  return [
    triggerStep(ctx),
    notifyStep(ctx),
    {
      icon: 'check-circle',
      title: '已解决',
      tag: '自动恢复',
      person: `系统自动恢复 (触发实例用户: ${ctx.owner || '-'})`,
      time: ctx.resolveTime || '-',
      status: 'completed',
    },
  ]
}

export const scenarioSystemRecoverySingle = scenarioSystemRecovery
export const scenarioSystemRecoveryMulti = scenarioSystemRecovery

const SCENARIO_BUILDERS = {
  [TimelineScenarioId.FIRE_PENDING]: scenarioFirePending,
  [TimelineScenarioId.ACKED_PROCESSING]: scenarioAckedProcessing,
  [TimelineScenarioId.RESOLVED_MANUAL_WITH_ACK]: scenarioResolvedManualWithAck,
  [TimelineScenarioId.RESOLVED_MANUAL_NO_ACK]: scenarioResolvedManualNoAck,
  [TimelineScenarioId.SILENCED]: scenarioSilenced,
  [TimelineScenarioId.TRANSFERRED]: scenarioTransferred,
  [TimelineScenarioId.FALSE_POSITIVE_DIRECT]: scenarioFalsePositiveDirect,
  [TimelineScenarioId.FALSE_POSITIVE_AFTER_ACK]: scenarioFalsePositiveAfterAck,
  [TimelineScenarioId.FIRING_SILENCED]: scenarioFiringSilenced,
  [TimelineScenarioId.NOTIFY_ESCALATION]: scenarioNotifyEscalation,
  [TimelineScenarioId.SYSTEM_RECOVERY_SINGLE]: scenarioSystemRecoverySingle,
  [TimelineScenarioId.SYSTEM_RECOVERY_MULTI]: scenarioSystemRecoveryMulti,
}

/**
 * 按场景 ID 生成步骤（用于文档演示、Story、组件库）
 * @param {string} scenarioId - TimelineScenarioId 中的值
 * @param {object} [ctx={}] - 时间、人员等占位上下文
 */
export function getTimelineStepsForScenario(scenarioId, ctx = {}) {
  const fn = SCENARIO_BUILDERS[scenarioId]
  if (!fn) return scenarioFirePending(ctx)
  return fn(ctx)
}

/**
 * 将告警对象转为时间线上下文
 * @param {object} alert
 */
export function alertToTimelineContext(alert) {
  if (!alert) return {}
  return {
    triggerTime: alert.triggerTime,
    resolveTime: alert.resolveTime,
    claimTime: alert.claimTime,
    notifyCount: alert.notifyCount,
    operator: alert.operator,
    owner: alert.owner,
    operatorBeforeFp: alert.operatorBeforeFp,
    transferFrom: alert.transferFrom,
    transferTo: alert.transferTo,
    transferTime: alert.transferTime,
    silenceUntil: alert.silenceUntil,
    recoveryType: alert.recoveryType,
    upgradeInfo: alert.upgradeInfo,
    upgradeContact: alert.upgradeContact,
    upgradeTime: alert.upgradeTime,
    /** 认领后误报：显式 true，或通过业务字段推断 */
    fpAfterAck: alert.fpAfterAck === true,
    /** 场景七：静默时间范围文案 */
    silenceTimeRange: alert.silenceTimeRange,
    /** 强制使用某场景（调试用） */
    timelineScenario: alert.timelineScenario,
  }
}

/**
 * 根据当前告警数据自动匹配原型场景并生成步骤（详情抽屉默认使用）
 * @param {object|null} alert
 */
export function buildTimelineStepsFromAlert(alert) {
  if (!alert) return []

  const ctx = alertToTimelineContext(alert)
  if (ctx.timelineScenario && SCENARIO_BUILDERS[ctx.timelineScenario]) {
    return SCENARIO_BUILDERS[ctx.timelineScenario](ctx)
  }

  const { status, recoveryType } = alert

  if (status === 'resolved' && recoveryType === 'auto') {
    return scenarioSystemRecovery(ctx)
  }

  if (status === 'resolved' && recoveryType === 'manual') {
    return hasMeaningfulOperator(ctx.operator)
      ? scenarioResolvedManualWithAck(ctx)
      : scenarioResolvedManualNoAck(ctx)
  }

  if (status === 'falsePositive') {
    return ctx.fpAfterAck ? scenarioFalsePositiveAfterAck(ctx) : scenarioFalsePositiveDirect(ctx)
  }

  if (status === 'silenced') {
    return scenarioSilenced(ctx)
  }

  if (status === 'transferred') {
    return scenarioTransferred(ctx)
  }

  if (status === 'acked') {
    return scenarioAckedProcessing(ctx)
  }

  if (status === 'firing') {
    if (ctx.silenceTimeRange) {
      return scenarioFiringSilenced(ctx)
    }
    if (ctx.upgradeInfo) {
      return scenarioNotifyEscalation(ctx)
    }
    return scenarioFirePending(ctx)
  }

  return scenarioFirePending(ctx)
}

export default {
  TimelineScenarioId,
  buildTimelineStepsFromAlert,
  getTimelineStepsForScenario,
  alertToTimelineContext,
}
