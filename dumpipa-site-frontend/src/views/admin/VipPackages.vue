<template>
  <div class="vip-packages-container">
    <div class="page-header">
      <h2>会员套餐管理</h2>
      <button class="btn-primary" @click="showCreateDialog">
        <span>+ 新增套餐</span>
      </button>
    </div>

    <div class="packages-list">
      <div 
        v-for="pkg in packages" 
        :key="pkg.id" 
        class="package-card"
        :class="{ 'inactive': !pkg.is_active }"
      >
        <div class="package-header">
          <h3>{{ pkg.name }}</h3>
          <div class="package-badges">
            <span class="badge level-badge">等级 {{ pkg.vip_level }}</span>
            <span 
              class="badge status-badge" 
              :class="pkg.is_active ? 'active' : 'inactive'"
            >
              {{ pkg.is_active ? '启用' : '禁用' }}
            </span>
          </div>
        </div>

        <div class="package-info">
          <div class="info-item">
            <label>价格：</label>
            <span class="price">¥{{ pkg.price }}</span>
          </div>
          <div class="info-item">
            <label>金币价格：</label>
            <span class="coin-price">{{ pkg.coin_price }} 金币</span>
          </div>
          <div class="info-item">
            <label>有效期：</label>
            <span>{{ pkg.duration }} 天</span>
          </div>
          <div class="info-item">
            <label>排序：</label>
            <span>{{ pkg.sort_order }}</span>
          </div>
        </div>

        <div class="package-description">
          <label>描述：</label>
          <p>{{ pkg.description || '无' }}</p>
        </div>

        <div class="package-actions">
          <button class="btn-edit" @click="editPackage(pkg)">编辑</button>
          <button class="btn-delete" @click="deletePackageConfirm(pkg.id)">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ isEdit ? '编辑套餐' : '新增套餐' }}</h3>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>套餐名称 *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="例如：月度会员"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>会员等级 *</label>
              <input 
                v-model.number="formData.vip_level" 
                type="number" 
                min="1"
                placeholder="1"
              />
            </div>
            <div class="form-group">
              <label>有效天数 *</label>
              <input 
                v-model.number="formData.duration" 
                type="number" 
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>价格（¥）*</label>
              <input 
                v-model.number="formData.price" 
                type="number" 
                step="0.01"
                min="0"
                placeholder="9.90"
              />
            </div>
            <div class="form-group">
              <label>金币价格</label>
              <input 
                v-model.number="formData.coin_price" 
                type="number" 
                step="0.01"
                min="0"
                placeholder="100.00"
              />
            </div>
          </div>

          <div class="form-group">
            <label>套餐描述</label>
            <textarea 
              v-model="formData.description" 
              rows="3"
              placeholder="套餐详细介绍..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>排序</label>
              <input 
                v-model.number="formData.sort_order" 
                type="number" 
                placeholder="0"
              />
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model.number="formData.is_active">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>
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
  getVipPackages, 
  createVipPackage, 
  updateVipPackage, 
  deleteVipPackage 
} from '@/api/vipCoin'

// 数据
const packages = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

// 表单数据
const formData = ref({
  name: '',
  vip_level: 1,
  price: 0,
  duration: 30,
  coin_price: 0,
  description: '',
  is_active: 1,
  sort_order: 0
})

// 加载套餐列表
const loadPackages = async () => {
  try {
    const res = await getVipPackages(true)
    
    console.log('📥 会员套餐API响应（管理后台）:', {
      ok: res.ok,
      hasPackages: !!res.packages,
      hasData: !!res.data,
      packagesLength: res.packages?.length || res.data?.packages?.length || 0,
      keys: Object.keys(res),
    })
    
    // 兼容两种响应格式：
    // 1. { ok: 1, packages: [...] } - 直接返回
    // 2. { ok: 1, data: { packages: [...] } } - 放在data字段中
    const packagesData = res.packages || res.data?.packages || []
    
    if (res.ok === 1 && packagesData.length > 0) {
      packages.value = packagesData
      console.log('📊 处理后的会员套餐数据:', { packagesCount: packagesData.length })
    } else if (res.ok === 1 && packagesData.length === 0) {
      packages.value = []
      console.log('会员套餐数据为空')
    } else {
      console.warn('会员套餐API返回格式不正确:', res)
      packages.value = []
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载套餐列表失败')
    console.error('加载套餐列表失败:', err)
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  currentId.value = null
  formData.value = {
    name: '',
    vip_level: 1,
    price: 0,
    duration: 30,
    coin_price: 0,
    description: '',
    is_active: 1,
    sort_order: 0
  }
  showDialog.value = true
}

// 编辑套餐
const editPackage = (pkg: any) => {
  isEdit.value = true
  currentId.value = pkg.id
  formData.value = {
    name: pkg.name,
    vip_level: pkg.vip_level,
    price: pkg.price,
    duration: pkg.duration,
    coin_price: pkg.coin_price || 0,
    description: pkg.description || '',
    is_active: pkg.is_active,
    sort_order: pkg.sort_order || 0
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 提交表单
const submitForm = async () => {
  // 验证
  if (!formData.value.name) {
    ElMessage.warning('请输入套餐名称')
    return
  }
  if (formData.value.price <= 0) {
    ElMessage.warning('请输入有效的价格')
    return
  }
  if (formData.value.duration <= 0) {
    ElMessage.warning('请输入有效的天数')
    return
  }

  try {
    if (isEdit.value && currentId.value) {
      await updateVipPackage(currentId.value, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createVipPackage(formData.value)
      ElMessage.success('创建成功')
    }
    closeDialog()
    loadPackages()
  } catch (err: any) {
    ElMessage.error(err.msg || '操作失败')
  }
}

// 删除套餐确认
const deletePackageConfirm = (id: number) => {
  ElMessageBox.confirm('确定要删除这个套餐吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteVipPackage(id)
      ElMessage.success('删除成功')
      loadPackages()
    } catch (err: any) {
      ElMessage.error(err.msg || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadPackages()
})
</script>

<style scoped lang="scss">
.vip-packages-container {
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

.packages-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.package-card {
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

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }
}

.package-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.level-badge {
  background: #e6f7ff;
  color: #1890ff;
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

.package-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;

  label {
    color: #999;
    font-size: 14px;
  }

  span {
    color: #333;
    font-size: 14px;
  }

  .price {
    color: #ff4d4f;
    font-weight: bold;
    font-size: 16px;
  }

  .coin-price {
    color: #fa8c16;
    font-weight: bold;
  }
}

.package-description {
  margin-bottom: 15px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;

  label {
    display: block;
    color: #999;
    font-size: 12px;
    margin-bottom: 5px;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
  }
}

.package-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
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
  max-width: 600px;
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

  input,
  textarea,
  select {
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

.btn-cancel,
.btn-submit {
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
  .vip-packages-container {
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

  .packages-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .package-card {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .dialog {
    max-width: 95%;
  }
}

@media (max-width: 480px) {
  .vip-packages-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .package-card {
    padding: 12px;
  }

  .dialog {
    width: 100%;
  }
}
</style>

