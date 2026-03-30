<template>
  <div class="lineage-tab">
    <div class="lineage-toolbar">
      <div class="segment-control">
        <button
          :class="['segment-btn', lineageLevel === 'table' && 'segment-btn-active']"
          @click="switchLevel('table')"
        >
          表级血缘
        </button>
        <button
          :class="['segment-btn', lineageLevel === 'column' && 'segment-btn-active']"
          @click="switchLevel('column')"
        >
          字段级血缘
        </button>
      </div>

      <div class="toolbar-right">
        <template v-if="lineageLevel === 'table'">
          <a-select
            v-model:value="searchSourceType"
            placeholder="数据源类型"
            style="width: 140px"
            allow-clear
            @change="handleTableSearch"
            :options="[
              { label: '全部类型', value: undefined },
              { label: 'MySQL', value: 'mysql' },
              { label: 'Hive', value: 'hive' },
              { label: 'StarRocks', value: 'starrocks' },
              { label: 'Tableau', value: 'tableau' },
              { label: '分析节点', value: 'analysis' }
            ]"
          />
          <a-input-search
            v-model:value="searchTableKeyword"
            placeholder="搜索表名或任务..."
            class="table-search"
            allow-clear
            @search="handleTableSearch"
            @change="handleTableSearch"
          />
        </template>

        <a-select
          v-if="lineageLevel === 'column'"
          v-model:value="selectedColumn"
          show-search
          placeholder="搜索字段..."
          :options="columnOptions"
          :filter-option="filterColumn"
          @change="onColumnChange"
          class="column-selector"
          allow-clear
        />
      </div>
    </div>

    <div class="lineage-canvas" ref="wrapperRef">
      <!-- 操作提示 -->
      <div class="graph-toolbar">
        <div class="toolbar-group">
          <InfoCircleOutlined />
          <span v-if="lineageLevel === 'table'">点击节点左右两侧 <b>+/-</b> 展开/收起血缘</span>
          <span v-else>选择字段后点击 <b>+/-</b> 逐层展开上下游字段级血缘</span>
        </div>
      </div>

      <!-- 右上角图例 + 缩放 -->
      <div class="top-right-bar">
        <div class="graph-legend">
          <div v-for="(cfg, key) in SOURCE_TYPE_CONFIG" :key="key" class="legend-item">
            <div class="legend-dot" :style="{ background: cfg.color }"></div>
            {{ cfg.label }}
          </div>
        </div>
        <div class="zoom-toolbar">
          <a-tooltip title="放大">
            <div class="zoom-btn" @click="handleZoom(1.2)"><ZoomInOutlined /></div>
          </a-tooltip>
          <a-tooltip title="缩小">
            <div class="zoom-btn" @click="handleZoom(0.8)"><ZoomOutOutlined /></div>
          </a-tooltip>
          <a-tooltip title="自适应">
            <div class="zoom-btn" @click="handleFitView"><ExpandOutlined /></div>
          </a-tooltip>
        </div>
      </div>

      <!-- G6 容器 -->
      <div ref="containerRef" class="graph-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import G6 from '@antv/g6'
import { InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined, ExpandOutlined } from '@ant-design/icons-vue'
import { getLineageByFqn, getLineageNeighbors, getColumnLineageNeighbors, SOURCE_TYPE_CONFIG } from '@/services/DataMap/lineageService.js'

const props = defineProps({
  fqn: { type: String, default: '' },
})

const lineageLevel = ref('table')
const containerRef = ref(null)
const wrapperRef = ref(null)

const selectedColumn = ref(undefined)
const searchTableKeyword = ref('')
const searchSourceType = ref(undefined)

const columnOptions = computed(() => {
  if (!lineageData.value || !lineageData.value.entity) return []
  const centerNode = lineageData.value.nodes.find(n => n.id === lineageData.value.entity.id)
  if (!centerNode || !centerNode.columns) return []
  return centerNode.columns.map(colObj => {
    const colName = typeof colObj === 'string' ? colObj : colObj.name
    return { label: colName, value: colName }
  })
})

