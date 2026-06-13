<template>
  <div class="admin-settings-page">
    <h1 class="page-title">系统设置</h1>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 分站设置 -->
      <el-tab-pane label="分站设置" name="site">
        <el-form
          ref="siteFormRef"
          :model="siteSettings"
          label-width="150px"
          class="settings-form"
        >
          <el-form-item label="分站Logo">
            <el-input
              v-model="siteSettings.logo_url"
              placeholder="请输入Logo图片URL"
              clearable
            />
            <template #extra>
              <div class="form-extra">
                建议尺寸：200x60像素，支持PNG、JPG格式
              </div>
            </template>
          </el-form-item>
          <el-form-item v-if="siteSettings.logo_url">
            <img :src="siteSettings.logo_url" class="logo-preview" />
          </el-form-item>

          <el-form-item label="分站名称">
            <el-input
              v-model="siteSettings.site_name"
              placeholder="请输入分站名称"
              clearable
              maxlength="50"
              show-word-limit
            />
            <template #extra>
              <div class="form-extra">分站名称将显示在页面标题和导航栏</div>
            </template>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSiteSettings" :loading="saving">
              保存设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- SEO设置 -->
      <el-tab-pane label="SEO设置" name="seo">
        <el-form
          ref="seoFormRef"
          :model="seoSettings"
          label-width="150px"
          class="settings-form"
        >
          <el-form-item label="网站标题">
            <el-input 
              v-model="seoSettings.site_title" 
              placeholder="请输入网站标题"
              clearable
              maxlength="60"
              show-word-limit
            />
            <template #extra>
              <div class="form-extra">建议长度：30-60个字符，将显示在浏览器标签页和搜索引擎结果中</div>
            </template>
          </el-form-item>

          <el-form-item label="副标题">
            <el-input 
              v-model="seoSettings.site_subtitle" 
              placeholder="请输入网站副标题"
              clearable
              maxlength="100"
              show-word-limit
            />
            <template #extra>
              <div class="form-extra">用于网站首页或头部显示，建议长度：50-100个字符</div>
            </template>
          </el-form-item>

          <el-form-item label="网站描述">
            <el-input 
              v-model="seoSettings.site_description" 
              type="textarea"
              :rows="4"
              placeholder="请输入网站描述"
              clearable
              maxlength="200"
              show-word-limit
            />
            <template #extra>
              <div class="form-extra">用于SEO meta description，建议长度：120-200个字符，将显示在搜索引擎结果中</div>
            </template>
          </el-form-item>

          <el-form-item label="关键词">
            <el-input 
              v-model="seoSettings.site_keywords" 
              placeholder="请输入关键词，多个关键词用逗号分隔"
              clearable
              maxlength="200"
              show-word-limit
            />
            <template #extra>
              <div class="form-extra">用于SEO meta keywords，多个关键词用英文逗号分隔，例如：IPA,脱壳,应用下载,免费IPA</div>
            </template>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="saveSeoSettings" :loading="saving">
              保存设置
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSettings,
  updateSettings,
} from '@/api/settings'

const activeTab = ref('site')
const saving = ref(false)

const siteSettings = reactive({
  logo_url: '',
  site_name: '',
})

const seoSettings = reactive({
  site_title: '',
  site_subtitle: '',
  site_description: '',
  site_keywords: '',
})

const fetchSettings = async () => {
  try {
    const res = await getSettings()
    if (res.ok === 1) {
      const settings = res.data?.settings || {}
      Object.assign(seoSettings, settings.seo || {})
      Object.assign(siteSettings, settings.site || {})
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

const saveSiteSettings = async () => {
  saving.value = true
  try {
    await updateSettings('site', siteSettings)
    ElMessage.success('分站设置保存成功')
    await fetchSettings()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const saveSeoSettings = async () => {
  saving.value = true
  try {
    await updateSettings('seo', seoSettings)
    ElMessage.success('SEO 设置保存成功')
    await fetchSettings()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.admin-settings-page {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.settings-tabs {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-form {
  max-width: 600px;
}

.form-extra {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
  line-height: 1.5;
}

.logo-preview {
  max-width: 200px;
  max-height: 60px;
  object-fit: contain;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  padding: 4px;
}

/* 移动端自适应 */
@media (max-width: 768px) {
  .admin-settings-page {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .settings-tabs {
    padding: 16px;
  }

  .settings-form {
    max-width: 100%;
  }

  .apple-accounts-section {
    max-width: 100%;
  }

  /* 表格横向滚动 */
  :deep(.el-table) {
    min-width: 600px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
  }

  :deep(.el-tabs__nav) {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .admin-settings-page {
    padding: 8px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .settings-tabs {
    padding: 12px;
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

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style>

