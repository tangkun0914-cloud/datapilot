/**
 * 监控运维 - 影响评估 Mock（Phase 3）
 * 与 PRD/SDD 对齐：开发/集成类 rootCause 恒为 null。
 * DQC：「触发异常阈值」展开下游推演与实例列表；「运行失败」默认仅根节点；Q-2002/Q-2003 为演示增加下游依赖 Mock。
 */
import { alertList } from '@/mock/Monitoring/monitoring.js'

/** @param {string} source */
export function resolveAlertSource(source) {
  if (source === '数据质量' || source === '质量监控') return 'quality'
  if (source === '数据开发') return 'dev'
  if (source === '数据集成') return 'integration'
  return 'dev'
}

/** 质量监控 - 规则/任务执行失败（未进入阈值判定），与「触发异常阈值」互斥 */
export function isQualityRunFailedEvent(alert) {
  const ev = alert?.monitorEvent || ''
  return ev.includes('运行失败')
}

/** 质量监控 - 执行成功但结果触发异常阈值 */
export function isQualityThresholdEvent(alert) {
  const ev = alert?.monitorEvent || ''
  return ev.includes('触发异常阈值')
}

/** 运行失败类告警中，仍展示下游依赖拓扑的演示事件 ID（Mock，便于联调 DAG） */
export const QUALITY_RUN_FAIL_DOWNSTREAM_DEMO_IDS = new Set(['Q-2002', 'Q-2003'])

/** @param {object} alert */
export function isQualityRunFailedDownstreamDemo(alert) {
  return isQualityRunFailedEvent(alert) && QUALITY_RUN_FAIL_DOWNSTREAM_DEMO_IDS.has(String(alert?.id))
}

/**
 * 优先使用列表/抽屉传入的告警快照（与当前行一致），再按 id 查 mock 列表，避免回退到首条导致拓扑与标题错位。
 * @param {string} eventId
 * @param {object|null|undefined} alertSnapshot
 */
export function resolveAlertForImpact(eventId, alertSnapshot) {
  if (alertSnapshot && String(alertSnapshot.id) === String(eventId)) {
    return alertSnapshot
  }
  const found = alertList.find((a) => a.id === eventId)
  if (found) return found
  if (alertSnapshot) return alertSnapshot
  return alertList[0]
}

/** 根节点 impactStatus：开发/集成用 monitorEvent；质量类须区分「运行失败」与「阈值触发」 */
function rootImpactStatus(alert) {
  if (resolveAlertSource(alert?.source) === 'quality') {
    if (isQualityRunFailedEvent(alert)) return 'failed'
    // 阈值类：拓扑用 dqc_threshold 红顶栏；摘要逻辑仍按「非执行失败」走 qualityThreshold 分支
    if (isQualityThresholdEvent(alert)) return 'dqc_threshold'
    const ev = alert.monitorEvent || ''
    if (ev.includes('失败')) return 'failed'
    return 'failed'
  }
  const ev = alert.monitorEvent || ''
  if (ev.includes('失败')) return 'failed'
  if (ev.includes('超时') || ev.includes('SLA')) return 'timeout'
  if (alert.severity === 'ERROR') return 'failed'
  return 'timeout'
}

function taskNode(partial) {
  return {
    nodeType: 'task',
    isRootCause: false,
    aiTag: null,
    lastRunDuration: '-',
    avgDuration: '42m',
    errorSummary: '',
    region: 'CN',
    ...partial,
  }
}

/**
 * 数据开发/集成：根节点状态文案与 impactStatus（与告警 monitorEvent 对齐，覆盖四类场景）
 * @returns {{ statusText: string, impactStatus: string }}
 */
function devIntegrationRootDisplay(alert) {
  const ev = alert.monitorEvent || ''
  if (ev.includes('SLA启动超时')) {
    return { statusText: 'SLA启动超时', impactStatus: 'timeout' }
  }
  if (ev.includes('SLA完成超时')) {
    return { statusText: 'SLA完成超时', impactStatus: 'timeout' }
  }
  if (ev.includes('离线任务超时')) {
    return { statusText: '运行超时', impactStatus: 'timeout' }
  }
  if (ev.includes('失败')) {
    return { statusText: '运行失败', impactStatus: 'failed' }
  }
  return { statusText: '运行失败', impactStatus: 'failed' }
}

/**
 * L3 下标与 ads_core_dashboard_* 对齐：任务名 + SLA 启动/完成破线（与统计评估卡片、DAG 标签同源）
 * @type {Record<number, { taskName: string, slaStartBreached: boolean, slaFinishBreached: boolean }>}
 */