function filterColumn(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function onColumnChange() {
  if (lineageLevel.value === 'column') {
    renderGraph()
  }
}

let graph = null
let resizeObserver = null
const lineageData = shallowRef(null)

// ==================== 数据源颜色工具 ====================
function getTheme(serviceType) {
  return SOURCE_TYPE_CONFIG[serviceType] || SOURCE_TYPE_CONFIG.hive
}

function getServiceTypeLabel(serviceType) {
  return SOURCE_TYPE_CONFIG[serviceType]?.label || serviceType || 'Unknown'
}

// ==================== G6 自定义节点 - 表级 ====================
function registerTableNode() {
  try {
    G6.registerNode('table-card-node', {
      draw(cfg, group) {
        const w = 260, h = 110, r = 6
        const theme = getTheme(cfg.serviceType)
        const color = theme.color
        const isCenter = cfg.isCenter

        // 主背景
        const shape = group.addShape('rect', {
          attrs: {
            x: 0, y: 0, width: w, height: h,
            fill: cfg.selected ? theme.lightColor : '#fff',
            stroke: cfg.selected ? color : (isCenter ? color : '#e8e8e8'),
            lineWidth: (cfg.selected || isCenter) ? 2 : 1,
            radius: r,
            shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 8,
            cursor: 'pointer',
          },
          name: 'main-box',
        })

        // 顶部色条
        group.addShape('rect', {
          attrs: { x: 0, y: 0, width: w, height: 4, fill: color, radius: [r, r, 0, 0], cursor: 'pointer' },
          name: 'header-bar',
        })

        // 数据源类型标签
        group.addShape('rect', {
          attrs: { x: 12, y: 14, width: 48, height: 18, fill: theme.lightColor, radius: 3 },
          name: 'type-badge-bg',
        })
        group.addShape('text', {
          attrs: { x: 36, y: 23, text: getServiceTypeLabel(cfg.serviceType), fill: color, fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
          name: 'type-badge-text',
        })

        // 表名
        const displayName = (cfg.label || '').length > 24 ? cfg.label.slice(0, 23) + '...' : cfg.label
        group.addShape('text', {
          attrs: { x: 12, y: 50, text: displayName, fill: '#262626', fontSize: 13, fontWeight: 600, fontFamily: '"Fira Code", monospace', cursor: 'pointer' },
          name: 'table-name',
        })

        // 分隔线
        group.addShape('line', {
          attrs: { x1: 12, y1: 64, x2: w - 12, y2: 64, stroke: '#f0f0f0', lineWidth: 1 },
          name: 'divider',
        })

        // 库名
        group.addShape('text', {
          attrs: { x: 12, y: 82, text: `${cfg.database || '-'}`, fill: '#8c8c8c', fontSize: 11, fontFamily: '"Fira Code", monospace' },
          name: 'db-text',
        })

        // 负责人
        group.addShape('text', {
          attrs: { x: w - 12, y: 82, text: cfg.owner || '-', fill: '#8c8c8c', fontSize: 11, textAlign: 'end' },
          name: 'owner-text',
        })

        // 中心节点标记
        if (isCenter) {
          group.addShape('rect', {
            attrs: { x: w - 52, y: 12, width: 40, height: 18, fill: color, radius: 3 },
            name: 'center-badge-bg',
          })
          group.addShape('text', {
            attrs: { x: w - 32, y: 21, text: '当前', fill: '#fff', fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
            name: 'center-badge-text',
          })
        }

        // 展开/收起锚点 - 左侧(上游)
        if (cfg.hasUpstream) {
          const expanded = cfg.upstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: 0, y: h / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-left-circle',
          })
          group.addShape('text', {
            attrs: { x: 0, y: h / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-left-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: 0, y: h / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-left-hotspot',
          })
        }

        // 展开/收起锚点 - 右侧(下游)
        if (cfg.hasDownstream) {
          const expanded = cfg.downstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: w, y: h / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-right-circle',
          })
          group.addShape('text', {
            attrs: { x: w, y: h / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-right-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: w, y: h / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-right-hotspot',
          })
        }

        return shape
      },
      setState(name, value, item) {
        const group = item.getContainer()
        const shape = group.find(e => e.get('name') === 'main-box')
        const model = item.getModel()
        const theme = getTheme(model.serviceType)
        
        if (name === 'selected') {
          shape.attr('fill', value ? theme.lightColor : '#fff')
          shape.attr('stroke', value ? theme.color : (model.isCenter ? theme.color : '#e8e8e8'))
          shape.attr('lineWidth', (value || model.isCenter) ? 2 : 1)
        } else if (name === 'search-match') {
          if (value) {
            shape.attr('shadowColor', theme.color)
            shape.attr('shadowBlur', 16)
            shape.attr('stroke', theme.color)
            shape.attr('lineWidth', 2)
          } else {
            shape.attr('shadowColor', 'rgba(0,0,0,0.06)')
            shape.attr('shadowBlur', 8)
            shape.attr('stroke', model.isCenter ? theme.color : '#e8e8e8')
            shape.attr('lineWidth', model.isCenter ? 2 : 1)
          }
        } else if (name === 'search-unmatch') {
          if (value) {
            shape.attr('opacity', 0.2)
            group.get('children').forEach(child => {
              if (child.get('name') !== 'main-box') {
                child.attr('opacity', 0.2)
              }
            })
          } else {
            shape.attr('opacity', 1)
            group.get('children').forEach(child => {
              if (child.get('name') !== 'main-box') {
                child.attr('opacity', 1)
              }
            })
          }
        }
      },
    })
  } catch (e) { /* already registered */ }
}

// ==================== G6 自定义节点 - 字段级 ====================
function registerColumnNode() {
  try {
    G6.registerNode('column-card-node', {
      draw(cfg, group) {
        const w = 280
        const columns = cfg.columns || []
        const headerH = 64
        const colH = 24
        const h = headerH + columns.length * colH + 8
        const r = 6
        const theme = getTheme(cfg.serviceType)
        const color = theme.color

        // 主背景
        const shape = group.addShape('rect', {
          attrs: {
            x: 0, y: 0, width: w, height: h,
            fill: '#fff', stroke: cfg.isCenter ? color : '#e8e8e8',
            lineWidth: cfg.isCenter ? 2 : 1, radius: r,
            shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 8,
          },
          name: 'main-box',
        })

        // 顶部色条
        group.addShape('rect', {
          attrs: { x: 0, y: 0, width: w, height: 4, fill: color, radius: [r, r, 0, 0] },
          name: 'header-bar',
        })

        // 数据源类型标签
        group.addShape('rect', {
          attrs: { x: 12, y: 14, width: 48, height: 18, fill: theme.lightColor, radius: 3 },
          name: 'type-badge-bg',
        })
        group.addShape('text', {
          attrs: { x: 36, y: 23, text: getServiceTypeLabel(cfg.serviceType), fill: color, fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
          name: 'type-badge-text',
        })

        // 中心节点标记
        if (cfg.isCenter) {
          group.addShape('rect', {
            attrs: { x: w - 52, y: 12, width: 40, height: 18, fill: color, radius: 3 },
            name: 'center-badge-bg',
          })
          group.addShape('text', {
            attrs: { x: w - 32, y: 21, text: '当前', fill: '#fff', fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
            name: 'center-badge-text',
          })
        }

        // 表名
        const maxNameLen = cfg.isCenter ? 18 : 24
        const displayName = (cfg.label || '').length > maxNameLen ? cfg.label.slice(0, maxNameLen - 1) + '...' : cfg.label
        group.addShape('text', {
          attrs: { x: 12, y: 50, text: displayName, fill: '#262626', fontSize: 13, fontWeight: 600, fontFamily: '"Fira Code", monospace' },
          name: 'table-name',
        })

        // 分隔线
        group.addShape('line', {
          attrs: { x1: 0, y1: headerH, x2: w, y2: headerH, stroke: '#f0f0f0', lineWidth: 1 },
          name: 'divider',
        })

        // 字段列表
        columns.forEach((colObj, i) => {
          const colName = typeof colObj === 'string' ? colObj : colObj.name
          const colType = typeof colObj === 'string' ? 'string' : colObj.type || 'string'
          
          const y = headerH + i * colH + colH / 2 + 4
          const isHighlight = (cfg.highlightColumns || []).includes(colName)
          if (isHighlight) {
            group.addShape('rect', {
              attrs: { x: 1, y: headerH + i * colH + 2, width: w - 2, height: colH, fill: theme.lightColor },
              name: `col-bg-${i}`,
            })
          }
          // 字段名
          group.addShape('text', {
            attrs: {
              x: 16, y,
              text: colName,
              fill: isHighlight ? color : '#595959',
              fontSize: 12,
              fontWeight: isHighlight ? 600 : 400,
              fontFamily: '"Fira Code", monospace',
              cursor: 'pointer',
            },
            name: `col-text-${i}`,
          })
          // 字段类型
          group.addShape('text', {
            attrs: {
              x: w - 16, y,
              text: colType,
              fill: '#bfbfbf',
              fontSize: 10,
              fontFamily: '"Fira Code", monospace',
              textAlign: 'end',
              cursor: 'pointer',
            },
            name: `col-type-${i}`,
          })
          // 左锚点
          group.addShape('circle', {
            attrs: { x: 0, y, r: 4, fill: isHighlight ? color : 'transparent', stroke: isHighlight ? color : 'transparent', cursor: 'pointer' },
            name: `col-anchor-left-${i}`,
          })
          // 右锚点
          group.addShape('circle', {
            attrs: { x: w, y, r: 4, fill: isHighlight ? color : 'transparent', stroke: isHighlight ? color : 'transparent', cursor: 'pointer' },
            name: `col-anchor-right-${i}`,
          })
        })

        // 展开/收起锚点 - 左侧(上游)
        if (cfg.hasUpstream) {
          const expanded = cfg.upstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: 0, y: headerH / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-left-circle',
          })
          group.addShape('text', {
            attrs: { x: 0, y: headerH / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-left-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: 0, y: headerH / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-left-hotspot',
          })
        }

        // 展开/收起锚点 - 右侧(下游)
        if (cfg.hasDownstream) {
          const expanded = cfg.downstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: w, y: headerH / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-right-circle',
          })
          group.addShape('text', {
            attrs: { x: w, y: headerH / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-right-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: w, y: headerH / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-right-hotspot',
          })
        }

        return shape
      },
      getAnchorPoints(cfg) {
        const columns = cfg.columns || []
        const headerH = 64
        const colH = 24
        const h = headerH + columns.length * colH + 8
        const points = [[0, headerH / 2 / h], [1, headerH / 2 / h]]
        columns.forEach((_, i) => {
          const y = (headerH + i * colH + colH / 2 + 4) / h
          points.push([0, y])
          points.push([1, y])
        })
        return points
      },
    })
  } catch (e) { /* already registered */ }
}

// ==================== G6 自定义节点 - 字段级(单字段节点) ====================
function registerFieldNode() {
  try {
    G6.registerNode('field-lineage-node', {
      draw(cfg, group) {
        const w = 260, h = 80, r = 6
        const theme = getTheme(cfg.serviceType)
        const color = theme.color
        const isCenter = cfg.isCenter

        const shape = group.addShape('rect', {
          attrs: {
            x: 0, y: 0, width: w, height: h,
            fill: '#fff',
            stroke: isCenter ? color : '#e8e8e8',
            lineWidth: isCenter ? 2 : 1,
            radius: r,
            shadowColor: 'rgba(0,0,0,0.06)', shadowBlur: 8,
            cursor: 'pointer',
          },
          name: 'main-box',
        })

        group.addShape('rect', {
          attrs: { x: 0, y: 0, width: w, height: 4, fill: color, radius: [r, r, 0, 0], cursor: 'pointer' },
          name: 'header-bar',
        })

        group.addShape('rect', {
          attrs: { x: 12, y: 12, width: 48, height: 18, fill: theme.lightColor, radius: 3 },
          name: 'type-badge-bg',
        })
        group.addShape('text', {
          attrs: { x: 36, y: 21, text: getServiceTypeLabel(cfg.serviceType), fill: color, fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
          name: 'type-badge-text',
        })

        if (isCenter) {
          group.addShape('rect', {
            attrs: { x: w - 52, y: 12, width: 40, height: 18, fill: color, radius: 3 },
            name: 'center-badge-bg',
          })
          group.addShape('text', {
            attrs: { x: w - 32, y: 21, text: '当前', fill: '#fff', fontSize: 10, fontWeight: 500, textAlign: 'center', textBaseline: 'middle' },
            name: 'center-badge-text',
          })
        }

        const tableName = cfg.tableName || ''
        const maxTableLen = isCenter ? 20 : 28
        const displayTable = tableName.length > maxTableLen ? tableName.slice(0, maxTableLen - 1) + '…' : tableName
        group.addShape('text', {
          attrs: { x: 12, y: 42, text: displayTable, fill: '#8c8c8c', fontSize: 11, fontFamily: '"Fira Code", monospace', cursor: 'pointer' },
          name: 'table-name',
        })

        const fieldName = cfg.fieldName || ''
        const fieldType = cfg.fieldType || ''
        const maxFieldLen = 22
        const displayField = fieldName.length > maxFieldLen ? fieldName.slice(0, maxFieldLen - 1) + '…' : fieldName
        group.addShape('text', {
          attrs: { x: 12, y: 62, text: displayField, fill: '#262626', fontSize: 14, fontWeight: 600, fontFamily: '"Fira Code", monospace', cursor: 'pointer' },
          name: 'field-name',
        })
        group.addShape('text', {
          attrs: { x: w - 12, y: 62, text: fieldType, fill: '#bfbfbf', fontSize: 11, fontFamily: '"Fira Code", monospace', textAlign: 'end', cursor: 'pointer' },
          name: 'field-type',
        })

        if (cfg.hasUpstream) {
          const expanded = cfg.upstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: 0, y: h / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-left-circle',
          })
          group.addShape('text', {
            attrs: { x: 0, y: h / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-left-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: 0, y: h / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-left-hotspot',
          })
        }

        if (cfg.hasDownstream) {
          const expanded = cfg.downstreamExpanded
          group.addShape('circle', {
            attrs: { r: 8, x: w, y: h / 2, fill: '#fff', stroke: color, lineWidth: 1.5, cursor: 'pointer' },
            name: 'marker-right-circle',
          })
          group.addShape('text', {
            attrs: { x: w, y: h / 2 + 1, text: expanded ? '−' : '+', fill: color, fontSize: 14, fontWeight: 'bold', textAlign: 'center', textBaseline: 'middle', cursor: 'pointer' },
            name: 'marker-right-text',
          })
          group.addShape('circle', {
            attrs: { r: 16, x: w, y: h / 2, fill: 'transparent', cursor: 'pointer' },
            name: 'marker-right-hotspot',
          })
        }

        return shape
      },
      getAnchorPoints() {
        return [[0, 0.5], [1, 0.5]]
      },
    })
  } catch (e) { /* already registered */ }
}

// ==================== Graph 初始化 ====================
function initGraph() {
  if (!containerRef.value) return
  const w = containerRef.value.clientWidth || 1000
  const h = containerRef.value.clientHeight || 600

  const tooltip = new G6.Tooltip({
    offsetX: 10, offsetY: 10,
    itemTypes: ['node'],
    getContent(e) {
      const model = e.item.getModel()
      const div = document.createElement('div')
      div.style.cssText = 'padding:6px 10px;font-size:12px;color:#fff;background:rgba(0,0,0,0.75);border-radius:4px;max-width:300px;word-break:break-all;'
      div.textContent = model.fqn || model.label
      return div
    },
  })

  graph = new G6.Graph({
    container: containerRef.value,
    width: w, height: h,
    fitView: false,
    animate: true,
    plugins: [tooltip],
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 40,
      ranksep: 120,
      controlPoints: true,
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    },
    defaultNode: {
      type: 'table-card-node',
      anchorPoints: [[0, 0.5], [1, 0.5]],
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#b8c2cc',
        lineWidth: 1.5,
        endArrow: {
          path: G6.Arrow.triangle(6, 8, 0),
          fill: '#b8c2cc',
          d: 0,
        },
      },
    },
  })

  graph.on('node:click', onNodeClick)
  graph.on('canvas:click', onCanvasClick)
}

