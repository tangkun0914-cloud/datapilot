<template>
  <div class="result-list">
    <a-spin :spinning="loading">
      <div v-for="item in data" :key="item.id || item.fullyQualifiedName" class="result-card">
        <!-- Header -->
        <div class="card-header">
          <div class="header-left">
            <SourceTag :type="item.serviceType" class="source-icon-tag" />
            <span class="source-type-label">{{ item.serviceType }}表</span>
            <div class="table-name-wrapper">
              <a-tooltip :title="`${item.database?.name || 'db'}.${item.name}`" placement="topLeft">
                <a
                  class="table-name font-mono"
                  @click="goDetail(item.fullyQualifiedName)"
                >
                  {{ item.database?.name || 'db' }}.{{ item.name }}
                </a>
              </a-tooltip>
              <CopyOutlined class="copy-icon" @click="copyName(`${item.database?.name || 'db'}.${item.name}`, $event)" title="复制表名" />
            </div>
            <span v-if="item.displayName" class="table-display-name">
              {{ item.displayName }}
            </span>
          </div>
          <div class="header-right">
            <a-tooltip title="最近30天被查询/引用的次数">
              <div class="stat-item">
                <FireFilled class="stat-icon fire" />
                <span class="stat-count">{{ Math.floor((item.usageSummary?.dailyStats?.count || 0) * 0.8) }}</span>
              </div>
            </a-tooltip>
            <a-tooltip title="最近30天被浏览的次数">
              <div class="stat-item">
                <EyeOutlined class="stat-icon eye" />
                <span class="stat-count">{{ item.usageSummary?.dailyStats?.count || 0 }}</span>
              </div>
            </a-tooltip>
            <div class="divider"></div>
            <a-tooltip :title="isFavorited(item) ? '取消收藏' : '加入收藏'">
              <div class="fav-btn" @click="toggleFavorite(item)">
                <StarFilled v-if="isFavorited(item)" class="star-icon active" />
                <StarOutlined v-else class="star-icon" />
              </div>
            </a-tooltip>
          </div>
        </div>

        <!-- Body -->
        <div class="card-body">
          <a-row :gutter="[16, 12]">
            <a-col :span="8" class="meta-col">
              <span class="meta-label">所属库：</span>
              <span class="meta-value">
                <a-tag class="meta-tag db-tag">{{ item.database?.name || 'db' }}</a-tag>
              </span>
            </a-col>
            <a-col :span="8" class="meta-col">
              <span class="meta-label">负责人：</span>
              <span class="meta-value">{{ ownerNames(item.owners) }}</span>
            </a-col>
            <a-col :span="8" class="meta-col">
              <span class="meta-label">更新时间：</span>
              <span class="meta-value">{{ formatTime(item.updatedAt) }}</span>
            </a-col>
            <a-col :span="8" class="meta-col">
              <span class="meta-label">业务域：</span>
              <span class="meta-value">{{ getTagValue(item, '业务域') || '-' }}</span>
            </a-col>
            <a-col :span="8" class="meta-col">
              <span class="meta-label">分层：</span>
              <span class="meta-value">
                <a-tag v-if="getTagValue(item, '数仓分层')" color="blue" class="meta-tag tier-tag">{{ getTagValue(item, '数仓分层') }}</a-tag>
                <span v-else>-</span>
              </span>
            </a-col>
            <a-col :span="8" class="meta-col">
              <span class="meta-label">描述：</span>
              <a-tooltip :title="item.description" placement="topLeft">
                <span class="meta-value desc-value">{{ item.description || '-' }}</span>
              </a-tooltip>
            </a-col>
          </a-row>
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <span class="footer-label">字段：</span>
          <div class="footer-fields">
            <template v-for="(field, idx) in getMockFieldsList(item)" :key="idx">
              <a-tooltip placement="top">
                <template #title>
                  <div class="field-tooltip">
                    <div class="field-tt-row"><span class="field-tt-label">字段名：</span>{{ field.name }}</div>
                    <div class="field-tt-row"><span class="field-tt-label">类型：</span><span class="field-tt-type">{{ field.type }}</span></div>
                    <div class="field-tt-row"><span class="field-tt-label">描述：</span>{{ field.desc }}</div>
                  </div>
                </template>
                <span class="field-item">
                  <KeyOutlined v-if="field.isPk" class="text-blue-500 mr-1 text-[12px]" />
                  {{ field.name }}
                </span>
              </a-tooltip>
              <span v-if="idx < getMockFieldsList(item).length - 1" class="field-divider">|</span>
            </template>
          </div>
        </div>
      </div>
      <a-empty v-if="!loading && data.length === 0" description="暂无结果" />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { StarOutlined, StarFilled, EyeOutlined, FireFilled, CopyOutlined, KeyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import SourceTag from '@/components/SourceTag.vue'

const router = useRouter()

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['filterByTag', 'favorite'])

