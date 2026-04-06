/**
 * 从用户输入中提取 @ 提及的表 FQN（形如 @db.table 或 @schema.db.table）
 * @param {string} text
 * @returns {string[]}
 */
export function extractMentionFqnsFromText(text) {
  if (!text || typeof text !== 'string') return []
  const seen = new Set()
  const out = []
  // 匹配 @ 后紧跟的数据库.表名片段（字母数字下划线与点）
  const re = /@([\w][\w.]*\.\w[\w.]*)/g
  let m
  while ((m = re.exec(text)) !== null) {
    const fqn = m[1]
    if (!seen.has(fqn)) {
      seen.add(fqn)
      out.push(fqn)
    }
  }
  return out
}