export const SLA_DASHBOARD_L3_MOCK = {
  1: {
    taskName: 'ads_core_dashboard_1',
    slaStartBreached: true,
    slaFinishBreached: true,
  },
  3: {
    taskName: 'ads_core_dashboard_3',
    slaStartBreached: true,
    slaFinishBreached: false,
  },
  4: {
    taskName: 'ads_core_dashboard_4',
    slaStartBreached: false,
    slaFinishBreached: true,
  },
  16: {
    taskName: 'ads_core_dashboard_16',
    slaStartBreached: true,
    slaFinishBreached: true,
  },
  17: {
    taskName: 'ads_core_dashboard_17',
    slaStartBreached: false,
    slaFinishBreached: true,
  },
  19: {
    taskName: 'ads_core_dashboard_19',
    slaStartBreached: true,
    slaFinishBreached: false,
  },
}

/**
 * L2 SLA Mock：l2_1/l2_2 为完成侧「SLA完成风险」；l2_4 为「SLA双重破线」
 * @type {Record<number, { slaStartBreached: boolean, slaFinishBreached: boolean, slaFinishRiskLabel?: boolean }>}
 */
export const SLA_L2_FINISH_RISK_BY_INDEX = {
  1: { slaStartBreached: false, slaFinishBreached: true, slaFinishRiskLabel: true },
  2: { slaStartBreached: false, slaFinishBreached: true, slaFinishRiskLabel: true },
  4: { slaStartBreached: true, slaFinishBreached: true },
}

const L3_LEAF_IDS = [
  ...Array.from({ length: 10 }, (_, i) => `impact_l3_${i + 1}`),
  'impact_l3_16',
  'impact_l3_17',
  'impact_l3_19',
]

/** 开发/集成 Mock：父 → 直接子 id（用于按需展开一层），3 层共 23 个下游节点 */
export const DEV_IMPACT_CHILDREN = {
  impact_root: ['impact_l1_1', 'impact_l1_2', 'impact_l1_3'],
  impact_l1_1: ['impact_l2_1', 'impact_l2_2'],
  impact_l1_2: ['impact_l2_3', 'impact_l2_4', 'impact_l2_5'],
  impact_l1_3: ['impact_l2_6', 'impact_l2_7'],
  impact_l2_1: ['impact_l3_1', 'impact_l3_2'],
  impact_l2_2: ['impact_l3_3'],
  impact_l2_3: ['impact_l3_4', 'impact_l3_5'],
  impact_l2_4: ['impact_l3_6'],
  impact_l2_5: ['impact_l3_7'],
  impact_l2_6: ['impact_l3_8', 'impact_l3_9'],
  impact_l2_7: ['impact_l3_10', 'impact_l3_16', 'impact_l3_17', 'impact_l3_19'],
  ...L3_LEAF_IDS.reduce((acc, id) => ({ ...acc, [id]: [] }), {}),
}

/** DQC 下游逻辑任务 id 顺序（与 QUAL_IMPACT_CHILDREN 一致，供实例列表 taskId 映射） */
export const QUAL_MOCK_DOWNSTREAM_IDS = [
  'impact_q_l1_1',
  'impact_q_l1_2',
  'impact_q_l1_3',
  'impact_q_l2_1',
  'impact_q_l2_2',
  'impact_q_l2_3',
  'impact_q_l2_4',
  'impact_q_l2_5',
  'impact_q_l3_1',
  'impact_q_l3_2',
  'impact_q_l3_3',
  'impact_q_l3_4',
  'impact_q_l3_5',
  'impact_q_l3_6',
  'impact_q_l3_7',
  'impact_q_l3_8',
]

const QUAL_L3_IDS = QUAL_MOCK_DOWNSTREAM_IDS.filter((id) => id.includes('_l3_'))

/** 质量 Mock：3 层共 16 个下游逻辑节点（按需 +/− 展开） */
export const QUAL_IMPACT_CHILDREN = {
  impact_dqc_root: ['impact_q_l1_1', 'impact_q_l1_2', 'impact_q_l1_3'],
  impact_q_l1_1: ['impact_q_l2_1', 'impact_q_l2_2'],
  impact_q_l1_2: ['impact_q_l2_3', 'impact_q_l2_4'],
  impact_q_l1_3: ['impact_q_l2_5'],
  impact_q_l2_1: ['impact_q_l3_1', 'impact_q_l3_2'],
  impact_q_l2_2: ['impact_q_l3_3'],
  impact_q_l2_3: ['impact_q_l3_4', 'impact_q_l3_5'],
  impact_q_l2_4: ['impact_q_l3_6'],
  impact_q_l2_5: ['impact_q_l3_7', 'impact_q_l3_8'],
  ...QUAL_L3_IDS.reduce((acc, id) => ({ ...acc, [id]: [] }), {}),
}