// ==================== 事件处理 ====================
function onNodeClick(e) {
  const shapeName = e.target.get('name')
  const model = e.item.getModel()

  // 展开/收起上游
  if (['marker-left-hotspot', 'marker-left-text', 'marker-left-circle'].includes(shapeName)) {
    model.upstreamExpanded ? handleCollapse(model, 'upstream') : handleExpand(model, 'upstream')
    return
  }
  // 展开/收起下游
  if (['marker-right-hotspot', 'marker-right-text', 'marker-right-circle'].includes(shapeName)) {
    model.downstreamExpanded ? handleCollapse(model, 'downstream') : handleExpand(model, 'downstream')
    return
  }

  if (lineageLevel.value === 'table') {
    handleSelectNode(model.id)
  }
}

function onCanvasClick() {
  if (lineageLevel.value === 'table') {
    handleSelectNode(null)
  }
}

function handleSelectNode(nodeId) {
  if (!graph) return
  graph.getNodes().forEach(n => graph.clearItemStates(n, 'selected'))
  if (nodeId) {
    const item = graph.findById(nodeId)
    if (item) {
      graph.setItemState(item, 'selected', true)
      graph.focusItem(item, true, { easing: 'easeCubic', duration: 400 })
    }
  }
}

// ==================== 展开/收起 ====================
async function handleExpand(nodeModel, direction) {
  if (!graph) return
  if (lineageLevel.value === 'column') {
    await handleFieldExpand(nodeModel, direction)
    return
  }
  try {
    const { nodes, edges } = await getLineageNeighbors(nodeModel.id, direction)
    const centerX = nodeModel.x || 0
    const centerY = nodeModel.y || 0

    nodes.forEach(n => {
      if (!graph.findById(n.id)) {
        graph.addItem('node', {
          id: n.id,
          label: n.name,
          type: 'table-card-node',
          serviceType: n.serviceType,
          database: n.database,
          owner: n.owner,
          fqn: n.fqn,
          isCenter: false,
          x: centerX,
          y: centerY,
          hasUpstream: direction === 'upstream',
          hasDownstream: direction === 'downstream',
          upstreamExpanded: false,
          downstreamExpanded: false,
        })
      }
    })

    edges.forEach(e => {
      const exists = graph.getEdges().find(ge =>
        ge.getModel().source === e.source && ge.getModel().target === e.target
      )
      if (!exists) {
        graph.addItem('edge', e)
      }
    })

    graph.updateItem(nodeModel.id, direction === 'upstream'
      ? { upstreamExpanded: true }
      : { downstreamExpanded: true }
    )
    graph.layout()
    setTimeout(() => fitView(), 400)
  } catch {
    // 展开失败，静默处理
  }
}

