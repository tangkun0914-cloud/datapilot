<template>
  <a-drawer
    :open="open"
    :width="800"
    :title="drawerTitle"
    placement="right"
    @close="$emit('close')"
    :style="{ marginTop: '64px', height: 'calc(100% - 64px)' }"
  >
    <div class="create-strategy-form">
      <!-- Step 1: 基本信息 -->
      <div class="section-block">
        <div class="section-header">
          <span class="step-num">1</span>
          <h3>基础信息</h3>
        </div>
        <div class="section-body">
          <a-form layout="vertical">
            <a-form-item label="策略名称" required>
              <a-input v-model:value="form.name" placeholder="例如：数仓核心任务策略、业务轻量级策略、静默策略" :maxlength="50" show-count :disabled="isViewMode" />
            </a-form-item>
            <a-form-item label="描述">
              <a-textarea v-model:value="form.description" placeholder="请输入策略描述..." :rows="3" :disabled="isViewMode" />
            </a-form-item>
          </a-form>
        </div>
      </div>

      <!-- Step 2: 告警通知规则 -->
      <div class="section-block">
        <div class="section-header">
          <span class="step-num">2</span>
          <h3>告警通知规则</h3>
        </div>
        <div class="section-body">
          <LevelRuleBox
            level="ERROR"
            :rules="form.errorRules"
            :userOptions="userOptions"
            :oncallOptions="oncallGroupOptions"
            :disabled="isViewMode"
          />
          <LevelRuleBox
            level="WARN"
            :rules="form.warnRules"
            :userOptions="userOptions"
            :oncallOptions="oncallGroupOptions"
            :disabled="isViewMode"
          />
        </div>
      </div>

      <!-- Step 3: 发送策略配置 -->
      <div class="section-block">
        <div class="section-header">
          <span class="step-num">3</span>
          <h3>发送策略配置</h3>
        </div>
        <div class="section-body">
          <!-- 策略 1: 发送频次控制 -->
          <div class="policy-card" :class="{ 'active-border': form.policies.frequency.enabled }">
            <div class="policy-header">
              <div class="policy-left">
                <a-switch v-model:checked="form.policies.frequency.enabled" size="small" :disabled="isViewMode" />
                <div class="policy-info">
                  <div class="policy-name">发送频次控制</div>
                  <div class="policy-desc">避免告警风暴，限制发送频率。</div>
                </div>
              </div>
              <div class="status-tag" v-if="form.policies.frequency.enabled">已开启</div>
            </div>
            <div class="policy-body" v-if="form.policies.frequency.enabled">
              <div class="inline-form">
                每 <a-input-number v-model:value="form.policies.frequency.interval" class="input-mini" :min="1" :disabled="isViewMode" /> 分钟发送一次，
                最多连续发送 <a-input-number v-model:value="form.policies.frequency.maxSend" class="input-mini" :min="1" :disabled="isViewMode" /> 次
              </div>
            </div>
          </div>

          <!-- 策略 2: 静默时间 -->
          <div class="policy-card" :class="{ 'active-border': form.policies.silence.enabled }">
            <div class="policy-header">
              <div class="policy-left">
                <a-switch v-model:checked="form.policies.silence.enabled" size="small" :disabled="isViewMode" />
                <div class="policy-info">
                  <div class="policy-name-row">
                    <span class="policy-name">静默时间</span>
                    <a-tag color="processing" class="scope-tag" :bordered="false">仅 WARN</a-tag>
                  </div>
                  <div class="policy-desc">在指定时段内，仅对 WARN 级别告警屏蔽通知（ERROR 不受影响）。</div>
                </div>
              </div>
              <div class="status-tag" v-if="form.policies.silence.enabled">已开启</div>
            </div>
            <div class="policy-body" v-if="form.policies.silence.enabled">
              <div class="policy-scope-hint-inline">
                <InfoCircleOutlined class="hint-icon info" />
                <span>静默规则仅作用于 WARN 级别告警任务；ERROR 级别告警仍会正常通知。</span>
              </div>
              <div class="form-row form-row-below-hint">
                <span style="margin-right: 8px; color: #666;">生效时段：</span>
                <a-time-range-picker v-model:value="form.policies.silence.timeRange" format="HH:mm" :disabled="isViewMode" />
              </div>
            </div>
          </div>

          <!-- 策略 3: 通知升级 -->
          <div class="policy-card" :class="{ 'active-border': form.policies.upgrade.enabled }">
            <div class="policy-header">
              <div class="policy-left">
                <a-switch v-model:checked="form.policies.upgrade.enabled" size="small" :disabled="isViewMode" />
                <div class="policy-info">
                  <div class="policy-name-row">
                    <span class="policy-name">通知升级</span>
                    <a-tag color="error" class="scope-tag" :bordered="false">仅 ERROR</a-tag>
                  </div>
                  <div class="policy-desc">当 ERROR 级别告警未及时处理时，按层级通知更高负责人（WARN 不触发升级）。</div>
                </div>
              </div>
              <div class="status-tag" v-if="form.policies.upgrade.enabled">已开启</div>
            </div>
            <div class="policy-body" v-if="form.policies.upgrade.enabled">
              <div class="policy-scope-hint-inline warning">
                <ExclamationCircleOutlined class="hint-icon warn" />
                <span>升级链路仅针对 ERROR 级别告警；WARN 告警不会进入此升级流程。</span>
              </div>
              <div class="escalation-rules-container escalation-below-hint">
                <div class="escalation-row" v-for="(level, index) in form.policies.upgrade.levels" :key="index">
                  <span class="row-num">{{ index + 1 }}</span>
                  <div class="row-content">
                    <div class="escalation-condition">
                      {{ index === 0 ? '触发告警' : '再过' }} 
                      <a-input-number v-model:value="level.timeout" class="input-mini" :min="1" :disabled="isViewMode" /> 分钟后仍未处理，升级发送给：
                      <a-select
                        v-model:value="level.users"
                        mode="multiple"
                        placeholder="+ 选择人员"
                        style="min-width: 200px"
                        :options="userOptions"
                        :disabled="isViewMode"
                      />
                    </div>
                    <div class="escalation-channel-config">
                      <span class="options-label">升级渠道：</span>
                      <a-checkbox-group v-model:value="level.channels" :disabled="isViewMode">
                        <a-checkbox value="feishu">企微</a-checkbox>
                        <a-checkbox value="phone">电话</a-checkbox>
                      </a-checkbox-group>
                    </div>
                  </div>
                  <DeleteOutlined v-if="!isViewMode" class="btn-delete" @click="removeUpgradeLevel(index)" />
                </div>
              </div>
              <div v-if="!isViewMode" class="escalation-add-row" @click="addUpgradeLevel">
                <PlusOutlined /> 添加下一级升级策略
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <a-space v-if="isViewMode">
        <a-button @click="$emit('close')">关闭</a-button>
      </a-space>
      <a-space v-else>
        <a-button @click="$emit('close')">取消</a-button>
        <a-button type="primary" @click="handleSubmit">保存配置</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