/**
 * @param {object} alert
 * @returns {Record<string, string[]>}
 */
export function getImpactBranchChildrenMap(alert) {
  if (resolveAlertSource(alert?.source) !== 'quality') return DEV_IMPACT_CHILDREN
  if (isQualityRunFailedEvent(alert)) {
    if (isQualityRunFailedDownstreamDemo(alert)) return QUAL_IMPACT_CHILDREN
    return { impact_dqc_root: [] }
  }
  return QUAL_IMPACT_CHILDREN
}

/**
 * 按 id 构造任务节点（供逐层展开时插入）
 * @param {string} nodeId
 * @param {object} alert
 */
export function createImpactTaskNodeById(nodeId, alert) {
  const planBase = alert.scheduleBatch || alert.triggerTime || '-'

  // 动态生成 DEV 场景层级节点（含与 SLA 列表对齐的 ads_core_dashboard_*）
  if (nodeId.startsWith('impact_l')) {
    const match = nodeId.match(/impact_l(\d+)_(\d+)/)
    if (match) {
      const depth = parseInt(match[1], 10)
      const idx = parseInt(match[2], 10)
      const isCore = depth === 3 && (idx % 3 === 0) // 第 3 层的部分节点作为核心任务
      const owners = ['张三(zhangsan)', '李四(lisi)', '王五(wangwu)', '赵六(zhaoliu)']
      const prefixes = ['', 'dwd_', 'dws_', 'ads_']
      const slaL3 = depth === 3 ? SLA_DASHBOARD_L3_MOCK[idx] : null
      const slaL2 = depth === 2 ? SLA_L2_FINISH_RISK_BY_INDEX[idx] : null
      const taskName = slaL3?.taskName || `${prefixes[depth]}business_model_l${depth}_${idx}`
      const slaStartBreached =
        slaL3?.slaStartBreached === true || slaL2?.slaStartBreached === true
      const slaFinishBreached =
        slaL3?.slaFinishBreached === true || slaL2?.slaFinishBreached === true
      const slaFinishRiskLabel = slaL2?.slaFinishRiskLabel === true
      const hasSlaBreachRisk = slaStartBreached || slaFinishBreached

      const devStatuses =
        depth === 1
          ? ['waiting', 'running', 'success']
          : depth === 2
            ? ['waiting', 'running', 'success', 'failed', 'waiting', 'running', 'success']
            : ['not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated']
      const impactStatus = devStatuses[idx % devStatuses.length]
      const hasEnd = impactStatus === 'success' || impactStatus === 'failed'
      return taskNode({
        id: nodeId,
        taskName,
        taskType: 'SPARK_SQL',
        owner: owners[idx % owners.length],
        impactStatus,
        startTime: impactStatus === 'not_generated' ? '-' : planBase,
        endTime: hasEnd ? planBase : '-',
        depth: depth,
        isCore: isCore,
        hasSlaBreachRisk,
        slaStartBreached,
        slaFinishBreached,
        ...(slaFinishRiskLabel ? { slaFinishRiskLabel: true } : {}),
      })
    }
  }

  /** DQC 下游：阈值推演；运行失败默认未推演；Q-2002/Q-2003 演示依赖链（与 ERROR 强阻断下游表现一致，无 isPolluted） */
  if (nodeId.startsWith('impact_q_l')) {
    const match = nodeId.match(/impact_q_l(\d+)_(\d+)/)
    if (match) {
      const depthEarly = parseInt(match[1], 10)
      const idxEarly = parseInt(match[2], 10)
      const prefixesEarly = ['', 'dwd_', 'dws_', 'ads_']
      const skipDownstreamMock =
        (isQualityRunFailedEvent(alert) || !isQualityThresholdEvent(alert)) &&
        !isQualityRunFailedDownstreamDemo(alert)
      if (skipDownstreamMock) {
        return taskNode({
          id: nodeId,
          taskName: `${prefixesEarly[depthEarly]}qc_chain_l${depthEarly}_${idxEarly}`,
          taskType: 'SPARK_SQL',
          owner: '—',
          impactStatus: 'pending',
          statusText: '未推演',
          startTime: '-',
          endTime: '-',
          depth: depthEarly,
          isCore: false,
          region: 'CN',
        })
      }
      const depth = parseInt(match[1], 10)
      const idx = parseInt(match[2], 10)
      const isError = alert.severity === 'ERROR'
      const owners = ['张三(zhangsan)', '李四(lisi)', '王五(wangwu)', '赵六(zhaoliu)', '师建伟(jianweishi)']
      const prefixes = ['', 'dwd_', 'dws_', 'ads_']
      const taskName = `${prefixes[depth]}qc_chain_l${depth}_${idx}`
      const isCore = depth >= 2 && idx % 3 === 1
      const warnStatuses = ['success', 'running', 'failed', 'waiting']
      const impactStatus = isError ? 'waiting' : warnStatuses[idx % warnStatuses.length]
      const isPolluted = !isError
      return taskNode({
        id: nodeId,
        taskName,
        taskType: 'SPARK_SQL',
        owner: owners[idx % owners.length],
        impactStatus,
        isPolluted,
        startTime: planBase,
        endTime: (impactStatus === 'running' || impactStatus === 'waiting') ? '-' : planBase,
        depth,
        isCore,
        region: 'CN',
      })
    }
  }

  const builders = {
    impact_dwd_1: () =>
      taskNode({
        id: 'impact_dwd_1',
        taskName: 'dwd_order_detail_di',
        taskType: 'HIVE2STARROCKS',
        owner: '张三(zhangsan)',
        impactStatus: 'waiting',
        planTime: planBase,
        depth: 1,
        isCore: true,
      }),
    impact_dwd_2: () =>
      taskNode({
        id: 'impact_dwd_2',
        taskName: 'dwd_payment_merge_di',
        taskType: 'SPARK_SQL',
        owner: '李四(lisi)',
        impactStatus: 'waiting',
        planTime: planBase,
        depth: 1,
      }),
    impact_downstream_not_gen: () =>
      taskNode({
        id: 'impact_downstream_not_gen',
        taskName: 'ods_future_partition_di',
        taskType: 'SPARK_SQL',
        owner: alert.owner || '王蕊(ruiwang1)',
        impactStatus: 'not_generated',
        statusText: '未生成',
        planTime: '-',
        depth: 1,
      }),
    impact_mid_1: () =>
      taskNode({
        id: 'impact_mid_1',
        taskName: 'dwd_trade_union_di',
        taskType: 'HIVE2STARROCKS',
        owner: '李四(lisi)',
        impactStatus: 'waiting',
        planTime: '2026-03-19 09:00:00',
        depth: 2,
        isCore: true,
      }),
    impact_mid_2: () =>
      taskNode({
        id: 'impact_mid_2',
        taskName: 'dws_trade_agg_1d',
        taskType: 'SPARK_SQL',
        owner: '张三(zhangsan)',
        impactStatus: 'waiting',
        planTime: '2026-03-19 09:30:00',
        depth: 3,
        isCore: true,
        aiTag: 'high_priority_business',
      }),
    impact_dws_1: () =>
      taskNode({
        id: 'impact_dws_1',
        taskName: 'dws_user_order_1d',
        taskType: 'HIVE2STARROCKS',
        owner: '张三(zhangsan)',
        impactStatus: 'waiting',
        planTime: '2026-03-19 09:15:00',
        depth: 2,
      }),
  }

  const fn = builders[nodeId]
  if (!fn) return null
  return fn()
}