async function handleFieldExpand(nodeModel, direction) {
  const entityId = nodeModel._entityId
  const colName = nodeModel._colName
  if (!entityId || !colName) return

  const colLineage = lineageData.value.columnLineage || []
  const nodeMap = new Map()
  lineageData.value.nodes.forEach(n => nodeMap.set(n.id, n))

  let matches
  if (direction === 'upstream') {
    matches = colLineage.filter(l => l.toEntity === entityId && l.toColumn === colName)
  } else {
    matches = colLineage.filter(l => l.fromEntity === entityId && l.fromColumn === colName)
  }

  if (matches.length === 0) {
    try {
      const result = await getColumnLineageNeighbors(entityId, colName, direction)
      matches = result.columnLineage || []
      ;(result.nodes || []).forEach(n => {
        if (!nodeMap.has(n.id)) nodeMap.set(n.id, n)
      })
    } catch {
      // 字段血缘展开失败，静默处理
    }
  }

  matches.forEach(m => {
    const newEntityId = direction === 'upstream' ? m.fromEntity : m.toEntity
    const newColName = direction === 'upstream' ? m.fromColumn : m.toColumn
    const newNodeId = `${newEntityId}::${newColName}`

    if (!graph.findById(newNodeId)) {
      const entityNode = nodeMap.get(newEntityId)
      const colObj = entityNode
        ? (entityNode.columns || []).find(c => (typeof c === 'string' ? c : c.name) === newColName)
        : null
      const fieldType = colObj ? (typeof colObj === 'string' ? 'string' : colObj.type || 'string') : 'string'

      graph.addItem('node', {
        id: newNodeId,
        type: 'field-lineage-node',
        tableName: entityNode ? entityNode.name : newEntityId,
        fieldName: newColName,
        fieldType,
        serviceType: entityNode ? entityNode.serviceType : 'hive',
        isCenter: false,
        hasUpstream: direction === 'upstream',
        hasDownstream: direction === 'downstream',
        upstreamExpanded: false,
        downstreamExpanded: false,
        fqn: entityNode ? `${entityNode.fqn}.${newColName}` : `${newEntityId}.${newColName}`,
        _entityId: newEntityId,
        _colName: newColName,
        x: nodeModel.x || 0,
        y: nodeModel.y || 0,
      })
    }

    const sourceId = direction === 'upstream' ? newNodeId : nodeModel.id
    const targetId = direction === 'upstream' ? nodeModel.id : newNodeId
    const exists = graph.getEdges().find(ge =>
      ge.getModel().source === sourceId && ge.getModel().target === targetId
    )
    if (!exists) {
      graph.addItem('edge', {
        source: sourceId,
        target: targetId,
      })
    }
  })

  graph.updateItem(nodeModel.id, direction === 'upstream'
    ? { upstreamExpanded: true }
    : { downstreamExpanded: true }
  )
  graph.layout()
  setTimeout(() => fitView(), 400)
}

