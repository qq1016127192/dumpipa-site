<template>
  <div class="announcements-container">
    <div class="page-header">
      <h2>公告管理</h2>
      <button class="btn-primary" @click="showCreateDialog">
        <span>+ 新增公告</span>
      </button>
    </div>

    <div class="announcements-list">
      <div 
        v-for="announcement in announcements" 
        :key="announcement.id" 
        class="announcement-card"
        :class="{ 'inactive': !announcement.status }"
      >
        <div class="announcement-header">
          <div>
            <h3>{{ announcement.title }}</h3>
            <div class="announcement-meta">
              <span class="type-badge" :class="announcement.type">
                {{ getTypeText(announcement.type) }}
              </span>
              <span class="priority-badge" :class="getPriorityClass(announcement.priority)">
                {{ getPriorityText(announcement.priority) }}
              </span>
              <span 
                class="status-badge" 
                :class="announcement.status ? 'active' : 'inactive'"
              >
                {{ announcement.status ? '启用' : '禁用' }}
              </span>
            </div>
          </div>
        </div>

        <div class="announcement-content">
          <p>{{ announcement.content }}</p>
        </div>

        <div class="announcement-info">
          <div class="info-item">
            <span class="label">发布时间:</span>
            <span>{{ formatDate(announcement.publish_at || announcement.created_at) }}</span>
          </div>
          <div class="info-item" v-if="announcement.expires_at">
            <span class="label">过期时间:</span>
            <span>{{ formatDate(announcement.expires_at) }}</span>
          </div>
        </div>

        <div class="announcement-actions">
          <button class="btn-edit" @click="editAnnouncement(announcement)">编辑</button>
          <button class="btn-delete" @click="deleteAnnouncementConfirm(announcement.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ isEdit ? '编辑公告' : '新增公告' }}</h3>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>公告标题 *</label>
            <input 
              v-model="formData.title" 
              type="text" 
              placeholder="请输入公告标题"
            />
          </div>

          <div class="form-group">
            <label>公告内容 *</label>
            <textarea 
              v-model="formData.content" 
              rows="6"
              placeholder="请输入公告内容"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>公告类型</label>
              <select v-model="formData.type">
                <option value="info">信息</option>
                <option value="success">成功</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
              </select>
            </div>
            <div class="form-group">
              <label>优先级</label>
              <select v-model.number="formData.priority">
                <option :value="0">普通</option>
                <option :value="1">重要</option>
                <option :value="2">紧急</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>发布时间</label>
              <input 
                v-model="formData.publish_at" 
                type="datetime-local"
              />
            </div>
            <div class="form-group">
              <label>过期时间</label>
              <input 
                v-model="formData.expires_at" 
                type="datetime-local"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>显示策略</label>
              <select v-model="formData.display_strategy">
                <option value="always">每次显示</option>
                <option value="once">仅显示一次</option>
                <option value="hourly">按间隔显示</option>
              </select>
            </div>
            <div class="form-group">
              <label>显示间隔(小时)</label>
              <input 
                v-model.number="formData.display_interval" 
                type="number" 
                min="1"
                placeholder="仅用于按间隔显示"
                :disabled="formData.display_strategy !== 'hourly'"
              />
            </div>
          </div>

          <div class="form-group">
            <label>状态</label>
            <select v-model.number="formData.status">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialog">取消</button>
          <button class="btn-submit" @click="submitForm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '@/api/announcement'

// 数据
const announcements = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  type: 'info',
  priority: 0,
  status: 1,
  publish_at: '',
  expires_at: '',
  display_strategy: 'always',
  display_interval: null
})

// 加载公告列表
const loadAnnouncements = async () => {
  try {
    const res = await getAllAnnouncements()
    if (res.ok) {
      announcements.value = res.data?.announcements || res.announcements || []
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载公告列表失败')
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  currentId.value = null
  formData.value = {
    title: '',
    content: '',
    type: 'info',
    priority: 0,
    status: 1,
    publish_at: '',
    expires_at: '',
    display_strategy: 'always',
    display_interval: null
  }
  showDialog.value = true
}

// 编辑公告
const editAnnouncement = (announcement: any) => {
  isEdit.value = true
  currentId.value = announcement.id
  formData.value = {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    status: announcement.status,
    publish_at: announcement.publish_at ? new Date(announcement.publish_at).toISOString().slice(0, 16) : '',
    expires_at: announcement.expires_at ? new Date(announcement.expires_at).toISOString().slice(0, 16) : '',
    display_strategy: announcement.display_strategy || 'always',
    display_interval: announcement.display_interval || null
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 提交表单
const submitForm = async () => {
  if (!formData.value.title || !formData.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  try {
    if (isEdit.value && currentId.value) {
      await updateAnnouncement(currentId.value, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createAnnouncement(formData.value)
      ElMessage.success('创建成功')
    }
    closeDialog()
    loadAnnouncements()
  } catch (err: any) {
    ElMessage.error(err.msg || '操作失败')
  }
}

// 删除公告确认
const deleteAnnouncementConfirm = (id: number) => {
  ElMessageBox.confirm('确定要删除这个公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAnnouncement(id)
      ElMessage.success('删除成功')
      loadAnnouncements()
    } catch (err: any) {
      ElMessage.error(err.msg || '删除失败')
    }
  }).catch(() => {})
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: any = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误'
  }
  return typeMap[type] || type
}

// 获取优先级文本
const getPriorityText = (priority: number) => {
  const priorityMap: any = {
    0: '普通',
    1: '重要',
    2: '紧急'
  }
  return priorityMap[priority] || '普通'
}

// 获取优先级样式类
const getPriorityClass = (priority: number) => {
  const classMap: any = {
    0: 'normal',
    1: 'important',
    2: 'urgent'
  }
  return classMap[priority] || 'normal'
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped lang="scss">
.announcements-container {
  padding: 20px;
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
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #40a9ff;
  }
}

.announcements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.announcement-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;

  &.inactive {
    opacity: 0.6;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.announcement-header {
  margin-bottom: 15px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
    word-break: break-word;
  }
}

.announcement-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-badge, .priority-badge, .status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.type-badge {
  &.info {
    background: #e6f7ff;
    color: #1890ff;
  }
  &.success {
    background: #f6ffed;
    color: #52c41a;
  }
  &.warning {
    background: #fffbe6;
    color: #faad14;
  }
  &.error {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.priority-badge {
  &.normal {
    background: #f0f0f0;
    color: #666;
  }
  &.important {
    background: #fff1f0;
    color: #ff7a45;
  }
  &.urgent {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.status-badge {
  &.active {
    background: #f6ffed;
    color: #52c41a;
  }
  &.inactive {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.announcement-content {
  margin-bottom: 15px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
  }
}

.announcement-info {
  margin-bottom: 15px;
  padding-top: 15px;
  border-top: 1px dashed #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;

  .label {
    color: #999;
  }
}

.announcement-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-delete:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;

  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #333;
  }
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
  }

  input, textarea, select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }

  textarea {
    resize: vertical;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel, .btn-submit {
  padding: 8px 20px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-submit {
  background: #1890ff;
  color: white;
  border-color: #1890ff;

  &:hover {
    background: #40a9ff;
  }
}

/* 移动端自适应 */
@media (max-width: 768px) {
  .announcements-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .btn-primary {
    width: 100%;
  }

  .announcements-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .announcement-card {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .dialog {
    max-width: 95%;
  }
}
</style>
