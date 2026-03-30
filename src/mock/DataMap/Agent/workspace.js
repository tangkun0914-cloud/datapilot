export function mockWorkspaceRecommendations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          fqn: 'default.dwd_user_log',
          cnName: '用户行为日志表',
          reason: '最近 7 天高频访问'
        },
        {
          id: '2',
          fqn: 'prod_db.dim_product',
          cnName: '商品维度表',
          reason: '同组同事都在看'
        }
      ])
    }, 300)
  })
}
