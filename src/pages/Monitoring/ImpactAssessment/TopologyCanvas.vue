<template>
  <div class="topology-canvas absolute inset-0 bg-slate-50/50 overflow-hidden transition-all duration-300">
    <CanvasToolbar 
      :core-only="coreOnly" 
      :impact-level="impactLevel"
      :project-space="projectSpace"
      @update:core-only="$emit('update:coreOnly', $event)"
      @update:impact-level="$emit('update:impactLevel', $event)"
      @update:project-space="$emit('update:projectSpace', $event)"
      @zoom-in="() => containerRef?.__handleZoomIn?.()"
      @zoom-out="() => containerRef?.__handleZoomOut?.()"
      @fit-view="() => containerRef?.__handleFitView?.()"
    />
    <div ref="containerRef" class="absolute inset-0" />
  </div>
</template>

<script setup>
/**
 * 影响评估拓扑画布：G6 dagre LR + 自定义任务/折叠节点
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import G6 from '@antv/g6'
import CanvasToolbar from './components/CanvasToolbar.vue'
import { registerImpactG6Nodes, IMPACT_TASK_NODE_SIZE } from './impactG6Nodes.js'

const props = defineProps({
  topology: { type: Object, default: null },
  /** 父节点 id → 直接子节点 id 列表（Mock 或接口下发），用于推导 +/− */
  branchChildrenOf: { type: Object, default: () => ({}) },
  coreOnly: { type: Boolean, default: false },
  impactLevel: { type: String, default: '1' },
  projectSpace: { type: String, default: 'all' },
  highlightNodeId: { type: String, default: null },
})

const emit = defineEmits(['update:coreOnly', 'update:impactLevel', 'update:projectSpace', 'node-click', 'expand-branch', 'collapse-branch'])

const containerRef = ref(null)
let graph = null
let resizeObserver = null

const ANCHOR_SHAPE_NAMES = new Set([
  'anchor-expand',
  'anchor-expand-text',
  'anchor-collapse',
  'anchor-collapse-text',
])

