<template>
  <div class="demo-wrap">
    <p class="demo-desc">
      <code>injectTableCopyButtons</code> 扫描容器内 <code>&lt;table&gt;</code>，hover 表格区域时右上角出现复制按钮。
    </p>
    <div
      ref="boxRef"
      class="p-4 bg-white border border-slate-200 rounded-lg markdown-body max-w-md"
      v-html="tableHtml"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { injectTableCopyButtons } from '@/pages/DataMap/MapAgent/components/Chat/useTableCopy.js'

const boxRef = ref(null)
const tableHtml =
  '<table><thead><tr><th>列A</th><th>列B</th></tr></thead><tbody><tr><td>1</td><td>示例</td></tr><tr><td>2</td><td>数据</td></tr></tbody></table>'

onMounted(() => {
  nextTick(() => {
    injectTableCopyButtons(boxRef.value, message)
  })
})
</script>

<style scoped>
.demo-wrap {
  padding: 8px 0;
}
.demo-desc {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 12px;
}
.demo-desc code {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}
</style>

<!-- 与 MessageList 中注入的 .table-copy-* 一致，否则预览区按钮不可见 -->
<style>
.table-copy-wrapper {
  position: relative;
}
.table-copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  opacity: 0;
  transition: all 0.2s;
  z-index: 5;
}
.table-copy-wrapper:hover .table-copy-btn {
  opacity: 1;
}
.table-copy-btn:hover {
  color: rgba(108, 76, 155, 1);
  border-color: rgba(108, 76, 155, 0.3);
  background: rgba(108, 76, 155, 0.05);
}
</style>