function handleCollapse(nodeModel, direction) {
  if (!graph) return
  const currentId = nodeModel.id
  const nodeItem = graph.findById(currentId)
  if (!nodeItem) return

  const edges = direction === 'upstream'
    ? [...nodeItem.getInEdges()]
    : [...nodeItem.getOutEdges()]

  edges.forEach(edge => {
    const otherNode = direction === 'upstream' ? edge.getSource() : edge.getTarget()
    const otherSideEdges = direction === 'upstream'
      ? otherNode.getOutEdges()
      : otherNode.getInEdges()
    const isShared = otherSideEdges.some(e =>
      (direction === 'upstream' ? e.getTarget().get('id') : e.getSource().get('id')) !== currentId
    )
    if (isShared) return
    graph.removeItem(edge)
    if (graph.findById(otherNode.get('id'))) {
      recursiveRemove(otherNode.get('id'), direction)
    }
  })

  graph.updateItem(nodeModel.id, direction === 'upstream'
    ? { upstreamExpanded: false }
    : { downstreamExpanded: false }
  )
  graph.layout()
  setTimeout(() => fitView(), 400)
}

function recursiveRemove(nodeId, direction) {
  const nodeItem = graph.findById(nodeId)
  if (!nodeItem) return
  const reverseEdges = direction === 'downstream'
    ? nodeItem.getInEdges()
    : nodeItem.getOutEdges()
  if (reverseEdges.length > 0) return

  const forwardEdges = direction === 'downstream'
    ? nodeItem.getOutEdges()
    : nodeItem.getInEdges()
  const nextIds = forwardEdges.map(edge =>
    direction === 'downstream' ? edge.getTarget().get('id') : edge.getSource().get('id')
  )
  graph.removeItem(nodeId)
  nextIds.forEach(id => recursiveRemove(id, direction))
}

