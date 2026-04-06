/**
 * 表格复制按钮注入 — L3-5 DataTable 的核心逻辑
 * 扫描容器内的 <table> 元素，为每个表格注入 hover 复制按钮
 *
 * @param {HTMLElement} container  包含 Markdown 渲染产物的 DOM 容器
 * @param {Object}      antMessage ant-design-vue 的 message 实例，用于 toast 提示
 */
export function injectTableCopyButtons(container, antMessage) {
  if (!container) return

  const tables = container.querySelectorAll('table')
  tables.forEach(table => {
    if (table.dataset.hasCopyBtn) return
    table.dataset.hasCopyBtn = 'true'

    const wrapper = document.createElement('div')
    wrapper.className = 'table-copy-wrapper'
    table.parentNode.insertBefore(wrapper, table)
    wrapper.appendChild(table)

    const btn = document.createElement('button')
    btn.className = 'table-copy-btn'
    btn.innerHTML = '<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM382 896h-.2L232 746.2v-.2h150v150z"/></svg>'
    btn.title = '复制表格'
    btn.addEventListener('click', () => {
      const text = Array.from(table.querySelectorAll('tr')).map(row =>
        Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent.trim()).join('\t')
      ).join('\n')
      navigator.clipboard.writeText(text).then(() => {
        antMessage?.success('表格内容已复制到剪贴板')
      })
    })
    wrapper.appendChild(btn)
  })
}
