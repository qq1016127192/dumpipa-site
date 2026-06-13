<template>
  <div class="site-token-page">
    <h1 class="page-title">主站Token设置</h1>
    
    <el-card class="token-card">
      <template #header>
        <div class="card-header">
          <span>主站对接Token</span>
          <el-tag type="info" size="small">用于与主站API对接</el-tag>
        </div>
      </template>
      
      <el-form
        ref="tokenFormRef"
        :model="tokenForm"
        :rules="tokenRules"
        label-width="150px"
        class="token-form"
      >
        <el-form-item label="主站Token" prop="token">
          <el-input
            v-model="tokenForm.token"
            type="textarea"
            :rows="4"
            placeholder="请输入主站API Token"
            show-password
            clearable
          />
          <div class="form-extra">
            此Token用于分站与主站API对接，用于扣除主站金币、创建任务等操作。
            <br />
            请从主站管理后台获取API Token并填入此处。
          </div>
        </el-form-item>
        
        <el-form-item v-if="tokenPreview" label="当前Token预览">
          <el-input
            :value="tokenPreview"
            readonly
            disabled
            style="width: 300px;"
          />
          <div class="form-extra">
            已配置的Token预览（前8位...后4位）
            <span v-if="tokenExpiresAt" :class="['token-expiry', { 'expired': isTokenExpired }]">
              <br />
              <span v-if="isTokenExpired" style="color: #F56565;">⚠️ Token已过期</span>
              <span v-else style="color: #38A169;">✓ Token有效期至</span>
              <strong>{{ formatExpiryDate(tokenExpiresAt) }}</strong>
            </span>
            <span v-else class="token-expiry">
              <br />
              <span style="color: #A0AEC0;">Token无过期时间或无法解析</span>
            </span>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveToken" :loading="saving">
            保存Token
          </el-button>
          <el-button @click="testToken" :loading="testing">
            测试连接
          </el-button>
          <el-button @click="loadToken">
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="info-card">
      <template #header>
        <span>使用说明</span>
      </template>
      <div class="info-content">
        <h3>如何获取主站Token？</h3>
        <ol>
          <li>登录主站管理后台</li>
          <li>进入 "Token管理" 页面</li>
          <li>创建或查看您的API Token</li>
          <li>复制Token并粘贴到上方输入框</li>
        </ol>
        
        <h3>Token的作用</h3>
        <ul>
          <li>分站调用主站API时的身份认证</li>
          <li>扣除主站金币（用户操作时）</li>
          <li>创建任务到主站</li>
          <li>获取应用数据</li>
        </ul>
        
        <h3>注意事项</h3>
        <ul>
          <li>Token请妥善保管，不要泄露</li>
          <li>如果Token失效，请及时更新</li>
          <li>Token错误会导致分站无法正常与主站对接</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getMainSiteToken, updateMainSiteToken, testMainSiteConnection } from '@/api/siteConfig'

const tokenFormRef = ref<FormInstance>()
const saving = ref(false)
const testing = ref(false)
const tokenPreview = ref('')
const tokenExpiresAt = ref<string | null>(null)
const isTokenExpired = ref(false)

const tokenForm = reactive({
  token: '',
})

const tokenRules: FormRules = {
  token: [
    { required: true, message: '请输入主站Token', trigger: 'blur' },
    { min: 10, message: 'Token长度至少10个字符', trigger: 'blur' },
  ],
}

const loadToken = async () => {
  try {
    const res = await getMainSiteToken()
    if (res.ok === 1) {
      // 不自动填充token，只显示预览
      // 后端返回格式：{ ok: 1, msg: '...', data: { token: '...', token_preview: '...', expires_at: '...', is_expired: false } }
      tokenPreview.value = res.data?.token_preview || res.token_preview || ''
      tokenExpiresAt.value = res.data?.expires_at || res.expires_at || null
      isTokenExpired.value = res.data?.is_expired || res.is_expired || false
      // tokenForm.token = res.data?.token || res.token || '' // 不自动填充，安全考虑
      // 只在成功获取时显示成功消息，避免频繁提示
      // ElMessage.success('获取Token信息成功')
    } else {
      tokenPreview.value = ''
      tokenExpiresAt.value = null
      isTokenExpired.value = false
      // Token未配置时不显示错误，只是提示
      if (res.msg && !res.msg.includes('未配置')) {
        ElMessage.warning(res.msg)
      }
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Token未配置，这是正常情况
      tokenPreview.value = ''
      tokenExpiresAt.value = null
      isTokenExpired.value = false
    } else {
      console.error('获取Token信息失败:', error)
      // 网络错误等情况下不显示错误提示，避免干扰用户
      // ElMessage.error('获取Token信息失败')
    }
  }
}

const formatExpiryDate = (dateStr: string | null): string => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (err) {
    return dateStr
  }
}

const saveToken = async () => {
  if (!tokenFormRef.value) return
  
  await tokenFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const res = await updateMainSiteToken(tokenForm.token)
        // 检查响应格式：后端返回 { ok: 1, msg: '...', data: { message: '...' } }
        if (res.ok === 1) {
          const successMsg = res.data?.message || res.msg || 'Token保存成功'
          ElMessage.success(successMsg)
          // 保存后清空输入框（安全考虑）
          tokenForm.token = ''
          // 重新加载预览
          await loadToken()
        } else {
          ElMessage.error(res.msg || '保存失败')
        }
      } catch (error: any) {
        console.error('保存Token失败:', error)
        const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || '保存失败'
        ElMessage.error(errorMsg)
      } finally {
        saving.value = false
      }
    }
  })
}

const testToken = async () => {
  testing.value = true
  try {
    const res = await testMainSiteConnection()
    if (res.ok === 1) {
      const successMsg = res.data?.message || res.msg || '主站连接测试成功！Token有效'
      ElMessage.success(successMsg)
    } else {
      ElMessage.error('连接测试失败: ' + (res.msg || 'Token可能无效'))
    }
  } catch (error: any) {
    console.error('测试连接失败:', error)
    const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || '测试失败'
    ElMessage.error('连接测试失败: ' + errorMsg)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadToken()
})
</script>

<style scoped>
.site-token-page {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.token-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.token-form {
  max-width: 800px;
}

.form-extra {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
  line-height: 1.6;
}

.info-card {
  background: #F9FAFB;
}

.info-content {
  color: #374151;
  line-height: 1.8;
}

.info-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-top: 20px;
  margin-bottom: 12px;
}

.info-content h3:first-child {
  margin-top: 0;
}

.info-content ol,
.info-content ul {
  margin: 8px 0;
  padding-left: 24px;
}

.info-content li {
  margin: 6px 0;
}

/* 移动端自适应 */
@media (max-width: 768px) {
  .site-token-page {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .token-form {
    max-width: 100%;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left !important;
  }

  :deep(.el-textarea__inner) {
    font-size: 14px;
  }
}
</style>

