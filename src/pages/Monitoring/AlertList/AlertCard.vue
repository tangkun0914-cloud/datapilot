<template>
  <div class="alert-row" :class="{ selected: checked }">
    <div class="row-check-wrap">
      <a-checkbox :checked="checked" @change="$emit('check', $event.target.checked)" />
    </div>
    <div class="card" :class="[statusClass, cardThemeClass]">
      <!-- Header -->
      <div class="card-header">
        <div class="header-left">
          <span class="severity-tag" :class="severityClass">{{ alert.severity }}</span>
          <a class="alert-title" @click="$emit('titleClick', alert)">{{ alert.title }}</a>
          <AlertStatusBadge :status="alert.status" />

          <template v-if="alert.source !== '质量监控'">
            <span v-if="alert.scheduleCycle" class="count-tag">调度周期：{{ alert.scheduleCycle }}调度</span>
            <span v-if="alert.scheduleBatch" class="count-tag">调度批次：{{ alert.scheduleBatch }}</span>
          </template>

          <template v-if="alert.status === 'resolved'">
            <span v-if="alert.recoveryType === 'manual'" class="recovery-tag rec-manual">人工恢复</span>
            <span v-else-if="alert.recoveryType === 'auto'" class="recovery-tag rec-auto">自动恢复</span>
          </template>
        </div>
        <div class="card-actions">
          <template v-if="alert.status === 'firing'">
            <button class="btn btn-main" @click="$emit('action', 'claim', alert)">认领</button>
            <button class="btn btn-sub" @click="$emit('action', 'silence', alert)">屏蔽</button>
            <div class="more-wrap">
              <button class="btn btn-icon">···</button>
              <div class="dropdown">
                <div class="dd-item" @click="$emit('action', 'resolve', alert)">已解决</div>
                <div class="dd-item" @click="$emit('action', 'transfer', alert)">转交</div>
                <div class="dd-item" @click="$emit('action', 'falsePositive', alert)">误报</div>
              </div>
            </div>
          </template>

          <template v-else-if="alert.status === 'acked'">
            <button class="btn btn-main" @click="$emit('action', 'resolve', alert)">已解决</button>
            <button class="btn btn-sub" @click="$emit('action', 'falsePositive', alert)">误报</button>
          </template>

          <template v-else-if="alert.status === 'silenced'">
            <button class="btn btn-main" @click="$emit('action', 'resolve', alert)">已解决</button>
            <button class="btn btn-sub" @click="$emit('action', 'falsePositive', alert)">误报</button>
          </template>

          <template v-else-if="alert.status === 'transferred'">
            <button class="btn btn-main" @click="$emit('action', 'claim', alert)">认领</button>
            <button class="btn btn-sub" @click="$emit('action', 'resolve', alert)">已解决</button>
            <button class="btn btn-sub" @click="$emit('action', 'transfer', alert)">再次转交</button>
          </template>

          <template v-else-if="alert.status === 'resolved'">
            <span class="resolve-time">恢复时间：{{ alert.resolveTime }}</span>
          </template>
        </div>
      </div>

      <!-- Meta -->
      <div class="meta-row">
        <span class="meta-item">首次触发时间：{{ alert.triggerTime }}</span>
        <span class="meta-item">来源: {{ alert.source }}</span>
        <span class="meta-item">监控事件: {{ alert.monitorEvent }}</span>

        <template v-if="alert.source === '质量监控'">
          <span class="meta-item" v-if="alert.qualityMonitorName">质量监控名称: {{ alert.qualityMonitorName }}</span>
          <span class="meta-item" v-if="alert.dataRange">数据范围: {{ alert.dataRange }}</span>
          <span v-if="alert.triggerType" class="trigger-tag">{{ alert.triggerType }}</span>
        </template>
        <template v-else>
          <span class="meta-item" v-if="alert.taskInstanceId">任务实例ID: <a href="javascript:void(0)" class="link-text" @click.stop>{{ alert.taskInstanceId }}</a></span>
        </template>

        <span v-if="alert.notifyCount" class="count-tag">通知{{ alert.notifyCount }}次</span>

        <span v-if="alert.upgradeInfo" class="upgrade-tag">
          <span class="upgrade-icon">↑</span>
          <span class="upgrade-text">{{ alert.upgradeInfo }}</span>
        </span>

        <span v-if="alert.status === 'silenced'" class="meta-item silence-info">
          屏蔽至: {{ alert.silenceUntil || '未设置' }} <template v-if="alert.silenceReason">(原因: {{ alert.silenceReason }})</template>
        </span>

        <span v-if="alert.status === 'transferred'" class="meta-item transfer-info">
          由 [{{ alert.transferFrom }}] 转交给 [{{ alert.transferTo }}]
        </span>

        <template v-if="alert.status === 'resolved'">
          <span class="meta-item" v-if="alert.duration">持续时长：{{ alert.duration }}</span>
          <span class="meta-item resolved-info" v-if="alert.rootCause">故障根因：{{ alert.rootCause }}</span>
        </template>

        <template v-if="alert.status === 'falsePositive'">
          <span class="meta-item fp-info">
            误报原因：{{ alert.fpReason || '其他' }} <template v-if="alert.fpRemark">({{ alert.fpRemark }})</template>
          </span>
        </template>
      </div>

      <!-- Log -->
      <div class="log-section-wrap" v-if="(alert.logSnippet || alert.fullLog) && alert.status !== 'resolved'">
        <AlertLogSection :alert="alert" />
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="footer-info">
          <span class="footer-label">事件ID:</span><span class="footer-val">{{ alert.id }}</span>
          <span class="footer-sep">|</span>
          <span class="footer-label">负责人:</span><span class="footer-val">{{ alert.owner }}</span>
          <template v-if="alert.source !== '质量监控'">
            <span class="footer-sep">|</span>
            <span class="footer-label">操作人:</span>
            <span class="footer-val" v-if="alert.status === 'resolved' && alert.recoveryType === 'auto'">
              系统自动恢复(触发实例用户：{{ alert.owner }})
            </span>
            <span class="footer-val" v-else>{{ alert.operator }}</span>
          </template>
        </div>
        <a v-if="alert.source === '质量监控'" class="footer-link">查看运行记录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AlertCard - 单条告警事件卡片
 *
 * 展示告警基础信息（等级、状态、来源、监控事件）、日志摘要和操作按钮。
 * 根据 alert.status 动态切换操作按钮组，根据 alert.severity 和状态
 * 自动应用 ERROR(红)、WARN(蓝)、已解决(绿)、误报(橙) 主题边框色。
 *
 * @prop {Object}  alert   - 告警对象（required），数据结构见 src/mock/monitoring.js
 * @prop {Boolean} checked - 是否被勾选（用于批量操作场景），默认 false
 *
 * @emits check      (checked: Boolean)              - 勾选状态变化
 * @emits titleClick  (alert: Object)                 - 点击告警标题，通常用于打开详情抽屉
 * @emits action      (type: String, alert: Object)   - 操作按钮点击，type 为 claim/silence/resolve/transfer/falsePositive
 */
