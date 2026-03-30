/**
 * Mock 血缘数据 - 表级 & 字段级
 */

// 数据源类型配置
export const SOURCE_TYPE_CONFIG = {
  mysql: { color: '#52c41a', lightColor: '#f6ffed', label: 'MySQL' },
  hive: { color: '#1677ff', lightColor: '#e6f7ff', label: 'Hive' },
  starrocks: { color: '#722ed1', lightColor: '#f9f0ff', label: 'StarRocks' },
  analysis: { color: '#fa8c16', lightColor: '#fff7e6', label: '分析节点' },
  tableau: { color: '#eb2f96', lightColor: '#fff0f6', label: 'Tableau' },
}

export const lineageData = {
  entity: {
    id: 'dwa_cn_cus_df_complain_detail',
    type: 'table',
    name: 'dwa_cn_cus_df_complain_detail',
    fqn: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail',
    serviceType: 'hive',
    database: 'dwa_cn',
    owner: '韩帅(shuaihan)',
  },
  nodes: [
    { id: 'ods_order_raw', type: 'table', name: 'ods_order_raw', fqn: 'mysql.trade_db.ods_order_raw', serviceType: 'mysql', database: 'trade_db', owner: '张三(zhangsan)', columns: [{name: 'order_id', type: 'bigint'}, {name: 'user_id', type: 'bigint'}, {name: 'product_id', type: 'bigint'}, {name: 'order_amount', type: 'decimal(10,2)'}, {name: 'pay_channel', type: 'varchar(32)'}, {name: 'order_status', type: 'int'}, {name: 'create_time', type: 'datetime'}] },
    { id: 'ods_payment_raw', type: 'table', name: 'ods_payment_raw', fqn: 'mysql.pay_db.ods_payment_raw', serviceType: 'mysql', database: 'pay_db', owner: '李四(lisi)', columns: [{name: 'payment_id', type: 'bigint'}, {name: 'order_id', type: 'bigint'}, {name: 'pay_amount', type: 'decimal(10,2)'}, {name: 'pay_channel', type: 'varchar(32)'}, {name: 'pay_status', type: 'int'}, {name: 'pay_time', type: 'datetime'}] },
    { id: 'ods_user_raw', type: 'table', name: 'ods_user_raw', fqn: 'mysql.user_db.ods_user_raw', serviceType: 'mysql', database: 'user_db', owner: '王五(wangwu)', columns: [{name: 'user_id', type: 'bigint'}, {name: 'user_name', type: 'varchar(64)'}, {name: 'province', type: 'varchar(32)'}, {name: 'city', type: 'varchar(32)'}, {name: 'register_time', type: 'datetime'}] },
    { id: 'ods_product_raw', type: 'table', name: 'ods_product_raw', fqn: 'mysql.product_db.ods_product_raw', serviceType: 'mysql', database: 'product_db', owner: '赵六(zhaoliu)', columns: [{name: 'product_id', type: 'bigint'}, {name: 'product_name', type: 'varchar(128)'}, {name: 'category', type: 'varchar(64)'}, {name: 'price', type: 'decimal(10,2)'}] },
    { id: 'ods_inventory_raw', type: 'table', name: 'ods_inventory_raw', fqn: 'mysql.inventory_db.ods_inventory_raw', serviceType: 'mysql', database: 'inventory_db', owner: '孙七(sunqi)', columns: [{name: 'product_id', type: 'bigint'}, {name: 'warehouse', type: 'varchar(64)'}, {name: 'stock_count', type: 'int'}, {name: 'update_time', type: 'datetime'}] },
    { id: 'dwa_cn_cus_df_complain_detail', type: 'table', name: 'dwa_cn_cus_df_complain_detail', fqn: 'hive.dwa_cn.dwa_cn_cus_df_complain_detail', serviceType: 'hive', database: 'dwa_cn', owner: '韩帅(shuaihan)', columns: [{name: 'order_id', type: 'bigint'}, {name: 'user_id', type: 'bigint'}, {name: 'product_id', type: 'bigint'}, {name: 'order_amount', type: 'decimal(10,2)'}, {name: 'pay_channel', type: 'string'}, {name: 'order_status', type: 'int'}, {name: 'province', type: 'string'}, {name: 'city', type: 'string'}, {name: 'create_time', type: 'timestamp'}, {name: 'update_time', type: 'timestamp'}, {name: 'is_deleted', type: 'boolean'}, {name: 'dt', type: 'string'}] },
    { id: 'dwd_trade_order_detail', type: 'table', name: 'dwd_trade_order_detail', fqn: 'hive.dm_trade.dwd_trade_order_detail', serviceType: 'hive', database: 'dm_trade', owner: '韩帅(shuaihan)', columns: [{name: 'order_id', type: 'bigint'}, {name: 'user_id', type: 'bigint'}, {name: 'product_id', type: 'bigint'}, {name: 'order_amount', type: 'decimal(10,2)'}, {name: 'pay_channel', type: 'string'}, {name: 'trade_date', type: 'string'}] },
    { id: 'dws_sku_sale_daily', type: 'table', name: 'dws_sku_sale_daily', fqn: 'hive.dm_product.dws_sku_sale_daily', serviceType: 'hive', database: 'dm_product', owner: '王博(bowang)', columns: [{name: 'product_id', type: 'bigint'}, {name: 'sale_count', type: 'bigint'}, {name: 'sale_amount', type: 'decimal(10,2)'}, {name: 'dt', type: 'string'}] },
    { id: 'ads_order_summary', type: 'table', name: 'ads_order_summary', fqn: 'starrocks.dm_report.ads_order_summary', serviceType: 'starrocks', database: 'dm_report', owner: '张三(zhangsan)', columns: [{name: 'dt', type: 'date'}, {name: 'total_orders', type: 'bigint'}, {name: 'total_amount', type: 'decimal(10,2)'}, {name: 'total_users', type: 'bigint'}] },
  ],
  upstreamEdges: [
    { fromEntity: 'ods_order_raw', toEntity: 'dwa_cn_cus_df_complain_detail' },
    { fromEntity: 'ods_payment_raw', toEntity: 'dwa_cn_cus_df_complain_detail' },
    { fromEntity: 'ods_user_raw', toEntity: 'dwa_cn_cus_df_complain_detail' },
    { fromEntity: 'ods_product_raw', toEntity: 'dwa_cn_cus_df_complain_detail' },
    { fromEntity: 'ods_inventory_raw', toEntity: 'dwa_cn_cus_df_complain_detail' },
  ],
  downstreamEdges: [
    { fromEntity: 'dwa_cn_cus_df_complain_detail', toEntity: 'dwd_trade_order_detail' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', toEntity: 'dws_sku_sale_daily' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', toEntity: 'ads_order_summary' },
  ],
  // 字段级血缘
  columnLineage: [
    { fromEntity: 'ods_order_raw', fromColumn: 'order_id', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'order_id' },
    { fromEntity: 'ods_order_raw', fromColumn: 'user_id', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'user_id' },
    { fromEntity: 'ods_order_raw', fromColumn: 'product_id', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'product_id' },
    { fromEntity: 'ods_order_raw', fromColumn: 'order_amount', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'order_amount' },
    { fromEntity: 'ods_order_raw', fromColumn: 'pay_channel', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'pay_channel' },
    { fromEntity: 'ods_order_raw', fromColumn: 'order_status', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'order_status' },
    { fromEntity: 'ods_order_raw', fromColumn: 'create_time', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'create_time' },
    { fromEntity: 'ods_payment_raw', fromColumn: 'pay_channel', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'pay_channel' },
    { fromEntity: 'ods_user_raw', fromColumn: 'province', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'province' },
    { fromEntity: 'ods_user_raw', fromColumn: 'city', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'city' },
    { fromEntity: 'ods_product_raw', fromColumn: 'product_id', toEntity: 'dwa_cn_cus_df_complain_detail', toColumn: 'product_id' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'order_id', toEntity: 'dwd_trade_order_detail', toColumn: 'order_id' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'user_id', toEntity: 'dwd_trade_order_detail', toColumn: 'user_id' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'product_id', toEntity: 'dwd_trade_order_detail', toColumn: 'product_id' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'order_amount', toEntity: 'dwd_trade_order_detail', toColumn: 'order_amount' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'pay_channel', toEntity: 'dwd_trade_order_detail', toColumn: 'pay_channel' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'product_id', toEntity: 'dws_sku_sale_daily', toColumn: 'product_id' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'order_amount', toEntity: 'dws_sku_sale_daily', toColumn: 'sale_amount' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'dt', toEntity: 'ads_order_summary', toColumn: 'dt' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'order_id', toEntity: 'ads_order_summary', toColumn: 'total_orders' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'order_amount', toEntity: 'ads_order_summary', toColumn: 'total_amount' },
    { fromEntity: 'dwa_cn_cus_df_complain_detail', fromColumn: 'user_id', toEntity: 'ads_order_summary', toColumn: 'total_users' },
  ],
}

