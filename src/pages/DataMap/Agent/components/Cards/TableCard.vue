<template>
  <div class="border rounded-xl p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] w-full max-w-3xl group relative mt-2 transition-colors duration-300"
       :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#eef0f2]'">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 pb-3 border-b" :class="isDarkMode ? 'border-slate-700' : 'border-[#e5e7eb]'">
      <div class="flex items-center gap-2">
        <SourceTag type="hive" class="scale-90 origin-left" />
        <span class="text-[13px] mr-1" :class="isDarkMode ? 'text-slate-400' : 'text-[#64748b]'">Hive表</span>
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[15px] font-semibold transition-colors" :class="isDarkMode ? 'text-slate-200' : 'text-[#1677ff]'">
            {{ data.fqn }}
          </span>
          <CopyOutlined class="text-[14px] cursor-pointer transition-colors" 
                        :class="isDarkMode ? 'text-slate-500 hover:text-[rgba(108,76,155,1)]' : 'text-[#cbd5e1] hover:text-[rgba(108,76,155,1)]'" 
                        title="复制表名" @click="copyText(data.fqn)" />
        </div>
        <span v-if="data.cnName" class="text-[13px] ml-2 px-2 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-[#f1f5f9] text-[#64748b]'">
          {{ data.cnName }}
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        <a-tooltip title="最近30天被查询/引用的次数">
          <div class="flex items-center gap-1 text-[13px] cursor-help px-2 py-1 rounded transition-colors" :class="isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-[#64748b] hover:bg-[#f1f5f9]'">
            <FireFilled class="text-[14px]" style="color: #ff7875;" />
            <span class="font-mono font-medium">{{ data.hotness || 120 }}</span>
          </div>
        </a-tooltip>
        <a-tooltip title="最近30天被浏览的次数">
          <div class="flex items-center gap-1 text-[13px] cursor-help px-2 py-1 rounded transition-colors" :class="isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-[#64748b] hover:bg-[#f1f5f9]'">
            <EyeOutlined class="text-[14px]" style="color: #1677ff;" />
            <span class="font-mono font-medium">963</span>
          </div>
        </a-tooltip>
        <div class="w-[1px] h-[12px]" :class="isDarkMode ? 'bg-slate-600' : 'bg-[#e2e8f0]'"></div>
        <a-tooltip :title="isFavorited ? '取消收藏' : '收藏'">
          <div class="flex items-center justify-center w-6 h-6 cursor-pointer group/fav" @click="toggleFavorite">
            <StarFilled v-if="isFavorited" class="text-[16px] text-[#ffc53d]" />
            <StarOutlined v-else class="text-[16px] transition-colors" :class="isDarkMode ? 'text-slate-500 group-hover/fav:text-[#ffc53d]' : 'text-[#d9d9d9] group-hover/fav:text-[#ffc53d] group-hover/fav:opacity-80'" />
          </div>
        </a-tooltip>
      </div>
    </div>
    
    <!-- Body -->
    <div class="mb-4">
      <a-row :gutter="[16, 12]">
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">所属库：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">
            <span class="font-mono px-2 py-0.5 rounded border" :class="isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-[#f1f5f9] border-[#e2e8f0]'">{{ data.fqn.split('.')[0] || 'default' }}</span>
          </span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">负责人：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.owner }}</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">更新时间：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.updateFreq }}</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">业务域：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">-</span>
        </a-col>
        <a-col :span="8" class="flex items-center mb-2">
          <span class="text-[13px] w-[70px] shrink-0" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">分层：</span>
          <span class="text-[13px] truncate flex-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">
            <span v-if="data.layers && data.layers.length" class="text-[#1677ff] bg-[#e6f4ff] border border-[#91caff] px-2 py-0.5 rounded text-[12px]">{{ data.layers[0] }}</span>
            <span v-else>-</span>
          </span>
        </a-col>
        <a-col :span="24" class="flex items-start mb-2">
          <span class="text-[13px] w-[70px] shrink-0 mt-0.5" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">描述：</span>
          <span class="text-[13px] flex-1 leading-relaxed" :class="isDarkMode ? 'text-slate-300' : 'text-[#334155]'">{{ data.desc || '-' }}</span>
        </a-col>
      </a-row>
    </div>

    <!-- 操作按钮区 -->
    <div class="flex flex-wrap items-center justify-start pt-4 border-t transition-colors duration-300"
         :class="isDarkMode ? 'border-slate-700' : 'border-[#f0f0f0]'">
      
      <!-- 功能操作 -->
      <div class="flex items-center gap-2">
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="[
            isDetailExpanded 
              ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.05)] border border-[rgba(108,76,155,0.2)]' 
              : (isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]')
          ]"
          @click="isDetailExpanded = !isDetailExpanded"
        >
          <FullscreenExitOutlined v-if="isDetailExpanded" />
          <FullscreenOutlined v-else />
          {{ isDetailExpanded ? '收起' : '展开全部' }}
        </div>
        
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="[
            activeSqlType === 'ddl' 
              ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.05)] border border-[rgba(108,76,155,0.2)]' 
              : (isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]')
          ]"
          @click="toggleSql('ddl')"
        >
          <CodeOutlined />
          生成 DDL
        </div>
        
        <div 
          class="px-3 py-1 rounded-md text-[12px] cursor-pointer transition-colors flex items-center gap-1"
          :class="[
            activeSqlType === 'select' 
              ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.05)] border border-[rgba(108,76,155,0.2)]' 
              : (isDarkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-[#64748b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]')
          ]"
          @click="toggleSql('select')"
        >
          <ConsoleSqlOutlined />
          生成 SELECT
        </div>
      </div>
    </div>
    
    <!-- 隐藏的代码面板 -->
    <div v-if="activeSqlType" class="mt-3 bg-[#1e293b] rounded-lg overflow-hidden relative border" :class="isDarkMode ? 'border-slate-700' : 'border-slate-800'">
      <div class="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-white/10">
        <span class="text-slate-300 text-[12px] font-medium">{{ activeSqlType === 'ddl' ? '建表语句 (DDL)' : '查询语句 (SELECT)' }}</span>
        <div class="flex items-center gap-2">
          <a-tooltip title="复制">
            <CopyOutlined class="text-slate-400 hover:text-white cursor-pointer transition-colors p-1" @click="copySql" />
          </a-tooltip>
        </div>
      </div>
      <pre class="text-[#e2e8f0] font-mono text-[13px] leading-relaxed overflow-x-auto custom-scrollbar m-0 p-4 max-h-[400px]"><code>{{ sqlContent }}</code></pre>
    </div>

    <!-- 内联展开的详情面板 -->
    <div 
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isDetailExpanded ? `max-h-[1000px] opacity-100 mt-3 pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-[#f0f0f0]'}` : 'max-h-0 opacity-0'"
    >
      <a-tabs v-model:activeKey="activeDetailTab" :animated="false" size="small" :class="{ 'dark-tabs': isDarkMode }">
        <a-tab-pane key="fields" tab="字段详情">
          <!-- 工具栏 -->
          <div class="flex justify-between items-center mb-3 mt-1">
            <a-input-search
              v-model:value="searchKeyword"
              placeholder="搜索字段"
              class="w-[200px]"
              allow-clear
              size="small"
              :class="{ 'dark-input': isDarkMode }"
            />
          </div>

          <!-- 字段表格 -->
          <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="fieldColumns" 
              :data-source="filteredFields" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
              :scroll="{ y: 300 }"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'ordinalPosition'">
                  <span class="text-[13px] font-mono" :class="isDarkMode ? 'text-slate-500' : 'text-gray-500'">{{ index + 1 }}</span>
                </template>
                <template v-else-if="column.key === 'name'">
                  <div class="flex items-center gap-1.5">
                    <KeyOutlined v-if="record.isPk" style="color: #f59e0b; font-size: 14px;" title="主键" />
                    <span class="font-mono text-[13px]" :class="record.isPk ? (isDarkMode ? 'font-semibold text-slate-200' : 'font-semibold text-gray-900') : (isDarkMode ? 'text-slate-300 font-medium' : 'text-[#334155] font-medium')">{{ record.name }}</span>
                    <span v-if="record.isPartition" class="px-1 py-0.5 text-[10px] rounded ml-1 transition-colors duration-300"
                          :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-[#f0f0f0] text-[#999]'">分区</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'dataType'">
                  <span class="text-[12px] px-1.5 py-0.5 rounded font-mono font-medium"
                        :class="isDarkMode ? 'bg-slate-700 border border-slate-600 text-[#38bdf8]' : 'bg-[#f1f5f9] border border-[#e2e8f0] text-[#0ea5e9]'">
                    {{ record.type }}
                  </span>
                </template>
                <template v-else-if="column.key === 'description'">
                  <span class="text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-600'">{{ record.desc || '-' }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="preview" tab="数据预览">
          <!-- 工具栏 -->
          <div class="flex justify-between items-center mb-3 mt-1">
            <div class="flex items-center gap-2 bg-[#f1f5f9] p-1 rounded-md" :class="{ 'bg-slate-800': isDarkMode }">
              <div 
                class="px-3 py-1 text-[12px] font-medium rounded cursor-pointer transition-colors"
                :class="previewMode === 'preview' ? (isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-[#1677ff] shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#64748b] hover:text-[#334155]')"
                @click="previewMode = 'preview'"
              >
                数据预览
              </div>
              <div 
                class="px-3 py-1 text-[12px] font-medium rounded cursor-pointer transition-colors"
                :class="previewMode === 'profile' ? (isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-[#1677ff] shadow-sm') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-[#64748b] hover:text-[#334155]')"
                @click="previewMode = 'profile'"
              >
                数据探查
              </div>
            </div>
            
            <a-button v-if="previewMode === 'preview'" size="small" type="primary" ghost class="text-[12px] flex items-center gap-1" :class="isDarkMode ? 'border-slate-600 text-slate-300 hover:text-white hover:border-slate-500' : ''">
              <template #icon><ReloadOutlined /></template>
              重新抽样
            </a-button>
            <a-button v-if="previewMode === 'profile'" size="small" type="primary" class="text-[12px] flex items-center gap-1 bg-[rgba(108,76,155,1)] border-none hover:bg-[rgba(108,76,155,0.9)]">
              <template #icon><PlusOutlined /></template>
              新建探查任务
            </a-button>
          </div>

          <!-- 数据预览表格 -->
          <div v-if="previewMode === 'preview'" class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="previewColumns" 
              :data-source="previewRows" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
              :scroll="{ x: 'max-content', y: 300 }"
            >
              <template #bodyCell="{ column, text }">
                <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-300' : 'text-[#475569]'">{{ text }}</span>
              </template>
            </a-table>
          </div>

          <!-- 数据探查视图 -->
          <div v-if="previewMode === 'profile'" class="flex flex-col gap-3">
            <div class="flex items-center gap-4">
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">总行数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">100,000</span>
              </div>
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">主键去重记录数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">98,520</span>
              </div>
              <div class="flex-1 border rounded-lg p-3 flex flex-col gap-1" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
                <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">重复记录数</span>
                <span class="font-mono text-[18px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">1,480</span>
              </div>
            </div>
            <div class="text-center py-8 border rounded-lg" :class="isDarkMode ? 'bg-slate-800/30 border-slate-700 text-slate-500' : 'bg-[#fafafa] border-[#eee] text-[#999]'">
              <p class="text-[13px] mb-2">更多字段级探查详情</p>
              <a-button size="small" type="link" class="text-[rgba(108,76,155,1)]">点击跳转至完整详情页查看</a-button>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="production" tab="生产信息">
          <!-- 概览信息条 -->
          <div class="flex flex-wrap gap-4 p-4 rounded-lg border mb-4 mt-2" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#f8fafc] border-[#e2e8f0]'">
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">任务名称</span>
              <span class="font-mono text-[13px] font-medium truncate" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">dws_user_behavior_log_di</span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">调度周期</span>
              <span class="font-mono text-[13px] font-medium flex items-center gap-1" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">
                <ClockCircleOutlined class="text-[#1677ff]" /> 每日 02:00
              </span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">所属时区</span>
              <span class="text-[13px] font-medium">
                <span class="px-2 py-0.5 rounded text-[12px] bg-[#e6f4ff] text-[#1677ff]">中国时间</span>
              </span>
            </div>
            <div class="flex-1 min-w-[120px] flex flex-col gap-1">
              <span class="text-[12px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'">最近产出时间</span>
              <span class="font-mono text-[13px] font-medium" :class="isDarkMode ? 'text-slate-300' : 'text-[#1e293b]'">2026-03-30 02:15:30</span>
            </div>
          </div>

          <!-- 执行记录 -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1 h-3.5 bg-[#1677ff] rounded-sm"></div>
            <span class="text-[14px] font-semibold" :class="isDarkMode ? 'text-slate-200' : 'text-[#1e293b]'">执行记录</span>
          </div>
          
          <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-slate-700' : 'border-[#e2e8f0]'">
            <a-table 
              :columns="execColumns" 
              :data-source="execRows" 
              :pagination="false"
              size="small"
              class="field-table"
              :class="{ 'dark-table': isDarkMode }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                  <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record.id }}</span>
                </template>
                <template v-else-if="column.key === 'status'">
                  <span class="px-2 py-0.5 rounded text-[12px]"
                        :class="record.status === 'SUCCESS' ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600') : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')">
                    {{ record.status === 'SUCCESS' ? '成功' : '失败' }}
                  </span>
                </template>
                <template v-else-if="column.key === 'startTime' || column.key === 'endTime'">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record[column.key] }}</span>
                    <span class="text-[11px] px-1 rounded" :class="isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-400'">中国时间</span>
                  </div>
                </template>
                <template v-else-if="column.key === 'duration'">
                  <span class="font-mono text-[13px]" :class="isDarkMode ? 'text-slate-400' : 'text-gray-500'">{{ record.duration }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane key="lineage" tab="血缘关系">
          <div class="h-[400px] mt-2 rounded-lg border relative overflow-hidden" :class="isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-[#e2e8f0] bg-[#fafafa]'">
            <!-- 占位提示，实际应渲染 G6 画布 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mb-3" :class="isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm'">
                <NodeIndexOutlined class="text-2xl" :class="isDarkMode ? 'text-slate-400' : 'text-[#1677ff]'" />
              </div>
              <span class="text-[13px]" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">表级血缘图谱渲染区</span>
              <span class="text-[12px] mt-1" :class="isDarkMode ? 'text-slate-600' : 'text-[#94a3b8]'">支持缩放、拖拽、节点展开/收起</span>
            </div>
            
            <!-- 操作提示 -->
            <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border shadow-sm backdrop-blur-sm"
                 :class="isDarkMode ? 'bg-slate-800/90 border-slate-600 text-slate-300' : 'bg-white/90 border-[#e2e8f0] text-[#64748b]'">
              <InfoCircleOutlined />
              <span>点击节点左右两侧 <b>+/-</b> 展开/收起血缘</span>
            </div>

            <!-- 图例与缩放 -->
            <div class="absolute top-3 right-3 z-10 flex gap-2">
              <div class="flex gap-2.5 px-3 py-1.5 rounded-md text-[12px] border shadow-sm backdrop-blur-sm"
                   :class="isDarkMode ? 'bg-slate-800/90 border-slate-600 text-slate-300' : 'bg-white/90 border-[#e2e8f0] text-[#64748b]'">
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[#1677ff]"></div>Hive</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[#f59e0b]"></div>MySQL</div>
              </div>
              <div class="flex rounded-md border shadow-sm backdrop-blur-sm overflow-hidden"
                   :class="isDarkMode ? 'bg-slate-800/90 border-slate-600 text-slate-400' : 'bg-white/90 border-[#e2e8f0] text-[#64748b]'">
                <div class="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors" :class="isDarkMode ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-[#f1f5f9] hover:text-[#1677ff]'"><ZoomInOutlined /></div>
                <div class="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors border-l border-r" :class="isDarkMode ? 'border-slate-600 hover:bg-slate-700 hover:text-white' : 'border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#1677ff]'"><ZoomOutOutlined /></div>
                <div class="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors" :class="isDarkMode ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-[#f1f5f9] hover:text-[#1677ff]'"><ExpandOutlined /></div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    
    <!-- 追问建议 -->
    <div v-if="data.suggestions && data.suggestions.length" class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t transition-colors duration-300"
         :class="isDarkMode ? 'border-slate-700' : 'border-[#f0f0f0]'">
      <span class="text-[13px] transition-colors duration-300 mr-1" :class="isDarkMode ? 'text-slate-500' : 'text-[#64748b]'">您可以继续问：</span>
      <div 
        v-for="sug in data.suggestions" 
        :key="sug"
        class="px-3 py-1.5 rounded-full text-[13px] cursor-pointer transition-all duration-300 flex items-center"
        :class="isDarkMode 
          ? 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.1)] border border-[rgba(108,76,155,0.2)] hover:bg-[rgba(108,76,155,0.2)] hover:border-[rgba(108,76,155,0.4)]' 
          : 'text-[rgba(108,76,155,1)] bg-[rgba(108,76,155,0.04)] border border-[rgba(108,76,155,0.15)] hover:bg-[rgba(108,76,155,0.08)] hover:border-[rgba(108,76,155,0.3)]'"
        @click="$emit('send', sug)"
      >
        {{ sug }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  CopyOutlined, StarOutlined, StarFilled, FireFilled, EyeOutlined,
  FullscreenOutlined, FullscreenExitOutlined, CodeOutlined, ConsoleSqlOutlined,
  KeyOutlined, ReloadOutlined, PlusOutlined, ClockCircleOutlined,
  NodeIndexOutlined, InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined, ExpandOutlined
} from '@ant-design/icons-vue'
import SourceTag from '@/pages/DataMap/components/SourceTag.vue'

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

const emit = defineEmits(['send'])

// 交互状态
const isDetailExpanded = ref(false)
const activeSqlType = ref('')
const activeDetailTab = ref('fields')
const isFavorited = ref(false)
const previewMode = ref('preview') // preview or profile

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  if (isFavorited.value) {
    message.success('已加入收藏')
  } else {
    message.success('已取消收藏')
  }
}

// SQL 数据
const sqlData = {
  ddl: `CREATE TABLE default.user_behavior_log (
  user_id STRING COMMENT '全局唯一用户标识',
  event_type STRING COMMENT '事件类型 (click, view, add_cart)',
  page_id STRING COMMENT '发生事件的页面ID',
  device_os STRING COMMENT '设备操作系统 (iOS, Android)'
)
COMMENT '用户行为日志表'
PARTITIONED BY (dt STRING COMMENT '日期分区 (yyyyMMdd)')
STORED AS PARQUET;`,
  select: `SELECT 
  user_id,
  event_type,
  page_id,
  device_os,
  dt
FROM default.user_behavior_log
WHERE dt = '\${bizdate}'
LIMIT 100;`
}

const sqlContent = computed(() => activeSqlType.value ? sqlData[activeSqlType.value] : '')

const toggleSql = (type) => {
  if (activeSqlType.value === type) {
    activeSqlType.value = ''
  } else {
    activeSqlType.value = type
  }
}

const copySql = () => {
  navigator.clipboard.writeText(sqlContent.value).then(() => {
    message.success('SQL 已复制')
  })
}

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success('已复制表名')
  })
}

