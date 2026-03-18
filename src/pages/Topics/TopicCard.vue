<template>
  <div class="topic-card" @click="handleClick">
    <!-- 标题 + 标签 + 操作 -->
    <div class="topic-card-title-wrapper">
      <h3 class="topic-card-title" :title="topic.name">{{ topic.name }}</h3>
      <a-tag v-if="topic.visibility === 'private'" class="visibility-tag">
        <LockOutlined /> 私有
      </a-tag>
      <div class="header-actions">
        <a-tooltip :title="topic.followed ? '取消关注' : '关注'">
          <StarFilled
            v-if="topic.followed"
            class="action-icon action-icon-followed"
            @click.stop="$emit('follow', topic)"
          />
          <StarOutlined
            v-else
            class="action-icon"
            @click.stop="$emit('follow', topic)"
          />
        </a-tooltip>
        <a-dropdown v-if="canEdit" :trigger="['click']" @click.stop>
          <MoreOutlined class="action-icon action-more" />
          <template #overlay>
            <a-menu>
              <a-menu-item key="edit" @click="$emit('edit', topic)">
                <EditOutlined /> 编辑
              </a-menu-item>
              <a-menu-item key="delete" danger @click="$emit('delete', topic)">
                <DeleteOutlined /> 删除
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 自定义标签 -->
    <div class="topic-tags" v-if="topic.tags && topic.tags.length">
      <span v-for="tag in topic.tags" :key="tag" class="custom-tag">{{ tag }}</span>
    </div>

    <!-- 描述 -->
    <p class="topic-card-desc">{{ topic.description || '暂无描述' }}</p>

    <!-- 统计信息 -->
    <div class="topic-card-stats">
      <div class="stat-chip">
        <TableOutlined class="stat-chip-icon" />
        <span>{{ topic.tableCount }} 张表</span>
      </div>
      <div class="stat-chip">
        <StarOutlined class="stat-chip-icon" />
        <span>{{ topic.followerCount }} 关注</span>
      </div>
    </div>

    <!-- 底部：负责人 + 时间 -->
    <div class="topic-card-footer">
      <span class="topic-card-owner">
        <a-avatar :size="22" class="owner-avatar">{{ topic.owner?.charAt(0) }}</a-avatar>
        <span class="owner-name">{{ topic.owner }}</span>
      </span>
      <span class="topic-card-time">{{ topic.updatedAt }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  TableOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  LockOutlined,
  MoreOutlined,
} from '@ant-design/icons-vue'

const props = defineProps({
  topic: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'follow'])

const router = useRouter()

function handleClick() {
  router.push(`/topics/${props.topic.id}`)
}
</script>

<style scoped>
.topic-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s, border-color 0.3s;
  border: 1px solid #eef1f5;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.topic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s;
}

.topic-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
  transform: translateY(-3px);
}

.topic-card:hover::before {
  opacity: 1;
}

.visibility-tag {
  font-size: 11px;
  color: #94a3b8;
  background: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 6px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 1px 8px;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.topic-card:hover .header-actions,
.header-actions:has(.action-icon-followed) {
  opacity: 1;
}

.action-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: color 0.2s, background-color 0.2s;
}

.action-icon:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.action-icon-followed {
  color: #f59e0b;
  background: transparent;
}

.action-icon-followed:hover {
  color: #d97706;
  background: transparent;
}

.action-more {
  font-size: 16px;
}

/* 标题 */
.topic-card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.topic-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.custom-tag {
  font-size: 11px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #dbeafe;
}

.topic-card-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  margin-bottom: 16px;
}

/* 统计标签 */
.topic-card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.stat-chip-icon {
  font-size: 12px;
  color: #94a3b8;
}

/* 底部 */
.topic-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid #f5f7fa;
}

.topic-card-owner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.owner-avatar {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  font-size: 11px !important;
  flex-shrink: 0;
}

.owner-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-card-time {
  font-size: 11px;
  color: #cbd5e1;
}
</style>
