/**
 * 影响评估 DAG 按需展开（Mock 数据与合并逻辑在 mock 层实现，此处仅作服务入口）
 */
export {
  getImpactBranchChildrenMap,
  expandImpactDirectChildren,
  materializeFullImpactTopology,
  filterTopologyToCorePaths,
} from '@/mock/Monitoring/impactAssessment.js'
