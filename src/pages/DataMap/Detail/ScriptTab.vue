<template>
  <div class="script-tab">
    <div class="script-header">
      <div class="script-actions">
        <a-tooltip title="全屏查看">
          <a-button size="small" class="action-btn" @click="toggleFullscreen">
            <template #icon><FullscreenOutlined v-if="!isFullscreen" /><FullscreenExitOutlined v-else /></template>
          </a-button>
        </a-tooltip>
        <a-button size="small" class="action-btn" @click="copyScript">
          <template #icon><CopyOutlined /></template>
          复制代码
        </a-button>
      </div>
    </div>
    
    <div class="code-block-wrapper" :class="{ 'is-fullscreen': isFullscreen }">
      <div v-if="isFullscreen" class="fullscreen-header">
        <span class="fullscreen-title">建表语句 (DDL)</span>
        <div class="fullscreen-actions">
          <a-button type="text" class="fullscreen-action-btn" @click="copyScript">
            <template #icon><CopyOutlined /></template>
            复制代码
          </a-button>
          <a-button type="text" class="fullscreen-action-btn" @click="toggleFullscreen">
            <template #icon><FullscreenExitOutlined /></template>
            退出全屏
          </a-button>
        </div>
      </div>
      <pre class="code-block"><code>{{ ddlScript }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CopyOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  table: { type: Object, default: () => ({}) },
})

const isFullscreen = ref(false)

const ddlScript = computed(() => {
  const t = props.table
  const cols = (t.columns || [])
    .map((c) => {
      const type = c.dataLength ? `${c.dataType}(${c.dataLength})` : c.dataType
      const pk = c.constraint === 'PRIMARY_KEY' ? ' PRIMARY KEY' : ''
      const comment = c.description ? ` COMMENT '${c.description}'` : ''
      return `  \`${c.name}\` ${type}${pk}${comment}`
    })
    .join(',\n')

  return `-- 表名: ${t.displayName || ''}
-- 描述: ${t.description || ''}

CREATE TABLE ${t.database?.name || 'db'}.${t.name || ''} (
${cols}
)
PARTITIONED BY (\`dt\` VARCHAR(10) COMMENT '分区字段，格式 yyyyMMdd')
STORED AS ORC
TBLPROPERTIES (
  'creator'='${t.owners?.[0]?.name || 'system'}',
  'create_time'='${t.updatedAt ? new Date(t.updatedAt).toISOString() : ''}'
);`
})

function copyScript() {
  navigator.clipboard.writeText(ddlScript.value).then(() => {
    message.success('代码已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.script-tab {
  padding: 0 0 16px;
}

.script-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.script-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 13px;
  color: #475569;
  border-color: #d9d9d9;
  border-radius: 6px;
}

.action-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.code-block-wrapper {
  background: #1e293b;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.code-block-wrapper.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.fullscreen-title {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.fullscreen-actions {
  display: flex;
  gap: 16px;
}

.fullscreen-action-btn {
  color: #94a3b8;
  font-size: 13px;
}

.fullscreen-action-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.code-block {
  background: transparent;
  color: #e2e8f0;
  padding: 20px;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
}

.is-fullscreen .code-block {
  flex: 1;
  padding: 24px;
  font-size: 14px;
}

.code-block code {
  font-family: inherit;
}
</style>
