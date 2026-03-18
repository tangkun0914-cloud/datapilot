<template>
  <div class="usage-tab">
    <div class="usage-header">
      <a-button v-if="!editing" size="small" class="edit-btn" @click="startEdit">
        <template #icon><EditOutlined /></template>
        编辑
      </a-button>
      <template v-else>
        <a-space>
          <a-button size="small" type="primary" @click="saveEdit">保存</a-button>
          <a-button size="small" @click="cancelEdit">取消</a-button>
        </a-space>
      </template>
    </div>

    <!-- 预览模式 -->
    <div v-if="!editing" class="usage-content" v-html="renderedContent" />

    <!-- 编辑模式 -->
    <div v-else class="usage-edit-form">
      <div class="edit-section">
        <label class="edit-label">表说明</label>
        <a-textarea v-model:value="editForm.tableDesc" :rows="3" placeholder="请输入表说明" />
      </div>
      <div class="edit-section">
        <label class="edit-label">口径说明</label>
        <a-textarea v-model:value="editForm.calibration" :rows="5" placeholder="请输入口径说明" />
      </div>
      <div class="edit-section">
        <label class="edit-label">注意事项</label>
        <a-textarea v-model:value="editForm.notes" :rows="5" placeholder="请输入注意事项" />
      </div>
      <div class="edit-section">
        <label class="edit-label">示例 SQL</label>
        <a-textarea v-model:value="editForm.exampleSql" :rows="8" placeholder="请输入示例 SQL" class="font-mono" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { EditOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  description: { type: String, default: '' },
})

const editing = ref(false)

const docSections = reactive({
  tableDesc: props.description || '',
  calibration: `- **统计粒度**：按订单维度，每笔订单一行记录
- **数据来源**：通过 DataX 从 MySQL trade_db 实时同步至 Hive ODS 层
- **同步策略**：T+1 增量同步，每日凌晨 02:00 调度
- **分区策略**：按 \`dt\`（日期）字段分区，格式 \`yyyyMMdd\``,
  notes: `1. **主键唯一性**：\`order_id\` 为全局唯一主键，不可重复
2. **金额精度**：\`order_amount\` 使用 DECIMAL(18,2)，计算时避免浮点精度丢失
3. **PII 字段**：\`user_id\`、\`province\`、\`city\` 已标记 PII，下游使用需脱敏处理
4. **删除标记**：查询有效数据时需添加 \`WHERE is_deleted = 0\` 过滤条件
5. **状态枚举**：\`order_status\` 取值 0-3，分别代表待支付、已支付、已取消、已退款`,
  exampleSql: `-- 查询某天的有效已支付订单金额汇总
SELECT
  dt,
  COUNT(1) AS order_cnt,
  SUM(order_amount) AS total_amount,
  AVG(order_amount) AS avg_amount
FROM ods_order_detail
WHERE dt = '2024-11-10'
  AND is_deleted = 0
  AND order_status = 1
GROUP BY dt;

-- 各渠道支付金额分布
SELECT
  pay_channel,
  COUNT(1) AS order_cnt,
  SUM(order_amount) AS total_amount
FROM ods_order_detail
WHERE dt = '2024-11-10'
  AND is_deleted = 0
GROUP BY pay_channel
ORDER BY total_amount DESC;`,
})

const editForm = reactive({
  tableDesc: '',
  calibration: '',
  notes: '',
  exampleSql: '',
})

function startEdit() {
  editForm.tableDesc = docSections.tableDesc
  editForm.calibration = docSections.calibration
  editForm.notes = docSections.notes
  editForm.exampleSql = docSections.exampleSql
  editing.value = true
}

function saveEdit() {
  docSections.tableDesc = editForm.tableDesc
  docSections.calibration = editForm.calibration
  docSections.notes = editForm.notes
  docSections.exampleSql = editForm.exampleSql
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

const usageDoc = computed(() => `## 表说明

${docSections.tableDesc}

---

## 口径说明

${docSections.calibration}

## 注意事项

${docSections.notes}

## 示例 SQL

\`\`\`sql
${docSections.exampleSql}
\`\`\`
`)

const renderedContent = computed(() => {
  let md = usageDoc.value
  md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  md = md.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  md = md.replace(/^---$/gm, '<hr />')
  md = md.replace(/```sql\n([\s\S]*?)```/g, '<pre class="sql-block"><code>$1</code></pre>')
  md = md.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  md = md.replace(/^(\d+)\. (.+)$/gm, '<li class="ol-item"><span class="ol-num">$1.</span> $2</li>')
  md = md.replace(/^- (.+)$/gm, '<li class="ul-item">$1</li>')
  
  // 清理块级元素前后的多余换行，避免生成多余的 br
  md = md.replace(/(<\/?h[23]>|<\/?hr \/>|<\/?pre[^>]*>|<\/?li[^>]*>)\n+/g, '$1')
  md = md.replace(/\n+(<\/?h[23]>|<\/?hr \/>|<\/?pre[^>]*>|<\/?li[^>]*>)/g, '$1')
  
  // 剩余的连续换行替换为较小的间距
  md = md.replace(/\n{2,}/g, '<div class="para-spacer"></div>')
  md = md.replace(/\n/g, '<br />')
  return md
})
</script>

<style scoped>
.usage-tab {
  padding: 0 0 16px;
}

.usage-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.edit-btn {
  font-size: 13px;
  color: #475569;
  border-color: #d9d9d9;
}

.edit-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.usage-content {
  max-width: 800px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-body);
}

.usage-content :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-title);
  margin: 16px 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.usage-content :deep(h2:first-child) {
  margin-top: 0;
}

.usage-content :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-title);
  margin: 12px 0 6px;
}

.usage-content :deep(hr) {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 12px 0;
}

.usage-content :deep(.sql-block) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  margin: 8px 0;
}

.usage-content :deep(.sql-block code) {
  background: none;
  padding: 0;
  color: inherit;
}

.usage-content :deep(.inline-code) {
  font-size: 13px;
  padding: 1px 6px;
  background: #f5f5f5;
  border-radius: 3px;
  color: #d4380d;
}

.usage-content :deep(.ul-item),
.usage-content :deep(.ol-item) {
  list-style: none;
  padding-left: 16px;
  position: relative;
  margin-bottom: 2px;
}

.usage-content :deep(.para-spacer) {
  height: 8px;
}

.usage-content :deep(.ul-item::before) {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.usage-content :deep(.ol-num) {
  color: var(--color-primary);
  font-weight: 600;
  margin-right: 4px;
}

.usage-edit-form {
  max-width: 800px;
}

.edit-section {
  margin-bottom: 20px;
}

.edit-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  padding-left: 10px;
  position: relative;
}

.edit-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: #3b82f6;
  border-radius: 2px;
}
</style>
