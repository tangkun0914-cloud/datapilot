<template>
  <div class="log-section">
    <div class="log-header">
      <h3 class="log-title">告警片段</h3>
      <div class="log-actions">
        <a-button type="link" size="small" @click="expandVisible = true">
          查看完整日志
        </a-button>
      </div>
    </div>
    <div class="log-terminal">
      <pre class="log-content">{{ snippetText }}</pre>
    </div>

    <a-modal v-model:open="expandVisible" title="完整告警日志" width="800px" :footer="null">
      <div class="full-log-terminal">
        <pre class="log-content">{{ fullLogText }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
/**
 * AlertLogSection - 告警日志片段
 *
 * 根据 alert.monitorEvent 类型智能提取并展示关键日志片段：
 *  - 数据质量：直接展示 logSnippet
 *  - 离线SLA完成/启动超时：生成 SLA 摘要消息
 *  - 离线任务失败：从 fullLog 中反向搜索 ERROR/Exception 等关键词，取前3行+后10行
 *  - 离线任务超时：取 fullLog 末尾 30 行
 * 提供「复制」和「放大」（全屏查看完整日志）功能。
 *
 * @prop {Object} alert - 告警对象（required），需包含 monitorEvent, source, logSnippet, fullLog 等字段
 */
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  alert: { type: Object, required: true }
})

const expandVisible = ref(false)

const fullLogText = computed(() => {
  return props.alert.fullLog || props.alert.logSnippet || '暂无日志内容'
})

const snippetText = computed(() => {
  const alert = props.alert
  if (alert.source === '数据质量') return alert.logSnippet

  if (alert.monitorEvent === '离线SLA完成超时') {
    return `[SLA告警]：任务当前已运行 ${alert.runningHours || 2} 小时，目前处于 [${alert.taskState || '运行中'}]，尚未完成。`
  }
  
  if (alert.monitorEvent === '离线SLA启动超时') {
    return `[SLA告警]：任务当前已超时 ${alert.timeoutHours || 1} 小时，目前处于 [${alert.taskState || '依赖等待'}]，尚未启动。`
  }

  const lines = fullLogText.value.split('\n')

  if (alert.monitorEvent === '离线任务失败') {
    const keywords = ['ERROR', 'Exception', 'Cause by', 'FAILED', 'Fatal', 'OutOfMemoryError', 'Table not found']
    let targetIndex = -1
    for (let i = lines.length - 1; i >= 0; i--) {
      if (keywords.some(kw => lines[i].includes(kw))) {
        targetIndex = i
        break
      }
    }
    if (targetIndex !== -1) {
      const start = Math.max(0, targetIndex - 3)
      const end = Math.min(lines.length, targetIndex + 11)
      return lines.slice(start, end).join('\n')
    }
    return lines.slice(-10).join('\n')
  }

  if (alert.monitorEvent === '离线任务超时') {
    return lines.slice(-30).join('\n')
  }

  return alert.logSnippet
})
</script>

<style scoped>
.log-section {
  margin-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-terminal {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.full-log-terminal {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.log-content {
  color: #e2e8f0;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
