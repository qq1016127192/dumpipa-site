<template>
  <div class="admin-login-page">
    <div class="login-container">
      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- Logo 和标题 -->
        <div class="login-header">
          <div class="logo-icon">IPA</div>
          <h2>管理后台登录</h2>
          <p>IPA在线脱壳平台 · 后台管理系统</p>
        </div>

        <!-- 错误提示 -->
        <transition name="slide-down">
          <div v-if="errorMsg" class="error-msg">
            <i class="fa fa-exclamation-circle"></i>
            <span>{{ errorMsg }}</span>
          </div>
        </transition>

        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          class="login-form"
        >
          <!-- 管理员账号 -->
          <el-form-item prop="username" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-user-shield"></i>
              </div>
              <input
                v-model="form.username"
                type="text"
                placeholder="管理员账号"
                class="form-input"
              />
            </div>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-lock"></i>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="管理员密码"
                class="form-input"
                @keyup.enter="handleSubmit"
              />
              <div class="input-suffix" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </div>
            </div>
          </el-form-item>

          <!-- 记住我 -->
          <el-form-item class="remember-item">
            <el-checkbox v-model="form.remember" class="custom-checkbox">
              <span class="remember-text">记住我（7天内自动登录）</span>
            </el-checkbox>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item class="submit-item">
            <button
              type="button"
              :disabled="loading"
              @click="handleSubmit"
              class="submit-btn"
            >
              <span v-if="!loading">
                <i class="fa fa-sign-in-alt"></i>
                登录后台
              </span>
              <span v-else>
                <i class="fa fa-spinner fa-spin"></i>
                登录中...
              </span>
            </button>
          </el-form-item>
        </el-form>

        <!-- 底部链接 -->
        <div class="login-footer">
          <router-link to="/" class="back-link">
            <i class="fa fa-arrow-left"></i>
            返回首页
          </router-link>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return

  errorMsg.value = ''

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await userStore.login({
          username: form.username,
          password: form.password,
          remember: form.remember,
        })

        if (success) {
          // 验证是否为管理员
          if (!userStore.isAdmin()) {
            errorMsg.value = '您没有管理员权限'
            await userStore.logout()
            loading.value = false
            return
          }

          ElMessage.success('登录成功!')
          const redirect = route.query.redirect as string || '/admin/dashboard'
          router.push(redirect)
        } else {
          errorMsg.value = '账号或密码错误'
        }
      } catch (error: any) {
        console.error('登录失败:', error)
        errorMsg.value = error.response?.data?.msg || '登录失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 页面容器 */
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* 登录容器 */
.login-container {
  width: 100%;
  max-width: 480px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* 登录卡片 */
.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

/* 错误提示 */
.error-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #F56C6C;
  background: #FEF0F0;
  border: 1px solid #FBC4C4;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  animation: shake 0.4s ease-in-out;
}

.error-msg i {
  font-size: 16px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 输入框包装器 */
.input-wrapper {
  display: flex;
  align-items: center;
  background: #F7F8FA;
  border-radius: 12px;
  padding: 0 16px;
  margin-bottom: 16px;
  height: 52px;
  width: 100%;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.input-wrapper:focus-within {
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  margin-right: 12px;
}

.input-prefix i {
  font-size: 18px;
  color: #667eea;
}

.form-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  height: 100%;
}

.form-input::placeholder {
  color: #CCCCCC;
}

.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  margin-left: 12px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease;
}

.input-suffix:hover {
  color: #667eea;
}

.input-suffix i {
  font-size: 18px;
}

/* 输入框表单项 */
.input-item {
  margin-bottom: 0;
}

.input-item :deep(.el-form-item__content) {
  width: 100%;
  margin: 0 !important;
}

.input-item :deep(.el-form-item__error) {
  padding-left: 16px;
}

/* 记住我复选框 */
.remember-item {
  margin-bottom: 24px;
  margin-top: -8px;
}

.remember-item :deep(.el-form-item__content) {
  justify-content: flex-start;
}

.custom-checkbox :deep(.el-checkbox__input .el-checkbox__inner) {
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  width: 16px;
  height: 16px;
}

.custom-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

.remember-text {
  font-size: 13px;
  color: #666;
  margin-left: 4px;
}

/* 登录按钮 */
.submit-item {
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn i {
  margin-right: 8px;
}

/* 底部链接 */
.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.back-link {
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-link:hover {
  color: #764ba2;
  gap: 12px;
}

.back-link i {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    max-width: 100%;
    padding: 16px;
  }

  .login-card {
    padding: 36px 24px;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 20px;
  }

  .login-header h2 {
    font-size: 22px;
  }

  .input-wrapper {
    height: 48px;
  }

  .submit-btn {
    height: 48px;
  }
}
</style>

