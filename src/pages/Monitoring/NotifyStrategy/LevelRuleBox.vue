<template>
  <div class="level-rule-box">
    <div class="level-rule-header" :class="level === 'ERROR' ? 'error-header' : 'warn-header'">
      <span class="level-tag" :class="level === 'ERROR' ? 'error' : 'warn'">{{ level }}</span>
      <span class="level-rule-desc">当触发 {{ level }} 级别告警时，发送给：</span>
    </div>
    <div class="level-rule-body">
      <!-- 任务负责人 -->
      <div class="rule-row">
        <div class="rule-switch">
          <a-switch v-model:checked="rules.owner.enabled" size="small" :disabled="disabled" />
          <span>任务负责人</span>
        </div>
        <div class="rule-options" :class="{ 'disabled-options': !rules.owner.enabled }">
          <span class="options-label">接收渠道：</span>
          <a-checkbox-group v-model:value="rules.owner.channels" :disabled="disabled">
            <a-checkbox value="feishu">企微</a-checkbox>
            <a-checkbox value="phone">电话</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
      <!-- 指定人员 -->
      <div class="rule-row">
        <div class="rule-switch">
          <a-switch v-model:checked="rules.specific.enabled" size="small" :disabled="disabled" />
          <span>指定人员</span>
        </div>
        <div class="rule-options" :class="{ 'disabled-options': !rules.specific.enabled }">
          <a-select
            v-model:value="rules.specific.users"
            mode="multiple"
            placeholder="+ 选择人员"
            style="min-width: 200px"
            :options="userOptions"
            :disabled="disabled"
          />
          <span class="options-separator">|</span>
          <span class="options-label">接收渠道：</span>
          <a-checkbox-group v-model:value="rules.specific.channels" :disabled="disabled">
            <a-checkbox value="feishu">企微</a-checkbox>
            <a-checkbox value="phone">电话</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
      <!-- On-call 值班 -->
      <div class="rule-row">
        <div class="rule-switch">
          <a-switch v-model:checked="rules.oncall.enabled" size="small" :disabled="disabled" />
          <span>On-call值班</span>
        </div>
        <div class="rule-options" :class="{ 'disabled-options': !rules.oncall.enabled }">
          <a-select
            v-model:value="rules.oncall.groups"
            mode="multiple"
            placeholder="选择值班组（可多选）"
            style="min-width: 220px; flex: 1"
            :options="oncallOptions"
            allow-clear
            :disabled="disabled"
          />
          <span class="options-separator">|</span>
          <span class="options-label">接收渠道：</span>
          <a-checkbox-group v-model:value="rules.oncall.channels" :disabled="disabled">
            <a-checkbox value="feishu">企微</a-checkbox>
            <a-checkbox value="phone">电话</a-checkbox>
          </a-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * LevelRuleBox - 告警等级通知规则配置块
 *
 * 单个告警等级（ERROR/WARN）的通知接收人和渠道配置面板，包含
 * 「任务负责人」「指定人员」「On-call 值班」三组独立开关 + 渠道选择。
 * 供 CreateStrategy 按等级复用，消除 ERROR/WARN 重复模板。
 *
 * @prop {String} level         - 'ERROR' | 'WARN'，决定标题颜色和标签
 * @prop {Object} rules         - 规则对象，含 owner/specific/oncall 三组（直接修改，父组件通过 reactive 共享）
 * @prop {Array}  userOptions   - 人员选项数组 [{ value, label }]
 * @prop {Array}  oncallOptions - 值班组选项数组 [{ value, label }]
 */
defineProps({
  level: { type: String, required: true },
  rules: { type: Object, required: true },
  userOptions: { type: Array, default: () => [] },
  oncallOptions: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})
</script>

<style scoped>
.level-rule-box {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.level-rule-header {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.error-header {
  background-color: #fff1f0;
  border-bottom-color: #ffa39e;
}

.warn-header {
  background-color: #fffbe6;
  border-bottom-color: #ffe58f;
}

.level-tag {
  display: inline-block;
  width: 54px;
  text-align: center;
  padding: 2px 0;
  border-radius: 2px;
  font-weight: bold;
  font-size: 12px;
}

.level-tag.error { background: #ff4d4f; color: #fff; }
.level-tag.warn { background: #fa8c16; color: #fff; }

.level-rule-desc {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-left: 12px;
}

.level-rule-body {
  padding: 16px;
  background-color: #fff;
}

.rule-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
}

.rule-row:last-child {
  margin-bottom: 0;
}

.rule-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.rule-options {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.3s;
  min-height: 32px;
}

.rule-row:hover .rule-options:not(.disabled-options) {
  border-color: #e6f4ff;
  background: #f0f7ff;
}

.rule-options.disabled-options {
  opacity: 0.4;
  pointer-events: none;
  background: #f5f5f5;
}

.options-label {
  color: #666;
  font-weight: 500;
}

.options-separator {
  color: #d9d9d9;
  margin: 0 4px;
}
</style>
