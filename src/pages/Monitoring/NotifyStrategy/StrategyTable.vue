<template>
  <div class="table-area">
    <div class="table-header">共 {{ dataSource.length }} 条策略</div>
    <a-table
      :dataSource="dataSource"
      :columns="columns"
      :pagination="pagination"
      rowKey="key"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="name-cell">
            <a class="name-link" @click="$emit('view', record)">{{ record.name }}</a>
            <span v-if="record.isDefault" class="default-tag">默认</span>
          </div>
        </template>
        <template v-if="column.key === 'status'">
          <StatusSwitch :value="record.status" :disabled="record.isDefault" @change="(val) => $emit('statusChange', record, val)" />
        </template>
        <template v-if="column.key === 'action'">
          <div class="action-cell">
            <a class="action-link" @click="$emit('edit', record)">编辑</a>
            <a class="action-link" @click="$emit('view', record)">查看</a>
            <a class="action-link" @click="$emit('copy', record)">复制</a>
            <a-popconfirm
              v-if="!record.isDefault"
              title="确定要删除该策略吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="$emit('delete', record)"
            >
              <a class="action-link danger">删除</a>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import StatusSwitch from './StatusSwitch.vue'

const props = defineProps({
  dataSource: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: [Object, Boolean],
    default: false
  }
})

defineEmits(['statusChange', 'edit', 'view', 'copy', 'delete'])

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
  { title: '创建人', dataIndex: 'creator', key: 'creator' },
  { title: '发送间隔', dataIndex: 'interval', key: 'interval' },
  { title: '最大发送', dataIndex: 'maxSend', key: 'maxSend' },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'action', width: 200 },
]
</script>

<style scoped>
.table-area {
  padding: 20px 24px;
}

.table-header {
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-link {
  color: #3b73f6;
  cursor: pointer;
  transition: color 0.2s;
}

.name-link:hover {
  text-decoration: underline;
}

.default-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-link {
  color: #3b73f6;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
}

.action-link:hover {
  text-decoration: underline;
}

.action-link.danger {
  color: #f5222d;
}

.action-link.danger:hover {
  color: #cf1322;
}
</style>
