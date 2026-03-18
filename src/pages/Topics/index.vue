<template>
  <div class="topics-page">
    <!-- 顶部 Banner -->
    <div class="topics-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="header-title">数据专题</h1>
          <p class="header-desc">按主题组织和管理相关数据表，方便团队协作与数据消费</p>
        </div>
        <a-button type="primary" class="create-btn" @click="showCreateModal = true">
          <template #icon><PlusOutlined /></template>
          新建专题
        </a-button>
      </div>
    </div>

    <div class="topics-body">
      <!-- 工具栏：Tab + 搜索 -->
      <div class="topics-toolbar">
        <div class="filter-tab-group">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['filter-tab', activeTab === tab.key && 'filter-tab-active']"
            @click="activeTab = tab.key; searchKeyword = ''"
          >
            {{ tab.label }}
            <span class="filter-tab-count" v-if="tab.count > 0">{{ tab.count }}</span>
          </button>
        </div>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索专题名称..."
          class="search-input"
          allow-clear
        />
      </div>

      <!-- 卡片列表 -->
      <a-row v-if="paginatedTopics.length" :gutter="[20, 20]">
        <a-col
          v-for="topic in paginatedTopics"
          :key="topic.id"
          :xs="24" :sm="12" :lg="8" :xl="6"
        >
          <TopicCard
            :topic="topic"
            :can-edit="canEditTopic(topic)"
            @edit="handleEdit"
            @delete="handleDelete"
            @follow="handleFollow"
          />
        </a-col>
      </a-row>
      <div v-else class="empty-state">
        <a-empty description="未找到匹配的数据专题">
          <a-button type="primary" ghost @click="showCreateModal = true">创建第一个专题</a-button>
        </a-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="filteredTopics.length > 0">
        <a-pagination
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="filteredTopics.length"
          :show-total="(total) => `共 ${total} 个专题`"
          show-size-changer
          :page-size-options="['12', '24', '48']"
        />
      </div>
    </div>

    <!-- 新建专题弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建数据专题"
      :width="480"
      @ok="handleCreate"
      @cancel="showCreateModal = false"
      okText="创建"
      cancelText="取消"
      :okButtonProps="{ disabled: !createForm.name.trim() }"
      class="topic-modal"
    >
      <a-form layout="vertical" class="topic-form">
        <a-form-item label="专题名称" required>
          <a-input v-model:value="createForm.name" placeholder="请输入专题名称" :maxlength="50" />
        </a-form-item>
        <a-form-item label="专题标签">
          <a-select
            v-model:value="createForm.tags"
            mode="tags"
            placeholder="输入标签后回车（选填，最多3个）"
            :maxTagCount="3"
            style="width: 100%"
            :token-separators="[',', ' ']"
          />
        </a-form-item>
        <a-form-item label="可见范围">
          <a-radio-group v-model:value="createForm.visibility" class="visibility-radio-group">
            <a-radio value="public">
              <GlobalOutlined class="radio-icon" />
              <span class="radio-label">公开</span>
              <span class="radio-hint">所有人可见</span>
            </a-radio>
            <a-radio value="private">
              <LockOutlined class="radio-icon" />
              <span class="radio-label">私有</span>
              <span class="radio-hint">仅管理员可见</span>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="专题描述">
          <a-textarea v-model:value="createForm.description" placeholder="请输入专题描述（选填）" :rows="3" :maxlength="200" show-count />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑专题弹窗 -->
    <a-modal
      v-model:open="showEditModal"
      title="编辑数据专题"
      :width="480"
      @ok="handleEditSave"
      @cancel="showEditModal = false"
      okText="保存"
      cancelText="取消"
      :okButtonProps="{ disabled: !editForm.name.trim() }"
    >
      <a-form layout="vertical" class="topic-form">
        <a-form-item label="专题名称" required>
          <a-input v-model:value="editForm.name" placeholder="请输入专题名称" :maxlength="50" />
        </a-form-item>
        <a-form-item label="专题标签">
          <a-select
            v-model:value="editForm.tags"
            mode="tags"
            placeholder="输入标签后回车（选填，最多3个）"
            :maxTagCount="3"
            style="width: 100%"
            :token-separators="[',', ' ']"
          />
        </a-form-item>
        <a-form-item label="可见范围">
          <a-radio-group v-model:value="editForm.visibility" class="visibility-radio-group">
            <a-radio value="public">
              <GlobalOutlined class="radio-icon" />
              <span class="radio-label">公开</span>
              <span class="radio-hint">所有人可见</span>
            </a-radio>
            <a-radio value="private">
              <LockOutlined class="radio-icon" />
              <span class="radio-label">私有</span>
              <span class="radio-hint">仅管理员可见</span>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="专题描述">
          <a-textarea v-model:value="editForm.description" placeholder="请输入专题描述" :rows="3" :maxlength="200" show-count />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { getTopics, createTopic, updateTopic, deleteTopic, toggleFollow } from '@/services/topicService.js'
import TopicCard from './TopicCard.vue'

const router = useRouter()
const topics = ref([])
const activeTab = ref('all')
const searchKeyword = ref('')

const currentPage = ref(1)
const pageSize = ref(12)

watch([activeTab, searchKeyword], () => {
  currentPage.value = 1
})

const CURRENT_USER = '王睿(wangrui)'