/**
 * CreateStrategy - 通知策略抽屉（新建/编辑/查看）
 *
 * 右侧 800px 抽屉，分三步配置通知策略：
 *  1. 基础信息（名称 + 描述）
 *  2. 告警通知规则（ERROR/WARN 各一组 LevelRuleBox）
 *  3. 发送策略配置（频次控制、静默时间[仅WARN]、通知升级[仅ERROR]）
 *
 * @prop {Boolean} open        - 控制抽屉显示/隐藏
 * @prop {String}  mode        - 'create' | 'edit' | 'view'
 * @prop {Object}  initialData - 编辑/查看模式下传入的策略完整数据
 *
 * @emits close ()              - 关闭抽屉
 * @emits submit (data: Object) - 提交策略配置
 */
import { reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, PlusOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import LevelRuleBox from './LevelRuleBox.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
})

const emit = defineEmits(['close', 'submit'])

const isViewMode = computed(() => props.mode === 'view')

const drawerTitle = computed(() => {
  const map = { create: '新建通知策略', edit: '编辑通知策略', view: '查看通知策略' }
  return map[props.mode] || '新建通知策略'
})

const userOptions = [
  { value: 'u_wangrui', label: '王蕊 (ruiwang1)' },
  { value: 'u_wangbo', label: '王博 (bowang2)' },
  { value: 'u_lilei', label: '李雷 (lilei)' },
  { value: 'u_hanmeimei', label: '韩梅梅 (hmm)' },
  { value: 'u_zhangsan', label: '张三 (zhangsan)' }
]

const oncallGroupOptions = [
  { value: 'sre', label: '大数据SRE值班组' },
  { value: 'dba', label: '数据库值班组' },
  { value: 'biz_ops', label: '业务运维值班组' },
  { value: 'security', label: '安全值班组' }
]

