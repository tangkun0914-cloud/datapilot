<template>
  <div class="demo-wrapper">
    <div class="demo-header">
      <div class="demo-title-row">
        <h2 class="demo-topic-name">{{ topic.name }}</h2>
        <div class="demo-tags">
          <a-tag v-for="tag in topic.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          <a-tag :color="topic.visibility === 'public' ? 'green' : 'orange'">
            {{ topic.visibility === 'public' ? '公开' : '私有' }}
          </a-tag>
        </div>
      </div>
      <p class="demo-desc">{{ topic.description }}</p>
      <div class="demo-meta">
        <span><UserOutlined /> {{ topic.owner }}</span>
        <span><TeamOutlined /> {{ topic.followerCount }} 人关注</span>
        <span><TableOutlined /> {{ topic.tableCount }} 张表</span>
        <span><CalendarOutlined /> 更新于 {{ topic.updatedAt }}</span>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeTab" class="demo-tabs">
      <a-tab-pane key="tables" tab="关联数据表">
        <a-table
          :columns="tableColumns"
          :data-source="topic.tables"
          :pagination="false"
          size="small"
          row-key="id"
        />
      </a-tab-pane>
      <a-tab-pane key="usage" tab="使用说明">
        <div class="demo-usage-note" v-text="usagePreview" />
      </a-tab-pane>
    </a-tabs>

    <p class="demo-hint">此为 TopicDetail 页面的缩略 Demo（实际页面通过 route.params.id 加载数据）</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  UserOutlined,
  TeamOutlined,
  TableOutlined,
  CalendarOutlined,
} from '@ant-design/icons-vue'
import { mockTopics } from '@/mock/topics.js'

const topic = mockTopics[0]
const activeTab = ref('tables')

const usagePreview = topic.usageNote?.replace(/[#*`]/g, '').trim() || '暂无使用说明'

const tableColumns = [
  { title: '表名', dataIndex: 'name', key: 'name' },
  { title: '中文名', dataIndex: 'displayName', key: 'displayName' },
  { title: '数据源', dataIndex: 'serviceType', key: 'serviceType' },
  { title: '库名', dataIndex: 'database', key: 'database' },
  { title: '负责人', dataIndex: 'owner', key: 'owner' },
]
</script>

<style scoped>
.demo-wrapper {
  width: 100%;
}

.demo-header {
  margin-bottom: 20px;
}

.demo-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.demo-topic-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.demo-tags {
  display: flex;
  gap: 4px;
}

.demo-desc {
  font-size: 14px;
  color: #475569;
  margin: 0 0 12px;
}

.demo-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #64748b;
}

.demo-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.demo-tabs {
  margin-bottom: 12px;
}

.demo-usage-note {
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
  white-space: pre-wrap;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.demo-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
</style>
