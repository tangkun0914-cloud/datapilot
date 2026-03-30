# DataPilot 产品功能与 OpenMetadata API 映射表

本文档基于 DataPilot 数据地图最新产品功能架构（L1/L2/L3 业务模块），梳理了前端功能与后端 OpenMetadata (OM) API 的对接映射关系。供前后端研发与测试参考。

## 1. 首页模块 (Home)

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **智能检索入口** | 搜索框与热门推荐 | Suggest API | `GET /v1/search/suggest?q={keyword}&index=table_search_index` | 提供输入联想和补全 |
| **最近访问** | 展示用户最近浏览的资产 | 自研/扩展 API | `GET /api/v1/custom/user/recent-views` | OM 原生不支持直接获取最近浏览，需额外记录或依赖浏览器本地存储 |
| **我的收藏** | 展示用户 Follow 的资产 | User API | `GET /v1/users/name/{username}?fields=follows` | 获取用户关注的实体列表 |
| **热度榜** | 按浏览量/查询量排行 | Search API | `GET /v1/search/query?index=table_search_index&sortField=usageSummary.dailyStats.count&sortOrder=desc` | 基于使用统计排序 |
| **平台概览** | 资产总数、数据源统计 | Search API | `GET /v1/search/query?index=table_search_index` (带 aggregations) | 利用 ES 聚合查询获取各维度统计数据 |

## 2. 资产检索模块 (Search)

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **搜索输入栏** | 关键词精准/模糊匹配 | Search API | `GET /v1/search/query?q={keyword}&index=table_search_index` | 关键词同时匹配表名、描述和标签 |
| **筛选面板** | 按数据源、数据库、标签等多维过滤 | Search API | `GET /v1/search/query` (带 aggregations) | 通过 ES 聚合返回当前搜索结果的筛选项分布 |
| **检索结果 (列表/表格)** | 展示资产卡片/行数据 | Search API | `GET /v1/search/query?q={keyword}&from={offset}&size={limit}` | 支持分页，返回包含 owners, tags, tier 等元数据 |

## 3. 资产详情模块 (Detail)

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **资产信息侧栏** | 表名、负责人、业务域、标签、行数、容量 | Table API | `GET /v1/tables/name/{fqn}?fields=owners,tags,usageSummary,domain,profile,extension` | 核心元数据接口，`profile` 包含行数和大小 |
| **字段详情** | 字段列表、类型、注释、主键/外键 | Table API | (同上，包含在 `columns` 字段中) | 包含字段级 tags |
| **数据预览** | 前 N 行真实数据样本 | Sample Data API | `GET /v1/tables/{id}/sampleData` | 需配置 OM 的 Profiler 任务提取样本 |
| **字段画像** | 字段 NULL 占比、唯一值、分布 | Column Profile | `GET /v1/tables/{id}/columnProfile` | 需配置 OM 的 Profiler 任务 |
| **使用说明** | Markdown 格式的业务说明 | Table API | (同上，包含在 `description` 或 `extension` 中) | 支持通过 `PATCH /v1/tables/{id}` 更新 |
| **建表语句** | DDL 语句展示 | Table API | `GET /v1/tables/name/{fqn}?fields=tableQueries` | 或通过 `extension` 自定义属性存储 |
| **生产信息** | 调度任务、产出时间、SLA | Lineage / Pipeline API | `GET /v1/lineage/table/name/{fqn}` → 关联 Pipeline 节点 | 需集成 Airflow/DolphinScheduler 等调度系统元数据 |
| **数据血缘** | G6 DAG 图（表级/字段级） | Lineage API | `GET /v1/lineage/table/name/{fqn}?upstreamDepth=3&downstreamDepth=3` | 原生支持表级与字段级血缘关系 |
| **变更记录** | DDL/元数据变更历史与版本对比 | Entity Versions | `GET /v1/tables/{id}/versions` & `GET /v1/tables/{id}/versions/{version}` | 返回 JSON Patch 格式的变更差异 |

## 4. 数据专题模块 (Topics)

*注：OpenMetadata 中可使用 Data Products 或 Glossary (术语表) 来映射“数据专题”概念。此处以 Data Products 为例。*

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **专题卡片** | 专题列表、描述、表数量 | Data Product API | `GET /v1/dataProducts?fields=owners,experts` | 获取专题列表 |
| **专题详情** | 专题元信息、使用说明 | Data Product API | `GET /v1/dataProducts/name/{fqn}?fields=owners,experts` | 获取专题详情 |
| **关联表管理** | 专题下的数据表列表 | Search API | `GET /v1/search/query?q=dataProducts.name:{topicName}` | 查询归属该专题的所有资产 |

## 5. 我的库表模块 (MyTables)

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **库表分组列表** | 我负责的表列表 | Search API | `GET /v1/search/query?q=owners.name:{username}` | 查询当前用户负责的资产 |
| **库表转让弹窗** | 批量修改表负责人 | Table API | `PATCH /v1/tables/{id}` | 使用 JSON Patch 格式更新 `owners` 字段 |

## 6. AI Copilot 模块

| L3 子模块 | 前端功能描述 | OpenMetadata API | 请求方式 & 端点 | 备注说明 |
| :--- | :--- | :--- | :--- | :--- |
| **AI 对话面板** | 智能找表、血缘追溯、字段释义 | 自研 AI 代理层 | `POST /api/v1/copilot/chat` | 需自研中台层：LLM 接收自然语言 → 转换为 OM Search API 或 Lineage API 调用 → 总结返回 |
| **快捷建议** | 预置的 Prompt 推荐 | 静态配置 / 自研 API | - | 前端写死或从后端动态拉取 |

---

## 优化说明 (相比早期规划)
1. **对齐最新组件架构**：完全按照最新的 L2 模块（首页、资产检索、资产详情、数据专题、我的库表、AI Copilot）重新梳理。
2. **细化资产详情 (Detail)**：将右侧 Tab（字段、预览、说明、DDL、生产、血缘、变更）与 OM API 进行了精准的一对一映射。
3. **明确能力边界**：明确指出了 OM 原生 API 支持的范围（如血缘、版本、画像），以及需要自研/扩展的部分（如最近访问、AI Copilot 代理层）。