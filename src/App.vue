<template>
  <a-config-provider :theme="theme">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { theme as antTheme } from 'ant-design-vue'

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
  },
  algorithm: antTheme.defaultAlgorithm,
}
</script>