/** 从点击目标向上解析带 name 的子图形（G6 常点到 group，直接 get('name') 为空） */
function resolveAnchorShapeName(ev) {
  let el = ev.target
  const stop = ev.item?.getContainer?.()
  while (el) {
    const name = el.get?.('name')
    if (name && ANCHOR_SHAPE_NAMES.has(name)) return name
    if (el === stop) break
    el = el.getParent?.()
  }
  return null
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toGraphData(topology, branchChildrenOf) {
  if (!topology?.nodes?.length) {
    return { nodes: [], edges: [] }
  }
  
  const rawNodes = topology.nodes
  const rawEdges = topology.edges || []
  const spec = branchChildrenOf && typeof branchChildrenOf === 'object' ? branchChildrenOf : {}
  /** 核心链路模式下图数据由上层已物化并过滤，此处仅冻结 +/-，避免 branch 规范与可见子集不一致 */
  const freezeBranchAnchors = props.coreOnly

  const visibleIds = new Set(rawNodes.map((x) => x.id))
  const nodeById = new Map(rawNodes.map((node) => [node.id, node]))

  const nodes = rawNodes.map((n) => {
    if (n.nodeType === 'collapse') {
      return {
        id: n.id,
        type: 'impact-collapse-node',
        size: [200, 72],
        ...n,
      }
    }

    const childIds = spec[n.id]
    let showExpandAnchor = false
    let showCollapseAnchor = false
    let collapseChildId
    if (Array.isArray(childIds) && childIds.length > 0) {
      const anyVisible = childIds.some((cid) => visibleIds.has(cid))
      const anyMissing = childIds.some((cid) => !visibleIds.has(cid))
      showExpandAnchor = anyMissing
      showCollapseAnchor = anyVisible && !anyMissing
    } else {
      for (const e of rawEdges) {
        if (e.source !== n.id) continue
        const target = nodeById.get(e.target)
        if (target?.nodeType === 'collapse') {
          showExpandAnchor = true
          collapseChildId = target.id
          break
        }
      }
      if (n.showCollapseAnchor) showCollapseAnchor = true
    }

    /** 选项 B（LR）：+ / − 跟「入边汇流 / 出边展开」走 */
    const hasIncomingFromCollapse = rawEdges.some(
      (e) => e.target === n.id && nodeById.get(e.source)?.nodeType === 'collapse'
    )
    let expandAnchorSide
    if (showExpandAnchor && (collapseChildId || (Array.isArray(childIds) && childIds.length > 0))) {
      expandAnchorSide = hasIncomingFromCollapse ? 'left' : 'right'
    }
    let collapseAnchorSide
    if (showCollapseAnchor) {
      collapseAnchorSide = 'right'
    }

    if (freezeBranchAnchors) {
      showExpandAnchor = false
      showCollapseAnchor = false
      collapseChildId = undefined
      expandAnchorSide = undefined
      collapseAnchorSide = undefined
    }

    return {
      ...n,
      id: n.id,
      type: 'impact-task-node',
      size: [...IMPACT_TASK_NODE_SIZE],
      label: n.taskName,
      showExpandAnchor,
      showCollapseAnchor,
      ...(collapseChildId ? { collapseChildId } : {}),
      ...(expandAnchorSide ? { expandAnchorSide } : {}),
      ...(collapseAnchorSide ? { collapseAnchorSide } : {}),
    }
  })

  const edges = rawEdges.map((e) => ({
    source: e.source,
    target: e.target,
    type: 'cubic-horizontal',
    style:
      e.edgeType === 'penetrate'
        ? { stroke: '#94a3b8', lineDash: [4, 4], lineWidth: 1.5 }
        : {
            stroke: '#cbd5e1',
            lineWidth: 1.5,
            endArrow: {
              path: G6.Arrow.triangle(6, 8, 0),
              fill: '#cbd5e1',
            },
          },
  }))

  return { nodes, edges }
}

function destroyGraph() {
  if (graph) {
    graph.destroy()
    graph = null
  }
  if (resizeObserver && containerRef.value) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

function applyHighlight(nodeId) {
  if (!graph) return
  graph.getNodes().forEach((n) => {
    graph.clearItemStates(n, 'selected')
  })
  if (nodeId) {
    const item = graph.findById(nodeId)
    if (item) {
      graph.setItemState(item, 'selected', true)
      graph.focusItem(item, true, { easing: 'easeCubic', duration: 300 })
    }
  }
}

function renderGraph() {
  if (!containerRef.value) return
  registerImpactG6Nodes()

  const w = containerRef.value.clientWidth || 640
  const h = containerRef.value.clientHeight || 400

  const tooltip = new G6.Tooltip({
    className: 'impact-g6-tooltip',
    offsetX: 0,
    offsetY: 0,
    enterable: true,
    itemTypes: ['node'],
    getContent(e) {
      const model = e.item.getModel()
      const div = document.createElement('div')
      
      if (model.nodeType === 'collapse') {
        div.style.cssText = 'position:relative; padding:8px 12px; font-size:12px; color:#fff; background:#262626; border-radius:6px; max-width:280px; line-height:1.5;'
        div.innerHTML = `
          折叠：${model.collapsedCount ?? 0} 个任务 / ${model.collapsedDepth ?? 0} 层
          <div style="position:absolute; bottom:-4px; left:50%; margin-left:-4px; width:8px; height:8px; background:#262626; transform:rotate(45deg);"></div>
        `
        return div
      }
      
      const taskName = model.taskName || model.label || '-'
      
      div.style.cssText = 'position:relative; max-width:320px; padding:8px 12px; font-size:13px; color:#ffffff; background:#262626; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); line-height:1.5; word-break:break-all; user-select:text;'
      div.innerHTML = `
        ${escapeHtml(taskName)}
        <div style="position:absolute; bottom:-4px; left:50%; margin-left:-4px; width:8px; height:8px; background:#262626; transform:rotate(45deg);"></div>
      `
      return div
    },
  })

  destroyGraph()

  const data = toGraphData(props.topology, props.branchChildrenOf)

  const graphOptions = {
    container: containerRef.value,
    width: w,
    height: h,
    fitView: false, // 彻底关闭 fitView，防止它在后台捣乱
    animate: false, // 关闭动画，防止在手动控制坐标时发生冲突导致坐标计算错误
    plugins: [tooltip],
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 24, // 上下节点间距缩小 (原为 48)
      ranksep: 60, // 左右层级间距缩小 (原为 100)
      controlPoints: true,
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas'],
    },
    defaultNode: {
      anchorPoints: [
        [0, 0.5],
        [1, 0.5],
      ],
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#cbd5e1',
        lineWidth: 1.5,
        endArrow: {
          path: G6.Arrow.triangle(6, 8, 0),
          fill: '#cbd5e1',
        },
      },
      stateStyles: {
        dim: {
          opacity: 0.25,
        },
      },
    },
  }

  graph = new G6.Graph(graphOptions)

  function focusRootNode() {
    if (!graph || !containerRef.value) return
    const cw = containerRef.value.clientWidth
    const ch = containerRef.value.clientHeight
    if (cw === 0 || ch === 0) return

    // 1. 恢复 1:1 原始大小，保证内容清晰不缩小
    graph.zoomTo(1, { x: cw / 2, y: ch / 2 })

    // 2. 找到根节点（当前告警节点）
    const rootNode = graph.getNodes().find((n) => n.getModel().isCurrentNode) || graph.getNodes()[0]
    if (!rootNode) return

    // 3. 将根节点平移到画布左侧（留白 60px）、垂直居中偏上（避开工具栏）
    const rootModel = rootNode.getModel()
    
    // 使用 getCanvasByPoint 获取当前缩放下的坐标
    const canvasPoint = graph.getCanvasByPoint(rootModel.x, rootModel.y)
    
    // 节点现在是居中绘制的 (0,0) 为中心，宽度 260，高度 104。
    // 目标位置：X 轴左边缘留出 60px，即中心点在 60 + 130 = 190
    // Y 轴居中
    const targetX = 190
    const targetY = ch / 2
    
    // 使用直接移动，避免动画带来的视觉跳动和潜在的渲染延迟问题
    graph.translate(targetX - canvasPoint.x, targetY - canvasPoint.y)
    
    // 强制重绘，确保视口更新
    graph.paint()
  }

  // 暴露给外部模板调用的缩放方法
  containerRef.value.__handleZoomIn = () => {
    if (!graph || !containerRef.value) return
    const currentZoom = graph.getZoom()
    graph.zoomTo(currentZoom * 1.2, { x: containerRef.value.clientWidth / 2, y: containerRef.value.clientHeight / 2 })
  }

  containerRef.value.__handleZoomOut = () => {
    if (!graph || !containerRef.value) return
    const currentZoom = graph.getZoom()
    graph.zoomTo(currentZoom * 0.8, { x: containerRef.value.clientWidth / 2, y: containerRef.value.clientHeight / 2 })
  }

  containerRef.value.__handleFitView = () => {
    if (!graph || !containerRef.value) return
    graph.zoomTo(1, { x: containerRef.value.clientWidth / 2, y: containerRef.value.clientHeight / 2 })
    focusRootNode()
  }

  graph.data(data)
  graph.render()
  
  // 延迟执行 focusRootNode，确保 G6 已经完成了初次渲染和内部 BBox 计算
  setTimeout(() => {
    // 强制重置视角到左上角，消除 fitView 带来的不可控偏移
    graph.zoomTo(1, { x: 0, y: 0 })
    const p0 = graph.getCanvasByPoint(0, 0)
    graph.translate(-p0.x, -p0.y)
    
    // 额外加一层保险：如果图表依然没有渲染出来，强制让它居中一次
    graph.fitCenter()
    
    focusRootNode()
  }, 100)

  graph.on('node:click', (ev) => {
    const shapeName = resolveAnchorShapeName(ev)
    const model = ev.item.getModel()

    if (shapeName === 'anchor-expand' || shapeName === 'anchor-expand-text') {
      const cid = model.collapseChildId
      if (cid) emit('expand-branch', cid)
      else emit('expand-branch', model.id)
      return
    }

    if (shapeName === 'anchor-collapse' || shapeName === 'anchor-collapse-text') {
      emit('collapse-branch', model.id)
      return
    }

    if (model.nodeType === 'collapse') {
      emit('expand-branch', model.id)
      return
    }

    emit('node-click', { nodeId: model.id, node: model })
  })

  resizeObserver = new ResizeObserver(() => {
    if (!graph || !containerRef.value) return
    const nw = containerRef.value.clientWidth
    const nh = containerRef.value.clientHeight
    if (nw === 0 || nh === 0) return
    graph.changeSize(nw, nh)
    // 强制重绘，防止 resize 时画布内容被裁剪
    graph.paint()
  })
  resizeObserver.observe(containerRef.value)

  nextTick(() => {
    applyHighlight(props.highlightNodeId)
  })
}

