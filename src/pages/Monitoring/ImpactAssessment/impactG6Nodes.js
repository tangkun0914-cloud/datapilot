/**
 * G6 影响评估自定义节点（完全复刻参考 UI）
 */
import G6 from '@antv/g6'

const STATUS_THEME = {
  success:       { color: '#52C41A', icon: '✓', text: '成功' },
  failed:        { color: '#FF4D4F', icon: '×', text: '已失败' },
  timeout:       { color: '#FF4D4F', icon: '！', text: '已超时' },
  stopped:       { color: '#FF4D4F', icon: '×', text: '已停止' },
  running:       { color: '#FA8C16', icon: '↻', text: '运行中' },
  waiting:       { color: '#FA8C16', icon: '○', text: '依赖等待' },
  delayed:       { color: '#FA8C16', icon: '○', text: '排队中' },
  other:         { color: '#1890FF', icon: '○', text: '串行等待' },
  pending:       { color: '#8c8c8c', icon: '○', text: '未运行' },
  not_generated: { color: '#8c8c8c', icon: '○', text: '未生成' },
  dqc_threshold: { color: '#FF4D4F', icon: '！', text: '阈值异常' },
}

function themeFor(status) {
  return STATUS_THEME[status] || STATUS_THEME.pending
}

/**
 * SLA 破线标签：与统计评估卡片语义一致（启动 / 完成 / 双重）
 * 节点字段：hasSlaBreachRisk + slaStartBreached / slaFinishBreached
 */
function resolveSlaBreachTag(cfg) {
  if (!cfg.hasSlaBreachRisk) return null
  const s = cfg.slaStartBreached === true
  const f = cfg.slaFinishBreached === true
  if (s && f) {
    return {
      label: 'SLA双重破线',
      w: 72,
      fill: '#fff1f0',
      stroke: '#ffa39e',
      color: '#cf1322',
    }
  }
  if (s) {
    return {
      label: 'SLA启动破线',
      w: 68,
      fill: '#fff7e6',
      stroke: '#ffd591',
      color: '#d46b08',
    }
  }
  if (f) {
    const useFinishRisk = cfg.slaFinishRiskLabel === true
    return {
      label: useFinishRisk ? 'SLA完成风险' : 'SLA完成破线',
      w: useFinishRisk ? 66 : 68,
      fill: '#fff1f0',
      stroke: '#ffa39e',
      color: '#cf1322',
    }
  }
  return {
    label: 'SLA风险',
    w: 54,
    fill: '#fff2e8',
    stroke: '#ffbb96',
    color: '#d4380d',
  }
}

/** 负责人展示：优先保留「姓名(邮箱前缀)」形态 */
function formatOwnerDisplay(owner) {
  if (owner == null || owner === '') return '-'
  const s = String(owner).trim()
  if (!s) return '-'
  if (/^.+\([^)]+\)$/.test(s)) return s
  return s
}

/** 估算字符显示宽度（canvas 文本，用于省略号截断） */
function estimateCharWidth(ch, fontSize) {
  return /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(ch) ? fontSize : fontSize * 0.56
}

/** 超出宽度时尾部省略 ... */
function truncateWithEllipsis(text, maxWidth, fontSize) {
  if (!text) return ''
  const ellipsisW = estimateCharWidth('.', fontSize) * 3.2
  let w = 0
  let i = 0
  for (; i < text.length; i++) {
    const cw = estimateCharWidth(text[i], fontSize)
    if (w + cw + ellipsisW > maxWidth) break
    w += cw
  }
  if (i >= text.length) return text
  if (i < 1) return '...'
  return `${text.slice(0, i)}...`
}

/** 任务节点：顶栏状态 + 任务名 / 计划 / 负责人（可选核心标签） */
export const IMPACT_TASK_NODE_SIZE = [260, 138]

