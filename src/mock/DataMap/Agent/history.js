/** Mock：删除会话（模拟服务端成功） */
export function mockDeleteAgentSession(sessionId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id: sessionId })
    }, 200)
  })
}

export function mockHistorySessions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          group: '最近 7 天',
          items: [
            { id: '1', title: '查找用户活跃数据' },
            { id: '2', title: '销售归因分析表调研' },
            { id: '3', title: '用户留存异动排查' }
          ]
        },
        {
          group: '更早',
          items: [
            { id: '4', title: '华东区客单价分析' },
            { id: '5', title: '渠道转化率漏斗' }
          ]
        }
      ])
    }, 300)
  })
}
