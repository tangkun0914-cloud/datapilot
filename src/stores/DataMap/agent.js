import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAgentStore = defineStore('agent', () => {
  const isDarkMode = ref(false) // 默认开启亮色模式

  return {
    isDarkMode
  }
})