/**
 * 从当前已加载节点出发，按父→子规范 BFS 物化整张 DAG（用于「核心链路」一键穿透：在过滤前拿到全量节点/边）
 * 已存在于 topology.nodes 的节点会保留原对象引用，避免丢失交互态。
 * @param {object} topology
 * @param {object} alert
 * @param {Record<string, string[]>|null|undefined} [branchChildrenOf] 传入则优先使用（如接口下发的 lazyChildrenOf）；否则 Mock 下用规范表
 */
export function materializeFullImpactTopology(topology, alert, branchChildrenOf) {
  if (!topology?.nodes?.length) return topology
  const map =
    branchChildrenOf != null && typeof branchChildrenOf === 'object'
      ? branchChildrenOf
      : getImpactBranchChildrenMap(alert)
  const nodeById = new Map(topology.nodes.map((n) => [n.id, n]))
  const edges = [...(topology.edges || [])]
  const edgeKey = (s, t) => `${s}->${t}`
  const edgeSeen = new Set(edges.map((e) => edgeKey(e.source, e.target)))

  const root =
    topology.nodes.find((n) => n.isCurrentNode) || topology.nodes[0]
  if (!root) return topology

  const queue = [root.id]
  const queued = new Set(queue)

  while (queue.length) {
    const id = queue.shift()
    const childIds = map[id] || []
    for (const cid of childIds) {
      if (!nodeById.has(cid)) {
        const created = createImpactTaskNodeById(cid, alert)
        if (created) nodeById.set(cid, created)
      }
      if (nodeById.has(cid)) {
        const k = edgeKey(id, cid)
        if (!edgeSeen.has(k)) {
          edgeSeen.add(k)
          edges.push({ source: id, target: cid, edgeType: 'dependency' })
        }
        if (!queued.has(cid)) {
          queued.add(cid)
          queue.push(cid)
        }
      }
    }
  }

  return {
    ...topology,
    nodes: [...nodeById.values()],
    edges,
  }
}