const searchKeyword = ref('')

const filteredFields = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return mockFields
  return mockFields.filter(
    (c) => c.name?.toLowerCase().includes(kw) || c.desc?.toLowerCase().includes(kw)
  )
})

// 模拟字段数据
const fieldColumns = [
  { title: '序号', key: 'ordinalPosition', width: 60, align: 'center' },
  { title: '字段名', key: 'name', width: 160 },
  { title: '类型', key: 'dataType', width: 110 },
  { title: '描述', key: 'description', ellipsis: true },
]

const baseFields = [
  { key: '1', name: 'user_id', type: 'string', desc: '全局唯一用户标识', isPk: true },
  { key: '2', name: 'event_type', type: 'string', desc: '事件类型 (click, view, add_cart)' },
  { key: '3', name: 'page_id', type: 'string', desc: '发生事件的页面ID' },
  { key: '4', name: 'device_os', type: 'string', desc: '设备操作系统 (iOS, Android)' },
  { key: '5', name: 'device_model', type: 'string', desc: '设备型号' },
  { key: '6', name: 'ip_address', type: 'string', desc: '客户端 IP 地址' },
  { key: '7', name: 'session_id', type: 'string', desc: '会话 ID' },
  { key: '8', name: 'app_version', type: 'string', desc: 'App 版本号' },
]

