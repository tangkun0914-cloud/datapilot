<template>
  <div class="progress-timeline">
    <div class="timeline-track">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-group"
        :class="{ 'is-last': idx === steps.length - 1 }"
      >
        <!-- Step node -->
        <div class="step-node">
          <div
            class="step-circle"
            :class="{
              'circle-active': (step.status === 'completed' || step.status === 'current') && step.icon !== 'warning',
              'circle-pending': step.status === 'pending',
              'circle-warning': step.icon === 'warning'
            }"
          >
            <component :is="iconComponent(step.icon)" class="circle-icon" />
          </div>

          <div class="step-text">
            <span
              class="step-title"
              :class="{
                'title-active': (step.status === 'completed' || step.status === 'current') && step.icon !== 'warning',
                'title-warning': step.icon === 'warning',
                'title-pending': step.status === 'pending',
              }"
            >
              {{ step.title }}
              <span v-if="step.tag" class="step-tag">{{ step.tag }}</span>
            </span>

            <span v-if="step.person || step.timeRange" class="step-person">
              {{ step.person || step.timeRange }}
            </span>

            <template v-if="step.multiTime && step.multiTime.length">
              <span
                v-for="(t, ti) in step.multiTime"
                :key="ti"
                class="step-time"
              >{{ t }}</span>
            </template>
            <span v-else-if="step.time" class="step-time">{{ step.time }}</span>
          </div>
        </div>

        <!-- Connector line -->
        <div v-if="idx < steps.length - 1" class="step-line-wrap">
          <div
            class="step-line"
            :class="{
              'line-active': step.status === 'completed' || step.status === 'current',
              'line-pending': step.status === 'pending',
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ProgressTimeline - 水平进度时间线
 *
 * 展示告警生命周期各阶段（触发 → 通知 → 认领/屏蔽/转交 → 解决）的水平时间线。
 * 每个步骤支持三种状态：completed（蓝色实心）、current（蓝色实心 + 当前标识）、
 * pending（灰色空心）。特殊：icon 为 'warning' 时显示橙色（用于误报状态）。
 *
 * @prop {Array} steps - 步骤数组，每项含 { icon, title, time?, person?, timeRange?, tag?, multiTime?, status }
 *                       icon: alert-circle|send|user|user-check|check-circle|bell-off|ban|x-circle|chevrons-up|warning 等
 *                       status: completed|current|pending
 *                       场景数据维护见同目录 alertProgressTimelineScenarios.js（对齐原型 HTML）
 */
import {
  AlertOutlined,
  SendOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CloseCircleOutlined,
  BellOutlined,
  ArrowUpOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue'

defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
})

const iconMapLocal = {
  'alert-circle': AlertOutlined,
  send: SendOutlined,
  user: UserOutlined,
  'user-check': UserOutlined,
  'check-circle': CheckCircleOutlined,
  ban: StopOutlined,
  'x-circle': CloseCircleOutlined,
  'bell-off': BellOutlined,
  'chevrons-up': ArrowUpOutlined,
  'warning': WarningOutlined,
}

function iconComponent(name) {
  return iconMapLocal[name] || AlertOutlined
}
</script>

<style scoped>
.progress-timeline {
  padding-top: 8px;
}

.timeline-track {
  display: flex;
  align-items: flex-start;
}

.step-group {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.step-group.is-last {
  flex: 0 0 auto;
}

.step-node {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  z-index: 1;
}

/* Circle */
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.35s ease;
}

.circle-active {
  background: #1890ff;
  color: #fff;
}

.circle-warning {
  background: #fa8c16;
  color: #fff;
}

.circle-pending {
  background: #f1f5f9;
  color: #94a3b8;
}

.circle-icon {
  font-size: 16px;
}

/* Text */
.step-text {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
  min-width: 0;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.title-active { color: #1890ff; }
.title-warning { color: #fa8c16; }
.title-pending { color: #94a3b8; }

.step-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 3px;
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.step-person {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.step-time {
  font-size: 12px;
  color: #9ca3af;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  margin-top: 4px;
  line-height: 1.5;
}

/* Connector line */
.step-line-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  min-width: 24px;
}

.step-line {
  height: 2px;
  width: 100%;
  border-radius: 1px;
  transition: background 0.35s ease;
}

.line-active { background: #1890ff; }
.line-pending { background: #e2e8f0; }
</style>