function getDefaultForm() {
  return {
    name: '',
    description: '',
    errorRules: {
      owner: { enabled: true, channels: ['feishu'] },
      specific: { enabled: true, users: ['u_wangrui'], channels: ['feishu', 'phone'] },
      oncall: { enabled: false, groups: ['sre'], channels: ['feishu', 'phone'] },
    },
    warnRules: {
      owner: { enabled: true, channels: ['feishu'] },
      specific: { enabled: false, users: [], channels: ['feishu'] },
      oncall: { enabled: false, groups: ['sre'], channels: ['feishu'] },
    },
    policies: {
      frequency: { enabled: true, interval: 10, maxSend: 3 },
      silence: { enabled: true, timeRange: null, appliesToSeverity: 'WARN' },
      upgrade: {
        enabled: false,
        appliesToSeverity: 'ERROR',
        levels: [{ timeout: 15, users: ['u_wangbo'], channels: ['feishu', 'phone'] }],
      },
    },
  }
}

const form = reactive(getDefaultForm())

watch(() => props.open, (val) => {
  if (!val) return
  if (props.initialData) {
    const src = JSON.parse(JSON.stringify(props.initialData))
    Object.assign(form, {
      name: src.name || '',
      description: src.description || '',
      errorRules: src.errorRules || getDefaultForm().errorRules,
      warnRules: src.warnRules || getDefaultForm().warnRules,
      policies: src.policies || getDefaultForm().policies,
    })
  } else {
    Object.assign(form, getDefaultForm())
  }
})

function addUpgradeLevel() {
  form.policies.upgrade.levels.push({
    timeout: 15,
    users: [],
    channels: ['feishu', 'phone']
  })
}

function removeUpgradeLevel(index) {
  form.policies.upgrade.levels.splice(index, 1)
}

function handleSubmit() {
  if (!form.name) {
    message.warning('请输入策略名称')
    return
  }
  emit('submit', JSON.parse(JSON.stringify(form)))
  message.success(props.mode === 'edit' ? '策略修改成功' : '策略创建成功')
  emit('close')
}
</script>

<style scoped>
.create-strategy-form {
  padding-bottom: 24px;
}

.section-block {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.step-num {
  background: #e6f4ff;
  color: #1677ff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
}

.section-body {
  margin-left: 34px;
}

/* ======== 策略配置样式 ======== */
.policy-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  transition: all 0.3s;
  background: #fff;
}

.policy-card.active-border {
  border-color: #1677ff;
}

.policy-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-bottom: 1px solid transparent;
  border-radius: 4px 4px 0 0;
}

.policy-card.active-border .policy-header {
  background: #f0f7ff;
  border-bottom-color: #d6e4ff;
}

.policy-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.policy-info {
  display: flex;
  flex-direction: column;
}

.policy-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.policy-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.scope-tag {
  margin: 0;
  font-size: 12px;
  line-height: 20px;
}

.policy-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.status-tag {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #adc6ff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 2px;
}

.policy-body {
  padding: 16px;
  font-size: 13px;
  color: #333;
}

.inline-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-mini {
  width: 60px;
}

.form-row {
  display: flex;
  align-items: center;
}

.policy-scope-hint-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.policy-scope-hint-inline.warning {
  background: #fffbe6;
  border-color: #ffe58f;
}

.hint-icon {
  font-size: 14px;
}

.hint-icon.info {
  color: #52c41a;
}

.hint-icon.warn {
  color: #faad14;
}

.form-row-below-hint {
  margin-top: 4px;
}

.escalation-below-hint {
  margin-top: 8px;
}

/* ======== 升级策略样式 ======== */
.escalation-rules-container {
  margin-bottom: 16px;
}

.escalation-row {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-bottom: 24px;
}

.escalation-row:last-child {
  padding-bottom: 0;
}

.escalation-row:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 12px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background-color: #e8e8e8;
}

.row-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 24px;
  margin-right: 12px;
  flex-shrink: 0;
  z-index: 1;
  margin-top: 4px;
}

.row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}

.escalation-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.escalation-channel-config {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.btn-delete {
  color: #999;
  cursor: pointer;
  font-size: 14px;
  margin-left: 12px;
  margin-top: 10px;
  transition: color 0.2s;
}

.btn-delete:hover {
  color: #ff4d4f;
}

.escalation-add-row {
  margin-left: 36px;
  color: #1677ff;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.escalation-add-row:hover {
  text-decoration: underline;
}
</style>
