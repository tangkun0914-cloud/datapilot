import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCopilotStore = defineStore('copilot', () => {
  const visible = ref(false)
  const pendingQuestion = ref('')

  function open(question = '') {
    pendingQuestion.value = question
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  function consumeQuestion() {
    const q = pendingQuestion.value
    pendingQuestion.value = ''
    return q
  }

  return { visible, pendingQuestion, open, close, consumeQuestion }
})
