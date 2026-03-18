# 业务组件库（Config 驱动 v2）

基于 **Config 驱动 + 通用渲染器** 架构的组件库文档系统。引擎文件可跨项目复制复用，每个项目只需填写一份 `config.js` 即可自动生成完整组件文档。

## 访问方式

本地启动项目后：

- **工作台**（产品页 + 组件库入口）：根路径 **`/`**（侧栏第一项「工作台」）
- **业务组件库**：**`/design`**

*（端口号以实际 `vite dev` 输出为准）*

---

## 架构概览

```
src/pages/Design/
  index.vue          ← 【引擎】主框架：侧栏导航 + 统计概览 + 内容区
  DocRenderer.vue    ← 【引擎】通用文档渲染器：7 个标准区块 + 自动 import 推导
  config.js          ← 【项目特有】组件注册表，填表式声明所有组件元数据
  demos/             ← 【项目特有·可选】少量复杂组件的自定义 Preview Demo
```

### 核心机制

- **file 路径自动推导**：DocRenderer 通过 `import.meta.glob('/src/**/*.vue')` 预收集所有 .vue 文件，运行时按 config 中的 `file` 字段自动匹配加载，无需手写 `component: () => import(...)` 
- **三层渲染优先级**：`demo`（自定义 Demo）> `previewMultiple`（多实例）> `file` + `defaultProps`（自动渲染）
- **弹窗通用处理**：设置 `previewType: 'modal'` 即可自动生成"打开弹窗"按钮

---

## 当前组件清单

| 分组 | 组件数 | 组件列表 |
|------|--------|----------|
| L1 平台级组件 | 5 | AppLayout, DataSourceIcon, SourceTag, PageHeader, CopilotPanel |
| L2 首页模块 | 3 | HeroBanner, RecentList, HomeOverview |
| L2 资产检索模块 | 4 | SearchBar, FilterPanel, ResultList, ResultTable |
| L2 资产详情模块 | 8 | InfoSidebar, FieldDetailTab, PreviewTab, UsageTab, ScriptTab, ProductionTab, LineageTab, ChangeHistoryTab |
| L2 数据专题模块 | 2 | TopicCard, TopicDetail |
| L2 我的库表模块 | 2 | TableGroup, TransferModal |
| L2 AI Copilot 模块 | 1 | ChatPanel |
| **合计** | **25** | |

---

## 跨项目复用指南

### 1. 复制引擎文件

将以下文件复制到新项目的 `src/pages/Design/` 目录：

```
index.vue
DocRenderer.vue
```

### 2. 创建 config.js

在同目录下新建 `config.js`，按如下格式注册组件：

**侧边栏 Tab 归类（与文档里的 level 标签可不同）：**

- `catalogTier: 'platform'` → **平台级** Tab：跨产品的导航、布局、通用能力（如 AppLayout、全局 Copilot）。
- `catalogTier: 'productModule'` + `productModule: '数据地图'`（或 `'数据集成'` 等）→ **模块级** Tab：按产品模块分组展示。

```js
export const componentGroups = [
  {
    groupName: 'L1 平台级组件',
    groupLevel: 'L1',
    items: [
      {
        id: 'MyComponent',
        name: 'MyComponent',
        label: '组件中文名',
        catalogTier: 'platform',  // 或 'productModule' + productModule: '数据地图'
        level: '平台级',          // 文档页标签，可与 catalog 独立
        domain: '通用',
        type: 'display',          // display | interaction | layout
        file: 'src/components/MyComponent.vue',
        desc: '组件的业务描述。',
        defaultProps: { /* 预览时的默认属性 */ },
        props: [
          { prop: 'propName', type: 'String', desc: '属性说明' },
        ],
        // 以下字段可选，无内容时省略即可
        // events: [{ event: 'eventName', params: '...', desc: '...' }],
        // slots: [{ name: 'slotName', desc: '...' }],
        // children: [{ id: 'L3-1', name: '子模块名', data: '关键数据' }],
        // usages: [{ label: '使用页面', route: '/page' }],
        // demo: () => import('./demos/MyComponentDemo.vue'),
        // previewType: 'modal',
        // previewMultiple: [{ label: '状态A', props: {...} }],
      },
    ],
  },
]
```

### 3. 添加路由

```js
{
  path: '/design',
  name: 'DesignSystem',
  component: () => import('@/pages/Design/index.vue'),
  meta: { title: '组件库' },
}
```

### 4.（可选）编写自定义 Demo

对依赖路由、Store 或外部 API 的复杂组件，在 `demos/` 目录创建独立的 Demo 文件，并在 config 中通过 `demo` 字段引用。

---

## 如何新增组件

1. 在 `config.js` 的对应分组中添加一条新记录
2. 确保 `file` 字段指向正确的 `.vue` 文件路径
3. 填写 `props`、`events`、`slots` 等 API 文档
4. 简单组件提供 `defaultProps` 即可自动预览；复杂组件在 `demos/` 目录编写自定义 Demo
5. 刷新页面，侧栏自动出现新组件入口
