<template>
  <DataSourceIcon :type="type" :size="20" />
</template>

<script setup>
import DataSourceIcon from './DataSourceIcon.vue'

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
</style>