/**
 * 仅保留「根 → 各核心任务」关键路径上的节点与边（反向从 isCore 沿父边回溯到根）
 * @param {object} topology
 */
export function filterTopologyToCorePaths(topology) {
  if (!topology?.nodes?.length) {
    return topology
  }

  let rawNodes = topology.nodes
  let rawEdges = topology.edges || []

  const coreNodeIds = new Set(rawNodes.filter((n) => n.isCore).map((n) => n.id))
  const rootNode = rawNodes.find((n) => n.isCurrentNode)
  const rootId = rootNode ? rootNode.id : rawNodes[0]?.id

  const reverseAdj = new Map()
  for (const e of rawEdges) {
    if (e.edgeType === 'penetrate') continue
    if (!reverseAdj.has(e.target)) reverseAdj.set(e.target, [])
    reverseAdj.get(e.target).push(e.source)
  }

  const keepNodeIds = new Set(coreNodeIds)
  if (rootId) keepNodeIds.add(rootId)

  const queue = Array.from(coreNodeIds)
  const visited = new Set(coreNodeIds)

  while (queue.length) {
    const currId = queue.shift()
    const parents = reverseAdj.get(currId) || []
    for (const parentId of parents) {
      keepNodeIds.add(parentId)
      if (!visited.has(parentId)) {
        visited.add(parentId)
        queue.push(parentId)
      }
    }
  }

  rawNodes = rawNodes.filter((n) => keepNodeIds.has(n.id))
  rawEdges = rawEdges.filter(
    (e) => keepNodeIds.has(e.source) && keepNodeIds.has(e.target)
  )

  return {
    ...topology,
    nodes: rawNodes,
    edges: rawEdges,
  }
}

/**
 * 展开 parent 的一层直接子节点（已在图中的子 id 会跳过）
 */
export function expandImpactDirectChildren(topology, parentId, alert) {
  if (!topology?.nodes?.length) return topology
  const map = getImpactBranchChildrenMap(alert)
  const childIds = map[parentId] || []
  if (!childIds.length) return topology

  const visible = new Set(topology.nodes.map((n) => n.id))
  const toAdd = childIds.filter((id) => !visible.has(id))
  if (!toAdd.length) return topology

  const newNodes = []
  for (const id of toAdd) {
    const node = createImpactTaskNodeById(id, alert)
    if (node) newNodes.push(node)
  }
  const newEdges = newNodes.map((n) => ({
    source: parentId,
    target: n.id,
    edgeType: 'dependency',
  }))

  return {
    ...topology,
    nodes: [...topology.nodes, ...newNodes],
    edges: [...(topology.edges || []), ...newEdges],
  }
}

function devIntegrationRootTask(alert) {
  const rootId = 'impact_root'
  const rootUi = devIntegrationRootDisplay(alert)
  const planBase = alert.scheduleBatch || alert.triggerTime || '-'
  const rootTaskType = alert.source === '数据集成' ? 'HIVE2STARROCKS' : 'SPARK_SQL'
  return taskNode({
    id: rootId,
    taskName: alert.title,
    taskType: rootTaskType,
    owner: alert.owner || '-',
    impactStatus: rootUi.impactStatus,
    statusText: rootUi.statusText,
    startTime: planBase, // 根节点有开始时间
    endTime: '-', // 根节点没有结束时间
    isCurrentNode: true,
    isRootCause: false,
    depth: 0,
    isCore: true,
    errorSummary: (alert.logSnippet || '').slice(0, 80),
  })
}

/** 仅告警根节点；下游由画布 +/− 逐层展开 */
export function buildDevIntegrationRootTopology(alert) {
  const alertSource = resolveAlertSource(alert.source)
  const current = devIntegrationRootTask(alert)
  return {
    alertSource,
    currentNode: current,
    rootCause: null,
    nodes: [current],
    edges: [],
  }
}

/**
 * DQC：初始仅根；下游由画布 +/− 逐层展开
 */
