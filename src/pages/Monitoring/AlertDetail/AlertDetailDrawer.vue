<template>
  <a-drawer
    :open="open"
    :width="900"
    :title="null"
    placement="right"
    @close="$emit('close')"
    :headerStyle="{ display: 'none' }"
    :bodyStyle="{ padding: 0 }"
    :style="{ marginTop: '64px', height: 'calc(100% - 64px)' }"
  >
    <div class="drawer-container" v-if="alert">
      <!-- Header -->
      <header class="drawer-header">
        <div class="header-left">
          <div class="header-title-row">
            <span class="severity-tag" :class="severityTagClass">
              {{ displaySeverity }}
            </span>
            <h2 class="alert-title">{{ alert.title }}</h2>
            <CopyOutlined class="copy-icon" title="复制标题" @click.stop="handleCopyTitle" />
            <AlertStatusBadge :status="alert.status" />
            <span class="owner-inline">
              <span class="owner-label">责任人：</span>
              <span class="owner-value">{{ alert.owner }}</span>
            </span>
          </div>
          <div class="header-subtitle-row">
            <span class="id-label">事件ID</span>
            <span class="id-value">{{ alert.id }}</span>
          </div>
        </div>
        <div class="header-right">
          <a-button
            v-if="!['resolved', 'falsePositive'].includes(alert.status)"
            type="primary"
            class="impact-entry-btn active-mode"
            @click="$emit('action', 'impact', alert)"
          >
            <template #icon><NodeIndexOutlined /></template>
            影响评估
          </a-button>
          <a-button
            v-if="['resolved', 'falsePositive'].includes(alert.status)"
            class="impact-entry-btn snapshot-mode"
            @click="$emit('action', 'impact-snapshot', alert)"
          >
            <template #icon><NodeIndexOutlined /></template>
            查看影响评估
          </a-button>
          <CloseOutlined class="close-icon" @click="$emit('close')" />
        </div>
      </header>

      <!-- Scrollable content -->
      <main class="drawer-body">
        <Transition name="fade-slide" appear>
          <div class="drawer-body-inner" :key="alert?.id">
            <!-- Basic info + Timeline -->
            <div class="info-card">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">监控事件</div>
                  <div class="info-value font-bold">{{ alert.source }}-{{ alert.monitorEvent }}</div>
                </div>
                
                <template v-if="isQualitySource">
                  <div class="info-item">
                    <div class="info-label">数据质量规则名称</div>
                    <div class="info-value text-blue-600 cursor-pointer hover:underline">{{ alert.qualityMonitorName }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">数据范围</div>
                    <div class="info-value">{{ alert.dataRange }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="info-item">
                    <div class="info-label">调度周期</div>
                    <div class="info-value">{{ alert.scheduleCycle ? alert.scheduleCycle + '调度' : '-' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">调度批次</div>
                    <div class="info-value">{{ alert.scheduleBatch || '-' }}</div>
                  </div>
                  <div class="info-item" v-if="alert.taskInstanceId">
                    <div class="info-label">任务实例</div>
                    <div class="info-value text-blue-600 cursor-pointer hover:underline">{{ alert.taskInstanceId }}</div>
                  </div>
                </template>
                
                <div class="info-item">
                  <div class="info-label">触发时间</div>
                  <div class="info-value">{{ alert.triggerTime }}</div>
                </div>
                
                <div class="info-item" v-if="alert.duration && !isQualitySource">
                  <div class="info-label">持续时间</div>
                  <div class="info-value text-orange-500 font-bold">{{ alert.duration }}</div>
                </div>
              </div>

              <a-divider style="margin: 24px 0" />

              <div class="timeline-section">
                <div class="section-title">当前进度</div>
                <ProgressTimeline :steps="timelineSteps" />
              </div>
            </div>

            <!-- Quality Rule Detail (only for 数据质量) -->
            <RuleDetailTable v-if="isQualitySource" :rules="qualityRules" />

            <!-- Log Section -->
            <div class="info-card" v-if="alert.logSnippet || alert.fullLog">
              <AlertLogSection :alert="alert" />
            </div>
          </div>
        </Transition>
      </main>

      <!-- Footer actions -->
      <footer class="drawer-footer">
        <template v-if="alert.status === 'firing'">
          <a-button type="primary" @click="$emit('action', 'claim', alert)">认领</a-button>
          <a-button @click="$emit('action', 'silence', alert)">屏蔽</a-button>
          <a-button @click="$emit('action', 'resolve', alert)">已解决</a-button>
          <a-button @click="$emit('action', 'transfer', alert)">转交</a-button>
          <a-button @click="$emit('action', 'falsePositive', alert)">误报</a-button>
        </template>
        <template v-else-if="alert.status === 'acked'">
          <a-button type="primary" @click="$emit('action', 'resolve', alert)">已解决</a-button>
          <a-button @click="$emit('action', 'transfer', alert)">转交</a-button>
          <a-button @click="$emit('action', 'falsePositive', alert)">误报</a-button>
        </template>
        <template v-else-if="alert.status === 'silenced'">
          <a-button type="primary" @click="$emit('action', 'resolve', alert)">已解决</a-button>
          <a-button @click="$emit('action', 'transfer', alert)">转交</a-button>
        </template>
        <template v-else-if="alert.status === 'transferred'">
          <a-button type="primary" @click="$emit('action', 'claim', alert)">认领</a-button>
          <a-button @click="$emit('action', 'resolve', alert)">已解决</a-button>
        </template>
      </footer>
    </div>
  </a-drawer>
</template>

<script setup>
/**
 * AlertDetailDrawer - 告警详情抽屉
 *
 * 右侧滑出抽屉，展示完整告警信息：详情头（第一行：ERROR/WARN 等级、标题+常显复制+AlertStatusBadge+
 * 责任人依次排列；第二行：事件ID，无分割线）、
 * 基础属性表格（监控事件、调度周期、触发时间等）、水平进度时间线、
 * 质量规则明细表（仅数据质量来源）、日志片段、以及底部操作栏。
 * 根据 alert.status 动态渲染时间线步骤和操作按钮组。
 *
 * @prop {Boolean} open  - 控制抽屉显示/隐藏
 * @prop {Object}  alert - 告警对象，null 时不渲染内容
 *
 * @emits close ()                                - 关闭抽屉
 * @emits action (type: String, alert: Object)    - 操作按钮点击，type: claim/silence/resolve/transfer/falsePositive/impact
 */
import { computed, ref, watch } from 'vue'
import { CloseOutlined, CopyOutlined, NodeIndexOutlined, HistoryOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import ProgressTimeline from './ProgressTimeline.vue'
import AlertLogSection from './AlertLogSection.vue'
import RuleDetailTable from './RuleDetailTable.vue'
import AlertStatusBadge from '@/pages/Monitoring/components/AlertStatusBadge.vue'
import { getQualityRuleDetails } from '@/services/Monitoring/monitoringService.js'
import { buildTimelineStepsFromAlert } from './alertProgressTimelineScenarios.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  alert: { type: Object, default: null },
})

defineEmits(['close', 'action'])

const qualityRules = ref([])

const isQualitySource = computed(() => props.alert?.source === '数据质量')

/** 详情头仅展示 ERROR / WARN 等级标签 */
const displaySeverity = computed(() => {
  const s = props.alert?.severity
  return s === 'ERROR' || s === 'WARN' ? s : s || 'WARN'
})

const severityTagClass = computed(() =>
  displaySeverity.value === 'ERROR' ? 'sev-error' : 'sev-warn'
)

/** 进度条步骤由 alertProgressTimelineScenarios.js 统一维护（对齐原型 HTML） */
const timelineSteps = computed(() => buildTimelineStepsFromAlert(props.alert))

function handleCopyTitle() {
  if (props.alert?.title) {
    navigator.clipboard.writeText(props.alert.title).then(() => {
      message.success('已复制标题')
    })
  }
}

watch(
  () => props.alert,
  async (val) => {
    if (val && isQualitySource.value) {
      qualityRules.value = await getQualityRuleDetails(val.id)
    } else {
      qualityRules.value = []
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  flex-shrink: 0;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.severity-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  font-weight: 500;
  line-height: 20px;
}

.sev-error { color: #f5222d; background: #fff1f0; border-color: #ffa39e; }
.sev-warn { color: #e6a23c; background: #fdf6ec; border-color: #f5dab1; }

.alert-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.35;
  word-break: break-all;
  transition: color 0.2s ease;
}

.header-title-row:hover .alert-title {
  color: #1677ff;
}

.copy-icon {
  flex-shrink: 0;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s ease;
}

.copy-icon:hover {
  color: #1677ff;
}

.header-subtitle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.id-label {
  flex-shrink: 0;
  color: #94a3b8;
}

.id-value {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  color: #475569;
  word-break: break-all;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.owner-inline {
  display: inline-flex;
  align-items: center;
  height: 22px;
  font-size: 12px;
  color: #f5222d;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  padding: 0 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.owner-label {
  font-weight: 500;
  color: #cf1322;
}

.owner-value {
  word-break: break-all;
}

.impact-entry-btn {
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.impact-entry-btn.active-mode {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border: 1px solid transparent;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.impact-entry-btn.active-mode:hover {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.impact-entry-btn.active-mode:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.impact-entry-btn.snapshot-mode {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.impact-entry-btn.snapshot-mode:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.impact-entry-btn.snapshot-mode:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.close-icon {
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.close-icon:hover {
  color: #1e293b;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  background: #fff;
  flex-shrink: 0;
}

.drawer-body-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04);
}

/* Fade slide transition for content */
.fade-slide-enter-active {
  transition: all 0.35s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 16px;
}

.info-label {
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}
</style>