const favorites = ref(new Set())

function loadFavorites() {
  try {
    const raw = localStorage.getItem('datamap_favorites') || '[]'
    favorites.value = new Set(JSON.parse(raw))
  } catch {
    favorites.value = new Set()
  }
}

onMounted(loadFavorites)

function getTagValue(item, prefix) {
  if (!item.tags) return ''
  const tag = item.tags.find(t => t.tagFQN && t.tagFQN.startsWith(prefix + '.'))
  if (tag) {
    return tag.tagFQN.replace(prefix + '.', '')
  }
  return ''
}

function ownerNames(owners) {
  if (!owners?.length) return '-'
  return owners.map((o) => o.name || '-').join('、')
}

function formatTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isFavorited(item) {
  const fqn = item?.fullyQualifiedName
  return fqn && favorites.value.has(fqn)
}

function toggleFavorite(item) {
  const fqn = item?.fullyQualifiedName
  if (!fqn) return
  const set = new Set(favorites.value)
  if (set.has(fqn)) {
    set.delete(fqn)
  } else {
    set.add(fqn)
  }
  localStorage.setItem('datamap_favorites', JSON.stringify([...set]))
  favorites.value = set
  emit('favorite', item)
}

function goDetail(fqn) {
  if (!fqn) return
  router.push('/detail/' + encodeURIComponent(fqn))
}

function copyName(name, event) {
  event.stopPropagation()
  navigator.clipboard.writeText(name).then(() => {
    message.success('表名已复制')
  }).catch(() => {
    message.error('复制失败')
  })
}

function getMockFieldsList(item) {
  const name = item.name || ''
  
  if (name === 'dwa_cn_cus_df_complain_detail') {
    return [
      { name: 'order_id', type: 'BIGINT', desc: '订单唯一标识', isPk: true },
      { name: 'user_id', type: 'BIGINT', desc: '下单用户ID' },
      { name: 'product_id', type: 'BIGINT', desc: '商品ID' },
      { name: 'order_amount', type: 'DECIMAL(18,2)', desc: '订单金额（元）' },
      { name: 'pay_channel', type: 'VARCHAR(32)', desc: '支付渠道' },
      { name: 'order_status', type: 'INT', desc: '订单状态' },
      { name: 'province', type: 'VARCHAR(64)', desc: '收货省份' },
    ]
  }
  
  if (name.includes('user')) {
    return [
      { name: 'user_id', type: 'BIGINT', desc: '用户唯一标识 ID' },
      { name: 'user_name', type: 'VARCHAR(64)', desc: '用户真实姓名或昵称' },
      { name: 'age', type: 'INT', desc: '用户年龄' },
      { name: 'gender', type: 'TINYINT', desc: '性别：0未知，1男，2女' },
      { name: 'phone', type: 'VARCHAR(32)', desc: '绑定手机号（脱敏）' },
      { name: 'email', type: 'VARCHAR(128)', desc: '联系邮箱' },
      { name: 'register_time', type: 'TIMESTAMP', desc: '账号注册时间' },
    ]
  }
  if (name.includes('order')) {
    return [
      { name: 'order_id', type: 'BIGINT', desc: '订单流水号' },
      { name: 'user_id', type: 'BIGINT', desc: '下单用户 ID' },
      { name: 'amount', type: 'DECIMAL(10,2)', desc: '订单实际支付金额' },
      { name: 'status', type: 'INT', desc: '订单状态：1待支付，2已支付，3已发货，4已完成' },
      { name: 'create_time', type: 'TIMESTAMP', desc: '订单创建时间' },
      { name: 'pay_time', type: 'TIMESTAMP', desc: '订单支付成功时间' },
      { name: 'channel', type: 'VARCHAR(32)', desc: '订单来源渠道（APP/小程序/Web）' },
    ]
  }
  if (name.includes('product')) {
    return [
      { name: 'product_id', type: 'BIGINT', desc: '商品 SPU ID' },
      { name: 'sku_id', type: 'BIGINT', desc: '商品 SKU ID' },
      { name: 'product_name', type: 'VARCHAR(255)', desc: '商品标题名称' },
      { name: 'category', type: 'VARCHAR(64)', desc: '商品所属类目' },
      { name: 'price', type: 'DECIMAL(10,2)', desc: '商品当前售价' },
      { name: 'stock', type: 'INT', desc: '当前可用库存数量' },
      { name: 'brand', type: 'VARCHAR(64)', desc: '商品所属品牌' },
    ]
  }
  if (name.includes('marketing')) {
    return [
      { name: 'campaign_id', type: 'BIGINT', desc: '营销活动 ID' },
      { name: 'channel', type: 'VARCHAR(64)', desc: '投放渠道（抖音/快手/广点通等）' },
      { name: 'cost', type: 'DECIMAL(10,2)', desc: '活动消耗成本' },
      { name: 'clicks', type: 'INT', desc: '广告点击次数' },
      { name: 'conversions', type: 'INT', desc: '实际转化订单数' },
      { name: 'roi', type: 'DECIMAL(10,4)', desc: '投资回报率' },
      { name: 'start_date', type: 'DATE', desc: '活动开始日期' },
    ]
  }
  return [
    { name: 'id', type: 'BIGINT', desc: '主键 ID' },
    { name: 'name', type: 'VARCHAR(128)', desc: '名称' },
    { name: 'status', type: 'TINYINT', desc: '状态' },
    { name: 'create_time', type: 'TIMESTAMP', desc: '创建时间' },
    { name: 'update_time', type: 'TIMESTAMP', desc: '更新时间' },
    { name: 'creator', type: 'VARCHAR(64)', desc: '创建人' },
    { name: 'modifier', type: 'VARCHAR(64)', desc: '修改人' },
  ]
}
</script>

