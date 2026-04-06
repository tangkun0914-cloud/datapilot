/**
 * 在 Markdown 容器内为 .mapagent-table-actions-host 注入「收藏此表」按钮（与 MessageActions 星标行为一致）
 */
const HOST_SEL = '.mapagent-table-actions-host'

function buildStarSvg(filled) {
  if (filled) {
    return '<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7.1 1.1-13.4 5.5-17.1 11.9-8.2 14.1-3.3 32.2 10.9 40.3l183.7 89.4-34.5 252.8c-1.2 9.1 2.2 18.2 9 24.6 12.3 11.3 31.2 10.5 42.7-1.7L512 734.3l227.1 171.4c5.4 4.1 12.1 6.2 18.8 6.2 12.9 0 24.8-7.5 30.1-19.7 3.8-8.7 4.4-18.5 1.7-27.6l-34.5-252.8 183.7-89.4c7.1-3.5 12.4-10 14.3-17.7 2.9-12.3-2.2-25.1-12.5-30.7z"/></svg>'
  }
  return '<svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7.1 1.1-13.4 5.5-17.1 11.9-8.2 14.1-3.3 32.2 10.9 40.3l183.7 89.4-34.5 252.8c-1.2 9.1 2.2 18.2 9 24.6 6.7 6.2 15.7 9.4 24.8 9.4 5.5 0 11-1.4 15.9-4.2L512 734.3l227.1 171.4c5.4 4.1 12.1 6.2 18.8 6.2 9.2 0 18-3.4 24.8-9.5 6.7-6.2 10.9-14.9 12.1-24.2l34.5-252.8 183.7-89.4c7.1-3.5 12.4-10 14.3-17.7 2.9-12.3-2.2-25.1-12.5-30.7zM664.8 562.6l36.1 265.3-239.5-180.9L222.2 828l36.1-265.3L86.3 478.9l266.7-38.7 119.3-241.4 119.3 241.4 266.7 38.7-153.5 83.6z"/></svg>'
}

export function injectTableFavoriteSlot(container, { favorited, disabled, isDarkMode, onToggle }) {
  if (!container || typeof onToggle !== 'function') return
  const hosts = container.querySelectorAll(HOST_SEL)
  hosts.forEach((host) => {
    host.replaceChildren()
    host.classList.add('mapagent-table-actions-row')

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = [
      'mapagent-table-fav-btn',
      isDarkMode ? 'is-dark' : 'is-light',
      favorited ? 'is-favorited' : '',
      disabled ? 'is-disabled' : ''
    ]
      .filter(Boolean)
      .join(' ')
    btn.disabled = !!disabled
    btn.setAttribute('aria-label', favorited ? '已收藏此表' : '收藏此表')
    btn.innerHTML = `<span class="mapagent-table-fav-btn__icon">${buildStarSvg(favorited)}</span><span class="mapagent-table-fav-btn__text">${favorited ? '已收藏' : '收藏'}</span>`

    const handler = (e) => {
      e.preventDefault()
      if (disabled) return
      onToggle()
    }
    btn.addEventListener('click', handler)
    host.appendChild(btn)
  })
}
