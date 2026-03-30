/**
 * 监控运维模块 - API 封装（当前走 mock 数据）
 */
import {
  alertStats,
  alertList,
  notifyStrategyList,
  filterOptions,
} from '@/mock/Monitoring/monitoring.js'

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAlertStats() {
  await delay()
  return { ...alertStats }
}

export async function getAlertList(params = {}) {
  await delay()
  let list = [...alertList]

  if (params.source) {
    list = list.filter((item) => item.source === params.source)
  }
  if (params.status && params.status.length > 0) {
    const statusMap = {
      '触发中': 'firing',
      '处理中': 'acked',
      '已解决': 'resolved',
      '已屏蔽': 'silenced',
      '已转交': 'transferred',
      '误报': 'falsePositive'
    }
    const targetStatuses = params.status.map(s => statusMap[s] || s)
    list = list.filter((item) => targetStatuses.includes(item.status))
  }
  if (params.severity) {
    list = list.filter((item) => item.severity === params.severity)
  }
  if (params.monitorEvent) {
    list = list.filter((item) => item.monitorEvent === params.monitorEvent)
  }
  if (params.eventId) {
    list = list.filter((item) => item.id.includes(params.eventId))
  }
  if (params.taskName) {
    list = list.filter((item) => item.title.includes(params.taskName))
  }
  if (params.tableName) {
    list = list.filter((item) => item.title.includes(params.tableName))
  }
  if (params.owner) {
    list = list.filter((item) => item.owner === params.owner)
  }
  if (params.operator) {
    list = list.filter((item) => (item.operator ?? '-') === params.operator)
  }

  return { total: list.length, list }
}

export async function getAlertDetail(eventId) {
  await delay()
  return alertList.find((item) => item.id === eventId) || null
}

export async function getQualityRuleDetails(eventId) {
  await delay()
  const alert = alertList.find(a => a.id === eventId)
  
  if (eventId === 'Q-2003') {
    return [
      {
        ruleName: 'user_id非空校验',
        field: 'user_id',
        collectedValue: '-',
        baseValue: '-',
        threshold: '= 0',
        status: 'failed',
      }
    ]
  }

  if (alert && alert.severity === 'ERROR') {
    // ERROR 级别：单条强规则数据
    return [
      {
        ruleName: 'order_amount空值校验',
        field: 'order_amount',
        collectedValue: '582',
        baseValue: '-',
        threshold: '= 0',
        status: 'alert',
      }
    ]
  } else {
    // WARN 级别：多条弱规则数据（模拟包含运行失败、告警等不同状态）
    return [
      {
        ruleName: 'ext_json解析校验',
        field: 'ext_json',
        collectedValue: '-',
        baseValue: '-',
        threshold: '-',
        status: 'failed', // 运行失败
      },
      {
        ruleName: 'device_id空值校验',
        field: 'device_id',
        collectedValue: '1500',
        baseValue: '-',
        threshold: '< 1000',
        status: 'alert', // 告警
      },
      {
        ruleName: '行为日志条数波动校验',
        field: 'log_count',
        collectedValue: '-45%',
        baseValue: '1500000',
        threshold: '> -20%',
        status: 'alert',
      }
    ]
  }
}

export async function getNotifyStrategyList() {
  await delay()
  return [...notifyStrategyList]
}

export async function getFilterOptions() {
  await delay()
  return { ...filterOptions }
}

export async function claimAlert(eventId) {
  await delay(500)
  return { success: true }
}

export async function resolveAlert(eventId, payload) {
  await delay(500)
  return { success: true }
}

export async function transferAlert(eventId, payload) {
  await delay(500)
  return { success: true }
}

export async function silenceAlert(eventId, payload) {
  await delay(500)
  return { success: true }
}

export async function markFalsePositive(eventId, payload) {
  await delay(500)
  return { success: true }
}