// 模拟生成 90 个扩展字段，模拟真实业务中的大宽表
const generatedFields = Array.from({ length: 91 }, (_, i) => ({
  key: String(i + 9),
  name: `ext_attribute_${i + 1}`,
  type: i % 3 === 0 ? 'bigint' : (i % 5 === 0 ? 'double' : 'string'),
  desc: `扩展业务属性字段 ${i + 1}，用于记录额外维度的上下文信息`,
}))

const mockFields = [
  ...baseFields,
  ...generatedFields,
  { key: '100', name: 'dt', type: 'string', desc: '日期分区 (yyyyMMdd)', isPartition: true },
]

// 模拟数据预览数据
const previewColumns = computed(() => {
  const cols = baseFields.map((col) => ({
    title: col.name,
    dataIndex: col.name,
    key: col.name,
    width: 140,
    ellipsis: true,
  }))
  
  cols.unshift({
    title: '序号',
    dataIndex: '_idx',
    key: '_idx',
    width: 70,
    align: 'center',
    customRender: ({ text }) => text + 1
  })
  
  return cols
})

const previewRows = Array.from({ length: 20 }, (_, idx) => ({
  _idx: idx,
  user_id: `U${10000 + Math.floor(Math.random() * 90000)}`,
  event_type: ['click', 'view', 'add_cart', 'purchase'][Math.floor(Math.random() * 4)],
  page_id: `page_${Math.floor(Math.random() * 20)}`,
  device_os: ['iOS', 'Android', 'Web'][Math.floor(Math.random() * 3)],
  device_model: ['iPhone 14', 'Xiaomi 13', 'Huawei P60', 'MacBook'][Math.floor(Math.random() * 4)],
  ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  session_id: `sess_${Date.now().toString().slice(-6)}_${idx}`,
  app_version: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.0`
}))

// 模拟生产信息数据
const execColumns = [
  { title: '实例ID', dataIndex: 'id', key: 'id', width: 90 },
  { title: '实例名称', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
  { title: '状态', key: 'status', width: 90 },
  { title: '开始时间', key: 'startTime', width: 190 },
  { title: '结束时间', key: 'endTime', width: 190 },
  { title: '耗时', key: 'duration', width: 80 },
]

const execRows = [
  { id: '100456', taskName: 'dws_user_behavior_log_di_20260330', status: 'SUCCESS', startTime: '2026-03-30 02:00:00', endTime: '2026-03-30 02:15:30', duration: '15分30秒' },
  { id: '100455', taskName: 'dws_user_behavior_log_di_20260329', status: 'SUCCESS', startTime: '2026-03-29 02:00:00', endTime: '2026-03-29 02:14:20', duration: '14分20秒' },
  { id: '100454', taskName: 'dws_user_behavior_log_di_20260328', status: 'SUCCESS', startTime: '2026-03-28 02:00:00', endTime: '2026-03-28 02:16:10', duration: '16分10秒' },
  { id: '100453', taskName: 'dws_user_behavior_log_di_20260327', status: 'FAILED', startTime: '2026-03-27 02:00:00', endTime: '2026-03-27 02:05:00', duration: '5分0秒' },
  { id: '100452', taskName: 'dws_user_behavior_log_di_20260326', status: 'SUCCESS', startTime: '2026-03-26 02:00:00', endTime: '2026-03-26 02:15:45', duration: '15分45秒' },
]
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 覆盖 Ant Design Table 样式以匹配设计 */
.field-table :deep(.ant-table-cell) {
  font-size: 13px;
  padding: 10px 16px !important;
}

.field-table :deep(.ant-table-thead > tr > th) {
  background-color: #f8fafc !important;
  color: #475569;
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-table :deep(.ant-table-thead > tr > th) {
  background-color: #1e293b !important;
  color: #94a3b8;
  border-bottom: 1px solid #334155;
}

.dark-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #334155;
}

.dark-table :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background-color: #334155 !important;
}

/* 搜索框暗黑模式 */
.dark-input :deep(.ant-input) {
  background-color: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}
.dark-input :deep(.ant-input-group-addon) {
  background-color: #1e293b;
  border-color: #334155;
}
.dark-input :deep(.ant-input-search-button) {
  background-color: #334155;
  border-color: #334155;
  color: #94a3b8;
}
.dark-input :deep(.ant-input-affix-wrapper) {
  background-color: #1e293b;
  border-color: #334155;
}
.dark-input :deep(.ant-input-affix-wrapper > input.ant-input) {
  background-color: transparent;
}
</style>
