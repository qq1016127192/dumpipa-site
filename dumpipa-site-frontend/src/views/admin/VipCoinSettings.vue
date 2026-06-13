<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>会员金币系统配置</h2>
      <button class="btn-primary" @click="saveSettings">
        <span>💾 保存配置</span>
      </button>
    </div>

    <div class="settings-content">
      <!-- 全站免费模式 -->
      <div class="settings-section">
        <h3>🌐 全站模式</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>全站免费模式</label>
            <div class="switch-group">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="siteFreeMode"
                />
                <span class="slider"></span>
              </label>
              <span class="status">{{ siteFreeMode ? '免费' : '收费' }}</span>
            </div>
            <p class="hint">开启后，所有用户（包括普通用户和会员）可免费使用全部功能，无需消耗金币</p>
          </div>
        </div>
      </div>

      <!-- 金币消耗配置 -->
      <div class="settings-section">
        <h3>💰 金币消耗配置</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>普通用户下载消耗金币</label>
            <div class="input-group">
              <input 
                v-model.number="config.coin_download_cost" 
                type="number" 
                step="0.01"
                min="0"
              />
              <span class="unit">金币/次</span>
            </div>
            <p class="hint">用户下载 IPA 时扣除的金币数</p>
          </div>

          <div class="setting-item">
            <label>普通用户砸壳消耗金币</label>
            <div class="input-group">
              <input 
                v-model.number="config.coin_dump_cost" 
                type="number" 
                step="0.01"
                min="0"
              />
              <span class="unit">金币/次</span>
            </div>
            <p class="hint">用户砸壳时扣除的金币数</p>
          </div>
        </div>
      </div>

      <!-- 普通用户免费次数 -->
      <div class="settings-section">
        <h3>🆓 普通用户免费次数</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>每日免费下载次数</label>
            <div class="input-group">
              <input 
                v-model.number="config.free_download_daily" 
                type="number" 
                min="0"
              />
              <span class="unit">次/天</span>
            </div>
            <p class="hint">普通用户每天免费下载的次数，超过后需要消耗金币</p>
          </div>

          <div class="setting-item">
            <label>每日免费砸壳次数</label>
            <div class="input-group">
              <input 
                v-model.number="config.free_dump_daily" 
                type="number" 
                min="0"
              />
              <span class="unit">次/天</span>
            </div>
            <p class="hint">普通用户每天免费砸壳的次数，超过后需要消耗金币</p>
          </div>
        </div>
      </div>

      <!-- 会员免费配置 -->
      <div class="settings-section">
        <h3>👑 会员免费配置</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>会员下载是否免费</label>
            <div class="switch-group">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="vipDownloadFree"
                />
                <span class="slider"></span>
              </label>
              <span class="status">{{ vipDownloadFree ? '免费' : '收费' }}</span>
            </div>
            <p class="hint">启用后，会员下载不消耗金币</p>
          </div>

          <div class="setting-item">
            <label>会员砸壳是否免费</label>
            <div class="switch-group">
              <label class="switch">
                <input 
                  type="checkbox" 
                  v-model="vipDumpFree"
                />
                <span class="slider"></span>
              </label>
              <span class="status">{{ vipDumpFree ? '免费' : '收费' }}</span>
            </div>
            <p class="hint">启用后，会员砸壳不消耗金币</p>
          </div>
        </div>
      </div>

      <!-- 会员每日免费次数 -->
      <div class="settings-section">
        <h3>🎁 会员每日免费次数</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>会员每日免费下载次数</label>
            <div class="input-group">
              <input 
                v-model.number="config.vip_free_download_daily" 
                type="number" 
                min="0"
              />
              <span class="unit">次/天</span>
            </div>
            <p class="hint">会员每天免费下载的次数（如果下载收费）</p>
          </div>

          <div class="setting-item">
            <label>会员每日免费砸壳次数</label>
            <div class="input-group">
              <input 
                v-model.number="config.vip_free_dump_daily" 
                type="number" 
                min="0"
              />
              <span class="unit">次/天</span>
            </div>
            <p class="hint">会员每天免费砸壳的次数（如果砸壳收费）</p>
          </div>
        </div>
      </div>

      <!-- 应用大小范围金币配置 -->
      <div class="settings-section">
        <h3>📏 应用大小范围金币配置</h3>
        <div class="size-config-tabs">
          <el-tabs v-model="activeSizeConfigTab">
            <el-tab-pane label="下载配置" name="download">
              <div class="size-config-list">
                <div v-for="(cfg, index) in downloadSizeConfigs" :key="index" class="size-config-item">
                  <div class="size-config-inputs">
                    <div class="input-wrapper">
                      <label>最小大小</label>
                      <input v-model.number="cfg.min_size_mb" type="number" step="0.01" min="0" placeholder="MB" />
                    </div>
                    <span class="range-separator">-</span>
                    <div class="input-wrapper">
                      <label>最大大小</label>
                      <input 
                        v-model.number="cfg.max_size_mb" 
                        type="number" 
                        step="0.01" 
                        :min="cfg.min_size_mb"
                        placeholder="MB（留空表示无上限）"
                        @blur="handleMaxSizeBlur(cfg)"
                      />
                    </div>
                    <div class="input-wrapper">
                      <label>金币消耗</label>
                      <input v-model.number="cfg.coin_cost" type="number" step="0.01" min="0" placeholder="金币" />
                    </div>
                    <el-button type="danger" size="small" @click="removeSizeConfig('download', index)">删除</el-button>
                  </div>
                </div>
                <el-button type="primary" @click="addSizeConfig('download')" style="margin-top: 10px;">
                  + 添加范围
                </el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="砸壳配置" name="dump">
              <div class="size-config-list">
                <div v-for="(cfg, index) in dumpSizeConfigs" :key="index" class="size-config-item">
                  <div class="size-config-inputs">
                    <div class="input-wrapper">
                      <label>最小大小</label>
                      <input v-model.number="cfg.min_size_mb" type="number" step="0.01" min="0" placeholder="MB" />
                    </div>
                    <span class="range-separator">-</span>
                    <div class="input-wrapper">
                      <label>最大大小</label>
                      <input 
                        v-model.number="cfg.max_size_mb" 
                        type="number" 
                        step="0.01" 
                        :min="cfg.min_size_mb"
                        placeholder="MB（留空表示无上限）"
                        @blur="handleMaxSizeBlur(cfg)"
                      />
                    </div>
                    <div class="input-wrapper">
                      <label>金币消耗</label>
                      <input v-model.number="cfg.coin_cost" type="number" step="0.01" min="0" placeholder="金币" />
                    </div>
                    <el-button type="danger" size="small" @click="removeSizeConfig('dump', index)">删除</el-button>
                  </div>
                </div>
                <el-button type="primary" @click="addSizeConfig('dump')" style="margin-top: 10px;">
                  + 添加范围
                </el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <p class="hint" style="margin-top: 15px; color: #999;">
          配置说明：系统会根据应用大小（MB）自动匹配对应的金币消耗。如果应用大小不在任何范围内，将使用默认金币数。
        </p>
      </div>

      <!-- 其他配置 -->
      <div class="settings-section">
        <h3>⚙️ 其他配置</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>新用户注册默认金币</label>
            <div class="input-group">
              <input 
                v-model.number="config.default_user_coins" 
                type="number" 
                step="0.01"
                min="0"
              />
              <span class="unit">金币</span>
            </div>
            <p class="hint">新用户注册时赠送的金币数量</p>
          </div>
        </div>
      </div>

      <!-- 当前配置预览 -->
      <div class="settings-section preview-section">
        <h3>📊 当前配置预览</h3>
        <div class="preview-grid">
          <div class="preview-card">
            <h4>普通用户</h4>
            <ul>
              <li>每日免费下载：{{ config.free_download_daily }} 次</li>
              <li>每日免费砸壳：{{ config.free_dump_daily }} 次</li>
              <li>下载消耗：{{ config.coin_download_cost }} 金币/次</li>
              <li>砸壳消耗：{{ config.coin_dump_cost }} 金币/次</li>
              <li>注册赠送：{{ config.default_user_coins }} 金币</li>
            </ul>
          </div>

          <div class="preview-card vip-card">
            <h4>👑 会员用户</h4>
            <ul>
              <li>下载：{{ vipDownloadFree ? '完全免费' : `每日免费 ${config.vip_free_download_daily} 次` }}</li>
              <li>砸壳：{{ vipDumpFree ? '完全免费' : `每日免费 ${config.vip_free_dump_daily} 次` }}</li>
              <li v-if="!vipDownloadFree">超出后每次下载：{{ config.coin_download_cost }} 金币</li>
              <li v-if="!vipDumpFree">超出后每次砸壳：{{ config.coin_dump_cost }} 金币</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig, getSizeConfigs, updateSizeConfigs } from '@/api/vipCoin'

