import {
  readMapAgentFavoriteFqnList,
  mapFqnListToWorkspaceFavorites
} from '@/utils/mapAgentFavorites.js'

/** 无地图 Agent 收藏时的演示种子（与历史 Mock 行为一致） */
const SEED_WORKSPACE_FAVORITES = [
  {
    id: '3',
    fqn: 'dm_trade.dws_order_summary_nd',
    cnName: '订单汇总宽表',
    reason: '收藏于 2026-03-20'
  },
  {
    id: '4',
    fqn: 'ods_base.user_info_df',
    cnName: '用户信息全量表',
    reason: '收藏于 2026-03-15'
  }
]

export function mockWorkspaceData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fromMapAgent = mapFqnListToWorkspaceFavorites(readMapAgentFavoriteFqnList())
      const seen = new Set(fromMapAgent.map((x) => x.fqn))
      const favorites = [
        ...fromMapAgent,
        ...SEED_WORKSPACE_FAVORITES.filter((s) => !seen.has(s.fqn))
      ]
      resolve({
        recommendations: [
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
        ],
        favorites,
        sharedChats: [
          {
            id: '101',
            title: '关于用户留存异动排查的分析',
            date: '2026-03-28'
          },
          {
            id: '102',
            title: '销售归因数据表使用说明',
            date: '2026-03-25'
          }
        ]
      })
    }, 300)
  })
}
