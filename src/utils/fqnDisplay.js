/**
 * 表 FQN 展示：去掉 @ 提及前缀（输入框 @选表 带入时不应在 AI 回复区展示 @）
 */
export function stripLeadingAtForFqn(s) {
  if (s == null || typeof s !== 'string') return ''
  const t = s.trim()
  return t.startsWith('@') ? t.slice(1).trim() : t
}

/**
 * 正文中「前置 @ 的 schema.table 形态」去掉 @（不误伤 user@domain.com：@ 前为字母数字时不替换）
 */
export function stripAtBeforeFqnInPlainText(text) {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/(?<![\w/])@([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)+)/g, '$1')
}

/** 两段式及以上 FQN（含可选更多 .segment），用于从用户问句里抓第一张表 */
const FQN_TOKEN_RE = /\b([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)+)\b/g

/**
 * Agent 回复正文：表英文名前的噪声（用户输入/模型拼接残留）去掉，便于只展示 schema.table。
 * 含：/、/看（半角全角）、紧挨在 FQN 前的「意图：」类标签。
 * 建议在 stripAtBeforeFqnInPlainText 之后调用。
 */
export function stripNoiseBeforeFqnInPlainText(text) {
  if (!text || typeof text !== 'string') return ''
  let s = text
  s = s.replace(/意图\s*[:：]\s*(?=[a-zA-Z_][\w]*\.[a-zA-Z_])/g, '')
  s = s.replace(/(?:[/／]看|[/／])\s*(?=[a-zA-Z_][\w]*\.[a-zA-Z_])/g, '')
  return s
}

/**
 * 从用户一句话里取出第一个疑似表 FQN（去掉 @、/看、意图：等后再匹配）
 */
export function extractFirstTableFqnFromText(text) {
  if (!text || typeof text !== 'string') return ''
  let s = text
    .replace(/查看\s*/g, '')
    .replace(/\s*的?详[细情]信息?/g, '')
    .replace(/\s*的?详情/g, '')
    .trim()
  s = stripNoiseBeforeFqnInPlainText(stripAtBeforeFqnInPlainText(s))
  FQN_TOKEN_RE.lastIndex = 0
  const m = FQN_TOKEN_RE.exec(s)
  if (!m) return stripLeadingAtForFqn(s.trim())
  return stripLeadingAtForFqn(m[1])
}