// 配置数据
const config = ref({
  site_free_mode: 0,
  coin_download_cost: 0.01,
  coin_dump_cost: 0.01,
  free_download_daily: 3,
  free_dump_daily: 3,
  vip_download_free: 1,
  vip_dump_free: 1,
  vip_free_download_daily: 20,
  vip_free_dump_daily: 20,
  default_user_coins: 10.0
})

// 全站免费开关（计算属性）
const siteFreeMode = computed({
  get: () => config.value.site_free_mode === 1,
  set: (val) => { config.value.site_free_mode = val ? 1 : 0 }
})

// 会员免费开关（计算属性）
const vipDownloadFree = computed({
  get: () => config.value.vip_download_free === 1,
  set: (val) => { config.value.vip_download_free = val ? 1 : 0 }
})

const vipDumpFree = computed({
  get: () => config.value.vip_dump_free === 1,
  set: (val) => { config.value.vip_dump_free = val ? 1 : 0 }
})

// 大小范围配置
const activeSizeConfigTab = ref('download')
const downloadSizeConfigs = ref<Array<{
  id?: number
  min_size_mb: number
  max_size_mb: number | null
  coin_cost: number
  sort_order: number
}>>([])
const dumpSizeConfigs = ref<Array<{
  id?: number
  min_size_mb: number
  max_size_mb: number | null
  coin_cost: number
  sort_order: number
}>>([])