import { computed } from 'vue'
import AlertLogSection from '../AlertDetail/AlertLogSection.vue'
import AlertStatusBadge from '@/pages/Monitoring/components/AlertStatusBadge.vue'

const props = defineProps({
  alert: { type: Object, required: true },
  checked: { type: Boolean, default: false },
})

defineEmits(['check', 'titleClick', 'action'])

const statusMap = {
  firing: { cls: 'st-firing' },
  acked: { cls: 'st-ack' },
  silenced: { cls: 'st-silence' },
  transferred: { cls: 'st-transfer' },
  resolved: { cls: 'st-resolved' },
  falsePositive: { cls: 'st-fp' },
}

const statusClass = computed(() => statusMap[props.alert.status]?.cls || '')

const severityClass = computed(() => {
  if (props.alert.severity === 'ERROR') return 'sev-error'
  if (props.alert.severity === 'WARN') return 'sev-warn'
  return ''
})

const cardThemeClass = computed(() => {
  if (props.alert.status === 'resolved') return 'theme-resolved'
  if (props.alert.status === 'falsePositive') return 'theme-fp'
  if (props.alert.severity === 'ERROR') return 'theme-error'
  if (props.alert.severity === 'WARN') return 'theme-warn'
  return ''
})
</script>

<style scoped>
/* === Row === */
.alert-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  transition: all 0.25s ease;
}

