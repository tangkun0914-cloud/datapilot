<template>
  <div class="px-3.5 py-2.5 text-[14px] leading-[1.6] shadow-[0_1px_2px_rgba(16,24,40,0.04)] bg-[rgba(108,76,155,1)] text-white rounded-[14px] rounded-tr-sm border-none">
    {{ content }}
  </div>
</template>

<script setup>
defineProps({
  content: { type: String, default: '' }
})
</script>
