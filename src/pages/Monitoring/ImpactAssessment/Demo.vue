<template>
  <div class="impact-assessment-demo">
    <!-- 头部告警摘要与操作区 -->
    <div class="header-section">
      <div class="alert-info">
        <h2 class="title">
          <a-tag color="error" class="status-badge">异常</a-tag>
          dwd_user_trade_di 字段空值率超标
        </h2>
        <p class="meta">
          告警时间: 2026-03-19 14:30:00 | 负责人: 王小明 | 告警等级: P1
        </p>
      </div>
      <div class="action-bar">
        <a-button type="primary" @click="handleCreateGroup">
          <template #icon><MessageOutlined /></template>
          一键拉群
        </a-button>
        <a-button danger @click="handleBlockDownstream" style="margin-left: 8px">
          <template #icon><PauseCircleOutlined /></template>
          阻断下游
        </a-button>
        <a-button type="primary" ghost @click="handleCascadeRerun" style="margin-left: 8px; background-color: #52c41a; border-color: #52c41a; color: white;">
          <template #icon><ReloadOutlined /></template>
          级联重跑
        </a-button>
      </div>
    </div>

    <!-- 影响评估核心区域 -->
    <div class="assessment-content">
      <!-- 拓扑图控制栏 -->
      <div class="toolbar">
        <div class="left-controls">
          <span class="label">向下评估深度：</span>
          <a-select v-model:value="depth" style="width: 120px" size="small">
            <a-select-option value="1">1 层</a-select-option>
            <a-select-option value="2">2 层</a-select-option>
            <a-select-option value="3">3 层</a-select-option>
            <a-select-option value="all">全部展开</a-select-option>
          </a-select>
          
          <a-divider type="vertical" />
          
          <a-switch
            v-model:checked="onlyCoreAssets"
            checked-children="仅看 P0/P1 核心资产"
            un-checked-children="全部资产"
            size="small"
          />
        </div>
        <div class="right-stats">
          预计影响：<span class="highlight">12</span> 个任务, <span class="highlight">3</span> 个核心报表
        </div>
      </div>

      <!-- 模拟可视化拓扑图 -->
      <div class="topology-graph">
        <!-- 上游 (疑似根因) -->
        <div class="graph-column">
          <div class="column-title">上游依赖 (疑似根因)</div>
          <div class="node-card root-cause">
            <div class="node-type">数据集成</div>
            <div class="node-name">mysql_to_ods_user_trade</div>
            <div class="node-status">延迟 45 分钟</div>
            <div class="node-owner">负责人: 李四</div>
          </div>
        </div>

        <div class="graph-arrow">➔</div>

        <!-- 当前告警节点 -->
        <div class="graph-column">
          <div class="column-title">当前告警节点</div>
          <div class="node-card current-alert">
            <div class="node-type">质量监控</div>
            <div class="node-name">dwd_user_trade_di</div>
            <div class="node-status">字段 amount 空值率 > 5%</div>
            <div class="node-owner">负责人: 王小明</div>
          </div>
        </div>

        <div class="graph-arrow">➔</div>

        <!-- 下游影响 (第1层) -->
        <div class="graph-column">
          <div class="column-title">下游影响 (层级 1)</div>
          <div class="node-card affected">
            <div class="node-type">数据开发</div>
            <div class="node-name">dws_user_trade_summary_di</div>
            <div class="node-status">等待执行</div>
            <div class="node-owner">负责人: 张三</div>
          </div>
          <div class="node-card affected" v-if="!onlyCoreAssets">
            <div class="node-type">临时表</div>
            <div class="node-name">tmp_trade_mid_01</div>
            <div class="node-status">等待执行</div>
            <div class="node-owner">负责人: 王小明</div>
          </div>
        </div>

        <div class="graph-arrow" v-if="depth === '2' || depth === '3' || depth === 'all'">➔</div>

        <!-- 下游影响 (第2层 - 核心资产) -->
        <div class="graph-column" v-if="depth === '2' || depth === '3' || depth === 'all'">
          <div class="column-title">下游影响 (层级 2)</div>
          <div class="node-card core-asset">
            <div class="node-badge">P0</div>
            <div class="node-type">BI 报表</div>
            <div class="node-name">CEO 核心经营看板</div>
            <div class="node-status">数据可能不准</div>
            <div class="node-owner">负责人: 赵六</div>
          </div>
          <div class="node-card affected" v-if="!onlyCoreAssets">
            <div class="node-type">数据接口</div>
            <div class="node-name">API_Get_User_Trade</div>
            <div class="node-status">正常运行中</div>
            <div class="node-owner">负责人: 钱七</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 影响清单列表 -->
    <div class="impact-list-section">
      <h3 class="section-title">受影响资产清单</h3>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="tasks" tab="数据任务 (12)">
          <a-table :dataSource="mockTasks" :columns="columns" size="small" bordered :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'level'">
                <a-tag :color="record.level === 'P0' ? 'error' : (record.level === 'P1' ? 'warning' : 'default')">
                  {{ record.level }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="tables" tab="数据表 (8)">数据表列表...</a-tab-pane>
        <a-tab-pane key="reports" tab="BI 报表 (3)">BI 报表列表...</a-tab-pane>
        <a-tab-pane key="apis" tab="数据 API (2)">数据 API 列表...</a-tab-pane>
        <a-tab-pane key="users" tab="涉及人员 (5)">涉及人员列表 (用于拉群)...</a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { MessageOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons-vue'

const depth = ref('2')
const onlyCoreAssets = ref(true)
const activeTab = ref('tasks')

const columns = [
  { title: '任务名称', dataIndex: 'name', width: 220 },
  { title: '任务类型', dataIndex: 'type', width: 120 },
  { title: '重要等级', dataIndex: 'level', width: 100 },
  { title: '负责人', dataIndex: 'owner', width: 120 },
  { title: '当前状态', dataIndex: 'status' },
]

const mockTasks = ref([
  { key: '1', name: 'dws_user_trade_summary_di', type: 'Spark SQL', level: 'P1', owner: '张三', status: '等待上游' },
  { key: '2', name: 'ads_ceo_dashboard_daily', type: '数据同步', level: 'P0', owner: '赵六', status: '等待上游' },
  { key: '3', name: 'tmp_trade_mid_01', type: 'Hive SQL', level: 'P3', owner: '王小明', status: '等待上游' },
])

const handleCreateGroup = () => {
  Modal.confirm({
    title: '一键拉群',
    content: '系统已盘点出受影响的 5 位负责人，是否立即创建【故障应急响应群】？',
    okText: '创建群聊',
    cancelText: '取消',
    onOk() {
      message.success('群聊创建成功！已发送影响评估报告至群内。')
    },
  })
}

const handleBlockDownstream = () => {
  Modal.confirm({
    title: '阻断下游',
    content: '将挂起当前节点下游的 12 个直接和间接依赖任务，防止脏数据产出。确定阻断吗？',
    okText: '确认阻断',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      message.warning('已成功下发阻断指令，下游任务已挂起。')
    },
  })
}

const handleCascadeRerun = () => {
  Modal.confirm({
    title: '级联重跑',
    content: '根因问题已修复？将从当前节点开始，级联重跑下游所有受影响的 12 个任务。',
    okText: '确认重跑',
    cancelText: '取消',
    onOk() {
      message.success('级联重跑指令已提交，请在运维中心查看进度。')
    },
  })
}
</script>

<style scoped>
.impact-assessment-demo {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.alert-info .title {
  margin: 0 0 8px 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 4px;
}

.alert-info .meta {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.assessment-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.left-controls .label {
  font-size: 14px;
  color: #606266;
}

.right-stats {
  font-size: 14px;
  color: #606266;
}
.right-stats .highlight {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.topology-graph {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  overflow-x: auto;
}

.graph-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 220px;
}

.column-title {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #909399;
  margin-bottom: 8px;
}

.graph-arrow {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: #c0c4cc;
}

.node-card {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 16px;
  background: #fff;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.node-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.node-card.root-cause { border-left: 4px solid #f56c6c; }
.node-card.current-alert { border: 2px solid #f56c6c; background: #fef0f0; }
.node-card.affected { border-left: 4px solid #faad14; }
.node-card.core-asset { border-left: 4px solid #52c41a; background: #f6ffed; }

.node-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  z-index: 10;
}

.node-type {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.node-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  word-break: break-all;
}

.node-status, .node-owner {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.impact-list-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}
</style>
