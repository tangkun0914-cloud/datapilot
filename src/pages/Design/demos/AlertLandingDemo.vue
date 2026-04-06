<template>
  <div class="alert-landing-demo">
    <a-button type="primary" @click="openModal('dev')">打开 数据开发告警</a-button>
    <a-button @click="openModal('quality')" style="margin-left: 16px;">打开 数据质量告警</a-button>

    <a-modal
      v-model:open="visible"
      :title="title"
      :footer="null"
      width="414px"
      :bodyStyle="{ padding: 0, height: '736px', overflow: 'hidden', background: '#f5f7fa' }"
      destroyOnClose
      centered
    >
      <iframe :src="iframeSrc" frameborder="0" style="width: 100%; height: 100%; display: block;"></iframe>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
const iframeSrc = ref('')
const title = ref('')

function openModal(type) {
  if (type === 'dev') {
    // 使用 router.resolve 自动处理 base URL 拼接
    const route = router.resolve({ path: '/dev/alert-landing' })
    iframeSrc.value = route.href
    title.value = '手机端预览 - 数据开发告警'
  } else {
    const route = router.resolve({ path: '/monitoring/mobile/alert/2' })
    iframeSrc.value = route.href
    title.value = '手机端预览 - 数据质量告警'
  }
  visible.value = true
}
</script>

<style scoped>
.alert-landing-demo {
  display: flex;
  gap: 16px;
}
</style>
