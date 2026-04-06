/** 后端 Markdown 中插入的占位（HTML 注释，解析前由前端替换为挂载点） */
export const MAPAGENT_TABLE_ACTIONS_MARKER = /<!--\s*MAPAGENT:TABLE_ACTIONS\s*-->/gi

/**
 * 将收藏按钮占位注释替换为可被挂载的块级节点（marked 会保留内联 HTML）
 */
export function replaceMapagentTableActionsMarker(markdown) {
  if (!markdown || typeof markdown !== 'string') return ''
  return markdown.replace(MAPAGENT_TABLE_ACTIONS_MARKER, '<div class="mapagent-table-actions-host"></div>')
}

/** 原始流式文本里是否包含该占位（勿复用带 /g 的 RegExp 做 test） */
export function rawMarkdownHasTableActionsMarker(content) {
  if (!content || typeof content !== 'string') return false
  return /<!--\s*MAPAGENT:TABLE_ACTIONS\s*-->/i.test(content)
}