// 加载大小范围配置
const loadSizeConfigs = async () => {
  try {
    const [downloadRes, dumpRes] = await Promise.all([
      getSizeConfigs('download'),
      getSizeConfigs('dump')
    ])
    
    if (downloadRes.ok && downloadRes.configs) {
      downloadSizeConfigs.value = downloadRes.configs
    }
    
    if (dumpRes.ok && dumpRes.configs) {
      dumpSizeConfigs.value = dumpRes.configs
    }
  } catch (err: any) {
    console.error('加载大小范围配置失败:', err)
  }
}

// 保存大小范围配置
const saveSizeConfigs = async () => {
  try {
    await Promise.all([
      updateSizeConfigs('download', downloadSizeConfigs.value),
      updateSizeConfigs('dump', dumpSizeConfigs.value)
    ])
    ElMessage.success('大小范围配置保存成功')
  } catch (err: any) {
    ElMessage.error(err.msg || '保存大小范围配置失败')
  }
}

// 添加大小范围配置
const addSizeConfig = (actionType: 'download' | 'dump') => {
  const configs = actionType === 'download' ? downloadSizeConfigs.value : dumpSizeConfigs.value
  const maxSort = configs.length > 0 ? Math.max(...configs.map(c => c.sort_order)) : 0
  const lastConfig = configs.length > 0 ? configs[configs.length - 1] : undefined
  const newConfig = {
    min_size_mb: lastConfig?.max_size_mb ?? 0,
    max_size_mb: null as number | null,
    coin_cost: 0.01,
    sort_order: maxSort + 1
  }
  
  if (actionType === 'download') {
    downloadSizeConfigs.value.push(newConfig)
  } else {
    dumpSizeConfigs.value.push(newConfig)
  }
}