// ==================== 字段级血缘高亮 ====================
// 字段级血缘现在通过 renderColumnLevel 重新渲染实现，不再需要动态高亮函数


// ==================== 缩放与自适应 ====================
function handleZoom(ratio) {
  if (!graph) return
  const zoom = graph.getZoom() * ratio
  graph.zoomTo(zoom, { x: graph.getWidth() / 2, y: graph.getHeight() / 2 })
}

function handleFitView() {
  fitView()
}

function fitView() {
  if (!graph || !containerRef.value) return
  const { width, height } = containerRef.value.getBoundingClientRect()
  if (width > 0 && height > 0) {
    const cw = graph.getWidth()
    const ch = graph.getHeight()
    if (Math.abs(width - cw) > 1 || Math.abs(height - ch) > 1) {
      graph.changeSize(width, height)
    }
    graph.fitView([60, 40, 40, 40])
  }
}

function handleTableSearch() {
  if (!graph || lineageLevel.value !== 'table') return
  
  const keyword = searchTableKeyword.value.trim().toLowerCase()
  const sourceType = searchSourceType.value
  const nodes = graph.getNodes()
  
  // 如果两个条件都为空，清除所有搜索状态
  if (!keyword && !sourceType) {
    nodes.forEach(node => {
      graph.clearItemStates(node, ['search-match', 'search-unmatch'])
    })
    return
  }

  // 执行搜索匹配
  nodes.forEach(node => {
    const model = node.getModel()
    const tableName = (model.label || '').toLowerCase()
    const nodeServiceType = (model.serviceType || '').toLowerCase()
    const taskName = (model.taskName || '').toLowerCase()
    
    let isMatch = true
    
    // 1. 匹配关键词 (表名 或 任务名)
    if (keyword) {
      isMatch = tableName.includes(keyword) || taskName.includes(keyword)
    }
    
    // 2. 匹配数据源类型
    if (isMatch && sourceType) {
      isMatch = nodeServiceType === sourceType
    }
                    
    if (isMatch) {
      graph.setItemState(node, 'search-match', true)
      graph.setItemState(node, 'search-unmatch', false)
    } else {
      graph.setItemState(node, 'search-match', false)
      graph.setItemState(node, 'search-unmatch', true)
    }
  })
}

