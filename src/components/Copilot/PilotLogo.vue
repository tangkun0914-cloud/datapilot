<!--
  克隆自 data-agent PilotLogo.jsx（React）→ Vue SFC
  DataPilot SVG Logo：支持尺寸与 color / white / dark
-->
<template>
  <svg
    class="pilot-logo"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="100" x2="100" y2="0">
        <stop class="pilot-logo__stop-start" />
        <stop offset="1" class="pilot-logo__stop-end" />
      </linearGradient>
    </defs>
    <path
      d="M50 5 L63 37 L95 50 L63 63 L50 95 L37 63 L5 50 L37 37 Z"
      :fill="pathFill"
    />
    <circle cx="50" cy="50" r="4" fill="#fff" />
  </svg>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  /** 图标边长（px） */
  size: { type: Number, default: 24 },
  /**
   * color：渐变（与 Copilot 主题紫一致，可通过 CSS 变量覆盖）
   * white / dark：纯色填充
   */
  type: {
    type: String,
    default: 'color',
    validator: (v) => ['color', 'white', 'dark'].includes(v),
  },
})

/** 同页多实例时避免 defs id 冲突（useId 须在 setup 顶层同步调用） */
const gradId = `pilot-logo-g1-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

const pathFill = computed(() => {
  if (props.type === 'color') return `url(#${gradId})`
  if (props.type === 'white') return '#fff'
  return '#333'
})
</script>

<style scoped>
.pilot-logo {
  display: block;
  flex-shrink: 0;
  /* 与项目 Copilot 紫色对齐，可按页面覆盖 */
  --agent-primary: rgba(108, 76, 155);
  --agent-primary-2: rgba(142, 110, 185);
}

.pilot-logo__stop-start {
  stop-color: var(--agent-primary);
}

.pilot-logo__stop-end {
  stop-color: var(--agent-primary-2);
}
</style>