export function buildQualityRootTopology(alert) {
  const rootId = 'impact_dqc_root'
  const qPlan = alert.scheduleBatch || alert.triggerTime || '-'
  const runFailed = isQualityRunFailedEvent(alert)
  const threshold = isQualityThresholdEvent(alert)

  /** 阈值根：告警红顶栏（与下游 waiting 橙区分）；运行失败根：同红系更深色 */
  const DQC_RUN_FAIL_RED = '#A8071A'

  let impactStatus = 'failed'
  let statusText = '质量监控异常'
  let statusColor
  if (runFailed) {
    impactStatus = 'failed'
    statusColor = DQC_RUN_FAIL_RED
    statusText = '监控规则运行失败'
  } else if (threshold) {
    impactStatus = 'dqc_threshold'
    statusText =
      alert.severity === 'ERROR' ? '运行成功·已触发异常阈值' : '运行成功·阈值告警(WARN)'
  } else {
    impactStatus = alert.severity === 'ERROR' ? 'failed' : 'delayed'
    statusText = alert.severity === 'ERROR' ? '质量监控异常(ERROR)' : '质量监控告警(WARN)'
  }

  const current = taskNode({
    id: rootId,
    taskName: alert.title,
    taskType: 'DQC',
    owner: alert.owner || '-',
    impactStatus,
    ...(statusColor ? { statusColor } : {}),
    statusText,
    startTime: qPlan,
    endTime: runFailed ? '-' : qPlan,
    isCurrentNode: true,
    isRootCause: true,
    depth: 0,
    isCore: true,
    errorSummary: (alert.logSnippet || '').slice(0, 100),
  })

  return {
    alertSource: 'quality',
    currentNode: current,
    rootCause: null,
    nodes: [current],
    edges: [],
  }
}

/**
 * @param {string} eventId
 * @param {{ depth?: number, coreOnly?: boolean }} [params]
 */
export function mockTopology(eventId, params = {}, alertSnapshot) {
  const alert = resolveAlertForImpact(eventId, alertSnapshot)
  if (alert.source === '数据质量') {
    return buildQualityRootTopology(alert)
  }
  return buildDevIntegrationRootTopology(alert)
}

/** DQC 实例列表展示名，与 createImpactTaskNodeById 中 impact_q_l* 一致 */
function qualityMockTaskDisplayName(taskId) {
  const m = String(taskId).match(/impact_q_l(\d+)_(\d+)/)
  if (!m) return String(taskId)
  const d = parseInt(m[1], 10)
  const i = parseInt(m[2], 10)
  const prefixes = ['', 'dwd_', 'dws_', 'ads_']
  return `${prefixes[d]}qc_chain_l${d}_${i}`
}

function qualityTaskIsCore(taskId) {
  const m = String(taskId).match(/impact_q_l(\d+)_(\d+)/)
  if (!m) return false
  const d = parseInt(m[1], 10)
  const i = parseInt(m[2], 10)
  return d >= 2 && i % 3 === 1
}

/**
 * @param {string} eventId
 */
