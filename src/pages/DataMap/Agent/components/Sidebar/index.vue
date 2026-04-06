<template>
  <aside class="w-full h-full flex flex-col shrink-0 z-10 transition-colors duration-300 relative min-h-0" :class="isDarkMode ? 'bg-[#001529]' : 'bg-white'">

    <!-- 新建对话 -->
    <div class="p-4">
      <a-button block size="large" class="flex items-center justify-center gap-2 rounded-xl border-none shadow-md font-medium text-[15px] transition-all" :style="{ backgroundColor: 'rgba(108,76,155,1)', color: 'white', boxShadow: '0 4px 12px rgba(108,76,155,0.2)' }" @click="handleNewChat">
        <template #icon><PlusOutlined /></template>
        新建对话
      </a-button>
    </div>

    <!-- Tabs -->
    <div class="flex px-4 mb-2">
      <div 
        class="flex-1 text-center py-2 text-sm font-medium cursor-pointer transition-colors border-b-2"
        :class="[
          activeTab === 'history' 
            ? 'text-[rgba(108,76,155,1)] border-[rgba(108,76,155,1)]'
            : (isDarkMode ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-400 border-transparent hover:text-slate-700')
        ]"
        @click="activeTab = 'history'"
      >
        历史对话
      </div>
      <div 
        class="flex-1 text-center py-2 text-sm font-medium cursor-pointer transition-colors border-b-2"
        :class="[
          activeTab === 'workspace' 
            ? 'text-[rgba(108,76,155,1)] border-[rgba(108,76,155,1)]'
            : (isDarkMode ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-400 border-transparent hover:text-slate-700')
        ]"
        @click="activeTab = 'workspace'"
      >
        工作台
      </div>
    </div>

    <!-- 侧边栏内容区 -->
    <div class="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
      <!-- 历史记录面板 -->
      <div v-show="activeTab === 'history'" class="mt-2">
        <div v-for="group in historyGroups" :key="group.group" class="mb-5">
          <div class="text-xs font-semibold px-2 mb-2 tracking-wider transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">{{ group.group }}</div>
          <div 
            v-for="item in group.items" 
            :key="item.id"
            class="px-3 py-2.5 rounded-lg text-sm mb-1 cursor-pointer transition-colors duration-300 flex items-center justify-between group"
            :class="isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'"
            @click="handleHistoryClick(item)"
          >
            <div class="flex items-center truncate flex-1">
              <MessageOutlined class="mr-2 opacity-40 shrink-0" />
              <span class="truncate">{{ item.title }}</span>
            </div>

            <!-- 操作菜单 -->
            <a-dropdown placement="bottomRight" :trigger="['click']">
              <div class="w-6 h-6 flex items-center justify-center rounded transition-opacity shrink-0 opacity-0 group-hover:opacity-100"
                   :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'"
                   @click.stop>
                <MoreOutlined class="text-slate-400" />
              </div>
              <template #overlay>
                <a-menu :theme="isDarkMode ? 'dark' : 'light'">
                  <a-menu-item key="rename" @click="handleHistoryAction('rename', item)">
                    <template #icon><EditOutlined /></template>
                    重命名
                  </a-menu-item>
                  <a-menu-item key="pin" @click="handleHistoryAction('pin', item)">
                    <template #icon><PushpinOutlined /></template>
                    置顶对话
                  </a-menu-item>
                  <a-menu-item key="share" @click="handleHistoryAction('share', item)">
                    <template #icon><ShareAltOutlined /></template>
                    分享对话
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger @click="handleHistoryAction('delete', item)">
                    <template #icon><DeleteOutlined /></template>
                    删除对话
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>

      <!-- 工作台面板 -->
      <div v-show="activeTab === 'workspace'" class="mt-2">
        
        <!-- 推荐数据表（MapAgent 等场景可关闭） -->
        <div class="mb-3" v-if="showWorkspaceRecommendations && workspaceData.recommendations?.length">
          <div class="flex items-center justify-between px-2 mb-2 cursor-pointer group" @click="showRecommendations = !showRecommendations">
            <div class="text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-colors duration-300" :class="isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'">
              <PushpinFilled class="text-yellow-500" /> 推荐数据表
            </div>
            <RightOutlined class="text-[10px] transition-transform duration-300" :class="[showRecommendations ? 'rotate-90' : '', isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600']" />
          </div>
          
          <div v-show="showRecommendations">
            <div 
              v-for="item in workspaceData.recommendations" 
              :key="item.id"
              class="rounded-xl p-3.5 mb-3 transition-all cursor-pointer group"
              :class="isDarkMode ? 'bg-white/5 ring-1 ring-white/10 hover:ring-[rgba(108,76,155,1)] hover:bg-white/10' : 'bg-white ring-1 ring-slate-200 hover:ring-[rgba(108,76,155,1)] hover:shadow-md'"
              @click="handleTableClick(item.fqn)"
            >
              <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <div class="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors shrink-0" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.2)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white' : 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white'">
                  <TableOutlined />
                </div>
                <span class="text-sm font-semibold transition-colors font-mono" :class="isDarkMode ? 'text-slate-200 group-hover:text-[rgba(108,76,155,1)]' : 'text-slate-800 group-hover:text-[rgba(108,76,155,1)]'">{{ item.fqn }}</span>
                <CopyOutlined class="transition-colors" :class="isDarkMode ? 'text-slate-500 hover:text-[rgba(108,76,155,1)]' : 'text-slate-400 hover:text-[rgba(108,76,155,1)]'" title="复制" @click.stop="copyText(item.fqn)" />
                <span class="px-1.5 py-0.5 text-[11px] rounded font-medium transition-colors duration-300" :class="isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'">{{ item.cnName }}</span>
              </div>
              <div class="text-xs pl-8 transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{ item.reason }}</div>
            </div>
          </div>
        </div>

        <!-- 收藏的数据表 -->
        <div class="mb-3" v-if="workspaceData.favorites?.length">
          <div class="flex items-center justify-between px-2 mb-2 cursor-pointer group" @click="showFavorites = !showFavorites">
            <div class="text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-colors duration-300" :class="isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'">
              <StarFilled class="text-orange-400" /> 收藏的数据表
            </div>
            <RightOutlined class="text-[10px] transition-transform duration-300" :class="[showFavorites ? 'rotate-90' : '', isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600']" />
          </div>
          
          <div v-show="showFavorites">
            <div 
              v-for="item in workspaceData.favorites" 
              :key="item.id"
              class="rounded-xl p-3.5 mb-3 transition-all cursor-pointer group"
              :class="isDarkMode ? 'bg-white/5 ring-1 ring-white/10 hover:ring-[rgba(108,76,155,1)] hover:bg-white/10' : 'bg-white ring-1 ring-slate-200 hover:ring-[rgba(108,76,155,1)] hover:shadow-md'"
              @click="handleTableClick(item.fqn)"
            >
              <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <div class="w-6 h-6 rounded flex items-center justify-center text-xs transition-colors shrink-0" :class="isDarkMode ? 'bg-[rgba(108,76,155,0.2)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white' : 'bg-[rgba(108,76,155,0.1)] text-[rgba(108,76,155,1)] group-hover:bg-[rgba(108,76,155,1)] group-hover:text-white'">
                  <TableOutlined />
                </div>
                <span class="text-sm font-semibold transition-colors font-mono" :class="isDarkMode ? 'text-slate-200 group-hover:text-[rgba(108,76,155,1)]' : 'text-slate-800 group-hover:text-[rgba(108,76,155,1)]'">{{ item.fqn }}</span>
                <CopyOutlined class="transition-colors" :class="isDarkMode ? 'text-slate-500 hover:text-[rgba(108,76,155,1)]' : 'text-slate-400 hover:text-[rgba(108,76,155,1)]'" title="复制" @click.stop="copyText(item.fqn)" />
                <span class="px-1.5 py-0.5 text-[11px] rounded font-medium transition-colors duration-300" :class="isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'">{{ item.cnName }}</span>
              </div>
              <div class="text-xs pl-8 transition-colors duration-300" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{ item.reason }}</div>
            </div>
          </div>
        </div>

        <!-- 我分享的对话 -->
        <div class="mb-3" v-if="workspaceData.sharedChats?.length">
          <div class="flex items-center justify-between px-2 mb-2 cursor-pointer group" @click="showShared = !showShared">
            <div class="text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-colors duration-300" :class="isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'">
              <ShareAltOutlined class="text-blue-500" /> 我分享的对话
            </div>
            <RightOutlined class="text-[10px] transition-transform duration-300" :class="[showShared ? 'rotate-90' : '', isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600']" />
          </div>
          
          <div v-show="showShared">
            <div 
              v-for="item in workspaceData.sharedChats" 
              :key="item.id"
              class="px-3 py-2.5 rounded-lg text-sm mb-1 cursor-pointer transition-colors duration-300 flex items-center justify-between group"
              :class="isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'"
              @click="handleHistoryClick(item)"
            >
              <div class="flex flex-col gap-1 truncate flex-1">
                <div class="flex items-start gap-2">
                  <MessageOutlined class="mt-0.5 opacity-40 shrink-0" />
                  <span class="truncate flex-1">{{ item.title }}</span>
                </div>
                <div class="text-[11px] pl-6 transition-colors duration-300" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                  {{ item.date }}
                </div>
              </div>

              <!-- 操作菜单 -->
              <a-dropdown placement="bottomRight" :trigger="['click']">
                <div class="w-6 h-6 flex items-center justify-center rounded transition-opacity shrink-0 opacity-0 group-hover:opacity-100"
                     :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'"
                     @click.stop>
                  <MoreOutlined class="text-slate-400" />
                </div>
                <template #overlay>
                  <a-menu :theme="isDarkMode ? 'dark' : 'light'">
                    <a-menu-item key="rename" @click="handleHistoryAction('rename', item)">
                      <template #icon><EditOutlined /></template>
                      重命名
                    </a-menu-item>
                    <a-menu-item key="pin" @click="handleHistoryAction('pin', item)">
                      <template #icon><PushpinOutlined /></template>
                      置顶对话
                    </a-menu-item>
                    <a-menu-item key="share" @click="handleHistoryAction('share', item)">
                      <template #icon><ShareAltOutlined /></template>
                      分享对话
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger @click="handleHistoryAction('delete', item)">
                      <template #icon><DeleteOutlined /></template>
                      删除对话
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 收起侧边栏：底部居中 -->
    <div
      class="shrink-0 flex justify-center items-center py-2.5 border-t transition-colors"
      :class="isDarkMode ? 'border-white/10' : 'border-slate-100'"
    >
      <a-tooltip placement="top" title="收起侧边栏">
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer transition-all outline-none"
          :class="isDarkMode
            ? 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-[rgba(108,76,155,1)] hover:border-[rgba(108,76,155,0.35)]'"
          @click="$emit('collapse')"
        >
          <MenuFoldOutlined class="text-base" />
        </button>
      </a-tooltip>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  PlusOutlined, MessageOutlined, PushpinFilled, TableOutlined, 
  CopyOutlined, MenuFoldOutlined, StarFilled, ShareAltOutlined,
  MoreOutlined, EditOutlined, PushpinOutlined, DeleteOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { getHistorySessions, getWorkspaceData, deleteAgentSession } from '@/services/DataMap/Agent/index.js'