// 删除大小范围配置
const removeSizeConfig = (actionType: 'download' | 'dump', index: number) => {
  if (actionType === 'download') {
    downloadSizeConfigs.value.splice(index, 1)
  } else {
    dumpSizeConfigs.value.splice(index, 1)
  }
}

// 处理最大大小输入框失焦事件
const handleMaxSizeBlur = (cfg: any) => {
  if (cfg.max_size_mb === '' || cfg.max_size_mb === null || cfg.max_size_mb === undefined) {
    cfg.max_size_mb = null
  }
}

// 保存配置（合并大小范围配置）
const saveSettings = async () => {
  try {
    // 保存系统配置
    const configs = Object.keys(config.value).map(key => ({
      key,
      value: String(config.value[key as keyof typeof config.value])
    }))
    await updateSystemConfig(configs)
    
    // 保存大小范围配置
    await saveSizeConfigs()
    
    ElMessage.success('所有配置保存成功')
  } catch (err: any) {
    ElMessage.error(err.msg || '保存配置失败')
  }
}

// 加载配置
const loadSettings = async () => {
  try {
    const res = await getSystemConfig()
    if (res.ok && res.config) {
      Object.assign(config.value, res.config)
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载配置失败')
  }
}

onMounted(() => {
  loadSettings()
  loadSizeConfigs()
})
</script>

<style scoped lang="scss">
.settings-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
}

.btn-primary {
  padding: 10px 20px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #73d13d;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.setting-item {
  label {
    display: block;
    margin-bottom: 10px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
  }

  .hint {
    margin: 8px 0 0 0;
    font-size: 12px;
    color: #999;
    line-height: 1.5;
  }
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #52c41a;
    }
  }

  .unit {
    color: #999;
    font-size: 14px;
    white-space: nowrap;
  }
}

.switch-group {
  display: flex;
  align-items: center;
  gap: 15px;

  .status {
    font-size: 14px;
    font-weight: 500;
    color: #52c41a;
  }
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: #52c41a;
    }

    &:checked + .slider:before {
      transform: translateX(24px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 26px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
}

/* 预览区域 */
.preview-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;

  h3 {
    color: #374151;
    border-bottom-color: #e5e7eb;
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.preview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;

  h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #374151;
  }

  ul {
    margin: 0;
    padding: 0 0 0 20px;
    list-style: none;

    li {
      position: relative;
      padding: 6px 0;
      font-size: 14px;
      line-height: 1.6;

      &:before {
        content: "•";
        position: absolute;
        left: -15px;
        color: #6b7280;
      }
    }
  }

  &.vip-card {
    border-color: #fbbf24;

    h4:before {
      content: "👑 ";
    }
  }
}

.size-config-tabs {
  margin-top: 15px;
}

.size-config-list {
  padding: 10px 0;
}

.size-config-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.size-config-inputs {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.size-config-inputs .input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  label {
    font-size: 12px;
    color: #666;
  }
  
  input {
    padding: 6px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    min-width: 100px;
    
    &:focus {
      outline: none;
      border-color: #52c41a;
    }
  }
}

.range-separator {
  font-size: 18px;
  color: #999;
  margin: 0 5px;
  align-self: flex-end;
  padding-bottom: 22px;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .btn-primary {
    width: 100%;
  }

  .settings-content {
    gap: 16px;
  }

  .settings-section {
    padding: 16px;

    h3 {
      font-size: 16px;
      margin-bottom: 16px;
    }
  }

  .settings-grid,
  .preview-grid {
    grid-template-columns: 1fr;
  }
  
  .size-config-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .range-separator {
    display: none;
  }

  .size-config-item {
    padding: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .settings-section {
    padding: 12px;

    h3 {
      font-size: 15px;
    }
  }

  .setting-item label {
    font-size: 13px;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;

    input {
      width: 100%;
    }
  }

  .switch-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

