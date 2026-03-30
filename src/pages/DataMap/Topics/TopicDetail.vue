<template>
  <div class="topic-detail" v-if="topic">
    <!-- 顶部信息卡片 -->
    <div class="detail-header">
      <div class="header-bg-decor"></div>
      <div class="header-content">
        <div class="header-top-row">
          <a-button type="text" class="back-btn" @click="router.push('/topics')">
            <ArrowLeftOutlined /> 返回列表
          </a-button>
          <div class="header-actions">
            <a-button
              :class="['follow-btn', topic.followed && 'follow-btn-active']"
              @click="handleFollow"
            >
              <StarFilled v-if="topic.followed" />
              <StarOutlined v-else />
              {{ topic.followed ? '已关注' : '关注' }}
            </a-button>
            <a-dropdown v-if="canEdit" :trigger="['click']" placement="bottomRight">
              <a-button class="more-btn">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu class="topic-action-menu">
                  <a-menu-item key="edit" @click="openEditModal">
                    <div class="menu-item-content">
                      <EditOutlined class="menu-icon" /> 
                      <span>编辑专题</span>
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger @click="handleDeleteTopic">
                    <div class="menu-item-content">
                      <DeleteOutlined class="menu-icon" /> 
                      <span>删除专题</span>
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <div class="header-main">
          <div class="title-row">
            <div class="title-icon-wrap">
              <FolderOpenOutlined />
            </div>
            <div class="title-text-wrap">
              <div class="title-line">
                <template v-if="!isEditingTitle">
                  <h1 class="detail-title">
                    {{ topic.name }}
                    <EditOutlined v-if="canEdit" class="inline-edit-icon" @click="startEditTitle" />
                  </h1>
                </template>
                <template v-else>
                  <div class="inline-edit-wrapper">
                    <a-input v-model:value="editingTitle" size="small" class="inline-input" style="width: 300px" @pressEnter="saveTitle" />
                    <div class="inline-actions">
                      <button class="inline-btn save-btn" @click.stop.prevent="saveTitle" type="button" title="保存"><CheckOutlined /></button>
                      <button class="inline-btn cancel-btn" @click.stop.prevent="isEditingTitle = false" type="button" title="取消"><CloseOutlined /></button>
                    </div>
                  </div>
                </template>
                <a-tag v-if="topic.visibility === 'private'" class="visibility-tag">
                  <LockOutlined /> 私有
                </a-tag>
              </div>
              <div class="topic-tags-container" v-if="canEdit || (topic.tags && topic.tags.length)">
                <template v-if="!isEditingTags">
                  <div class="topic-tags" v-if="topic.tags && topic.tags.length">
                    <span v-for="tag in topic.tags" :key="tag" class="custom-tag">{{ tag }}</span>
                    <a-button v-if="canEdit" type="text" class="edit-tags-btn" @click="startEditTags">
                      <EditOutlined />
                    </a-button>
                  </div>
                  <div class="topic-tags" v-else-if="canEdit">
                    <a-button type="dashed" size="small" class="add-tag-btn" @click="startEditTags">
                      <PlusOutlined /> 添加标签
                    </a-button>
                  </div>
                </template>
                <template v-else>
                  <div class="edit-tags-wrapper">
                    <a-select
                      v-model:value="editingTags"
                      mode="tags"
                      placeholder="输入标签后回车（最多3个）"
                      :maxTagCount="3"
                      style="width: 260px"
                      size="small"
                      class="inline-input"
                      :token-separators="[',', ' ']"
                    />
                    <div class="inline-actions">
                      <button class="inline-btn save-btn" @click.stop.prevent="saveTags" type="button" title="保存"><CheckOutlined /></button>
                      <button class="inline-btn cancel-btn" @click.stop.prevent="isEditingTags = false" type="button" title="取消"><CloseOutlined /></button>
                    </div>
                  </div>
                </template>
              </div>
              <div class="desc-line">
                <template v-if="!isEditingDesc">
                  <p class="detail-desc">
                    {{ topic.description || '暂无描述' }}
                    <EditOutlined v-if="canEdit" class="inline-edit-icon" @click="startEditDesc" />
                  </p>
                </template>
                <template v-else>
                  <div class="inline-edit-wrapper desc-edit">
                    <a-textarea v-model:value="editingDesc" :rows="2" class="inline-input" style="width: 400px" />
                    <div class="inline-actions desc-actions">
                      <button class="inline-btn save-btn" @click.stop.prevent="saveDesc" type="button" title="保存"><CheckOutlined /></button>
                      <button class="inline-btn cancel-btn" @click.stop.prevent="isEditingDesc = false" type="button" title="取消"><CloseOutlined /></button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 信息指标条 -->
        <div class="meta-bar">
          <div class="meta-item">
            <span class="meta-label">创建人</span>
            <span class="meta-value owner-cell">
              <a-avatar :size="20" class="owner-avatar">{{ topic.owner?.charAt(0) }}</a-avatar>
              {{ topic.owner }}
            </span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">管理员</span>
            <span class="meta-value meta-admins">
              <span v-for="(admin, index) in topic.admins" :key="admin" class="admin-text">
                {{ admin }}<span v-if="index < topic.admins.length - 1">,</span>
              </span>
              <a v-if="canEdit" class="add-link" @click="showAdminModal = true"><PlusOutlined /></a>
            </span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">数据表</span>
            <span class="meta-value number-value">{{ topic.tableCount }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">关注人数</span>
            <span class="meta-value number-value">{{ topic.followerCount }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">更新时间</span>
            <span class="meta-value time-value">{{ topic.updatedAt }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="detail-body">
      <div class="detail-tabs-container">
        <a-tabs v-model:activeKey="activeTab" class="detail-tabs">
        <!-- 表列表 -->
        <a-tab-pane key="tables">
          <template #tab>
            <span><TableOutlined /> 数据表</span>
          </template>
          <div class="tab-toolbar">
            <a-input-search
              v-model:value="tableSearch"
              placeholder="搜索表名..."
              class="table-search"
              allow-clear
            />
            <div class="toolbar-actions">
              <a-button v-if="canEdit" type="primary" ghost @click="showAddTableModal = true">
                <template #icon><PlusOutlined /></template>
                添加数据表
              </a-button>
            </div>
          </div>
          <div class="table-card">
            <a-table
              :columns="tableColumns"
              :data-source="filteredTables"
              :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 张表` }"
              row-key="id"
              size="middle"
              :scroll="{ x: 1080 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="table-name-wrapper">
                    <a class="table-name-link" @click="goTableDetail(record)">
                      <span class="table-display-name font-mono">{{ record.database ? record.database + '.' : '' }}{{ record.name }}</span>
                      <span class="table-tech-name text-gray-500">{{ record.displayName || '-' }}</span>
                    </a>
                    <a-tooltip title="复制表名">
                      <CopyOutlined class="copy-icon" @click="copyName(record.database ? record.database + '.' + record.name : record.name, $event)" />
                    </a-tooltip>
                  </div>
                </template>
                <template v-if="column.key === 'description'">
                  <a-tooltip :title="record.description" placement="topLeft">
                    <span class="desc-text">{{ record.description || '-' }}</span>
                  </a-tooltip>
                </template>
                <template v-if="column.key === 'owner'">
                  <span class="owner-cell">
                    <UserOutlined class="owner-icon" /> {{ record.owner || '-' }}
                  </span>
                </template>
                <template v-if="column.key === 'serviceType'">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <SourceTag :type="record.serviceType" :size="16" />
                    <span style="font-size: 13px; color: #475569;">{{ record.serviceType }}</span>
                  </div>
                </template>
                <template v-if="column.key === 'hot'">
                  <div class="table-hot-meta">
                    <a-tooltip title="最近30天被查询/引用的次数">
                      <div class="meta-unit stat-item">
                        <FireFilled class="stat-icon fire" />
                        <span class="stat-count">{{ record.queryCount || Math.floor((record.hot || 320) * 0.8) }}</span>
                      </div>
                    </a-tooltip>
                    <a-tooltip title="最近30天被浏览的次数">
                      <div class="meta-unit stat-item">
                        <EyeOutlined class="stat-icon eye" />
                        <span class="stat-count">{{ record.viewCount || (record.hot || 400) }}</span>
                      </div>
                    </a-tooltip>
                  </div>
                </template>
                <template v-if="column.key === 'action'">
                  <a-popconfirm
                    v-if="canEdit"
                    title="确定将此表移出专题？"
                    okText="确定"
                    cancelText="取消"
                    @confirm="handleRemoveTable(record)"
                  >
                    <a-button type="link" danger size="small">移出</a-button>
                  </a-popconfirm>
                </template>
              </template>
              <template #emptyText>
                <div class="table-empty">
                  <p>暂无数据表</p>
                  <a-button v-if="canEdit" type="primary" ghost size="small" @click="showAddTableModal = true">添加第一张表</a-button>
                </div>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 使用说明 -->
        <a-tab-pane key="usage">
          <template #tab>
            <span><FileTextOutlined /> 使用说明</span>
          </template>
          <div class="usage-section">
            <div class="usage-toolbar">
              <template v-if="!isEditingNote">
                <a-button v-if="canEdit" class="usage-edit-btn" size="small" @click="startEditNote">
                  <template #icon><EditOutlined /></template>
                  编辑说明
                </a-button>
              </template>
              <template v-else>
                <a-button type="primary" class="usage-save-btn" size="small" @click="saveNote">保存说明</a-button>
                <a-button class="usage-cancel-btn" size="small" @click="cancelEditNote">取消</a-button>
              </template>
            </div>
            <div v-if="!isEditingNote" class="usage-card">
              <div v-if="topic.usageNote" class="usage-preview" v-html="renderedNote"></div>
              <div v-else class="usage-empty">
                <FileTextOutlined class="usage-empty-icon" />
                <p>暂无使用说明</p>
                <a-button v-if="canEdit" class="usage-edit-btn" size="small" @click="startEditNote">开始编写</a-button>
              </div>
            </div>
            <a-textarea
              v-else
              v-model:value="noteText"
              :rows="14"
              placeholder="请输入使用说明（支持 Markdown 格式）"
              class="usage-editor"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
      </div>
    </div>

    <!-- 底部悬浮操作栏 -->
    <div class="detail-footer" v-if="hasUnsavedTableChanges">
      <div class="footer-content">
        <div class="footer-info">
          <InfoCircleFilled class="info-icon" />
          <span class="info-text">数据表列表已修改，请保存以生效</span>
        </div>
        <div class="footer-actions">
          <a-button size="large" @click="cancelTableChanges">取消</a-button>
          <a-button size="large" type="primary" @click="saveTableChanges">保存更改</a-button>
        </div>
      </div>
    </div>

    <!-- 添加数据表弹窗 -->
    <a-modal
      v-model:open="showAddTableModal"
      title="添加数据表"
      :width="800"
      @ok="handleAddTables"
      @cancel="showAddTableModal = false"
      okText="保存"
      cancelText="取消"
      :okButtonProps="{ disabled: !selectedTables.length }"
      class="add-table-modal"
    >
      <p class="modal-hint">选择要添加到专题的数据表（已在专题中的表不会重复添加）</p>
      
      <div class="add-table-container">
        <!-- 左侧：数据库列表 -->
        <div class="db-list-sidebar">
          <div class="db-list-header">选择数据库</div>
          <div class="db-list-search">
            <a-input-search
              v-model:value="dbSearch"
              placeholder="搜索数据库..."
              size="small"
              allow-clear
            />
          </div>
          <div class="db-list-content">
            <div 
              v-for="db in filteredDatabases" 
              :key="db"
              :class="['db-item', selectedDb === db && 'db-item-active']"
              @click="selectedDb = db"
            >
              <DatabaseOutlined class="db-icon" />
              <span class="db-name" :title="db">{{ db }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：数据表列表 -->
        <div class="table-list-main">
          <div class="table-list-header">
            <a-input-search
              v-model:value="availableTableSearch"
              placeholder="在当前库中搜索表名..."
              style="width: 240px;"
              allow-clear
              size="small"
            />
            <span class="selected-count" v-if="selectedTables.length">已选 {{ selectedTables.length }} 项</span>
          </div>
          <a-table
            :columns="addTableColumns"
            :data-source="filteredAvailableTables"
            :row-selection="{ selectedRowKeys: selectedTables, onChange: (keys) => selectedTables = keys }"
            :pagination="{ pageSize: 10, showSizeChanger: true, size: 'small' }"
            row-key="id"
            size="small"
            :scroll="{ y: 360 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="table-name-wrapper" style="gap: 0;">
                  <div class="table-name-link" style="cursor: default;">
                    <span class="table-display-name font-mono">{{ record.name }}</span>
                    <span class="table-tech-name text-gray-500">{{ record.displayName || '-' }}</span>
                  </div>
                </div>
              </template>
              <template v-if="column.key === 'owner'">
                <span class="owner-cell">
                  <UserOutlined class="owner-icon" /> {{ record.owner || '-' }}
                </span>
              </template>
              <template v-if="column.key === 'description'">
                <a-tooltip :title="record.description" placement="topLeft">
                  <span class="desc-text">{{ record.description || '-' }}</span>
                </a-tooltip>
              </template>
              <template v-if="column.key === 'serviceType'">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <SourceTag :type="record.serviceType" :size="16" />
                  <span style="font-size: 13px; color: #475569;">{{ record.serviceType }}</span>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
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
      :okButtonProps="{ disabled: !editForm.name.trim(), class: 'custom-modal-btn' }"
      :cancelButtonProps="{ class: 'custom-modal-btn' }"
      class="topic-modal"
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

    <!-- 管理员弹窗 -->
    <a-modal
      v-model:open="showAdminModal"
      title="管理管理员"
      :width="400"
      @ok="showAdminModal = false"
      okText="确定"
      cancelText="取消"
    >
      <a-select
        v-model:value="topic.admins"
        mode="multiple"
        placeholder="搜索并选择管理员"
        style="width: 100%"
        show-search
        :options="adminOptions"
      />
    </a-modal>
  </div>

  <div v-else class="detail-loading">
    <a-spin size="large" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  TableOutlined,
  StarOutlined,
  StarFilled,
  LockOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  FireFilled,
  EyeOutlined,
  CopyOutlined,
  MoreOutlined,
  FolderOpenOutlined,
  DeleteOutlined,
  InfoCircleFilled,
  DatabaseOutlined,
  CheckOutlined,
  CloseOutlined,
  GlobalOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { marked } from 'marked'
import SourceTag from '@/pages/DataMap/components/SourceTag.vue'
import {
  getTopicDetail,
  toggleFollow,
  addTableToTopic,
  removeTableFromTopic,
  getAvailableTables,
  updateUsageNote,
  updateTopic,
  deleteTopic,
} from '@/services/DataMap/topicService.js'

const route = useRoute()
const router = useRouter()

const topic = ref(null)
const activeTab = ref('tables')
const tableSearch = ref('')

const CURRENT_USER = '王睿(wangrui)'

const canEdit = computed(() => {
  if (!topic.value) return false
  return topic.value.owner === CURRENT_USER || topic.value.admins?.includes(CURRENT_USER)
})

const topicId = computed(() => route.params.id)

// 用于本地暂存的表列表，实现"保存/取消"逻辑
const localTables = ref([])
const hasUnsavedTableChanges = ref(false)

async function loadTopic() {
  topic.value = await getTopicDetail(topicId.value)
  if (!topic.value) {
    message.error('专题不存在')
    router.replace('/topics')
  } else {
    // 初始化本地表列表
    localTables.value = JSON.parse(JSON.stringify(topic.value.tables || []))
    hasUnsavedTableChanges.value = false
  }
}

onMounted(loadTopic)
watch(topicId, loadTopic)

// 表格列
const tableColumns = [
  { title: '数据表名', dataIndex: 'name', key: 'name', width: 280 },
  { title: '表负责人', dataIndex: 'owner', key: 'owner', width: 120 },
  { title: '表描述', dataIndex: 'description', key: 'description', width: 200, ellipsis: true },
  { title: '数据源', dataIndex: 'serviceType', key: 'serviceType', width: 120 },
  { title: '热度', dataIndex: 'hot', key: 'hot', width: 100 },
  { title: '添加时间', dataIndex: 'addedAt', key: 'addedAt', width: 120 },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]

const filteredTables = computed(() => {
  const tables = localTables.value || []
  const kw = tableSearch.value.trim().toLowerCase()
  if (!kw) return tables
  return tables.filter(t => t.name.toLowerCase().includes(kw))
})

async function handleFollow() {
  await toggleFollow(topicId.value)
  await loadTopic()
}

function goTableDetail(record) {
  // 如果有 fullyQualifiedName 直接用，否则拼装一个
  const fqn = record.fullyQualifiedName || `${record.serviceType?.toLowerCase() || 'hive'}.${record.database || 'default'}.${record.name}`
  router.push('/detail/' + encodeURIComponent(fqn))
}

async function handleRemoveTable(record) {
  // 仅在本地移除
  localTables.value = localTables.value.filter(t => t.id !== record.id)
  hasUnsavedTableChanges.value = true
  message.success(`已暂存移出 ${record.name} 的操作，请点击保存生效`)
}

function copyName(name, event) {
  event.stopPropagation()
  navigator.clipboard.writeText(name).then(() => {
    message.success('表名已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}

// 添加数据表
const showAddTableModal = ref(false)
const availableTables = ref([])
const selectedTables = ref([])
const availableTableSearch = ref('')
const selectedDb = ref('全部') // 新增：当前选中的数据库

const addTableColumns = [
  { title: '数据表名', dataIndex: 'name', key: 'name', width: 240 },
  { title: '表负责人', dataIndex: 'owner', key: 'owner', width: 120 },
  { title: '表描述', dataIndex: 'description', key: 'description', width: 160, ellipsis: true },
  { title: '数据源', dataIndex: 'serviceType', key: 'serviceType', width: 100 },
]

const dbSearch = ref('')

// 提取所有可用的数据库列表
const availableDatabases = computed(() => {
  const dbs = new Set(availableTables.value.map(t => t.database).filter(Boolean))
  return ['全部', ...Array.from(dbs).sort()]
})

const filteredDatabases = computed(() => {
  const kw = dbSearch.value.trim().toLowerCase()
  if (!kw) return availableDatabases.value
  return availableDatabases.value.filter(db => db === '全部' || db.toLowerCase().includes(kw))
})

watch(showAddTableModal, async (val) => {
  if (val) {
    availableTables.value = await getAvailableTables() || []
    selectedTables.value = []
    availableTableSearch.value = ''
    selectedDb.value = '全部'
  }
})

const filteredAvailableTables = computed(() => {
  const existingIds = new Set(localTables.value.map(t => t.id))
  let list = availableTables.value.filter(t => !existingIds.has(t.id))
  
  // 1. 按数据库过滤
  if (selectedDb.value !== '全部') {
    list = list.filter(t => t.database === selectedDb.value)
  }
  
  // 2. 按关键字过滤
  const kw = availableTableSearch.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(t => 
      t.name.toLowerCase().includes(kw) || 
      (t.displayName && t.displayName.toLowerCase().includes(kw))
    )
  }
  return list
})

async function handleAddTables() {
  const newTables = []
  for (const tableId of selectedTables.value) {
    const table = availableTables.value.find(t => t.id === tableId)
    if (table) {
      // 模拟添加时间
      newTables.push({ ...table, addedAt: new Date().toISOString().split('T')[0] })
    }
  }
  
  // 仅在本地添加
  localTables.value = [...newTables, ...localTables.value]
  hasUnsavedTableChanges.value = true
  
  showAddTableModal.value = false
  message.success(`已暂存添加 ${selectedTables.value.length} 张表，请点击保存生效`)
}

async function saveTableChanges() {
  // 这里模拟一个批量更新表列表的接口调用
  // 实际项目中可能是一个 updateTopicTables(topicId, tableIds) 接口
  
  // 为了在 mock 环境生效，我们先清空原有表，再把本地的表加进去
  // 注意：这只是为了配合现有的 mock 接口逻辑
  const originalIds = (topic.value?.tables || []).map(t => t.id)
  const currentIds = localTables.value.map(t => t.id)
  
  // 找出被移除的表
  const removedIds = originalIds.filter(id => !currentIds.includes(id))
  for (const id of removedIds) {
    await removeTableFromTopic(topicId.value, id)
  }
  
  // 找出新添加的表
  const addedIds = currentIds.filter(id => !originalIds.includes(id))
  for (const id of addedIds) {
    const table = availableTables.value.find(t => t.id === id) || localTables.value.find(t => t.id === id)
    if (table) await addTableToTopic(topicId.value, JSON.parse(JSON.stringify(table)))
  }
  
  await loadTopic()
  message.success('数据表更改已保存')
}

function cancelTableChanges() {
  // 恢复本地列表为原始列表
  localTables.value = JSON.parse(JSON.stringify(topic.value?.tables || []))
  hasUnsavedTableChanges.value = false
  message.info('已取消更改')
}

// 管理员
const showAdminModal = ref(false)
const adminOptions = [
  { label: '张三(zhangsan)', value: '张三(zhangsan)' },
  { label: '李四(lisi)', value: '李四(lisi)' },
  { label: '王五(wangwu)', value: '王五(wangwu)' },
  { label: '赵六(zhaoliu)', value: '赵六(zhaoliu)' },
  { label: '王睿(wangrui)', value: '王睿(wangrui)' },
  { label: '陈七(chenqi)', value: '陈七(chenqi)' },
  { label: '吴九(wujiu)', value: '吴九(wujiu)' },
  { label: '郑十(zhengshi)', value: '郑十(zhengshi)' },
]

// 使用说明
const isEditingNote = ref(false)
const noteText = ref('')

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderedNote = computed(() => {
  if (!topic.value?.usageNote) return ''
  return marked.parse(topic.value.usageNote)
})

function startEditNote() {
  noteText.value = topic.value?.usageNote || ''
  isEditingNote.value = true
}

function cancelEditNote() {
  isEditingNote.value = false
}

async function saveNote() {
  await updateUsageNote(topicId.value, noteText.value)
  await loadTopic()
  isEditingNote.value = false
  message.success('使用说明已保存')
}

// 标签编辑
const isEditingTags = ref(false)
const editingTags = ref([])

function startEditTags() {
  editingTags.value = [...(topic.value?.tags || [])]
  isEditingTags.value = true
}

async function saveTags() {
  await updateTopic(topicId.value, {
    tags: JSON.parse(JSON.stringify(editingTags.value.slice(0, 3)))
  })
  await loadTopic()
  isEditingTags.value = false
  message.success('标签已更新')
}

// 标题和描述编辑
const isEditingTitle = ref(false)
const editingTitle = ref('')

function startEditTitle() {
  editingTitle.value = topic.value?.name || ''
  isEditingTitle.value = true
}

async function saveTitle() {
  if (!editingTitle.value.trim()) {
    message.error('专题名称不能为空')
    return
  }
  await updateTopic(topicId.value, {
    name: editingTitle.value.trim()
  })
  await loadTopic()
  isEditingTitle.value = false
  message.success('专题名称已更新')
}

const isEditingDesc = ref(false)
const editingDesc = ref('')

function startEditDesc() {
  editingDesc.value = topic.value?.description || ''
  isEditingDesc.value = true
}

async function saveDesc() {
  await updateTopic(topicId.value, {
    description: editingDesc.value.trim()
  })
  await loadTopic()
  isEditingDesc.value = false
  message.success('专题描述已更新')
}

// 专题操作
const showEditModal = ref(false)
const editForm = ref({
  name: '',
  tags: [],
  visibility: 'public',
  description: ''
})

function openEditModal() {
  editForm.value = {
    name: topic.value.name || '',
    tags: [...(topic.value.tags || [])],
    visibility: topic.value.visibility || 'public',
    description: topic.value.description || ''
  }
  showEditModal.value = true
}

async function handleEditSave() {
  if (!editForm.value.name.trim()) return
  await updateTopic(topicId.value, {
    name: editForm.value.name.trim(),
    tags: editForm.value.tags.slice(0, 3),
    visibility: editForm.value.visibility,
    description: editForm.value.description.trim(),
  })
  showEditModal.value = false
  await loadTopic()
  message.success('专题信息已更新')
}

function handleDeleteTopic() {
  Modal.confirm({
    title: '确定要删除该专题吗？',
    content: '删除后将无法恢复，专题内的数据表不会被删除。',
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteTopic(topicId.value)
      message.success('专题已删除')
      router.replace('/topics')
    }
  })
}
</script>

<style scoped>
.topic-detail {
  height: calc(100vh - 64px - 48px); /* 视口 - 顶栏 - app-content padding */
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
}

/* ===== 顶部信息区 ===== */
.detail-header {
  position: relative;
  background: #fff;
  padding: 0;
  border-bottom: none; /* 移除线段 */
  border-radius: 12px; /* 增加圆角 */
  margin: 12px 24px 8px 24px; /* 紧凑间距 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
  flex-shrink: 0;
}

.header-bg-decor {
  display: none; /* 移除背景色/渐变 */
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 12px 24px 0;
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  color: #64748b;
  font-size: 13px;
  padding: 4px 0;
  height: auto;
}

.back-btn:hover {
  color: #3b82f6;
}

.follow-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.follow-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}

.follow-btn-active {
  border-color: #fbbf24;
  color: #fff;
  background: #fbbf24;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.35);
}

.follow-btn-active:hover {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #fff;
}

.more-btn {
  padding: 4px 8px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
}

.more-btn:hover {
  color: #3b82f6;
  border-color: #bfdbfe;
  background: #eff6ff;
}

/* 标题区 */
.header-main {
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.title-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.title-text-wrap {
  flex: 1;
  min-width: 0;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-edit-icon {
  font-size: 14px;
  color: #94a3b8; /* 默认可见，颜色稍浅 */
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
}

.inline-edit-icon:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.inline-edit-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.desc-edit {
  align-items: flex-start;
}

.inline-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.desc-actions {
  flex-direction: column;
}

.inline-input {
  border-radius: 4px;
}

.inline-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  outline: none;
  pointer-events: auto;
}

.save-btn {
  color: #10b981;
  background: #ecfdf5;
}

.save-btn:hover {
  color: #059669;
  background: #d1fae5;
}

.cancel-btn {
  color: #64748b;
  background: #f1f5f9;
}

.cancel-btn:hover {
  color: #ef4444;
  background: #fef2f2;
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
  padding: 2px 8px;
}

.topic-tags-container {
  margin-bottom: 4px;
  min-height: 22px;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.edit-tags-btn {
  padding: 0 4px;
  height: 22px;
  color: #94a3b8;
}

.edit-tags-btn:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.add-tag-btn {
  font-size: 12px;
  color: #64748b;
  border-color: #cbd5e1;
}

.add-tag-btn:hover {
  color: #3b82f6;
  border-color: #93c5fd;
}

.edit-tags-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-tag {
  font-size: 12px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1px solid #dbeafe;
}

.detail-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  max-width: 800px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 信息指标条 (极简风格) */
.meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-divider {
  width: 1px;
  height: 14px;
  background: #e2e8f0;
}

.meta-label {
  font-size: 13px;
  color: #94a3b8;
}

.meta-value {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.number-value {
  font-family: 'Fira Code', 'SF Mono', monospace;
  color: #0f172a;
  font-weight: 600;
}

.time-value {
  color: #64748b;
  font-weight: 400;
}

.owner-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.owner-avatar {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  font-size: 11px !important;
}

.meta-admins {
  display: flex;
  align-items: center;
  gap: 4px;
}

.admin-text {
  color: #475569;
}

.add-link {
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eff6ff;
  transition: all 0.2s;
  margin-left: 4px;
}

.add-link:hover {
  background: #dbeafe;
  color: #2563eb;
}

/* ===== Tab 内容区 ===== */
.detail-body {
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子项收缩 */
  padding: 0 24px 16px;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-tabs-container {
  padding: 16px 24px; /* 内部留白 */
  background: #fff; /* 白色卡片背景 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止溢出 */
  margin-bottom: 24px; /* 确保底部留有间距 */
}

.detail-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 让 tabs 内部可以滚动 */
}

.detail-tabs :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow-y: auto; /* 让 tab 内容区可以滚动 */
  padding-right: 8px; /* 滚动条预留空间 */
}

.detail-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.detail-tabs :deep(.ant-tabs-tab) {
  font-size: 14px;
  padding: 12px 0;
}

/* 表列表 */
.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-search {
  width: 260px;
}

.table-search :deep(.ant-input) {
  border-radius: 10px 0 0 10px;
}

.table-search :deep(.ant-input-group-addon) {
  border-radius: 0 10px 10px 0;
  overflow: hidden;
}

.table-search :deep(.ant-input-search-button) {
  border-radius: 0 10px 10px 0 !important;
}

.table-search :deep(.ant-input-affix-wrapper) {
  border-radius: 10px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-card :deep(.ant-table) {
  border-radius: 14px;
}

.table-card :deep(.ant-table-thead > tr > th) {
  background: #fafbfc;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.table-name-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.table-name-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  color: #1677ff;
}

.table-name-link:hover .table-display-name {
  text-decoration: underline;
}

.table-display-name {
  font-weight: 600;
  font-size: 13px;
  font-family: 'Fira Code', 'SF Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.table-tech-name {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.copy-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}

.copy-icon:hover {
  color: #1677ff;
}

.owner-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.owner-icon {
  font-size: 12px;
  opacity: 0.8;
}

.desc-text {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  cursor: default;
}

.table-hot-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.meta-unit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item {
  cursor: help;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background-color: #f1f5f9;
}

.stat-icon {
  font-size: 14px;
}

.stat-icon.fire {
  color: #ff7875;
}

.stat-icon.eye {
  color: #3b82f6;
}

.stat-count {
  font-family: 'Fira Code', 'SF Mono', monospace;
  font-weight: 500;
  font-size: 13px;
}

.table-empty {
  padding: 32px 0;
  text-align: center;
  color: #94a3b8;
}

/* 使用说明 */
.usage-section {
  max-width: 840px;
}

.usage-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.usage-edit-btn {
  border-radius: 6px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #fff;
  transition: all 0.2s;
}

.usage-edit-btn:hover {
  color: #3b82f6;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.usage-save-btn {
  border-radius: 6px;
}

.usage-cancel-btn {
  border-radius: 6px;
}

.usage-card {
  background: #fff;
  border: 1px solid #eef1f5;
  border-radius: 12px;
  padding: 28px 32px;
  min-height: 240px;
  margin-bottom: 24px;
}

.usage-preview {
  font-size: 14px;
  color: #334155;
  line-height: 1.8;
}

.usage-preview :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px;
}

.usage-preview :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 20px 0 8px;
}

.usage-preview :deep(h4) {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 16px 0 6px;
}

.usage-preview :deep(ul) {
  padding-left: 20px;
  margin: 8px 0;
}

.usage-preview :deep(li) {
  margin-bottom: 4px;
}

.usage-preview :deep(code) {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Fira Code', 'SF Mono', monospace;
  color: #7c3aed;
}

.usage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #94a3b8;
}

.usage-empty-icon {
  font-size: 36px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.usage-empty p {
  margin: 0 0 16px;
  font-size: 14px;
}

.usage-editor {
  font-family: 'Fira Code', 'SF Mono', monospace;
  font-size: 13px;
  border-radius: 12px;
  min-height: 280px;
}

/* 底部悬浮操作栏 */
.detail-footer {
  position: absolute;
  bottom: 24px; /* 悬浮留出间距，与顶部间距保持一致 */
  left: 24px;
  right: 24px;
  background: #fff;
  border-top: none; /* 移除线段 */
  border-radius: 12px; /* 增加圆角 */
  padding: 16px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); /* 加深阴影使其更像悬浮卡片 */
  z-index: 10;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  color: #1677ff;
  font-size: 18px;
}

.info-text {
  color: #1e293b;
  font-size: 15px;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 16px;
}

.footer-actions .ant-btn {
  min-width: 88px;
}

/* 添加数据表弹窗 */
.add-table-modal :deep(.ant-modal-body) {
  padding-bottom: 0;
}

.add-table-container {
  display: flex;
  height: 440px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
}

.db-list-sidebar {
  width: 200px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.db-list-header {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
}

.db-list-search {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

.db-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.db-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.db-item:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.db-item-active {
  background: #eff6ff !important;
  color: #1677ff !important;
  font-weight: 500;
}

.db-icon {
  font-size: 14px;
}

.db-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Fira Code', 'SF Mono', monospace;
}

.table-list-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

.table-list-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 13px;
  color: #1677ff;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 弹窗 */
.modal-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 12px;
}

/* 加载 */
.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* 下拉菜单样式优化 */
:deep(.topic-action-menu) {
  min-width: 120px;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.topic-action-menu .ant-dropdown-menu-item) {
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.topic-action-menu .ant-dropdown-menu-item:hover) {
  background-color: #f1f5f9;
}

:deep(.topic-action-menu .ant-dropdown-menu-item-danger:hover) {
  background-color: #fef2f2;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.menu-icon {
  font-size: 14px;
  opacity: 0.8;
}

/* 弹窗表单样式 */
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

.visibility-radio-group :deep(.ant-radio-wrapper-checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

/* 弹窗按钮样式优化 */
:deep(.topic-modal .ant-modal-footer) {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

:deep(.topic-modal .custom-modal-btn) {
  border-radius: 8px;
  padding: 4px 16px;
  height: 36px;
  font-size: 14px;
}

:deep(.topic-modal .ant-btn-primary) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

:deep(.topic-modal .ant-btn-primary:hover) {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

:deep(.topic-modal .ant-btn-primary[disabled]) {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
}
</style>