import { MAP_AGENT_FAVORITES_CHANGED_EVENT } from '@/utils/mapAgentFavorites.js'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  },
  /** 工作台是否展示「推荐数据表」区块 */
  showWorkspaceRecommendations: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['collapse', 'send', 'newChat', 'sessionDeleted'])

const activeTab = ref('history')
const historyGroups = ref([])
const workspaceData = ref({
  recommendations: [],
  favorites: [],
  sharedChats: []
})

// 工作台折叠面板状态 (默认展开推荐，收起其他)
const showRecommendations = ref(true)
const showFavorites = ref(false)
const showShared = ref(false)

const reloadWorkspaceData = async () => {
  try {
    workspaceData.value = await getWorkspaceData()
  } catch (error) {
    console.error('Failed to load workspace data:', error)
  }
}

onMounted(async () => {
  try {
    historyGroups.value = await getHistorySessions()
    await reloadWorkspaceData()
  } catch (error) {
    console.error('Failed to load sidebar data:', error)
  }
  window.addEventListener(MAP_AGENT_FAVORITES_CHANGED_EVENT, reloadWorkspaceData)
})

onUnmounted(() => {
  window.removeEventListener(MAP_AGENT_FAVORITES_CHANGED_EVENT, reloadWorkspaceData)
})