// ==================== 数据加载与渲染 ====================
async function loadLineage(fqnValue) {
  if (!fqnValue) return
  lineageData.value = await getLineageByFqn(fqnValue)
  if (!lineageData.value) return
  renderGraph()
}

function renderGraph() {
  if (!graph || !lineageData.value) return

  const centerId = lineageData.value.entity.id
  const nodeMap = new Map()
  lineageData.value.nodes.forEach(n => nodeMap.set(n.id, n))

  const upstreamIds = new Set(lineageData.value.upstreamEdges.map(e => e.fromEntity))
  const downstreamIds = new Set(lineageData.value.downstreamEdges.map(e => e.toEntity))

  if (lineageLevel.value === 'table') {
    renderTableLevel(centerId, nodeMap, upstreamIds, downstreamIds)
  } else {
    renderColumnLevel(centerId, nodeMap)
  }
}

function renderTableLevel(centerId, nodeMap, upstreamIds, downstreamIds) {
  const nodes = []
  const edges = []

  nodeMap.forEach((n, id) => {
    const isCenter = id === centerId
    nodes.push({
      id,
      label: n.name,
      type: 'table-card-node',
      serviceType: n.serviceType,
      database: n.database,
      owner: n.owner,
      fqn: n.fqn,
      isCenter,
      hasUpstream: isCenter || upstreamIds.has(id),
      hasDownstream: isCenter || downstreamIds.has(id),
      upstreamExpanded: isCenter,
      downstreamExpanded: isCenter,
    })
  })

  lineageData.value.upstreamEdges.forEach(e => {
    edges.push({ source: e.fromEntity, target: e.toEntity })
  })
  lineageData.value.downstreamEdges.forEach(e => {
    edges.push({ source: e.fromEntity, target: e.toEntity })
  })

  graph.data({ nodes, edges })
  graph.render()
  setTimeout(() => fitView(), 300)
}

