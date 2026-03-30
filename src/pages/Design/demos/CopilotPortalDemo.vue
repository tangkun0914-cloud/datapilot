<template>
  <div class="copilot-portal-demo" style="display: flex; flex-direction: column; background-color: #0B0E14; color: white; height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; z-index: 9999; font-family: sans-serif; overflow: hidden;">
    <!-- Top Navigation Bar -->
    <header style="height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.1); background-color: rgba(11,14,20,0.8); backdrop-filter: blur(12px); z-index: 10;">
      <div style="display: flex; align-items: center; gap: 32px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; letter-spacing: 0.025em;">
          <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(to top right, #6366f1, #a855f7);">
            <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
          </div>
          DataPilot <span style="font-weight: 400; font-size: 14px; margin-left: 4px; color: #9ca3af;">数智工场</span>
        </div>
        <nav style="display: flex; align-items: center; gap: 24px; font-size: 14px; color: #d1d5db;">
          <a href="#" style="color: inherit; text-decoration: none;">数据集成</a>
          <a href="#" style="color: inherit; text-decoration: none;">数据开发</a>
          <a href="#" style="color: inherit; text-decoration: none;">数据质量</a>
          <a href="#" style="color: #818cf8; font-weight: 500; border-bottom: 2px solid #6366f1; padding-bottom: 16px; padding-top: 16px; text-decoration: none;">数据地图 (Copilot)</a>
          <a href="#" style="color: inherit; text-decoration: none;">监控运维</a>
        </nav>
      </div>
      <div style="display: flex; align-items: center; gap: 16px; font-size: 14px; color: #d1d5db;">
        <div style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
          <span>国内</span>
          <DownOutlined style="font-size: 10px;" />
        </div>
        <div style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
          <span>标准版集群</span>
          <DownOutlined style="font-size: 10px;" />
        </div>
        <QuestionCircleOutlined style="font-size: 18px; cursor: pointer;" />
        <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; cursor: pointer; background-color: #4f46e5;">
          王
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div style="flex: 1; display: flex; overflow: hidden;">
      <!-- Left Sidebar: Personal Workspace -->
      <aside style="width: 256px; border-right: 1px solid rgba(255,255,255,0.1); background-color: #0F131A; display: flex; flex-direction: column;">
        <div style="padding: 16px;">
          <button style="width: 100%; padding: 8px 16px; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; background-color: #4f46e5; border: none; cursor: pointer;">
            <PlusOutlined /> 新的探索
          </button>
        </div>
        
        <div class="custom-scrollbar" style="flex: 1; overflow-y: auto; padding: 0 12px 16px 12px;">
          <!-- Recent Sessions -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 500; padding: 0 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">今天</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.05); background-color: rgba(255,255,255,0.05); color: #e5e7eb;">
                <MessageOutlined style="color: #818cf8;" />
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">华东区上月销售明细</span>
              </div>
              <div class="hover-bg-white-5" style="padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #9ca3af;">
                <MessageOutlined />
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">用户留存数据表在哪</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 500; padding: 0 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">昨天</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div class="hover-bg-white-5" style="padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #9ca3af;">
                <MessageOutlined />
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">营收报表字段含义</span>
              </div>
            </div>
          </div>

          <!-- My Favorites -->
          <div>
            <div style="font-size: 12px; font-weight: 500; padding: 0 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">我的收藏</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div class="hover-bg-white-5" style="padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #9ca3af;">
                <StarOutlined style="color: #eab308;" />
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">dwd_trade_order_detail</span>
              </div>
              <div class="hover-bg-white-5" style="padding: 8px 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #9ca3af;">
                <StarOutlined style="color: #eab308;" />
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">ads_user_retention_day</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- User Profile Bottom -->
        <div class="hover-bg-white-5" style="padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; background-color: #4f46e5;">王</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #e5e7eb;">王蕊</div>
            <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #6b7280;">数据产品经理</div>
          </div>
          <SettingOutlined style="color: #9ca3af;" />
        </div>
      </aside>

      <!-- Center Content: Copilot Area -->
      <main class="bg-grid-pattern" style="flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <!-- Background Grid Overlay -->
        <div style="position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(11,14,20,0.5), transparent, #0B0E14);"></div>

        <!-- Center Welcome Content -->
        <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 768px; padding: 0 24px; margin-top: -80px;">
          <!-- Glowing Logo -->
          <div style="position: relative; margin-bottom: 32px;">
            <div style="position: absolute; inset: 0; filter: blur(40px); opacity: 0.3; border-radius: 50%; background-color: #6366f1;"></div>
            <div style="width: 80px; height: 80px; border-radius: 16px; border: 1px solid rgba(99,102,241,0.3); display: flex; align-items: center; justify-content: center; position: relative; z-index: 10; background: linear-gradient(to bottom right, rgba(99,102,241,0.2), rgba(147,51,234,0.2)); backdrop-filter: blur(24px); box-shadow: 0 0 30px rgba(99,102,241,0.2);">
              <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); background: linear-gradient(to top right, #818cf8, #c084fc);">
                <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
              </div>
            </div>
          </div>

          <h1 style="font-size: 30px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.025em; color: transparent; background-clip: text; -webkit-background-clip: text; background-image: linear-gradient(to right, white, #9ca3af);">
            今天想了解什么数据？
          </h1>
          <p style="font-size: 14px; margin-bottom: 40px; color: #9ca3af;">
            DataPilot Copilot 随时为您提供智能数据检索、血缘分析与资产洞察
          </p>

          <!-- Large Input Box -->
          <div class="input-container" style="width: 100%; position: relative;">
            <div class="input-glow" style="position: absolute; top: -2px; right: -2px; bottom: -2px; left: -2px; border-radius: 16px; filter: blur(8px); opacity: 0.2; transition: opacity 0.5s; background: linear-gradient(to right, #6366f1, #a855f7);"></div>
            <div style="position: relative; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; background-color: #151923; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
              <textarea 
                rows="3"
                placeholder="例如：帮我找一下上个月华东区的销售明细数据在哪张表？"
                style="width: 100%; background: transparent; color: white; padding: 16px 20px; outline: none; resize: none; font-size: 16px; border: none; font-family: inherit;"
              ></textarea>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.05); background-color: rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <a-tooltip title="选择数据域">
                    <button class="hover-text-indigo" style="display: flex; align-items: center; gap: 4px; font-size: 14px; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer; transition: color 0.2s; color: #9ca3af; background-color: rgba(255,255,255,0.05);">
                      <DatabaseOutlined /> 全局域 <DownOutlined style="font-size: 10px;" />
                    </button>
                  </a-tooltip>
                  <a-tooltip title="上传文件或图片">
                    <button class="hover-text-white" style="border: none; background: transparent; cursor: pointer; transition: color 0.2s; color: #9ca3af;">
                      <PaperClipOutlined style="font-size: 18px;" />
                    </button>
                  </a-tooltip>
                </div>
                <button style="width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; border: none; cursor: pointer; transition: background-color 0.2s; background-color: #4f46e5; box-shadow: 0 10px 15px -3px rgba(99,102,241,0.2);">
                  <SendOutlined />
                </button>
              </div>
            </div>
          </div>

          <!-- Suggestion Chips -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin-top: 32px;">
            <div class="hover-bg-white-10" style="padding: 8px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); font-size: 14px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 8px; background-color: rgba(255,255,255,0.05); color: #d1d5db;">
              <SearchOutlined style="color: #818cf8;" />
              查看用户留存相关数据表
            </div>
            <div class="hover-bg-white-10" style="padding: 8px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); font-size: 14px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 8px; background-color: rgba(255,255,255,0.05); color: #d1d5db;">
              <LineChartOutlined style="color: #c084fc;" />
              生成近7天交易大盘趋势
            </div>
            <div class="hover-bg-white-10" style="padding: 8px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); font-size: 14px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; gap: 8px; background-color: rgba(255,255,255,0.05); color: #d1d5db;">
              <NodeIndexOutlined style="color: #60a5fa;" />
              分析 dwd_trade_order 的血缘
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { 
  DownOutlined, 
  QuestionCircleOutlined, 
  PlusOutlined, 
  MessageOutlined, 
  StarOutlined, 
  SettingOutlined,
  PaperClipOutlined,
  SendOutlined,
  SearchOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
</script>

<style scoped>
.copilot-portal-demo {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hover-bg-white-5:hover {
  background-color: rgba(255,255,255,0.05) !important;
}

.hover-bg-white-10:hover {
  background-color: rgba(255,255,255,0.1) !important;
}

.hover-text-white:hover {
  color: white !important;
}

.hover-text-indigo:hover {
  color: #818cf8 !important;
}

.input-container:hover .input-glow {
  opacity: 0.4;
}

textarea::placeholder {
  color: #6b7280;
}
</style>