const handleNewChat = () => {
  emit('newChat')
}

/** 从本地侧边栏数据中移除一条会话（历史分组 + 我分享的对话） */
const removeSessionFromLocalState = (sessionId) => {
  const sid = String(sessionId)
  for (let g = 0; g < historyGroups.value.length; g++) {
    const group = historyGroups.value[g]
    const idx = group.items.findIndex((i) => String(i.id) === sid)
    if (idx !== -1) {
      group.items.splice(idx, 1)
      if (group.items.length === 0) {
        historyGroups.value.splice(g, 1)
      }
      return true
    }
  }
  const shared = workspaceData.value.sharedChats
  if (shared?.length) {
    const si = shared.findIndex((i) => String(i.id) === sid)
    if (si !== -1) {
      shared.splice(si, 1)
      return true
    }
  }
  return false
}

const handleDeleteSession = (item) => {
  Modal.confirm({
    title: '确认删除该对话？',
    content: '删除后无法恢复。',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteAgentSession(item.id)
        removeSessionFromLocalState(item.id)
        emit('sessionDeleted', item.id)
        message.success('已删除对话')
      } catch (e) {
        console.error(e)
        message.error(e?.message || '删除失败，请稍后重试')
        throw e
      }
    }
  })
}

const handleHistoryAction = (action, item) => {
  if (action === 'delete') {
    handleDeleteSession(item)
    return
  }
  const actionMap = {
    rename: '重命名',
    pin: '置顶对话',
    share: '分享对话'
  }
  message.info(`触发操作：${actionMap[action]} - ${item.title}`)
}

const handleHistoryClick = (item) => {
  message.info(`加载历史对话：${item.title}`)
  // TODO: 实际项目中这里需要调用接口加载历史对话记录并更新 messages
}

const handleTableClick = (fqn) => {
  emit('send', `查看 ${fqn} 表的详细信息`)
}

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制表名')
  })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