.alert-row.selected .card {
  background-color: #f6faff;
  border-color: #cce4ff;
}

.row-check-wrap {
  padding-top: 24px;
  margin-right: 12px;
}

/* === Card === */
.card {
  flex: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px 24px;
  position: relative;
  transition: all 0.25s ease;
  border-left: 4px solid transparent;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* === Status backgrounds === */
.st-silence { background: #fbfbfc; }
.st-resolved { opacity: 0.9; background: #fafafa; }
.st-fp { opacity: 0.9; background: #ffffff; }

/* === Theme borders === */
.theme-error { border-left-color: #f5222d; }
.theme-warn { border-left-color: #1890ff; }
.theme-resolved { border-left-color: #52c41a; }
.theme-fp { border-left-color: #fa8c16; }

/* === Header === */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* === Severity tag === */
.severity-tag {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 2px;
  border: 1px solid;
  font-weight: 500;
  line-height: 20px;
}

.sev-error { color: #f5222d; background: #fff1f0; border-color: #ffa39e; }
.sev-warn { color: #e6a23c; background: #fdf6ec; border-color: #f5dab1; }

/* === Title === */
.alert-title {
  font-size: 16px;
  font-weight: 600;
  color: #1677ff;
  cursor: pointer;
  text-decoration: none;
  margin-right: 4px;
  transition: color 0.2s;
}

.alert-title:hover { color: #0958d9; text-decoration: underline; }
.st-resolved .alert-title { color: #888; text-decoration: line-through; }
.st-fp .alert-title { color: #888; text-decoration: line-through; }

/* === Count tag (prototype style) === */
.count-tag {
  background: #f4f4f5;
  color: #909399;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

/* === Trigger tag === */
.trigger-tag {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

/* === Recovery tag === */
.recovery-tag {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 2px;
  border: 1px solid;
  cursor: default;
}

.rec-manual { color: #1890ff; background: #e6f7ff; border-color: #91d5ff; }
.rec-auto { color: #52c41a; background: #f6ffed; border-color: #b7eb8f; }

/* === Buttons (matching prototype 32px height) === */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  transition: all 0.2s;
  font-weight: 500;
  outline: none;
  white-space: nowrap;
}

.btn-main {
  background: #3b73f6;
  color: #fff;
  border-color: #3b73f6;
}

.btn-main:hover { background: #2c63e4; border-color: #2c63e4; }

.btn-sub {
  background: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.btn-sub:hover { color: #3b73f6; border-color: #c6e2ff; background: #ecf5ff; }

.btn-icon {
  width: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.btn-icon:hover { background: #f4f4f5; border-radius: 4px; color: #606266; }

/* === More dropdown === */
.more-wrap { position: relative; }

.dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 5px 0;
  min-width: 100px;
  z-index: 10;
}

.more-wrap:hover .dropdown { display: block; }

.dd-item {
  padding: 6px 16px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.dd-item:hover { background: #f5f7fa; color: #3b73f6; }

.resolve-time { font-size: 12px; color: #999; }

/* === Meta row === */
.meta-row {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-item { margin-right: 24px; }
.link-text { color: #1677ff; text-decoration: none; cursor: pointer; }
.link-text:hover { text-decoration: underline; }
.silence-info { color: #722ed1; }
.transfer-info { color: #13c2c2; }
.resolved-info { color: #52c41a; }
.fp-info { color: #999; }

/* === Upgrade tag === */
.upgrade-tag {
  font-size: 12px;
  color: #d9363e;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 300px;
}

.upgrade-icon { font-size: 12px; font-weight: bold; color: #f5222d; flex-shrink: 0; }
.upgrade-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* === Log section === */
.log-section-wrap { margin-bottom: 16px; }

/* === Footer === */
.card-footer {
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.footer-info { display: flex; align-items: center; }
.footer-label { color: #999; }
.footer-val { color: #333; font-weight: 500; margin-left: 4px; }
.footer-sep { margin: 0 8px; color: #e8e8e8; }
.footer-link { color: #3b73f6; cursor: pointer; }
.footer-link:hover { text-decoration: underline; }
</style>
