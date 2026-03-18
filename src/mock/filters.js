/**
 * Mock 筛选器选项 - 供 Search FilterPanel 使用
 */

export const filterOptions = {
  dataTypes: [
    { label: 'Hive表', value: 'Hive' },
    { label: 'StarRocks', value: 'StarRocks' },
    { label: 'MySQL', value: 'MySQL' },
  ],
  databases: [
    { label: 'ods_cn (120)', value: 'ods_cn' },
    { label: 'ods_log (85)', value: 'ods_log' },
    { label: 'dwd (234)', value: 'dwd' },
    { label: 'dwt (56)', value: 'dwt' },
    { label: 'dwa_cn (189)', value: 'dwa_cn' },
    { label: 'dm_cn (92)', value: 'dm_cn' },
  ],
  owners: [
    { label: '张三(zhangsan)', value: '张三(zhangsan)' },
    { label: '李四(lisi)', value: '李四(lisi)' },
    { label: '王五(wangwu)', value: '王五(wangwu)' },
    { label: '赵六(zhaoliu)', value: '赵六(zhaoliu)' },
    { label: '孙七(sunqi)', value: '孙七(sunqi)' },
    { label: '周八(zhouba)', value: '周八(zhouba)' },
  ],
  lifeStatus: [
    { label: '开发中', value: 'DEVELOPING' },
    { label: '已上线', value: 'ONLINE' },
    { label: '已下线', value: 'OFFLINE' },
  ],
  businessLines: [
    { label: '数据交易', value: 'trade' },
    { label: '数据用户', value: 'user' },
    { label: '数据营销', value: 'marketing' },
    { label: '数据商品', value: 'product' },
  ],
  projects: [
    { label: '交易数仓', value: 'dm_trade' },
    { label: '用户数仓', value: 'dm_user' },
    { label: '报表平台', value: 'dm_report' },
    { label: '营销分析', value: 'dm_marketing' },
  ],
  topics: [
    { label: '订单明细', value: 'order' },
    { label: '用户画像', value: 'user_profile' },
    { label: '支付流水', value: 'payment' },
    { label: '漏斗分析', value: 'funnel' },
  ],
  tagTree: [
    {
      title: '业务域',
      value: '业务域',
      key: '业务域',
      children: [
        { title: '交易', value: '业务域.交易', key: '业务域.交易' },
        { title: '用户', value: '业务域.用户', key: '业务域.用户' },
        { title: '商品', value: '业务域.商品', key: '业务域.商品' },
        { title: '营销', value: '业务域.营销', key: '业务域.营销' },
      ],
    },
    {
      title: '数仓分层',
      value: '数仓分层',
      key: '数仓分层',
      children: [
        { title: 'ODS', value: '数仓分层.ODS', key: '数仓分层.ODS' },
        { title: 'DWD', value: '数仓分层.DWD', key: '数仓分层.DWD' },
        { title: 'DWS', value: '数仓分层.DWS', key: '数仓分层.DWS' },
        { title: 'ADS', value: '数仓分层.ADS', key: '数仓分层.ADS' },
        { title: 'DIM', value: '数仓分层.DIM', key: '数仓分层.DIM' },
      ],
    },
    {
      title: '数据安全',
      value: '数据安全',
      key: '数据安全',
      children: [
        { title: '内部', value: '数据安全.内部', key: '数据安全.内部' },
        { title: '敏感', value: '数据安全.敏感', key: '数据安全.敏感' },
      ],
    },
  ],
}