/** 绘制任务卡片及左右 +/- 锚点（供 draw / update 复用；changeData 后必须走 update 重绘才会刷新锚点） */
function drawImpactTaskNode(cfg, group) {
  const [w, h] = IMPACT_TASK_NODE_SIZE
  const r = 8
  const headerH = 34
  const cx = -w / 2
  const cy = -h / 2
  const t = themeFor(cfg.impactStatus)
  const isCurrent = cfg.isCurrentNode
  const isRoot = cfg.isRootCause

  const statusText = cfg.statusText || t.text
  const color = cfg.statusColor || t.color

  const shape = group.addShape('rect', {
    attrs: {
      x: cx,
      y: cy,
      width: w,
      height: h,
      fill: '#ffffff',
      stroke: isCurrent || isRoot ? color : '#e2e8f0',
      lineWidth: isCurrent || isRoot ? 2 : 1,
      radius: r,
      shadowColor: isCurrent || isRoot ? `${color}33` : 'rgba(15, 23, 42, 0.06)',
      shadowBlur: 12,
      shadowOffsetY: 4,
      cursor: 'pointer',
    },
    name: 'main-box',
  })

  group.addShape('rect', {
    attrs: {
      x: cx,
      y: cy,
      width: w,
      height: headerH,
      fill: color,
      radius: [r, r, 0, 0],
      cursor: 'pointer',
    },
    name: 'header-bg',
  })

  const headerPrefix = isRoot ? '🎯 ' : ''
  group.addShape('text', {
    attrs: {
      x: cx + 14,
      y: cy + headerH / 2,
      text: `${headerPrefix}${t.icon}  ${statusText}`,
      fill: '#ffffff',
      fontSize: 13,
      fontWeight: 600,
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'header-status',
  })

  group.addShape('text', {
    attrs: {
      x: cx + w - 14,
      y: cy + headerH / 2,
      text: cfg.taskType || '-',
      fill: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      textAlign: 'end',
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'header-type',
  })

  const padX = 14
  /** 右侧为 +/− 锚点留白，避免文字压到圆圈 */
  const bodyTextMaxW = w - padX * 2 - 20
  const fullTaskName = cfg.taskName || cfg.label || '-'
  const titleFont = 14
  const titleText = truncateWithEllipsis(fullTaskName, bodyTextMaxW, titleFont)

  const line1Y = cy + headerH + 18
  const line2Y = line1Y + 22
  const line3Y = line2Y + 22
  const line4Y = line3Y + 22

  group.addShape('text', {
    attrs: {
      x: cx + padX,
      y: line1Y,
      text: titleText,
      fill: '#0f172a',
      fontSize: titleFont,
      fontWeight: 600,
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'task-name',
  })

  const startTimeText = `开始：${cfg.startTime || '-'}`
  const endTimeText = `结束：${cfg.endTime || '-'}`
  
  group.addShape('text', {
    attrs: {
      x: cx + padX,
      y: line2Y,
      text: startTimeText,
      fill: '#64748b',
      fontSize: 12,
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'time-start',
  })
  
  group.addShape('text', {
    attrs: {
      x: cx + padX,
      y: line3Y,
      text: endTimeText,
      fill: '#64748b',
      fontSize: 12,
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'time-end',
  })

  const coreTagW = 52
  const pollutedTagW = 62
  const dqcBlockTagW = 34
  const tagH = 18
  const slaTagUi = resolveSlaBreachTag(cfg)
  const showDqcBlock = cfg.isDqcErrorBlocked === true
  let tagRowW = 0
  if (showDqcBlock) tagRowW += dqcBlockTagW
  if (slaTagUi) tagRowW += slaTagUi.w
  if (cfg.isCore) tagRowW += coreTagW
  if (cfg.isPolluted) tagRowW += pollutedTagW
  const tagCount = [showDqcBlock, slaTagUi, cfg.isCore, cfg.isPolluted].filter(Boolean).length
  if (tagCount > 1) tagRowW += (tagCount - 1) * 6
  const ownerMaxW = Math.max(40, bodyTextMaxW - tagRowW - 4)
  const ownerLine = `负责人：${formatOwnerDisplay(cfg.owner)}`
  const ownerDisplay = truncateWithEllipsis(ownerLine, ownerMaxW, 12)

  group.addShape('text', {
    attrs: {
      x: cx + padX,
      y: line4Y,
      text: ownerDisplay,
      fill: '#64748b',
      fontSize: 12,
      textBaseline: 'middle',
      cursor: 'pointer',
    },
    name: 'owner-line',
  })

  /** 底部行：右下角自右向左依次为 阻断 → SLA → 核心任务 → 可能污染（内侧） */
  let tagRightX = cx + w - padX
  const tagY = line4Y - tagH / 2
  if (showDqcBlock) {
    tagRightX -= dqcBlockTagW
    group.addShape('rect', {
      attrs: {
        x: tagRightX,
        y: tagY,
        width: dqcBlockTagW,
        height: tagH,
        radius: 3,
        fill: '#fff1f0',
        stroke: '#ffa39e',
        lineWidth: 1,
        cursor: 'pointer',
      },
      name: 'dqc-block-tag-bg',
    })
    group.addShape('text', {
      attrs: {
        x: tagRightX + dqcBlockTagW / 2,
        y: tagY + tagH / 2,
        text: '阻断',
        fill: '#cf1322',
        fontSize: 10,
        fontWeight: 500,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'dqc-block-tag-text',
    })
    tagRightX -= 6
  }
  if (slaTagUi) {
    const tw = slaTagUi.w
    tagRightX -= tw
    group.addShape('rect', {
      attrs: {
        x: tagRightX,
        y: tagY,
        width: tw,
        height: tagH,
        radius: 3,
        fill: slaTagUi.fill,
        stroke: slaTagUi.stroke,
        lineWidth: 1,
        cursor: 'pointer',
      },
      name: 'sla-risk-tag-bg',
    })
    group.addShape('text', {
      attrs: {
        x: tagRightX + tw / 2,
        y: tagY + tagH / 2,
        text: slaTagUi.label,
        fill: slaTagUi.color,
        fontSize: 10,
        fontWeight: 500,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'sla-risk-tag-text',
    })
    tagRightX -= 6
  }
  if (cfg.isCore) {
    tagRightX -= coreTagW
    const tagY = line4Y - tagH / 2
    group.addShape('rect', {
      attrs: {
        x: tagRightX,
        y: tagY,
        width: coreTagW,
        height: tagH,
        radius: 3,
        fill: '#e6f4ff',
        stroke: '#91caff',
        lineWidth: 1,
        cursor: 'pointer',
      },
      name: 'core-tag-bg',
    })
    group.addShape('text', {
      attrs: {
        x: tagRightX + coreTagW / 2,
        y: tagY + tagH / 2,
        text: '核心任务',
        fill: '#1677ff',
        fontSize: 10,
        fontWeight: 500,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'core-tag-text',
    })
  }
  if (cfg.isPolluted) {
    tagRightX -= pollutedTagW
    const tagY = line4Y - tagH / 2
    group.addShape('rect', {
      attrs: {
        x: tagRightX,
        y: tagY,
        width: pollutedTagW,
        height: tagH,
        radius: 3,
        fill: '#F9F0FF',
        stroke: '#D3ADF7',
        lineWidth: 1,
        cursor: 'pointer',
      },
      name: 'polluted-tag-bg',
    })
    group.addShape('text', {
      attrs: {
        x: tagRightX + pollutedTagW / 2,
        y: tagY + tagH / 2,
        text: '☣ 可能污染',
        fill: '#722ED1',
        fontSize: 10,
        fontWeight: 500,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'polluted-tag-text',
    })
    tagRightX -= 6
  }

  const ayMid = cy + h / 2
  const ar = 10
  const anchorStroke = '#cbd5e1'
  const anchorSymbolFill = '#475569'

  const expandSide = cfg.expandAnchorSide || 'right'
  const collapseSide = cfg.collapseAnchorSide || 'right'

  if (cfg.showExpandAnchor) {
    const ax = expandSide === 'left' ? cx : cx + w
    group.addShape('circle', {
      attrs: {
        x: ax,
        y: ayMid,
        r: ar,
        fill: '#ffffff',
        stroke: anchorStroke,
        lineWidth: 1,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowBlur: 4,
        shadowOffsetY: 2,
        cursor: 'pointer',
      },
      name: 'anchor-expand',
    })
    group.addShape('text', {
      attrs: {
        x: ax,
        y: ayMid,
        text: '+',
        fontSize: 16,
        fontWeight: 400,
        fill: anchorSymbolFill,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'anchor-expand-text',
    })
  }

  if (cfg.showCollapseAnchor) {
    const ax = collapseSide === 'left' ? cx : cx + w
    group.addShape('circle', {
      attrs: {
        x: ax,
        y: ayMid,
        r: ar,
        fill: '#ffffff',
        stroke: anchorStroke,
        lineWidth: 1,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowBlur: 4,
        shadowOffsetY: 2,
        cursor: 'pointer',
      },
      name: 'anchor-collapse',
    })
    group.addShape('text', {
      attrs: {
        x: ax,
        y: ayMid,
        text: '−',
        fontSize: 16,
        fontWeight: 400,
        fill: anchorSymbolFill,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
      },
      name: 'anchor-collapse-text',
    })
  }

  return shape
}

export function registerImpactG6Nodes() {
  try {
    G6.registerNode('impact-task-node', {
      draw(cfg, group) {
        return drawImpactTaskNode(cfg, group)
      },
      update(cfg, item) {
        const group = item.getContainer()
        group.clear()
        const keyShape = drawImpactTaskNode(cfg, group)
        item.set('keyShape', keyShape)
      },
      setState(name, value, item) {
        const group = item.getContainer()
        const box = group.find((e) => e.get('name') === 'main-box')
        if (!box) return
        const model = item.getModel()
        const t = themeFor(model.impactStatus)
        const color = model.statusColor || t.color
        const isCurrent = model.isCurrentNode
        const isRoot = model.isRootCause

        if (name === 'selected') {
          if (value) {
            box.attr('shadowColor', color)
            box.attr('shadowBlur', 16)
            box.attr('stroke', color)
            box.attr('lineWidth', 2)
          } else {
            box.attr('shadowColor', isCurrent || isRoot ? `${color}33` : 'rgba(15, 23, 42, 0.06)')
            box.attr('shadowBlur', 12)
            box.attr('stroke', isCurrent || isRoot ? color : '#e2e8f0')
            box.attr('lineWidth', isCurrent || isRoot ? 2 : 1)
          }
        }
        if (name === 'dim') {
          const opacity = value ? 0.25 : 1
          group.attr('opacity', opacity)
          // 兼容某些 G6 版本/引擎不继承 group opacity 的情况
          group.get('children').forEach((shape) => {
            shape.attr('opacity', opacity)
          })
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ]
      },
    })
  } catch {
    /* 热更新重复注册 */
  }

  try {
    G6.registerNode('impact-collapse-node', {
      draw(cfg, group) {
        const w = 200
        const h = 72
        const r = 8
        const cx = -w / 2
        const cy = -h / 2
        const shape = group.addShape('rect', {
          attrs: {
            x: cx,
            y: cy,
            width: w,
            height: h,
            fill: '#fafafa',
            stroke: '#8c8c8c',
            lineWidth: 1.5,
            radius: r,
            lineDash: [6, 4],
            cursor: 'pointer',
          },
          name: 'collapse-box',
        })

        const n = cfg.collapsedDepth ?? 0
        const m = cfg.collapsedCount ?? 0
        group.addShape('text', {
          attrs: {
            x: 0,
            y: -6,
            text: `[+${n} 层, ${m} 个任务]`,
            fill: '#595959',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            textBaseline: 'middle',
            cursor: 'pointer',
          },
          name: 'collapse-title',
        })
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 12,
            text: '单击展开',
            fill: '#8c8c8c',
            fontSize: 10,
            textAlign: 'center',
            textBaseline: 'middle',
            cursor: 'pointer',
          },
          name: 'collapse-hint',
        })
        return shape
      },
      setState(name, value, item) {
        if (name === 'dim') {
          const group = item.getContainer()
          const opacity = value ? 0.25 : 1
          group.attr('opacity', opacity)
          group.get('children').forEach((shape) => {
            shape.attr('opacity', opacity)
          })
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ]
      },
    })
  } catch {
    /* 热更新重复注册 */
  }
}