watch(
  () => [props.topology, props.branchChildrenOf, props.coreOnly],
  () => {
    nextTick(() => {
      if (graph) {
        // 记录更新前根节点的屏幕坐标，用于平滑更新
        const rootNode = graph.getNodes().find((n) => n.getModel().isCurrentNode) || graph.getNodes()[0]
        let oldCanvasPoint = null
        if (rootNode) {
          const model = rootNode.getModel()
          oldCanvasPoint = graph.getCanvasByPoint(model.x, model.y)
        }

        // 如果图已经存在，使用 changeData 平滑更新（类似 Xmind 的动画效果），而不是销毁重建
        const data = toGraphData(props.topology, props.branchChildrenOf)
        graph.changeData(data)

        // 布局完成后，将根节点平移回原来的屏幕位置，防止画面乱跳
        setTimeout(() => {
          if (oldCanvasPoint) {
            const newRoot = graph.getNodes().find((n) => n.getModel().isCurrentNode) || graph.getNodes()[0]
            if (newRoot) {
              const newModel = newRoot.getModel()
              const newCanvasPoint = graph.getCanvasByPoint(newModel.x, newModel.y)
              graph.translate(oldCanvasPoint.x - newCanvasPoint.x, oldCanvasPoint.y - newCanvasPoint.y)
              graph.paint()
            }
          }
        }, 50)
      } else {
        renderGraph()
      }
    })
  },
  { deep: true }
)

watch(
  () => props.highlightNodeId,
  (id) => {
    applyHighlight(id)
  }
)

  onMounted(() => {
  nextTick(() => renderGraph())
})

onUnmounted(() => {
  destroyGraph()
})
</script>

<style>
.impact-g6-tooltip,
.g6-tooltip,
.g6-component-tooltip {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  transform: translate(-50%, calc(-100% - 16px)) !important;
  pointer-events: auto !important;
}
</style>
