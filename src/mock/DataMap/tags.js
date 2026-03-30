/**
 * Mock 标签与分类数据 - 对齐 OpenMetadata Tags/Classifications API
 */

export const tags = [
  { id: 't1', name: '核心资产', fullyQualifiedName: '业务域.核心资产', description: '核心业务资产' },
  { id: 't2', name: 'BI看板', fullyQualifiedName: '业务域.BI看板', description: 'BI 看板使用' },
  { id: 't3', name: '维度表', fullyQualifiedName: '数仓分层.维度表', description: '维度表' },
  { id: 't4', name: 'DWD', fullyQualifiedName: '数仓分层.DWD', description: '明细数据层' },
  { id: 't5', name: 'ODS', fullyQualifiedName: '数仓分层.ODS', description: '操作数据层' },
]

export const classifications = [
  { id: 'c1', name: '业务域', description: '业务域分类' },
  { id: 'c2', name: '数仓分层', description: '数仓分层分类' },
  { id: 'c3', name: '敏感级别', description: '数据敏感级别' },
]
