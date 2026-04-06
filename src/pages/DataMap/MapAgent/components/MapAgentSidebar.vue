<template>
  <aside
    class="w-full h-full flex flex-col shrink-0 z-10 transition-colors duration-300 relative min-h-0"
    :class="isDarkMode ? 'bg-[#001529]' : 'bg-white'"
  >
    <!-- 新建对话 -->
    <div class="p-4">
      <a-button
        block
        size="large"
        class="flex items-center justify-center gap-2 rounded-xl border-none shadow-md font-medium text-[15px] transition-all"
        :style="{
          backgroundColor: 'rgba(108,76,155,1)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(108,76,155,0.2)'
        }"
        @click="handleNewChat"
      >
        <template #icon><PlusOutlined /></template>
        新建对话
      </a-button>
    </div>

    <!-- 单层：历史 + 收藏（无 Tab） -->
    <div class="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar min-h-0 flex flex-col gap-3">
      <!-- 历史会话 -->
      <div class="mt-1 flex-shrink-0">
        <div
          class="text-xs font-semibold px-2 mb-2 tracking-wider transition-colors duration-300"
          :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
        >
          历史对话
        </div>
        <div v-if="!historyGroups.length" class="px-2 py-4 text-xs text-center transition-colors" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
          暂无历史会话
        </div>
        <template v-else>
          <div v-for="group in historyGroups" :key="group.group" class="mb-4">
            <div
              class="text-[11px] font-medium px-2 mb-1.5 tracking-wide transition-colors duration-300"
              :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
            >
              {{ group.group }}
            </div>
            <div
              v-for="item in group.items"
              :key="item.id"
              class="px-3 py-2.5 rounded-lg text-sm mb-1 cursor-pointer transition-colors duration-300 flex items-center justify-between group"
              :class="isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'"
              @click="handleHistoryClick(item)"
            >
              <div class="flex items-center truncate flex-1 min-w-0">
                <MessageOutlined class="mr-2 opacity-40 shrink-0" />
                <span class="truncate">{{ item.title }}</span>
              </div>
              <a-dropdown placement="bottomRight" :trigger="['click']">
                <div
                  class="w-6 h-6 flex items-center justify-center rounded transition-opacity shrink-0 opacity-0 group-hover:opacity-100"
                  :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'"
                  @click.stop
                >
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
        </template>
      </div>

      <!-- 收藏表折叠面板 -->
      <div class="border-t pt-3 flex-shrink-0 transition-colors" :class="isDarkMode ? 'border-white/10' : 'border-slate-100'">
        <div
          class="flex items-center justify-between px-2 mb-2 cursor-pointer select-none"
          @click="showFavorites = !showFavorites"
        >
          <div
            class="text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-colors duration-300"
            :class="isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'"
          >
            <StarFilled class="text-amber-500 text-[13px]" />
            我的收藏 ({{ favoriteRows.length }})
          </div>
          <RightOutlined
            class="text-[10px] transition-transform duration-300"
            :class="[showFavorites ? 'rotate-90' : '', isDarkMode ? 'text-slate-500' : 'text-slate-400']"
          />
        </div>

        <div v-show="showFavorites">
          <div
            v-if="!favoriteRows.length"
            class="px-3 py-4 rounded-lg text-xs leading-relaxed transition-colors"
            :class="isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-500'"
          >
            暂无收藏表。在对话中点击表旁的收藏星标，即可将常用表加入此处。
          </div>
          <div
            v-for="row in favoriteRows"
            :key="row.fqn"
            class="rounded-lg px-2.5 py-2 mb-1.5 flex items-start gap-2 transition-colors cursor-pointer group"
            :class="isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'"
            @click="emit('send', `查看 ${row.fqn} 表的详细信息`)"
          >
            <div class="flex-1 min-w-0">
              <div class="font-mono text-[13px] font-semibold truncate" :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'">
                {{ row.fqn }}
              </div>
              <div class="text-[11px] truncate mt-0.5" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                {{ row.cnName }} <span class="mx-1 opacity-40">|</span> {{ row.owner }}
              </div>
            </div>
            <a-tooltip title="取消收藏">
              <button
                type="button"
                class="shrink-0 w-7 h-7 rounded-md flex items-center justify-center border-none cursor-pointer transition-colors"
                :class="isDarkMode ? 'text-amber-400/90 hover:bg-white/10' : 'text-amber-500 hover:bg-amber-50'"
                @click.stop="emit('toggleTableFavorite', row.fqn)"
              >
                <StarFilled class="text-[15px]" />
              </button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 收起侧边栏 -->
    <div
      class="shrink-0 flex justify-center items-center py-2.5 border-t transition-colors"
      :class="isDarkMode ? 'border-white/10' : 'border-slate-100'"
    >
      <a-tooltip placement="top" title="收起侧边栏">
        <button
          type="button"
          class="flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer transition-all outline-none"
          :class="
            isDarkMode
              ? 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-[rgba(108,76,155,1)] hover:border-[rgba(108,76,155,0.35)]'
          "
          @click="$emit('collapse')"
        >
          <MenuFoldOutlined class="text-base" />
        </button>
      </a-tooltip>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MoreOutlined,
  EditOutlined,
  PushpinOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  RightOutlined,
  StarFilled
} from '@ant-design/icons-vue'
import { getHistorySessions, deleteAgentSession } from '@/services/DataMap/MapAgent/index.js'
import { enrichFavoriteRowsForDisplay } from '@/utils/mapAgentFavoriteMeta.js'
import { MAP_AGENT_FAVORITES_CHANGED_EVENT } from '@/utils/mapAgentFavorites.js'

const props = defineProps({
  isDarkMode: { type: Boolean, default: false },
  /** 已收藏 FQN 列表（与 MapAgent 页同步） */
  favoriteFqns: { type: Array, default: () => [] }
})

const emit = defineEmits(['collapse', 'send', 'newChat', 'sessionDeleted', 'selectHistory', 'toggleTableFavorite'])

const historyGroups = ref([])
const showFavorites = ref(false)

const favoriteRows = computed(() => enrichFavoriteRowsForDisplay(props.favoriteFqns))

const reloadHistory = async () => {
  try {
    historyGroups.value = await getHistorySessions()
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

onMounted(() => {
  reloadHistory()
  window.addEventListener(MAP_AGENT_FAVORITES_CHANGED_EVENT, reloadHistory)
})

onUnmounted(() => {
  window.removeEventListener(MAP_AGENT_FAVORITES_CHANGED_EVENT, reloadHistory)
})

const handleNewChat = () => {
  emit('newChat')
}

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
  emit('selectHistory', item)
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
