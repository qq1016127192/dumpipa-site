<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 注册表单 -->
      <div class="form-container">
        <!-- 标题 -->
        <div class="form-title">
          <h2>账户注册</h2>
          <p>欢迎加入 IPA 在线脱壳平台</p>
        </div>

        <!-- 错误提示 -->
        <transition name="slide-down">
          <div v-if="errorMsg" class="error-msg">
            <i class="fa fa-exclamation-circle"></i>
            <span>{{ errorMsg }}</span>
          </div>
        </transition>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
        >
          <!-- 用户名输入框 -->
          <el-form-item prop="username" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-user"></i>
              </div>
              <input
              v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="form-input"
            />
            </div>
          </el-form-item>

          <!-- 邮箱输入框 -->
          <el-form-item prop="email" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-envelope"></i>
              </div>
              <input
              v-model="form.email"
                type="email"
                placeholder="请输入邮箱（可选）"
                class="form-input"
            />
            </div>
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-lock"></i>
              </div>
              <input
              v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
              />
              <div class="input-suffix" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </div>
            </div>
          </el-form-item>

          <!-- 确认密码输入框 -->
          <el-form-item prop="confirmPassword" class="input-item">
            <div class="input-wrapper">
              <div class="input-prefix">
                <i class="fa fa-lock"></i>
              </div>
              <input
              v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="form-input"
              @keyup.enter="handleSubmit"
            />
              <div class="input-suffix" @click="showConfirmPassword = !showConfirmPassword">
                <i :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </div>
            </div>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item class="submit-item">
            <button
              type="button"
              :disabled="loading"
              @click="handleSubmit"
              class="submit-btn"
            >
              <span v-if="!loading">一键注册</span>
              <span v-else>
                <i class="fa fa-spinner fa-spin"></i>
                注册中...
              </span>
            </button>
          </el-form-item>
        </el-form>

        <!-- 分隔线 -->
        <div class="divider">
          <span>其它方式</span>
        </div>

        <!-- 底部链接 -->
        <div class="register-footer">
          <span class="footer-text">已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>

        <!-- 版权信息 -->
        <div class="copyright">
          <span class="copyright-text">Copyright © 2025</span>
          <span class="copyright-divider">/</span>
          <span class="copyright-link">IPA在线脱壳平台</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { register } from '@/api/auth'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  errorMsg.value = ''
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await register({
          username: form.username,
          password: form.password,
          email: form.email,
        })
        
        ElMessage.success('注册成功!请登录')
        router.push('/login')
      } catch (error: any) {
        console.error('注册失败:', error)
        errorMsg.value = error.response?.data?.msg || '注册失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 页面容器 */
.register-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 注册容器 */
.register-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表单容器 */
.form-container {
  background: white;
  width: 100%;
  max-width: 440px;
  padding: 40px 32px;
  box-shadow: none;
}

/* 表单标题 */
.form-title {
  text-align: center;
  margin-bottom: 32px;
}

.form-title h2 {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-title p {
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
  margin-bottom: 16px;
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
  height: 50px;
  width: 100%;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  background: #EEF2F6;
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
  color: #C0C0C0;
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
  color: #C0C0C0;
  transition: color 0.2s ease;
}

.input-suffix:hover {
  color: #999;
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

/* 登录按钮 */
.submit-item {
  margin-bottom: 20px;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(to right, rgb(100, 164, 240), rgb(56, 107, 246));
  border: none;
  border-radius: 23px;
  color: white;
  font-size: 16px;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(56, 107, 246, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 107, 246, 0.4);
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
  margin-right: 4px;
}

/* 分隔线 */
.divider {
  text-align: center;
  padding: 24px 0 20px;
  color: #CCC;
  font-size: 13px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background-color: #E5E5E5;
  transform: translateY(-50%);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

/* 底部链接 */
.register-footer {
  text-align: center;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px 0;
}

.footer-text {
  color: #999;
  margin-right: 6px;
}

.login-link {
  color: #5B8FF9;
  font-weight: normal;
  text-decoration: none;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #386BF6;
  text-decoration: underline;
}

/* 版权信息 */
.copyright {
  font-size: 13px;
  display: flex;
  justify-content: center;
  margin-top: 16px;
  align-items: center;
  padding-bottom: 8px;
  color: #999;
}

.copyright-text {
  color: #999;
}

.copyright-divider {
  color: #DDD;
  margin: 0 6px;
}

.copyright-link {
  color: #666;
  text-decoration: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 0 16px;
  }

  .form-container {
    padding: 32px 24px;
  }

  .form-title h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0 16px;
  }

  .form-container {
    padding: 28px 20px;
  }

  .form-title {
    margin-bottom: 24px;
  }

  .form-title h2 {
    font-size: 22px;
  }

  .input-wrapper {
    height: 48px;
    padding: 0 14px;
  }
}
</style>