function renderColumnLevel(centerId, nodeMap) {
  const nodes = []
  const edges = []
  const colLineage = lineageData.value.columnLineage || []

  if (!selectedColumn.value) {
    graph.changeData({ nodes, edges })
    return
  }

  const centerNode = nodeMap.get(centerId)
  if (!centerNode) return

  const hasUpstream = colLineage.some(l => l.toEntity === centerId && l.toColumn === selectedColumn.value)
  const hasDownstream = colLineage.some(l => l.fromEntity === centerId && l.fromColumn === selectedColumn.value)

  const colObj = (centerNode.columns || []).find(c => (typeof c === 'string' ? c : c.name) === selectedColumn.value)
  const colType = colObj ? (typeof colObj === 'string' ? 'string' : colObj.type || 'string') : 'string'

  nodes.push({
    id: `${centerId}::${selectedColumn.value}`,
    type: 'field-lineage-node',
    tableName: centerNode.name,
    fieldName: selectedColumn.value,
    fieldType: colType,
    serviceType: centerNode.serviceType,
    isCenter: true,
    hasUpstream,
    hasDownstream,
    upstreamExpanded: false,
    downstreamExpanded: false,
    fqn: `${centerNode.fqn}.${selectedColumn.value}`,
    _entityId: centerId,
    _colName: selectedColumn.value,
  })

  graph.changeData({ nodes, edges })
  setTimeout(() => fitView(), 300)
}

function switchLevel(level) {
  lineageLevel.value = level
  if (level === 'column' && lineageData.value && lineageData.value.entity) {
    const centerNode = lineageData.value.nodes.find(n => n.id === lineageData.value.entity.id)
    if (centerNode && centerNode.columns && centerNode.columns.length > 0) {
      const firstCol = centerNode.columns[0]
      selectedColumn.value = typeof firstCol === 'string' ? firstCol : firstCol.name
    }
  } else if (level === 'table') {
    selectedColumn.value = undefined
  }
  if (lineageData.value) renderGraph()
}

// ==================== 生命周期 ====================
onMounted(() => {
  registerTableNode()
  registerColumnNode()
  registerFieldNode()
  nextTick(() => {
    initGraph()
    if (props.fqn) loadLineage(props.fqn)

    // ResizeObserver
    if (wrapperRef.value) {
      resizeObserver = new ResizeObserver(() => {
        if (graph && containerRef.value) {
          const { width, height } = containerRef.value.getBoundingClientRect()
          if (width > 0 && height > 0) {
            graph.changeSize(width, height)
            graph.fitView([60, 40, 40, 40])
          }
        }
      })
      resizeObserver.observe(wrapperRef.value)
    }
  })
})

watch(() => props.fqn, (newFqn) => {
  if (newFqn) loadLineage(newFqn)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (graph) {
    graph.destroy()
    graph = null
  }
})
</script>

<style scoped>
.lineage-tab {
  padding: 0 0 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.lineage-toolbar {
  margin-bottom: 12px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-search {
  width: 240px;
}

.column-selector {
  width: 240px;
}

.segment-control {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 3px;
  gap: 2px;
}

.segment-btn {
  padding: 5px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.segment-btn:hover {
  color: #334155;
}

.segment-btn-active {
  background: #fff;
  color: #1677ff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.lineage-canvas {
  flex: 1;
  position: relative;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  min-height: 500px;
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.graph-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 9;
  pointer-events: none;
}

.toolbar-group {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e8e8e8;
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
}

.top-right-bar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 9;
  display: flex;
  gap: 8px;
}

.graph-legend {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  font-size: 12px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.zoom-toolbar {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  overflow: hidden;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: #f5f5f5;
  color: #1677ff;
}

/* G6 tooltip 样式覆盖 */
:global(.g6-tooltip) {
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}
</style>
