<template>
  <div v-if="config" class="doc-renderer">
    <!-- 区块1: 组件标题 + 标签 -->
    <div class="doc-header">
      <h1 class="doc-title">{{ config.name }}</h1>
      <span class="tag tag-level">{{ config.level }}</span>
      <span class="tag tag-domain">{{ config.domain }}</span>
      <span class="tag tag-type">{{ config.type }}</span>
    </div>

    <!-- 区块2: 源文件路径 + 业务描述 -->
    <div class="doc-meta">
      <code class="file-path">{{ config.file }}</code>
      <p class="doc-desc">{{ config.desc }}</p>
    </div>

    <!-- 区块3: 预览区 (Live Preview) -->
    <div class="doc-section">
      <h2 class="section-title">预览</h2>
      <div class="preview-box">
        <template v-if="customDemo">
          <component :is="customDemo" />
        </template>
        <template v-else-if="config.previewType === 'modal' && resolvedComponent">
          <a-button type="primary" @click="modalVisible = true">打开弹窗</a-button>
          <component :is="resolvedComponent" v-model:open="modalVisible" v-bind="config.defaultProps" />
        </template>
        <template v-else-if="config.previewMultiple">
          <div class="preview-multiple">
            <div v-for="item in config.previewMultiple" :key="item.label" class="preview-item">
              <component :is="resolvedComponent" v-bind="item.props" />
              <span class="preview-item-label">{{ item.label }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="resolvedComponent">
          <component :is="resolvedComponent" v-bind="config.defaultProps" />
        </template>
        <div v-else class="preview-placeholder">
          暂无预览
        </div>
      </div>
    </div>

    <!-- 区块4: Props 属性表 -->
    <div v-if="config.props?.length" class="doc-section">
      <h2 class="section-title">Props</h2>
      <table class="api-table">
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in config.props" :key="p.prop">
            <td class="api-prop">{{ p.prop }}</td>
            <td class="api-type">{{ p.type }}</td>
            <td class="api-desc">{{ p.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 区块5: Events 事件表 -->
    <div v-if="config.events?.length" class="doc-section">
      <h2 class="section-title">Events</h2>
      <table class="api-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in config.events" :key="e.event">
            <td class="api-prop">{{ e.event }}</td>
            <td class="api-type">{{ e.params || '-' }}</td>
            <td class="api-desc">{{ e.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 区块5.5: Slots 插槽表 -->
    <div v-if="config.slots?.length" class="doc-section">
      <h2 class="section-title">Slots</h2>
      <table class="api-table">
        <thead>
          <tr>
            <th>插槽名</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in config.slots" :key="s.name">
            <td class="api-prop">{{ s.name }}</td>
            <td class="api-desc">{{ s.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 区块6: L3 子模块拆解 -->
    <div v-if="config.children?.length" class="doc-section">
      <h2 class="section-title">子模块拆解</h2>
      <div class="children-grid">
        <div v-for="child in config.children" :key="child.id" class="child-card">
          <div class="child-header">
            <span class="child-badge">L3</span>
            <span class="child-name">{{ child.name }}</span>
          </div>
          <div class="child-data">{{ child.data }}</div>
        </div>
      </div>
    </div>

    <!-- 区块7: 使用页面 -->
    <div v-if="config.usages?.length" class="doc-section">
      <h2 class="section-title">使用页面</h2>
      <div class="usage-list">
        <a
          v-for="u in config.usages"
          :key="u.route"
          class="usage-link"
          @click="$router.push(u.route)"
        >
          <LinkOutlined class="usage-icon" />
          {{ u.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue'
import { LinkOutlined } from '@ant-design/icons-vue'

const modules = import.meta.glob('/src/**/*.vue')

const props = defineProps({
  config: {
    type: Object,
    default: null,
  },
})

const resolvedComponent = shallowRef(null)
const customDemo = shallowRef(null)
const modalVisible = ref(false)

watch(
  () => props.config,
  async (cfg) => {
    resolvedComponent.value = null
    customDemo.value = null
    modalVisible.value = false
    if (!cfg) return

    if (cfg.demo) {
      try {
        const mod = await cfg.demo()
        customDemo.value = mod.default
      } catch { /* ignore */ }
      return
    }

    if (cfg.component) {
      try {
        const mod = await cfg.component()
        resolvedComponent.value = mod.default
      } catch { /* ignore */ }
      return
    }

    if (cfg.file) {
      const key = '/' + cfg.file
      const loader = modules[key]
      if (loader) {
        try {
          const mod = await loader()
          resolvedComponent.value = mod.default
        } catch { /* ignore */ }
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.doc-renderer {
  max-width: 860px;
}

/* 区块1: 标题 + 标签 */
.doc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.doc-title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  margin-right: 4px;
}

.tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 4px;
  line-height: 20px;
}

.tag-level {
  background: #1677ff;
  color: #fff;
}

.tag-domain {
  background: #f1f5f9;
  color: #334155;
}

.tag-type {
  background: #fff;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* 区块2: 源文件 + 描述 */
.doc-meta {
  margin-bottom: 32px;
}

.file-path {
  display: block;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  color: #64748b;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  margin-bottom: 12px;
}

.doc-desc {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* 区块3-6: 通用 section */
.doc-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 3px solid #1677ff;
  line-height: 1.4;
}

/* 预览区 */
.preview-box {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  min-height: 60px;
}

.preview-multiple {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-item-label {
  font-size: 12px;
  color: #94a3b8;
}

.preview-placeholder {
  color: #cbd5e1;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}

/* API 表格 */
.api-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.api-table th {
  text-align: left;
  padding: 10px 16px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.api-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.api-prop {
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.api-type {
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
}

.api-desc {
  color: #475569;
}

/* 使用页面 */
.usage-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.usage-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0f5ff;
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  color: #1677ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.usage-link:hover {
  background: #e6f4ff;
  border-color: #91caff;
}

.usage-icon {
  font-size: 12px;
}

/* L3 子模块 */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.child-card {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
}

.child-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.child-badge {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  background: #e2e8f0;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.child-name {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.child-data {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}
</style>
