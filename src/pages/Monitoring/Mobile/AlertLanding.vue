<template>
  <div class="mobile-landing">
    <!-- Top nav -->
    <div class="mobile-nav">
      <span class="nav-back" @click="$router.back()">‹</span>
      <span class="nav-title">告警详情</span>
      <span class="nav-share">⋯</span>
    </div>

    <div class="mobile-content">
      <!-- Status card -->
      <div class="status-card card-animated" :style="{ borderTopColor: themeColor }" style="--delay: 0">
        <div class="status-top">
          <div class="status-tags">
            <span class="severity-badge" :class="severityBadgeClass">{{ alertData.severity }}</span>
            <span class="status-badge" :class="statusBadgeClass">
              <span v-if="status !== 'silenced'" class="status-dot" :class="dotClass"></span>
              <span v-else>🔇</span>
              {{ statusText }}
            </span>
          </div>
          <span class="event-id">ID: {{ alertData.id || 'E-100293' }}</span>
        </div>
        <h1 class="alert-title-mobile">{{ alertData.title }}</h1>
        <div class="duration-text">持续时长: <span class="duration-val">{{ alertData.duration || '2h 30m' }}</span></div>
      </div>

      <!-- Detail list -->
      <div class="detail-card card-animated" style="--delay: 1">
        <div class="detail-item">
          <span class="detail-label">所属空间</span>
          <span class="detail-value">国内数仓</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">告警来源</span>
          <span class="detail-value">{{ alertData.source }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">监控事件</span>
          <span class="detail-value">{{ alertData.monitorEvent }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">数据表名</span>
          <span class="detail-value mono-val">{{ alertData.title }}</span>
        </div>
        <div class="detail-item" v-if="alertData.qualityMonitorName">
          <span class="detail-label">数据质量</span>
          <span class="detail-value link-val">{{ alertData.qualityMonitorName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">首次触发</span>
          <span class="detail-value">{{ alertData.triggerTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">负责人</span>
          <span class="detail-value">
            <span class="owner-avatar">{{ ownerInitial }}</span>
            {{ alertData.owner }}
          </span>
        </div>
      </div>

      <!-- Link to monitor center -->
      <div class="link-card card-animated" style="--delay: 2">
        <div class="link-left">
          <div class="link-icon">📊</div>
          <div>
            <div class="link-title">监控运维中心</div>
            <div class="link-desc">点击定位至该告警事件上下文</div>
          </div>
        </div>
        <span class="link-arrow">›</span>
      </div>
    </div>

    <!-- Bottom action bar -->
    <div class="mobile-footer">
      <template v-if="status === 'acked'">
        <button class="btn-resolve" @click="handleResolve">
          ✅ 标记已解决
        </button>
      </template>
      <template v-else-if="status === 'silenced'">
        <button class="btn-unsilence" @click="handleUnSilence">取消屏蔽</button>
        <button class="btn-claim" @click="handleClaim">认领</button>
      </template>
      <template v-else>
        <button class="btn-silence" @click="handleSilence('1小时')">屏蔽1h</button>
        <button class="btn-silence" @click="handleSilence('2小时')">屏蔽2h</button>
        <button class="btn-claim" :disabled="status === 'claiming'" @click="handleClaim">
          <template v-if="status === 'claiming'">提交中...</template>
          <template v-else>✋ 认领</template>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * AlertLanding - 手机端告警落地页
 *
 * 移动端独立路由页面（无 AppLayout），展示单条告警详情。
 * 包含告警头部信息、进度时间线、详细属性列表、底部操作栏
 * （认领/屏蔽/取消屏蔽/标记已解决），支持入场动画和安全区适配。
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAlertDetail } from '@/services/Monitoring/monitoringService.js'

const route = useRoute()
const status = ref('firing')

const alertData = ref({
  id: '',
  title: '',
  severity: 'ERROR',
  source: '数据质量',
  monitorEvent: '',
  qualityMonitorName: '',
  triggerTime: '',
  owner: '',
  duration: '2h 30m',
})

const ownerInitial = computed(() => {
  const name = alertData.value.owner || ''
  return name.charAt(0)
})

const themeColor = computed(() => {
  if (status.value === 'resolved') return '#52c41a'
  if (status.value === 'falsePositive') return '#fa8c16'
  if (alertData.value.severity === 'ERROR') return '#f5222d'
  if (alertData.value.severity === 'WARN') return '#1890ff'
  return '#f5222d'
})

const severityBadgeClass = computed(() =>
  alertData.value.severity === 'ERROR' ? 'sev-error' : 'sev-warn'
)

const statusText = computed(() => {
  const map = { firing: '触发中', claiming: '认领中', acked: '处理中', silenced: '已屏蔽', resolved: '已解决', falsePositive: '误报' }
  return map[status.value] || '触发中'
})

const statusBadgeClass = computed(() => {
  const map = { firing: 'st-firing', claiming: 'st-firing', acked: 'st-acked', silenced: 'st-silenced', resolved: 'st-resolved', falsePositive: 'st-fp' }
  return map[status.value] || 'st-firing'
})

const dotClass = computed(() => {
  const map = { firing: 'dot-firing', claiming: 'dot-firing', acked: 'dot-acked', silenced: '' }
  return map[status.value] || ''
})

onMounted(async () => {
  const eventId = route.params.eventId
  if (eventId) {
    const detail = await getAlertDetail(eventId)
    if (detail) {
      Object.assign(alertData.value, detail)
    }
  }
})

function handleClaim() {
  status.value = 'claiming'
  setTimeout(() => {
    status.value = 'acked'
    message.success('认领成功')
  }, 800)
}

function handleSilence(duration) {
  status.value = 'silenced'
  message.success(`屏蔽成功，将暂时屏蔽 ${duration}`)
}

function handleUnSilence() {
  status.value = 'firing'
  message.success('已取消屏蔽')
}

function handleResolve() {
  message.success('已标记为解决')
}
</script>

<style scoped>
.mobile-landing {
  min-height: 100vh;
  background: #f5f6fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 24px));
  padding-top: env(safe-area-inset-top, 0px);
}

/* ===== Card slide-up entry animation ===== */
.card-animated {
  animation: slideUp 0.4s ease both;
  animation-delay: calc(var(--delay, 0) * 0.08s);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Nav ===== */
.mobile-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top, 0px);
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-back,
.nav-share {
  font-size: 20px;
  color: #666;
  cursor: pointer;
  width: 32px;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}

.nav-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

/* ===== Content ===== */
.mobile-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== Status card ===== */
.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  border-top: 4px solid;
  transition: border-color 0.3s;
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.severity-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
}

.sev-error { color: #f5222d; background: #fff1f0; border-color: #ffa39e; }
.sev-warn { color: #1890ff; background: #e6f7ff; border-color: #91d5ff; }

.status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.st-firing { color: #f5222d; background: #fff1f0; }
.st-acked { color: #1890ff; background: #e6f7ff; }
.st-silenced { color: #722ed1; background: #f9f0ff; }
.st-resolved { color: #52c41a; background: #f6ffed; }
.st-fp { color: #fa8c16; background: #fff7e6; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-firing { background: #f5222d; animation: pulse 1.5s infinite; }
.dot-acked { background: #1890ff; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.event-id {
  font-size: 12px;
  color: #999;
  font-family: 'Courier New', monospace;
}

.alert-title-mobile {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 8px;
  line-height: 1.4;
  word-break: break-all;
}

.duration-text {
  font-size: 14px;
  color: #8c8c8c;
}

.duration-val {
  font-weight: 500;
  color: #4a5568;
}

/* ===== Detail card ===== */
.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-start;
}

.detail-item:last-child { border-bottom: none; }

.detail-label {
  width: 90px;
  color: #8c8c8c;
  font-size: 13px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #262626;
  font-size: 13px;
  font-weight: 500;
  word-break: break-all;
  display: flex;
  align-items: center;
}

.mono-val {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  background: #f7f8fa;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.link-val {
  color: #3b73f6;
}

.owner-avatar {
  width: 20px;
  height: 20px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 50%;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

/* ===== Link card ===== */
.link-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.link-card:active { background: #f5f5f5; }

.link-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-icon {
  width: 40px;
  height: 40px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.link-title { font-size: 14px; font-weight: 700; color: #333; }
.link-desc { font-size: 12px; color: #999; margin-top: 2px; }
.link-arrow { font-size: 20px; color: #ccc; }

/* ===== Footer ===== */
.mobile-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 24px));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 40;
  display: flex;
  gap: 12px;
}

.btn-claim {
  flex: 1.5;
  height: 44px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
  transition: transform 0.15s, opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-claim:disabled { opacity: 0.7; }
.btn-claim:active:not(:disabled) { transform: scale(0.97); }

.btn-silence {
  flex: 1;
  height: 44px;
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-silence:active { background: #f5f5f5; }

.btn-unsilence {
  flex: 1;
  height: 44px;
  background: #fff;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-resolve {
  flex: 1;
  height: 44px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  transition: transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn-resolve:active { transform: scale(0.97); }
</style>
