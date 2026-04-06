<template>
  <div class="w-full">
    <template v-if="status === 'loading' && !hasSteps">
      <span class="typing-dots"><span /><span /><span /></span>
    </template>
    <template v-else-if="content">
      <div 
        ref="containerRef"
        class="markdown-body w-full" 
        :class="isDarkMode ? 'dark-markdown' : ''"
        v-html="renderedHtml"
      ></div>
      <span 
        v-if="status === 'streaming'" 
        class="inline-block w-1.5 h-3.5 ml-1 align-middle bg-[rgba(108,76,155,1)] animate-pulse"
      ></span>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import { message as antMessage } from 'ant-design-vue'
import { stripAtBeforeFqnInPlainText, stripNoiseBeforeFqnInPlainText } from '@/utils/fqnDisplay.js'
import { replaceMapagentTableActionsMarker } from '../../constants/markdownSlots.js'
import { injectTableCopyButtons } from './useTableCopy.js'
import { injectTableFavoriteSlot } from './injectTableFavoriteSlot.js'

marked.setOptions({ breaks: true, gfm: true })

const props = defineProps({
  content: { type: String, default: '' },
  status: { type: String, default: '' },
  isDarkMode: { type: Boolean, default: false },
  hasSteps: { type: Boolean, default: false },
  /**
   * 表收藏挂载：与流式 tableDetail（3C）配合；正文含 <!-- MAPAGENT:TABLE_ACTIONS -->（1A）时替换为挂载点并注入按钮
   */
  tableFavoriteSlot: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['toggleTableFavorite'])

const containerRef = ref(null)

const renderedHtml = computed(() => {
  if (!props.content) return ''
  let plain = stripNoiseBeforeFqnInPlainText(stripAtBeforeFqnInPlainText(props.content))
  if (props.tableFavoriteSlot?.enabled) {
    plain = replaceMapagentTableActionsMarker(plain)
  }
  return marked.parse(plain)
})

watch(
  () => [renderedHtml.value, props.tableFavoriteSlot, props.isDarkMode],
  () => {
    nextTick(() => {
      if (!containerRef.value) return
      injectTableCopyButtons(containerRef.value, antMessage)
      const slot = props.tableFavoriteSlot
      if (slot?.enabled) {
        injectTableFavoriteSlot(containerRef.value, {
          favorited: !!slot.favorited,
          disabled: !!slot.disabled,
          isDarkMode: props.isDarkMode,
          onToggle: () => emit('toggleTableFavorite')
        })
      }
    })
  },
  { deep: true, immediate: true }
)
</script>

<style>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
}
.markdown-body p { margin-bottom: 0.8em; }
.markdown-body p:last-child { margin-bottom: 0; }
.markdown-body strong { font-weight: 600; color: #1e293b; }
.markdown-body ul, .markdown-body ol { padding-left: 1.5em; margin-bottom: 0.8em; }
.markdown-body li { margin-bottom: 0.25em; }

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.markdown-body th, .markdown-body td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}
.markdown-body th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
}
.markdown-body tr:hover td { background-color: #f8fafc; }

.markdown-body code {
  background-color: #f3f4f6;
  padding: 0.15em 0.35em;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  color: rgba(108, 76, 155, 1);
}
.markdown-body blockquote {
  border-left: 4px solid rgba(108, 76, 155, 0.4);
  padding: 0.5em 1em;
  color: #64748b;
  margin: 1em 0;
  background-color: rgba(108, 76, 155, 0.04);
  border-radius: 0 6px 6px 0;
}

/* 暗色模式 Markdown */
.dark-markdown { color: #e2e8f0; }
.dark-markdown strong { color: #f1f5f9; }
.dark-markdown table { border-color: #334155; }
.dark-markdown th, .dark-markdown td { border-color: #334155; }
.dark-markdown th { background-color: #1e293b; color: #94a3b8; }
.dark-markdown tr:hover td { background-color: #1e293b; }
.dark-markdown code { background-color: #1e293b; color: rgba(168, 140, 210, 1); }
.dark-markdown blockquote { border-left-color: rgba(108, 76, 155, 0.6); color: #94a3b8; background-color: rgba(108, 76, 155, 0.08); }

/* 正文内收藏占位挂载 */
.markdown-body .mapagent-table-actions-row { margin: 0.75em 0; }
.markdown-body .mapagent-table-fav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.markdown-body .mapagent-table-fav-btn.is-light:hover:not(.is-disabled) {
  border-color: rgba(108, 76, 155, 0.45);
  color: rgba(108, 76, 155, 1);
  background: rgba(108, 76, 155, 0.06);
}
.markdown-body .mapagent-table-fav-btn.is-light.is-favorited {
  border-color: #fed7aa;
  color: #c2410c;
  background: #fff7ed;
}
.markdown-body .mapagent-table-fav-btn.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.dark-markdown .mapagent-table-fav-btn.is-dark {
  border-color: #475569;
  background: #1e293b;
  color: #94a3b8;
}
.dark-markdown .mapagent-table-fav-btn.is-dark:hover:not(.is-disabled) {
  border-color: rgba(168, 140, 210, 0.6);
  color: rgba(198, 170, 235, 1);
  background: rgba(255, 255, 255, 0.05);
}
.dark-markdown .mapagent-table-fav-btn.is-dark.is-favorited {
  border-color: rgba(251, 191, 36, 0.45);
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}
.markdown-body .mapagent-table-fav-btn__icon { display: flex; line-height: 0; }
.markdown-body .mapagent-table-fav-btn.is-favorited .mapagent-table-fav-btn__icon { color: #fb923c; }
.dark-markdown .mapagent-table-fav-btn.is-dark.is-favorited .mapagent-table-fav-btn__icon { color: #fbbf24; }
</style>

<style scoped>
.typing-dots { display: inline-flex; gap: 4px; align-items: center; height: 20px; }
.typing-dots span { width: 6px; height: 6px; background: #b0b0b0; border-radius: 50%; animation: typingBounce 1.2s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
</style>
