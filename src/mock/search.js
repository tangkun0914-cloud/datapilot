/**
 * Mock 搜索数据 - 对齐 OpenMetadata Search API 响应格式
 */

export const searchResults = {
  hits: {
    total: { value: 3 },
    hits: [
      { _source: { id: '1', name: 'dwd_trade_order_detail', fullyQualifiedName: 'hive.dm_sales.ods.dwd_trade_order_detail', displayName: '交易订单明细事实表', description: '包含全渠道订单原子粒度数据', tags: [{ tagFQN: '核心资产' }] } },
      { _source: { id: '2', name: 'ads_user_retention_day', fullyQualifiedName: 'starrocks.dm_user.ads.ads_user_retention_day', displayName: '用户留存日统计表', description: '次日、7日、30日留存率', tags: [{ tagFQN: 'BI看板' }] } },
      { _source: { id: '3', name: 'dim_user_base_info', fullyQualifiedName: 'mysql.crm_db.dim.dim_user_base_info', displayName: '用户基础信息维表', description: '用户基础属性维表', tags: [{ tagFQN: '维度表' }] } },
    ],
  },
}

export const suggestions = [
  { text: 'dwd_trade_order_detail', _source: { fullyQualifiedName: 'hive.dm_sales.ods.dwd_trade_order_detail' } },
  { text: 'dim_user_base_info', _source: { fullyQualifiedName: 'mysql.crm_db.dim.dim_user_base_info' } },
  { text: 'ads_user_retention_day', _source: { fullyQualifiedName: 'starrocks.dm_user.ads.ads_user_retention_day' } },
]
