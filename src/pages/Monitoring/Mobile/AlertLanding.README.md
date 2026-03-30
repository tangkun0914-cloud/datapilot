# AlertLanding - 手机端告警落地页

移动端独立路由页面（无 AppLayout），展示单条告警详情。包含告警头部信息、进度时间线、详细属性列表、底部操作栏（认领/屏蔽/取消屏蔽/标记已解决），支持入场动画和安全区适配。

## 截图

访问 `/design` → 监控运维 Tab → AlertLanding 查看在线预览。

## 用法

该组件作为独立页面路由使用，无需显式引入。

```js
// router/index.js
{
  path: '/monitoring/mobile/alert/:eventId',
  name: 'MobileAlertLanding',
  component: () => import('@/pages/Monitoring/Mobile/AlertLanding.vue'),
}
```

## Props

该组件无外部 Props，通过路由参数 `route.params.eventId` 获取告警 ID，并内部调用 API 获取数据。

## 使用页面

- 独立路由：`/monitoring/mobile/alert/:eventId`