// 模拟动态展开邻居节点
const MOCK_NEIGHBOR_POOL = {
  upstream: [
    { id: 'dim_channel', name: 'dim_channel', fqn: 'mysql.dim_db.dim_channel', serviceType: 'mysql', database: 'dim_db', owner: '张三(zhangsan)', columns: [{name: 'channel_id', type: 'int'}, {name: 'channel_name', type: 'varchar(64)'}] },
    { id: 'ods_refund_raw', name: 'ods_refund_raw', fqn: 'mysql.trade_db.ods_refund_raw', serviceType: 'mysql', database: 'trade_db', owner: '李四(lisi)', columns: [{name: 'refund_id', type: 'bigint'}, {name: 'order_id', type: 'bigint'}, {name: 'refund_amount', type: 'decimal(10,2)'}] },
    { id: 'ods_logistics_raw', name: 'ods_logistics_raw', fqn: 'mysql.logistics_db.ods_logistics_raw', serviceType: 'mysql', database: 'logistics_db', owner: '王五(wangwu)', columns: [{name: 'logistics_id', type: 'bigint'}, {name: 'order_id', type: 'bigint'}, {name: 'status', type: 'int'}] },
    { id: 'analysis_user_tag', name: 'analysis_user_tag', fqn: 'analysis.tag_db.analysis_user_tag', serviceType: 'analysis', database: 'tag_db', owner: '赵六(zhaoliu)', columns: [{name: 'user_id', type: 'bigint'}, {name: 'tag_name', type: 'varchar(64)'}, {name: 'tag_value', type: 'varchar(128)'}] },
  ],
  downstream: [
    { id: 'ads_daily_revenue', name: 'ads_daily_revenue', fqn: 'starrocks.dm_report.ads_daily_revenue', serviceType: 'starrocks', database: 'dm_report', owner: '张三(zhangsan)', columns: [{name: 'dt', type: 'date'}, {name: 'revenue', type: 'decimal(10,2)'}, {name: 'order_count', type: 'int'}] },
    { id: 'ads_user_retention', name: 'ads_user_retention', fqn: 'starrocks.dm_report.ads_user_retention', serviceType: 'starrocks', database: 'dm_report', owner: '李四(lisi)', columns: [{name: 'dt', type: 'date'}, {name: 'retention_rate', type: 'decimal(5,4)'}, {name: 'cohort', type: 'varchar(32)'}] },
    { id: 'tableau_sales_dashboard', name: 'tableau_sales_dashboard', fqn: 'tableau.workspace.tableau_sales_dashboard', serviceType: 'tableau', database: 'workspace', owner: '王博(bowang)', columns: [{name: 'metric', type: 'varchar(64)'}, {name: 'value', type: 'double'}, {name: 'dimension', type: 'varchar(64)'}] },
    { id: 'analysis_order_funnel', name: 'analysis_order_funnel', fqn: 'analysis.report_db.analysis_order_funnel', serviceType: 'analysis', database: 'report_db', owner: '孙七(sunqi)', columns: [{name: 'step', type: 'int'}, {name: 'count', type: 'bigint'}, {name: 'rate', type: 'decimal(5,4)'}] },
  ],
}