function canEditTopic(topic) {
  return topic.owner === CURRENT_USER || topic.admins?.includes(CURRENT_USER)
}

onMounted(async () => {
  topics.value = await getTopics() || []
})

const tabs = computed(() => {
  const allList = topics.value.filter(t => t.visibility === 'public' || canEditTopic(t))
  const managedList = topics.value.filter(t => t.admins?.includes(CURRENT_USER))
  const createdList = topics.value.filter(t => t.owner === CURRENT_USER)
  const followedList = topics.value.filter(t => t.followed)

  return [
    { key: 'all', label: '全部', count: allList.length },
    { key: 'managed', label: '我管理的', count: managedList.length },
    { key: 'created', label: '我创建的', count: createdList.length },
    { key: 'followed', label: '我关注的', count: followedList.length },
  ]
})

const filteredTopics = computed(() => {
  let list = topics.value

  if (activeTab.value === 'all') {
    // “全部” tab：只展示公开的，或者（如果是私有）我是创建人/管理员的
    list = list.filter(t => t.visibility === 'public' || canEditTopic(t))
  } else if (activeTab.value === 'managed') {
    list = list.filter(t => t.admins?.includes(CURRENT_USER))
  } else if (activeTab.value === 'created') {
    list = list.filter(t => t.owner === CURRENT_USER)
  } else if (activeTab.value === 'followed') {
    list = list.filter(t => t.followed)
  }

  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(t =>
      t.name.toLowerCase().includes(kw) ||
      t.description.toLowerCase().includes(kw)
    )
  }

  return list
})

const paginatedTopics = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTopics.value.slice(start, end)
})

// 创建
const showCreateModal = ref(false)
const createForm = reactive({ name: '', tags: [], visibility: 'public', description: '' })

async function handleCreate() {
  if (!createForm.name.trim()) return
  const newTopic = await createTopic({
    name: createForm.name.trim(),
    tags: createForm.tags.slice(0, 3), // 最多取3个
    visibility: createForm.visibility,
    description: createForm.description.trim(),
  })
  showCreateModal.value = false
  createForm.name = ''
  createForm.tags = []
  createForm.visibility = 'public'
  createForm.description = ''
  message.success('专题创建成功')
  // 刷新列表数据，确保在“全部”等 tab 中能看到
  topics.value = await getTopics()
  // 跳转到新创建的专题详情页
  router.push(`/topics/${newTopic.id}`)
}

// 编辑
const showEditModal = ref(false)
const editingTopic = ref(null)
const editForm = reactive({ name: '', tags: [], visibility: 'public', description: '' })

function handleEdit(topic) {
  editingTopic.value = topic
  editForm.name = topic.name
  editForm.tags = [...(topic.tags || [])]
  editForm.visibility = topic.visibility || 'public'
  editForm.description = topic.description
  showEditModal.value = true
}

async function handleEditSave() {
  if (!editForm.name.trim()) return
  await updateTopic(editingTopic.value.id, {
    name: editForm.name.trim(),
    tags: editForm.tags.slice(0, 3),
    visibility: editForm.visibility,
    description: editForm.description.trim(),
  })
  showEditModal.value = false
  editingTopic.value = null
  message.success('专题更新成功')
  topics.value = await getTopics()
}

// 删除
function handleDelete(topic) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除专题「${topic.name}」吗？此操作不可撤销。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteTopic(topic.id)
      message.success('专题已删除')
      topics.value = await getTopics()
    },
  })
}

// 关注
async function handleFollow(topic) {
  await toggleFollow(topic.id)
  topics.value = await getTopics()
}
</script>

<style scoped>
.topics-page {
  height: 100%;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

/* ===== Banner ===== */
.topics-header {
  background: #fff;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.header-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.create-btn {
  border-radius: 6px;
}

/* ===== Body ===== */
.topics-body {
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
}

/* ===== 工具栏 ===== */
.topics-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.filter-tab-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  padding: 4px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  color: #1e293b;
  background: #f8fafc;
}

.filter-tab-active {
  color: #2563eb;
  background: #eff6ff;
}

.filter-tab-active:hover {
  color: #2563eb;
  background: #eff6ff;
}

.filter-tab-count {
  font-size: 11px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.filter-tab-active .filter-tab-count {
  color: #3b82f6;
  background: #dbeafe;
}

.search-input {
  width: 240px;
}

.search-input :deep(.ant-input) {
  border-radius: 10px 0 0 10px;
}

.search-input :deep(.ant-input-group-addon) {
  border-radius: 0 10px 10px 0;
  overflow: hidden;
}

.search-input :deep(.ant-input-search-button) {
  border-radius: 0 10px 10px 0 !important;
}

.search-input :deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
  border-color: #e2e8f0;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

/* ===== 分页 ===== */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* ===== 弹窗表单 ===== */
.topic-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.topic-form :deep(.ant-form-item-label > label) {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.topic-form :deep(.ant-input),
.topic-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

.topic-form :deep(textarea.ant-input) {
  border-radius: 8px;
}

.visibility-radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  font-weight: 500;
  color: #1e293b;
  margin-right: 6px;
}

.radio-icon {
  font-size: 14px;
  color: #64748b;
  margin-right: 4px;
}

.radio-hint {
  font-size: 12px;
  color: #94a3b8;
}
</style>
