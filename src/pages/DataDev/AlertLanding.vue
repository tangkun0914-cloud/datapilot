<template>
  <div class="alert-landing-page">
    <!-- Top nav (模拟手机端导航) -->
    <div class="mobile-nav">
      <span class="nav-back" @click="$router.back()">‹</span>
      <span class="nav-title">告警详情</span>
      <span class="nav-share">⋯</span>
    </div>

    <div class="landing-content">
      <a-spin :spinning="loading" tip="正在加载告警数据...">
        <template v-if="!loading">
          <!-- Status Card -->
          <div class="card status-card">
            <div class="status-top">
              <div class="status-tags">
                <span class="tag-warn">{{ alertData.level }}</span>
                <span class="tag-firing">
                  <span class="dot-firing"></span>
                  {{ alertData.statusText }}
                </span>
              </div>
              <div class="event-id">ID: {{ alertData.id }}</div>
            </div>
            <h1 class="alert-title">{{ alertData.title }}</h1>
            <div class="alert-duration">持续时长: <span class="duration-val">{{ alertData.duration }}</span></div>
          </div>

          <!-- Detail Card -->
          <div class="card detail-card">
            <div class="detail-row">
              <div class="detail-label">所属空间</div>
              <div class="detail-value">
                <span class="space-icon">📁</span> {{ alertData.workspace }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">告警来源</div>
              <div class="detail-value">{{ alertData.source }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">监控事件</div>
              <div class="detail-value">{{ alertData.event }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">任务名</div>
              <div class="detail-value">
                <span class="code-value">{{ alertData.taskName }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">调度批次</div>
              <div class="detail-value">{{ alertData.batchTime }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">调度实例ID</div>
              <div class="detail-value">{{ alertData.instanceId }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">首次触发</div>
              <div class="detail-value">{{ alertData.triggerTime }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">负责人</div>
              <div class="detail-value owner-value">
                <div class="owner-avatar">{{ alertData.owner.avatar }}</div>
                <span class="owner-name">{{ alertData.owner.name }}</span>
              </div>
            </div>
          </div>

          <!-- Link Card -->
          <div class="card link-card" @click="goToMonitor">
            <div class="link-icon-wrapper">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="link-icon"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="link-content">
              <div class="link-title">监控运维中心</div>
              <div class="link-desc">点击定位至该告警事件上下文</div>
            </div>
            <div class="link-arrow">›</div>
          </div>
        </template>
      </a-spin>
    </div>

    <!-- Bottom action bar (固定在底部) -->
    <div class="mobile-footer" v-if="!loading">
      <div class="action-row">
        <button class="btn-secondary" @click="handleAction('屏蔽1h')">屏蔽1h</button>
        <button class="btn-secondary" @click="handleAction('屏蔽24h')">屏蔽24h</button>
        <button class="btn-secondary" @click="handleAction('误报')">误报</button>
      </div>
      <div class="action-row">
        <button class="btn-primary btn-claim" @click="handleAction('认领')">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          认领
        </button>
        <button class="btn-success btn-resolve" @click="handleAction('已解决')">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          已解决
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const loading = ref(true)

// 模拟后端返回的数据
const alertData = ref({
  id: '',
  level: '',
  status: '',
  statusText: '',
  title: '',
  duration: '',
  workspace: '',
  source: '',
  event: '',
  taskName: '',
  batchTime: '',
  instanceId: '',
  triggerTime: '',
  owner: {
    name: '',
    avatar: ''
  }
})

onMounted(() => {
  // 模拟 API 请求延迟
  setTimeout(() => {
    alertData.value = {
      id: 'E-10006242',
      level: 'WARN',
      status: 'firing',
      statusText: '触发中',
      title: 'ods_mysql_datatask_cheetah_v2_da_run_info_df',
      duration: '15d 23m 42s',
      workspace: '国内',
      source: '数据集成',
      event: '离线任务失败',
      taskName: 'ods_mysql_datatask_cheetah_v2_da_run_info_df',
      batchTime: '2026-03-05 16:13:51',
      instanceId: '848380',
      triggerTime: '2026-03-05 16:29:48',
      owner: {
        name: '王蕊(ruiwang1)',
        avatar: '王'
      }
    }
    loading.value = false
  }, 600) // 600ms 延迟模拟网络请求
})

function goToMonitor() {
  router.push('/monitoring/alerts')
}

function handleAction(actionType) {
  message.success(`操作成功: ${actionType}`)
}
</script>

<style scoped>
.alert-landing-page {
  min-height: 100vh;
  background-color: #f5f6fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: calc(110px + env(safe-area-inset-bottom, 24px));
  padding-top: env(safe-area-inset-top, 0px);
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

.landing-content {
  padding: 20px 16px; /* 增加顶部和底部的内边距 */
  display: flex;
  flex-direction: column;
  gap: 24px; /* 进一步增加卡片之间的间距，让视觉更透气 */
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 0; /* 移除可能的默认 margin，依赖父级的 gap */
}

/* Status Card */
.status-card {
  border-top: 4px solid #f59e0b; /* WARN 颜色 */
  padding: 20px;
}

.status-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-warn {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #fcd34d;
}

.tag-firing {
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
  background: #fee2e2;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot-firing {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.event-id {
  font-size: 12px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
}

.alert-title {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 8px 0;
  line-height: 1.4;
  word-break: break-all;
}

.alert-duration {
  font-size: 14px;
  color: #8c8c8c;
}

.duration-val {
  font-weight: 500;
  color: #4a5568;
}

/* Detail Card */
.detail-card {
  padding: 4px 16px;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: flex-start;
}

.detail-row:last-child {
  border-bottom: none;
}

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
  display: flex;
  align-items: center;
  word-break: break-all;
}

.space-icon {
  margin-right: 6px;
  font-size: 14px;
}

.code-value {
  background: #f7f8fa;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

.owner-value {
  display: flex;
  align-items: center;
}

.owner-avatar {
  width: 20px;
  height: 20px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  margin-right: 8px;
  flex-shrink: 0;
}

.owner-name {
  color: #262626;
}

/* Link Card */
.link-card {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.link-card:active {
  background: #f5f5f5;
}

.link-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #eef2ff;
  color: #7c3aed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
}

.link-content {
  flex: 1;
}

.link-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.link-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.link-arrow {
  font-size: 20px;
  color: #ccc;
}

/* Actions Footer */
.mobile-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 16px; /* 增加底部操作栏的内边距 */
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 24px));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 增加两排按钮之间的间距 */
}

.action-row {
  display: flex;
  gap: 12px;
}

button {
  outline: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

button:active {
  transform: scale(0.97);
}

.btn-secondary {
  flex: 1;
  height: 40px;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.btn-secondary:active {
  background: #f5f5f5;
}

.btn-primary {
  flex: 1;
  height: 44px;
  background: #1677ff;
  border: none;
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.btn-success {
  flex: 1;
  height: 44px;
  background: #52c41a;
  border: none;
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}
</style>
