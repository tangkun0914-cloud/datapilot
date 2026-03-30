<template>
  <div class="border rounded-xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] w-full max-w-3xl mt-2 transition-colors duration-300 bg-white border-[#eef0f2]">
    <div class="font-medium mb-3 text-[13px] transition-colors duration-300 text-[#333]">
      为您找到 {{ data.total || data.list.length }} 张相关表<template v-if="data.total > currentList.length">，为您展示最匹配的 {{ currentList.length }} 项</template>：
    </div>
    
    <div class="flex flex-col max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#ddd]">
      <div 
        v-for="item in currentList" 
        :key="item.fqn" 
        class="flex items-start py-4 border-b border-[#f1f5f9] transition-colors hover:bg-[#f1f5f9] hover:rounded-lg cursor-pointer group px-2"
        @click="$emit('view', item.fqn)"
      >
        <div class="mr-4 shrink-0 mt-0.5">
          <DataSourceIcon :type="item.serviceType || 'hive'" :size="28" />
        </div>
        
        <div class="flex-1 min-w-0 mr-6 flex flex-col justify-center">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[15px] font-semibold text-[rgba(108,76,155,1)] whitespace-nowrap overflow-hidden text-ellipsis transition-colors group-hover:text-[rgba(108,76,155,0.8)] font-mono" :title="item.fqn">
              {{ item.fqn }}
            </span>
          </div>
          
          <div class="text-[13px] color-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis flex items-center mb-1">
            <span class="text-xs text-gray-500">{{ item.cnName || item.name || '-' }}</span>
            <span class="ml-4 text-xs flex items-center gap-1 opacity-80 text-gray-500">
              <UserOutlined class="text-[11px]" /> {{ item.owner || '未知(unknown)' }}
            </span>
          </div>
          
          <div class="w-full mt-1">
            <a-tooltip :title="item.desc" placement="topLeft">
              <span class="text-xs text-gray-400 truncate block w-full">{{ item.desc || '暂无描述' }}</span>
            </a-tooltip>
          </div>
          
          <div v-if="item.reason" class="mt-2 text-[12px] p-2 rounded border flex items-start gap-1.5 text-[#888] bg-[#fcfcfc] border-[#f5f5f5]">
            <svg class="w-3.5 h-3.5 mt-0.5 shrink-0" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4566">
              <path d="M504.603543 974.541565c-29.15297 0-53.401234-4.859681-72.205509-14.486946-14.366196-7.355525-21.508873-15.46625-24.460088-19.59222-13.867846-15.7231-20.066011-33.679054-20.066011-58.002019l0.00921-99.921757c0.00921-1.292436-0.057305-18.423605-9.259898-41.974997-12.772908-32.689517-36.192294-61.701271-69.605288-86.228897l-0.518816-0.394996c-39.271422-31.001061-71.731718-70.971401-93.871971-115.593691-23.248494-46.856168-35.036981-97.326653-35.036981-150.010549 0-90.50734 35.244712-175.59832 99.243305-239.59589 63.998593-63.99757 149.087527-99.242282 239.594867-99.242282s175.59525 35.244712 239.59282 99.242282c63.996546 63.998593 99.241258 149.087527 99.241258 239.59589 0 53.150524-11.971659 104.036471-35.582403 151.244656-22.499433 44.985564-55.443753 85.146239-95.27083 116.14116l-0.572028 0.445138-0.603751 0.399089c-89.865727 59.358923-94.763271 113.971751-94.904487 116.187209 0 12.08013 0.013303 17.45658 0.022513 21.61018 0.01535 6.166443 0.023536 9.564843-0.022513 27.367301-0.080841 30.652114-13.596669 53.782927-39.084157 66.889433-16.180518 8.320503-36.524868 12.364609-62.199621 12.364609-1.65264 0-3.327792 0.005117-5.019317 0.00921-17.451464 0.053212-37.22481 0.105401-55.349609-4.793166-9.93835-2.687202-15.817244-12.921287-13.131065-22.859637 2.686179-9.939373 12.921287-15.812127 22.859637-13.132088 13.293771 3.593851 29.668717 3.546779 45.515636 3.502777 1.727341-0.005117 3.437286-0.010233 5.125741-0.010233 56.628742 0 63.950498-22.48306 64.001663-42.069141 0.047072-17.709337 0.038886-21.071921 0.023536-27.179013-0.011256-4.204765-0.023536-9.657964-0.023536-21.998013l0.004093-0.36225c0.040932-2.097778 0.824785-21.287839 15.57472-48.878221 18.729573-35.031864 50.835805-67.780733 95.441723-97.348142 35.214013-27.541263 64.346517-63.131853 84.269265-102.964046 20.998243-41.983183 31.644721-87.258343 31.644721-134.567835 0-80.549547-31.366382-156.277276-88.322581-213.233476s-132.681882-88.322581-213.229382-88.322581c-80.548524 0-156.275229 31.366382-213.231429 88.322581-56.957223 56.9562-88.323605 132.683928-88.323605 213.233476 0 92.535533 41.724287 178.590468 114.478288 236.144278 93.355201 68.683289 93.956905 151.293775 93.805456 158.89694l0 99.081623c0 15.694447 3.061732 24.89704 11.296277 33.957393l1.841951 2.026146 0.24764 0.641613c2.556219 2.87549 20.391423 20.231787 75.916017 17.968234l1.653663-0.067538 0.517793 0.091074c2.074242 0.00921 13.631462-0.162706 47.923476-5.074575 5.081739-0.87595 37.96773-6.062066 62.167898 1.74883 9.797134 3.160993 15.176654 13.666254 12.014638 23.465434-3.160993 9.797134-13.661138 15.181771-23.465434 12.014638-13.623275-4.3951-37.323047-1.738597-44.549635-0.459464l-0.598634 0.096191c-36.087916 5.176906-50.071396 5.600555-54.904471 5.467525C511.611144 974.473003 508.071528 974.541565 504.603543 974.541565z" fill="#FF9000" p-id="4567"></path>
              <path d="M285.930171 376.969631c-1.134847 0-2.284019-0.104377-3.440355-0.319272-10.120498-1.888-16.794501-11.623735-14.905478-21.744233 8.314363-44.562938 25.111934-86.170568 49.925063-123.669624 5.681396-8.585539 17.246803-10.940167 25.833365-5.258771 8.585539 5.681396 10.940167 17.246803 5.258771 25.833365-22.045085 33.314757-36.972053 70.302159-44.366464 109.933785C302.561967 370.709043 294.730605 376.969631 285.930171 376.969631z" fill="#FF9000" p-id="4568"></path>
            </svg>
            <span class="leading-relaxed"><span class="font-medium text-[#666]">推荐理由：</span>{{ item.reason }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 text-[#64748b] text-[13px] mt-0.5">
          <a-tooltip title="最近30天被查询/引用的次数">
            <div class="flex items-center gap-1 cursor-help px-1.5 py-1 rounded transition-colors hover:bg-[#f1f5f9]">
              <FireFilled class="text-[14px]" style="color: #ff7875;" />
              <span class="font-mono font-medium">{{ item.hotness || Math.floor((item.usageSummary?.dailyStats?.count || 100) * 0.8) }}</span>
            </div>
          </a-tooltip>
          <a-tooltip title="最近30天被浏览的次数">
            <div class="flex items-center gap-1 cursor-help px-1.5 py-1 rounded transition-colors hover:bg-[#f1f5f9]">
              <EyeOutlined class="text-[14px]" style="color: rgba(108,76,155,1);" />
              <span class="font-mono font-medium">{{ item.views || Math.floor(Math.random() * 2000) }}</span>
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>

    <!-- 底部操作区：加载更多 & 查看全部 -->
    <div v-if="data.total > currentList.length" class="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
      <span class="text-[13px] text-[#64748b]">还有 <span class="font-medium text-[rgba(108,76,155,1)]">{{ data.total - currentList.length }}</span> 张表未展示</span>
      <div class="flex gap-3">
        <div 
          class="px-4 py-1.5 rounded-md text-[13px] text-[rgba(108,76,155,1)] bg-[#f8fafc] border border-[rgba(108,76,155,0.2)] cursor-pointer transition-colors flex items-center gap-1"
          :class="isLoadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(108,76,155,0.05)] hover:border-[rgba(108,76,155,0.4)]'"
          @click="handleLoadMore"
        >
          <span v-if="isLoadingMore" class="w-3 h-3 border-2 border-[rgba(108,76,155,0.3)] border-t-[rgba(108,76,155,1)] rounded-full animate-spin"></span>
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </div>
        <div 
          class="px-4 py-1.5 rounded-md text-[13px] text-white bg-[rgba(108,76,155,1)] shadow-sm cursor-pointer transition-colors hover:bg-[rgba(108,76,155,0.9)] flex items-center gap-1"
          @click="handleViewAll"
        >
          查看全部 {{ data.total }} 条结果
        </div>
      </div>
    </div>

    <!-- 追问建议 -->
    <div v-if="data.suggestions && data.suggestions.length" class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#f1f5f9]">
      <span class="text-[13px] text-[#64748b] mr-1">您可以继续问：</span>
      <div 
        v-for="sug in data.suggestions" 
        :key="sug"
        class="px-3 py-1.5 rounded-full text-[13px] text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.04)] border border-[rgba(108,76,155,0.15)] cursor-pointer transition-all duration-300 hover:bg-[rgba(108,76,155,0.08)] hover:border-[rgba(108,76,155,0.3)] flex items-center"
        @click="$emit('send', sug)"
      >
        {{ sug }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  TableOutlined, UserOutlined, 
  FireFilled, EyeOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import DataSourceIcon from '@/pages/DataMap/components/DataSourceIcon.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'loadMore', 'viewAll', 'send'])
const router = useRouter()

const currentList = ref([])
const isLoadingMore = ref(false)

onMounted(() => {
  if (props.data && props.data.list) {
    currentList.value = [...props.data.list]
  }
})

const handleLoadMore = () => {
  if (isLoadingMore.value) return
  
  isLoadingMore.value = true
  // 模拟网络请求加载下一页数据
  setTimeout(() => {
    const mockNewItems = [
      { fqn: `dm_trade.dws_new_table_2026_${Math.floor(Math.random()*1000)}_1`, cnName: '新增订单表1', desc: '加载更多模拟数据', owner: '测试(test)' },
      { fqn: `dm_trade.dws_new_table_2026_${Math.floor(Math.random()*1000)}_2`, cnName: '新增订单表2', desc: '加载更多模拟数据', owner: '测试(test)' },
      { fqn: `dm_trade.dws_new_table_2026_${Math.floor(Math.random()*1000)}_3`, cnName: '新增订单表3', desc: '加载更多模拟数据', owner: '测试(test)' },
    ]
    currentList.value = [...currentList.value, ...mockNewItems]
    isLoadingMore.value = false
    message.success('加载成功')
  }, 800)
}

const handleViewAll = () => {
  // 跳转到全局搜索页，并带上参数（这里假设搜索词为“订单”）
  // 实际项目中可以从上下文中获取真实的搜索词
  router.push({
    path: '/search',
    query: { q: '订单' }
  })
}
</script>