export function mockSummary(eventId, alertSnapshot) {
  const alert = resolveAlertForImpact(eventId, alertSnapshot)
  const alertSource = resolveAlertSource(alert.source)
  const isQuality = alertSource === 'quality'
  const rootStatus = rootImpactStatus(alert)
  const qualityDownCount = QUAL_MOCK_DOWNSTREAM_IDS.length
  const qualityCoreCount = QUAL_MOCK_DOWNSTREAM_IDS.filter(qualityTaskIsCore).length

  const devIntegrationAi =
    rootStatus === 'timeout'
      ? `当前任务 ${alert.title} 出现运行延迟或 SLA 风险，下游多任务可能处于排队或等待触发状态。其中 2 个核心任务受影响，预计财务日报存在破线风险。建议负责人 ${alert.owner || '相关同学'} 优先确认链路。`
      : `当前任务 ${alert.title} 运行失败，导致下游 7 个任务因依赖缺失无法触发，处于"依赖等待"状态。其中 2 个核心任务受影响，预计财务日报将延迟产出，存在 SLA 破线风险。建议负责人 ${alert.owner || '相关同学'} 协同处理。`

  const qualityRunFailed = isQuality && isQualityRunFailedEvent(alert)
  const qualityRunFailDownstreamDemo = isQuality && isQualityRunFailedDownstreamDemo(alert)
  const qualityThreshold = isQuality && isQualityThresholdEvent(alert)

  let qualityAi = `当前为数据质量类告警，请结合监控事件类型与拓扑核对根因与影响范围。`
  if (qualityRunFailed) {
    qualityAi = `当前为「质量监控 - 运行失败」：监控规则或质检任务在执行过程中失败，尚未进入「指标与阈值」判定链路，因此不按强阻断或污染风险对下游做推演。建议负责人 ${alert.owner || '相关同学'} 优先排查规则配置、引擎日志与运行资源。`
    if (qualityRunFailDownstreamDemo) {
      qualityAi += ` 以下为下游调度依赖链路 Mock 展示（${String(alert.id)}），便于对照拓扑排查可能影响范围；实例状态为演示数据。`
    }
  } else if (qualityThreshold) {
    let ruleContext = ''
    if (eventId === 'Q-2005') {
      ruleContext = '（包含 age_group_coverage、gender_coverage 等 2 个弱规则告警）'
    } else if (eventId === 'Q-2001') {
      ruleContext = '（包含 order_amount空值校验 等 1 个强规则告警）'
    }
    
    if (alert.severity === 'ERROR') {
      qualityAi = `规则已执行完成，但触发异常阈值${ruleContext}（ERROR，强阻断推演）：下游 ${qualityDownCount} 个逻辑任务处于依赖等待，调度挂起；其中 ${qualityCoreCount} 个为核心任务。建议负责人 ${alert.owner || '相关同学'} 优先修复数据或规则并协调下游恢复。`
    } else {
      qualityAi = `规则已执行完成，但触发阈值告警${ruleContext}（WARN，未阻断推演）：下游任务仍在运行，存在数据污染风险（共 ${qualityDownCount} 个逻辑任务受影响，核心任务 ${qualityCoreCount} 个）。建议负责人 ${alert.owner || '相关同学'} 结合「全局影响清单」逐项确认。`
    }
  }

  const devAffectedTasks = []
  let devCoreCount = 0
  const l3Indices = [...Array.from({ length: 10 }, (_, j) => j + 1), 16, 17, 19]
  for (let d = 1; d <= 3; d++) {
    const indices =
      d === 1 ? [1, 2, 3] : d === 2 ? [1, 2, 3, 4, 5, 6, 7] : l3Indices
    for (const i of indices) {
      const isCore = d === 3 && (i % 3 === 0)
      if (isCore) devCoreCount++
      const owners = ['张三(zhangsan)', '李四(lisi)', '王五(wangwu)', '赵六(zhaoliu)']
      const prefixes = ['', 'dwd_', 'dws_', 'ads_']
      const slaL3 = d === 3 ? SLA_DASHBOARD_L3_MOCK[i] : null
      const slaL2 = d === 2 ? SLA_L2_FINISH_RISK_BY_INDEX[i] : null
      const taskName = slaL3?.taskName || `${prefixes[d]}business_model_l${d}_${i}`
      const slaStartBreached =
        slaL3?.slaStartBreached === true || slaL2?.slaStartBreached === true
      const slaFinishBreached =
        slaL3?.slaFinishBreached === true || slaL2?.slaFinishBreached === true
      const slaFinishRiskLabel = slaL2?.slaFinishRiskLabel === true
      const devListStatuses =
        d === 1
          ? ['waiting', 'running', 'success']
          : d === 2
            ? ['waiting', 'running', 'success', 'failed', 'waiting', 'running', 'success']
            : ['not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated', 'success', 'running', 'not_generated']
      devAffectedTasks.push({
        id: `impact_l${d}_${i}`,
        taskName,
        taskType: 'SPARK_SQL',
        owner: owners[i % owners.length],
        impactStatus: devListStatuses[i % devListStatuses.length],
        isCore: isCore,
        hasSlaBreachRisk: slaStartBreached || slaFinishBreached,
        slaStartBreached,
        slaFinishBreached,
        ...(slaFinishRiskLabel ? { slaFinishRiskLabel: true } : {}),
      })
    }
  }

  const base = {
    alertSource,
    aiAnalysis: isQuality ? qualityAi : devIntegrationAi,
    listGranularity: 'instance', // 所有来源统一展示为任务实例
    affectedTasks: [], // 废弃纯 task 列表，统一用 affectedTaskInstances
    affectedTaskInstances:
      isQuality
        ? qualityThreshold || qualityRunFailDownstreamDemo
          ? Array.from({ length: 24 }).map((_, i) => {
              const taskId = QUAL_MOCK_DOWNSTREAM_IDS[i % QUAL_MOCK_DOWNSTREAM_IDS.length]
              const isError = alert.severity === 'ERROR'
              const warnStatuses = ['success', 'running', 'failed', 'waiting']
              const status = isError ? 'waiting' : warnStatuses[i % warnStatuses.length]
              return {
                instanceId: String(8573921000 + i + 1),
                taskId,
                taskName: qualityMockTaskDisplayName(taskId),
                scheduleBatch: alert.scheduleBatch || alert.triggerTime || '2026-04-02',
                status,
                isPolluted: qualityThreshold && !isError,
                owner: i % 2 === 0 ? '张三(zhangsan)' : '赵六(zhaoliu)',
                isCore: qualityTaskIsCore(taskId),
              }
            })
          : []
        : devAffectedTasks.map((task, i) => ({
            instanceId: String(9182736000 + i + 1), // 类似 DolphinScheduler 的纯数字实例 ID
            taskId: task.id,
            taskName: task.taskName,
            taskType: task.taskType,
            scheduleBatch: alert.scheduleBatch || alert.triggerTime || '2026-04-02',
            status: task.impactStatus,
            owner: task.owner,
            isCore: task.isCore,
            hasSlaBreachRisk: task.hasSlaBreachRisk,
            slaStartBreached: task.slaStartBreached,
            slaFinishBreached: task.slaFinishBreached,
            slaFinishRiskLabel: task.slaFinishRiskLabel,
          })),
    totalAffectedNodes: isQuality
      ? qualityThreshold || qualityRunFailDownstreamDemo
        ? qualityDownCount
        : 0
      : devAffectedTasks.length,
    highRiskNodes: isQuality
      ? qualityThreshold || qualityRunFailDownstreamDemo
        ? qualityCoreCount
        : 0
      : devCoreCount,
    ownerMatrix: (() => {
      const rows = qualityRunFailed && !qualityRunFailDownstreamDemo
        ? [{ name: alert.owner || '相关同学', taskCount: 1 }]
        : [
            {
              name: alert.owner || '—',
              taskCount: isQuality ? (qualityThreshold ? 2 : 1) : 4,
            },
            { name: '张三(zhangsan)', taskCount: isQuality ? (qualityThreshold ? 1 : 0) : 3 },
            { name: '李四(lisi)', taskCount: isQuality ? 0 : 2 },
            { name: '赵六(zhaoliu)', taskCount: isQuality ? (qualityThreshold ? 1 : 0) : 1 },
          ]
      const seen = new Set()
      return rows.filter((r) => {
        if (!r.name || seen.has(r.name)) return false
        seen.add(r.name)
        return true
      })
    })(),
    slaPredictions: isQuality
      ? []
      : (() => {
      const l2Rows = [
        {
          taskName: 'dws_business_model_l2_1',
          slaStartDeadline: '08:00',
          predictedStartTime: '07:50',
          isStartBreached: false,
          slaFinishDeadline: '09:00',
          predictedFinishTime: '09:45',
          isFinishBreached: true,
          slaFinishRiskLabel: true,
        },
        {
          taskName: 'dws_business_model_l2_2',
          slaStartDeadline: '08:00',
          predictedStartTime: '07:50',
          isStartBreached: false,
          slaFinishDeadline: '09:00',
          predictedFinishTime: '09:40',
          isFinishBreached: true,
          slaFinishRiskLabel: true,
        },
        {
          taskName: 'dws_business_model_l2_4',
          slaStartDeadline: '08:00',
          predictedStartTime: '08:30',
          isStartBreached: true,
          slaFinishDeadline: '09:00',
          predictedFinishTime: '09:45',
          isFinishBreached: true,
        },
      ]
      const dashRows = Array.from({ length: 30 }).map((_, i) => {
        const n = i + 1
        const taskName = `ads_core_dashboard_${n}`
        const pinned = SLA_DASHBOARD_L3_MOCK[n]
        const isStartBreached = pinned ? pinned.slaStartBreached : i % 3 === 0
        const isFinishBreached = pinned ? pinned.slaFinishBreached : i % 2 === 0
        return {
          taskName,
          slaStartDeadline: '08:00',
          predictedStartTime: isStartBreached ? '08:30' : '07:50',
          isStartBreached,
          slaFinishDeadline: '09:00',
          predictedFinishTime: isFinishBreached ? '09:45' : '08:30',
          isFinishBreached,
        }
      })
      return [...l2Rows, ...dashRows]
    })(),
    deductionResult: isQuality
      ? qualityRunFailed
        ? 'broken'
        : qualityThreshold
          ? alert.severity === 'WARN'
            ? 'weak'
            : 'broken'
          : 'broken'
      : rootImpactStatus(alert) === 'failed'
        ? 'broken'
        : 'timeout',
    deductionDetail: isQuality
      ? qualityRunFailed
        ? qualityRunFailDownstreamDemo
          ? '质量监控运行失败：未产生有效阈值判定；当前为演示告警，已 Mock 展示下游调度依赖拓扑与实例列表，便于对照排查。'
          : '质量监控运行失败：未产生有效阈值判定，拓扑不展开下游推演。'
        : qualityThreshold
          ? alert.severity === 'WARN'
            ? '阈值 WARN：下游仍可能运行，请关注污染风险与实例状态。'
            : '阈值 ERROR：下游依赖等待或强阻断，请以拓扑与实例列表为准。'
          : '请根据监控事件类型核对推演策略。'
      : '当前为开发/集成类告警：仅评估下游任务依赖影响，不追溯 DQC 根因。',
  }

  return base
}

/**
 * 兼容旧接口：DAG 已改为前端逐层展开，不再使用折叠桩合并接口。
 */
export function mockExpand(_collapseNodeId, _depth, _alertSnapshot) {
  return {
    alertSource: 'dev',
    currentNode: null,
    rootCause: null,
    replaceCollapseId: null,
    nodes: [],
    edges: [],
  }
}