<style scoped>
.result-list {
  min-height: 200px;
}

.result-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.result-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-type-label {
  font-size: 13px;
  color: #64748b;
  margin-right: 4px;
}

.table-name {
  font-size: 15px;
  font-weight: 600;
  color: #1677ff;
  cursor: pointer;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.table-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-icon {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #1677ff;
}

.table-name:hover {
  text-decoration: underline;
}

.table-display-name {
  font-size: 13px;
  color: #64748b;
  margin-left: 8px;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
  cursor: help;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background-color: #f1f5f9;
}

.stat-icon {
  font-size: 14px;
}

.stat-icon.fire {
  color: #ff7875;
}

.stat-icon.eye {
  color: #1677ff;
}

.stat-count {
  font-family: monospace;
  font-weight: 500;
}

.divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  margin: 0 4px;
}

.fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
}

.fav-btn:hover .star-icon:not(.active) {
  color: #ffc53d;
  opacity: 0.8;
}

.star-icon {
  font-size: 16px;
  color: #d9d9d9;
}

.star-icon.active {
  color: #ffc53d;
}

.card-body {
  padding: 16px;
}

.meta-col {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.meta-label {
  color: #94a3b8;
  font-size: 13px;
  width: 70px;
  flex-shrink: 0;
}

.meta-value {
  color: #334155;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.desc-value {
  cursor: default;
}

.meta-tag {
  margin: 0;
  font-size: 12px;
  line-height: 20px;
  border-radius: 4px;
}

.db-tag {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
  font-family: monospace;
}

.tier-tag {
  border: none;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  font-size: 13px;
}

.footer-label {
  color: #94a3b8;
  flex-shrink: 0;
  margin-top: 2px;
}

.footer-fields {
  margin-left: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 0;
  overflow: hidden;
}

.field-item {
  color: #64748b;
  font-family: monospace;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}

.field-item:hover {
  color: #1677ff;
  background: #e6f4ff;
}

.field-divider {
  color: #cbd5e1;
  margin: 0 6px;
  font-size: 12px;
}

.field-tooltip {
  font-size: 12px;
  line-height: 1.6;
  padding: 4px;
}

.field-tt-row {
  display: flex;
  margin-bottom: 4px;
}

.field-tt-row:last-child {
  margin-bottom: 0;
}

.field-tt-label {
  color: rgba(255, 255, 255, 0.65);
  width: 50px;
  flex-shrink: 0;
}

.field-tt-type {
  color: #69b1ff;
  font-family: monospace;
}
</style>
