<template>
  <div class="payment-settings-container">
    <div class="page-header">
      <h2>支付设置</h2>
      <button class="btn-primary" @click="showAddDialog">
        <span>+ 添加支付方式</span>
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="el-icon-credit-card"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">支付方式总数</p>
          <p class="stat-value">{{ stats.total_methods || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">启用方式</p>
          <p class="stat-value">{{ stats.enabled_methods || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon yellow">
          <i class="el-icon-setting"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">配置项总数</p>
          <p class="stat-value">{{ stats.total_configs || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <i class="el-icon-lock"></i>
        </div>
        <div class="stat-info">
          <p class="stat-label">安全状态</p>
          <p class="stat-value">正常</p>
        </div>
      </div>
    </div>

    <!-- 支付方式列表 -->
    <div class="payment-methods-list">
      <div v-for="method in paymentMethods" :key="method.id" class="payment-method-card">
        <div class="method-header">
          <div class="method-info">
            <h3>{{ method.name }}</h3>
            <p class="method-desc">{{ method.description || '无描述' }}</p>
            <p class="method-code">代码: <code>{{ method.code }}</code></p>
          </div>
          <div class="method-status">
            <el-tag :type="method.status ? 'success' : 'danger'" size="small">
              {{ method.status ? '启用' : '禁用' }}
            </el-tag>
            <span class="sort-order">排序: {{ method.sort_order }}</span>
          </div>
        </div>

        <!-- 支付配置 -->
        <div class="method-config">
          <form @submit.prevent="saveConfig(method.id)">
            <div class="config-grid">
              <div class="config-item">
                <label>易支付接口地址</label>
                <el-input
                  v-model="method.configs.epay_url"
                  placeholder="https://api.example.com/submit.php"
                />
                <p class="config-hint">易支付API接口地址，用于创建支付订单</p>
              </div>

              <div class="config-item">
                <label>易支付商户ID</label>
                <el-input
                  v-model="method.configs.epay_pid"
                  placeholder="1000"
                />
                <p class="config-hint">易支付平台分配的商户ID</p>
              </div>

              <div class="config-item">
                <label>易支付商户密钥</label>
                <el-input
                  v-model="method.configs.epay_key"
                  type="password"
                  show-password
                  placeholder="32位MD5密钥"
                />
                <p class="config-hint">易支付平台分配的商户密钥，用于签名验证</p>
              </div>

              <div class="config-item">
                <label>收银台URL</label>
                <el-input
                  v-model="method.configs.epay_cashier_url"
                  placeholder="https://pay.example.com/pay/"
                />
                <p class="config-hint">支付收银台地址，系统会自动拼接订单号</p>
              </div>

              <div class="config-item full-width">
                <div class="checkbox-group">
                  <el-checkbox v-model="method.configs.epay_cashier_enabled" true-label="1" false-label="0">
                    启用收银台跳转
                  </el-checkbox>
                  <el-checkbox v-model="method.configs.epay_force_cashier" true-label="1" false-label="0">
                    强制使用收银台（忽略payurl/qrcode）
                  </el-checkbox>
                </div>
                <p class="config-hint">
                  <strong>收银台跳转：</strong>当支付接口返回trade_no时，使用收银台URL进行跳转<br>
                  <strong>强制收银台：</strong>即使接口返回payurl/qrcode，也优先使用收银台URL
                </p>
              </div>
            </div>

            <div class="config-actions">
              <el-button type="primary" @click="saveConfig(method.id)">保存配置</el-button>
              <el-button @click="editMethod(method)">编辑</el-button>
              <el-button type="danger" @click="deleteMethodConfirm(method)">删除</el-button>
            </div>
          </form>
        </div>

        <!-- 编辑表单 -->
        <div v-if="editingMethod?.id === method.id" class="edit-form">
          <el-form @submit.prevent="updateMethod(method.id)">
            <div class="form-row">
              <el-form-item label="支付方式名称">
                <el-input v-model="editingMethod.name" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="editingMethod.description" />
              </el-form-item>
            </div>
            <div class="form-row">
              <el-form-item label="排序">
                <el-input-number v-model="editingMethod.sort_order" :min="0" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch v-model="editingMethod.status" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </div>
            <div class="form-actions">
              <el-button type="primary" @click="updateMethod(method.id)">保存修改</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </div>
          </el-form>
        </div>
      </div>

      <div v-if="paymentMethods.length === 0" class="empty-state">
        <i class="el-icon-credit-card"></i>
        <h3>暂无支付方式</h3>
        <p>还没有添加任何支付方式</p>
      </div>
    </div>

    <!-- 添加支付方式对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑支付方式' : '添加支付方式'"
      width="600px"
    >
      <!-- 快速添加预设 -->
      <div class="preset-methods">
        <h4>快速添加预设支付方式</h4>
        <div class="preset-grid">
          <el-button
            v-for="preset in presetMethods"
            :key="preset.code"
            :disabled="presetExists(preset.code)"
            @click="fillPreset(preset)"
            size="small"
          >
            {{ preset.name }}
            <span v-if="presetExists(preset.code)" class="preset-exists">已添加</span>
          </el-button>
        </div>
      </div>

      <el-form :model="formData" label-width="120px">
        <el-form-item label="支付方式名称" required>
          <el-input v-model="formData.name" placeholder="例如：支付宝" />
        </el-form-item>

        <el-form-item label="支付方式代码" required>
          <el-select v-model="formData.code" placeholder="请选择" @change="handleCodeChange">
            <el-option
              v-for="preset in presetMethods"
              :key="preset.code"
              :label="`${preset.name} (${preset.code})`"
              :value="preset.code"
            />
            <el-option label="自定义代码" value="custom" />
          </el-select>
          <el-input
            v-if="formData.code === 'custom'"
            v-model="formData.customCode"
            placeholder="输入自定义代码"
            class="mt-2"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="支付方式描述"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPaymentMethods,
  getPaymentStats,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updatePaymentConfig,
} from '@/api/payment'

// 预设支付方式
const presetMethods = [
  { code: 'alipay', name: '支付宝', description: '安全快捷的在线支付' },
  { code: 'wxpay', name: '微信支付', description: '便捷的移动支付' },
  { code: 'qqpay', name: 'QQ钱包', description: 'QQ用户专属支付' },
  { code: 'bank', name: '网银支付', description: '支持各大银行转账' },
  { code: 'jdpay', name: '京东支付', description: '京东生态支付' },
  { code: 'paypal', name: 'PayPal', description: '国际支付平台' },
]

// 数据
const paymentMethods = ref<any[]>([])
const stats = ref({
  total_methods: 0,
  enabled_methods: 0,
  total_configs: 0,
})
const showDialog = ref(false)
const isEdit = ref(false)
const editingMethod = ref<any>(null)

const formData = reactive({
  name: '',
  code: '',
  customCode: '',
  description: '',
  status: 1,
  sort_order: 0,
})

// 加载数据
const loadData = async () => {
  try {
    const [methodsRes, statsRes] = await Promise.all([
      getPaymentMethods(),
      getPaymentStats(),
    ])

    console.log('📥 支付方式API响应:', {
      ok: methodsRes.ok,
      hasMethods: !!methodsRes.methods,
      hasData: !!methodsRes.data,
      methodsLength: methodsRes.methods?.length || methodsRes.data?.methods?.length || 0,
      keys: Object.keys(methodsRes),
    })

    if (methodsRes.ok === 1) {
      // 兼容两种响应格式：
      // 1. { ok: 1, methods: [...] } - 直接返回
      // 2. { ok: 1, data: { methods: [...] } } - 放在data字段中
      const methods = methodsRes.methods || methodsRes.data?.methods || []
      
      paymentMethods.value = methods.map((method: any) => ({
        ...method,
        configs: method.configs || {
          epay_url: '',
          epay_pid: '',
          epay_key: '',
          epay_cashier_url: '',
          epay_cashier_enabled: '0',
          epay_force_cashier: '0',
        },
      }))
    }

    if (statsRes.ok === 1) {
      // 兼容两种响应格式
      stats.value = statsRes.data || statsRes
    }
  } catch (error: any) {
    console.error('❌ 加载数据失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
    ElMessage.error(error.response?.data?.msg || error.message || '加载数据失败')
  }
}

// 检查预设是否存在
const presetExists = (code: string) => {
  return paymentMethods.value.some((m) => m.code === code)
}

// 填充预设
const fillPreset = (preset: any) => {
  formData.name = preset.name
  formData.code = preset.code
  formData.description = preset.description
  formData.customCode = ''
}

// 处理代码选择
const handleCodeChange = (value: string) => {
  if (value !== 'custom') {
    formData.customCode = ''
    const preset = presetMethods.find((p) => p.code === value)
    if (preset) {
      fillPreset(preset)
    }
  }
}

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    code: '',
    customCode: '',
    description: '',
    status: 1,
    sort_order: 0,
  })
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  isEdit.value = false
}

// 提交表单
const submitForm = async () => {
  if (!formData.name || !formData.code) {
    ElMessage.warning('请填写支付方式名称和代码')
    return
  }

  const code = formData.code === 'custom' ? formData.customCode : formData.code

  if (!code) {
    ElMessage.warning('请填写支付方式代码')
    return
  }

  try {
    if (isEdit.value) {
      await updatePaymentMethod(editingMethod.value.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status === 1,
        sort_order: formData.sort_order,
      })
      ElMessage.success('更新成功')
    } else {
      await addPaymentMethod({
        name: formData.name,
        code: code,
        description: formData.description,
        status: formData.status === 1,
        sort_order: formData.sort_order,
      })
      ElMessage.success('添加成功')
    }

    closeDialog()
    loadData()
  } catch (error: any) {
    ElMessage.error(error.msg || '操作失败')
  }
}

// 编辑支付方式
const editMethod = (method: any) => {
  editingMethod.value = { ...method }
}

// 取消编辑
const cancelEdit = () => {
  editingMethod.value = null
}

// 更新支付方式
const updateMethod = async (id: number) => {
  try {
    await updatePaymentMethod(id, {
      name: editingMethod.value.name,
      description: editingMethod.value.description,
      status: editingMethod.value.status === 1,
      sort_order: editingMethod.value.sort_order,
    })
    ElMessage.success('更新成功')
    editingMethod.value = null
    loadData()
  } catch (error: any) {
    ElMessage.error(error.msg || '更新失败')
  }
}

// 保存配置
const saveConfig = async (methodId: number) => {
  const method = paymentMethods.value.find((m) => m.id === methodId)
  if (!method) return

  try {
    await updatePaymentConfig(methodId, method.configs)
    ElMessage.success('配置保存成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.msg || '保存配置失败')
  }
}

// 删除确认
const deleteMethodConfirm = async (method: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除支付方式 "${method.name}" 吗？此操作不可恢复。`,
      '提示',
      {
        type: 'warning',
      }
    )

    await deletePaymentMethod(method.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.msg || '删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.payment-settings-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #66b1ff;
  }
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 16px;

    &.blue {
      background: #e6f4ff;
      color: #409eff;
    }

    &.green {
      background: #f0f9ff;
      color: #67c23a;
    }

    &.yellow {
      background: #fef7e6;
      color: #e6a23c;
    }

    &.purple {
      background: #f4e6ff;
      color: #9c27b0;
    }
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin: 0 0 8px 0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
}

// 支付方式列表
.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-method-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f3f5;

  .method-info {
    flex: 1;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .method-desc {
      font-size: 14px;
      color: #606266;
      margin: 0 0 8px 0;
    }

    .method-code {
      font-size: 12px;
      color: #909399;
      margin: 0;

      code {
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }
    }
  }

  .method-status {
    display: flex;
    align-items: center;
    gap: 12px;

    .sort-order {
      font-size: 14px;
      color: #909399;
    }
  }
}

.method-config {
  margin-top: 20px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .config-item {
    &.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 8px;
    }

    .config-hint {
      font-size: 12px;
      color: #909399;
      margin: 4px 0 0 0;
      line-height: 1.5;
    }
  }
}

.checkbox-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.config-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.edit-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f2f3f5;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  h3 {
    font-size: 18px;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

// 预设支付方式
.preset-methods {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;

  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 12px 0;
  }
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.preset-exists {
  display: block;
  font-size: 10px;
  color: #909399;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .payment-settings-container {
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

  .config-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .method-header {
    flex-direction: column;
    gap: 12px;
  }

  .payment-method-card {
    padding: 16px;
  }

  .config-actions {
    flex-wrap: wrap;
  }

  :deep(.el-dialog) {
    width: 95% !important;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .payment-settings-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .payment-method-card {
    padding: 12px;
  }

  .config-item label {
    font-size: 13px;
  }

  :deep(.el-dialog) {
    width: 100% !important;
    margin: 5vh auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 16px;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left !important;
  }

  .preset-grid {
    grid-template-columns: 1fr;
  }

  .preset-methods {
    padding: 12px;
  }
}
</style>

