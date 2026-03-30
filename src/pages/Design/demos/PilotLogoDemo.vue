<template>
  <div class="demo-wrap">
    <section class="token-section">
      <h4 class="section-title">Copilot / DataPilot 品牌主色</h4>
      <p class="demo-desc">
        Logo 渐变起始色与业务侧栏、气泡等紫色一致，统一使用：
        <code class="token-code">rgba(108, 76, 155)</code>
      </p>
      <div class="token-row">
        <div class="swatch" style="background: rgba(108, 76, 155)" />
        <div class="token-meta">
          <div class="token-line"><span class="label">主色</span> rgba(108, 76, 155)</div>
          <div class="token-line muted">渐变末端（组件内默认）— rgba(142, 110, 185)，可通过 <code>--agent-primary-2</code> 覆盖</div>
        </div>
      </div>
    </section>

    <section class="preview-section">
      <h4 class="section-title">组件形态（PilotLogo）</h4>
      <p class="demo-desc">
        <code>type="color"</code> 为对角线渐变（基于上述主色）；<code>white</code> / <code>dark</code> 为纯色填充，用于深色/浅色底。
      </p>

      <div class="preview-grid">
        <div class="preview-card">
          <span class="preview-label">color · 48px</span>
          <PilotLogo :size="48" type="color" />
        </div>
        <div class="preview-card">
          <span class="preview-label">color · 24px</span>
          <PilotLogo :size="24" type="color" />
        </div>
        <div class="preview-card preview-card--on-brand">
          <span class="preview-label">white · 32px（紫底）</span>
          <PilotLogo :size="32" type="white" />
        </div>
        <div class="preview-card preview-card--dark-bg">
          <span class="preview-label">white · 32px（深底）</span>
          <PilotLogo :size="32" type="white" />
        </div>
        <div class="preview-card">
          <span class="preview-label">dark · 32px</span>
          <PilotLogo :size="32" type="dark" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import PilotLogo from '@/components/Copilot/PilotLogo.vue'
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
  width: 100%;
}

.section-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.token-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e2e8f0;
}

.demo-desc {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 12px;
  line-height: 1.6;
}

.demo-desc code,
.token-line code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.token-code {
  font-weight: 600;
  color: rgba(108, 76, 155);
  background: rgba(108, 76, 155, 0.08);
}

.token-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.swatch {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.token-meta {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #334155;
}

.token-line {
  margin-bottom: 6px;
}

.token-line .label {
  display: inline-block;
  min-width: 36px;
  color: #64748b;
  font-size: 12px;
}

.token-line.muted {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  min-width: 140px;
}

.preview-card--on-brand {
  background: rgba(108, 76, 155);
  border-color: rgba(108, 76, 155);
}

.preview-card--on-brand .preview-label {
  color: rgba(255, 255, 255, 0.92);
}

.preview-card--dark-bg {
  background: #1e293b;
  border-color: #334155;
}

.preview-card--dark-bg .preview-label {
  color: #94a3b8;
}

.preview-label {
  font-size: 11px;
  color: #64748b;
  font-family: ui-monospace, monospace;
  text-align: center;
}
</style>