let expandCounter = 0
let columnExpandCounter = 0

export function mockFetchColumnNeighbors(entityId, colName, direction) {
  return new Promise((resolve) => {
    const nodes = []
    const columnLineage = []
    const count = 1 + Math.floor(Math.random() * 2)

    const upstreamPool = [
      { id: 'deep_ods_source_a', name: 'deep_ods_source_a', fqn: 'mysql.raw_db.deep_ods_source_a', serviceType: 'mysql', database: 'raw_db', owner: '张三(zhangsan)', columns: [{ name: 'id', type: 'bigint' }, { name: 'value', type: 'varchar(128)' }, { name: colName, type: 'bigint' }] },
      { id: 'deep_ods_source_b', name: 'deep_ods_source_b', fqn: 'mysql.raw_db.deep_ods_source_b', serviceType: 'mysql', database: 'raw_db', owner: '李四(lisi)', columns: [{ name: 'pk_id', type: 'bigint' }, { name: colName, type: 'bigint' }, { name: 'extra', type: 'varchar(64)' }] },
    ]
    const downstreamPool = [
      { id: 'deep_ads_target_a', name: 'deep_ads_target_a', fqn: 'starrocks.report_db.deep_ads_target_a', serviceType: 'starrocks', database: 'report_db', owner: '王博(bowang)', columns: [{ name: 'metric_id', type: 'bigint' }, { name: colName, type: 'decimal(10,2)' }, { name: 'dt', type: 'date' }] },
      { id: 'deep_tableau_view', name: 'deep_tableau_view', fqn: 'tableau.workspace.deep_tableau_view', serviceType: 'tableau', database: 'workspace', owner: '赵六(zhaoliu)', columns: [{ name: colName, type: 'double' }, { name: 'dimension', type: 'varchar(64)' }] },
    ]

    const pool = direction === 'upstream' ? upstreamPool : downstreamPool
    for (let i = 0; i < count && i < pool.length; i++) {
      const base = pool[(columnExpandCounter + i) % pool.length]
      const newId = `${base.id}_${columnExpandCounter}_${i}`
      nodes.push({ ...base, id: newId })
      if (direction === 'upstream') {
        columnLineage.push({ fromEntity: newId, fromColumn: colName, toEntity: entityId, toColumn: colName })
      } else {
        columnLineage.push({ fromEntity: entityId, fromColumn: colName, toEntity: newId, toColumn: colName })
      }
    }
    columnExpandCounter++
    resolve({ nodes, columnLineage })
  })
}

export function mockFetchNeighbors(nodeId, direction) {
  return new Promise((resolve) => {
    const pool = MOCK_NEIGHBOR_POOL[direction] || []
    const count = 1 + Math.floor(Math.random() * 2)
    const nodes = []
    const edges = []

    for (let i = 0; i < count && i < pool.length; i++) {
      const base = pool[(expandCounter + i) % pool.length]
      const newId = `${base.id}_${expandCounter}_${i}`
      const node = { 
        ...base, 
        id: newId, 
        type: 'table',
        columns: base.columns.map(c => typeof c === 'string' ? { name: c, type: 'string' } : c)
      }
      nodes.push(node)
      if (direction === 'upstream') {
        edges.push({ source: newId, target: nodeId })
      } else {
        edges.push({ source: nodeId, target: newId })
      }
    }
    expandCounter++
    resolve({ nodes, edges })
  })
}
