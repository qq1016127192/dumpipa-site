<template>
  <div class="api-docs-page">
    <div class="page-header">
      <h1 class="page-title">API 开发文档</h1>
      <el-button type="primary" @click="scrollToSection('quick-start')">
        <i class="fa fa-rocket mr-2"></i>快速开始
      </el-button>
    </div>

    <!-- 在线测试工具 -->
    <div class="api-tester-section">
      <h2>🧪 在线测试工具</h2>
      <el-alert
        title="提示：分站系统暂不支持 API Token"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        请前往主站 (www.dumpipa.com) 创建和管理 API Token，然后在此测试
      </el-alert>
      <el-form :model="testForm" label-width="100px">
        <el-form-item label="API Token">
          <el-input
            v-model="testForm.token"
            type="password"
            placeholder="请输入主站的 API Token"
            show-password
          />
          <div class="form-tip">需要使用主站 (www.dumpipa.com) 的 API Token</div>
        </el-form-item>
        
        <el-form-item label="接口地址">
          <el-select v-model="testForm.endpoint" placeholder="选择要测试的接口" @change="handleEndpointChange">
            <el-option label="GET /api/auth/me - 获取当前用户信息" value="GET:/api/auth/me" />
            <el-option label="GET /api/apps/:bundleId - 获取应用详情" value="GET:/api/apps/:bundleId" />
            <el-option label="GET /api/apps/search - 搜索应用" value="GET:/api/apps/search" />
            <el-option label="GET /api/tasks - 获取任务列表" value="GET:/api/tasks" />
            <el-option label="GET /api/tasks/:id - 获取任务详情" value="GET:/api/tasks/:id" />
            <el-option label="POST /api/tasks - 创建脱壳任务" value="POST:/api/tasks" />
          </el-select>
        </el-form-item>

        <!-- 动态参数 -->
        <div v-if="testForm.endpoint">
          <el-form-item v-if="testForm.endpoint.includes(':bundleId')" label="Bundle ID">
            <el-input v-model="testForm.bundleId" placeholder="例如：com.tencent.xin" />
          </el-form-item>

          <el-form-item v-if="testForm.endpoint.includes(':id')" label="任务 ID">
            <el-input v-model="testForm.taskId" type="number" placeholder="例如：12345" />
          </el-form-item>

          <el-form-item v-if="testForm.endpoint === 'GET:/api/apps/:bundleId' || testForm.endpoint === 'GET:/api/apps/search'" label="地区代码">
            <el-input v-model="testForm.country" placeholder="cn, us, tw, hk, jp 等" />
          </el-form-item>

          <el-form-item v-if="testForm.endpoint === 'GET:/api/apps/search'" label="搜索关键词">
            <el-input v-model="testForm.keyword" placeholder="例如：微信" />
          </el-form-item>

          <el-form-item v-if="testForm.endpoint === 'POST:/api/tasks'" label="请求体">
            <el-input
              v-model="testForm.requestBody"
              type="textarea"
              :rows="6"
              placeholder='{"bundle_id":"com.tencent.xin","version":"12345678","country":"cn"}'
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" @click="testApi" :loading="testing">
            <i class="fa fa-play mr-2"></i>发送请求
          </el-button>
          <el-button @click="clearTestResult">
            <i class="fa fa-trash mr-2"></i>清空结果
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result">
        <div class="result-header">
          <h3>响应结果</h3>
          <el-tag :type="testResult.status < 400 ? 'success' : 'danger'" size="large">
            HTTP {{ testResult.status }}
          </el-tag>
        </div>
        
        <div class="result-section">
          <h4>请求信息</h4>
          <div class="code-block">
            <pre><code>{{ testResult.request }}</code></pre>
          </div>
        </div>

        <div class="result-section">
          <h4>响应头</h4>
          <div class="code-block">
            <pre><code>{{ testResult.headers }}</code></pre>
          </div>
        </div>

        <div class="result-section">
          <h4>响应体</h4>
          <div class="code-block">
            <pre><code>{{ testResult.body }}</code></pre>
          </div>
        </div>

        <div class="result-section">
          <h4>响应时间</h4>
          <div class="response-time">{{ testResult.time }} ms</div>
        </div>
      </div>
    </div>

    <!-- 目录导航 -->
    <div class="toc-section">
      <h2>📚 目录</h2>
      <ul class="toc-list">
        <li><a href="#introduction" @click.prevent="scrollToSection('introduction')">简介</a></li>
        <li><a href="#authentication" @click.prevent="scrollToSection('authentication')">认证方式</a></li>
        <li><a href="#quick-start" @click.prevent="scrollToSection('quick-start')">快速开始</a></li>
        <li><a href="#endpoints" @click.prevent="scrollToSection('endpoints')">API 接口</a>
          <ul>
            <li><a href="#apps-api" @click.prevent="scrollToSection('apps-api')">应用接口</a></li>
            <li><a href="#tasks-api" @click.prevent="scrollToSection('tasks-api')">任务接口</a></li>
            <li><a href="#user-api" @click.prevent="scrollToSection('user-api')">用户接口</a></li>
          </ul>
        </li>
        <li><a href="#error-codes" @click.prevent="scrollToSection('error-codes')">错误码</a></li>
        <li><a href="#rate-limits" @click.prevent="scrollToSection('rate-limits')">限流说明</a></li>
        <li><a href="#examples" @click.prevent="scrollToSection('examples')">示例代码</a></li>
      </ul>
    </div>

    <!-- 简介 -->
    <section id="introduction" class="doc-section">
      <h2>📖 简介</h2>
      <p>Dumpipa API 提供了一套完整的 RESTful API，允许开发者通过程序化方式访问平台的所有功能。</p>
      
      <div class="info-box">
        <h3>✨ 主要特性</h3>
        <ul>
          <li>🔐 安全的 Token 认证机制</li>
          <li>📱 完整的应用信息查询</li>
          <li>🚀 自动化任务创建和管理</li>
          <li>📊 实时任务进度跟踪</li>
          <li>⚡ 高性能的 API 响应</li>
          <li>🔄 稳定的版本管理</li>
        </ul>
      </div>

      <div class="info-box warning">
        <h3>⚠️ 重要提示</h3>
        <ul>
          <li>请妥善保管您的 API Token，不要泄露给他人</li>
          <li>所有 API 请求都需要携带有效的 Token</li>
          <li>API 有请求频率限制，请合理使用</li>
          <li>建议在生产环境使用 HTTPS</li>
        </ul>
      </div>
    </section>

    <!-- 认证方式 -->
    <section id="authentication" class="doc-section">
      <h2>🔐 认证方式</h2>
      <p>所有 API 请求都需要在请求头中携带 API Token 进行认证。</p>

      <h3>获取 API Token</h3>
      <p>请在主站 (www.dumpipa.com) 的 Token 管理页面创建一个新的 Token。</p>
      <p><strong>⚠️ 重要：</strong>创建 Token 时，<strong>域名必须填写</strong>。该 Token 只能在指定域名下使用，提高安全性。</p>
      <p><strong>说明：</strong>分站系统使用的是服务器端配置的 Token（`main_site_token`），需要绑定分站域名。</p>

      <h3>域名绑定</h3>
      <p><strong>⚠️ 域名必须填写：</strong>创建 Token 时，必须绑定域名。绑定域名后，该 Token 只能在指定域名下使用，提高安全性。</p>
      <div class="info-box warning">
        <h4>⚠️ 域名验证说明</h4>
        <ul>
          <li><strong>域名必须填写</strong>：创建 Token 时，域名是必填项，不能为空</li>
          <li><strong>浏览器请求</strong>：Token 绑定了域名，请求时必须从该域名发起，否则会返回 403 错误</li>
          <li><strong>服务器端调用</strong>：服务器端调用（如分站后端调用主站 API）没有 Origin/Referer 头，系统会根据 Token 绑定的域名进行验证</li>
          <li><strong>系统自动验证</strong>：系统会自动从请求头（Origin 或 Referer）中提取域名进行验证</li>
          <li><strong>分站系统配置</strong>：分站使用的是系统配置的 Token（`main_site_token`），需要绑定分站域名</li>
        </ul>
      </div>

      <h3>认证方式</h3>
      <p>在每个 API 请求的 Header 中添加以下字段：</p>
      
      <div class="code-block">
        <div class="code-header">
          <span>HTTP Header</span>
          <el-button size="small" text @click="copyCode('Authorization: Bearer YOUR_API_TOKEN')">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>Authorization: Bearer YOUR_API_TOKEN</code></pre>
      </div>

      <h3>认证示例</h3>
      <div class="code-block">
        <div class="code-header">
          <span>curl</span>
          <el-button size="small" text @click="copyCode(exampleCurl)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ exampleCurl }}</code></pre>
      </div>
    </section>

    <!-- 快速开始 -->
    <section id="quick-start" class="doc-section">
      <h2>🚀 快速开始</h2>
      
      <h3>1. 创建 API Token</h3>
      <p>访问主站 (www.dumpipa.com) 的 Token 管理页面，创建一个新的 Token。</p>

      <h3>2. 测试连接</h3>
      <p>使用以下命令测试 API 连接：</p>
      <div class="code-block">
        <div class="code-header">
          <span>测试 API 连接</span>
          <el-button size="small" text @click="copyCode(quickStartTest)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ quickStartTest }}</code></pre>
      </div>

      <h3>3. 查询应用信息</h3>
      <div class="code-block">
        <div class="code-header">
          <span>查询微信应用信息</span>
          <el-button size="small" text @click="copyCode(quickStartApp)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ quickStartApp }}</code></pre>
      </div>

      <h3>4. 创建脱壳任务</h3>
      <div class="code-block">
        <div class="code-header">
          <span>创建任务示例</span>
          <el-button size="small" text @click="copyCode(quickStartTask)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ quickStartTask }}</code></pre>
      </div>
    </section>

    <!-- API 接口列表 -->
    <section id="endpoints" class="doc-section">
      <h2>📡 API 接口</h2>
      <p>以下是所有可用的 API 接口列表。</p>

      <!-- 应用接口 -->
      <div id="apps-api" class="api-category">
        <h3>📱 应用接口</h3>

        <!-- 获取应用详情 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/apps/:bundleId</span>
          </div>
          <p class="endpoint-desc">获取指定应用的详细信息和历史版本列表</p>
          
          <h4>请求参数</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bundleId</code></td>
                <td>String</td>
                <td>是</td>
                <td>应用的 Bundle ID，例如：com.tencent.xin</td>
              </tr>
              <tr>
                <td><code>country</code></td>
                <td>String</td>
                <td>否</td>
                <td>地区代码，默认：cn（支持：cn, us, tw, hk, jp 等）</td>
              </tr>
              <tr>
                <td><code>limit</code></td>
                <td>Number</td>
                <td>否</td>
                <td>返回版本数量，默认：5</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ appDetailResponse }}</code></pre>
          </div>
        </div>

        <!-- 搜索应用 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/apps/search</span>
          </div>
          <p class="endpoint-desc">搜索应用</p>
          
          <h4>请求参数</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>keyword</code></td>
                <td>String</td>
                <td>是</td>
                <td>搜索关键词</td>
              </tr>
              <tr>
                <td><code>country</code></td>
                <td>String</td>
                <td>否</td>
                <td>地区代码，默认：cn</td>
              </tr>
              <tr>
                <td><code>limit</code></td>
                <td>Number</td>
                <td>否</td>
                <td>返回数量，默认：10，最大：50</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ searchResponse }}</code></pre>
          </div>
        </div>

        <!-- 获取下载链接 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/apps/download-url</span>
          </div>
          <p class="endpoint-desc">获取已脱壳应用的下载链接</p>
          
          <h4>请求参数</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bundle_id</code></td>
                <td>String</td>
                <td>是</td>
                <td>应用的 Bundle ID</td>
              </tr>
              <tr>
                <td><code>version</code></td>
                <td>String</td>
                <td>是</td>
                <td>版本号（App Store 发行号）</td>
              </tr>
              <tr>
                <td><code>country</code></td>
                <td>String</td>
                <td>否</td>
                <td>地区代码，默认：cn</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ downloadUrlResponse }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 任务接口 -->
      <div id="tasks-api" class="api-category">
        <h3>🚀 任务接口</h3>

        <!-- 创建任务 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/api/tasks</span>
          </div>
          <p class="endpoint-desc">创建一个新的脱壳任务</p>
          
          <h4>请求体</h4>
          <div class="code-block">
            <pre><code>{{ createTaskRequest }}</code></pre>
          </div>

          <h4>参数说明</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bundle_id</code></td>
                <td>String</td>
                <td>是</td>
                <td>应用的 Bundle ID</td>
              </tr>
              <tr>
                <td><code>version</code></td>
                <td>String</td>
                <td>是</td>
                <td>版本号（App Store 发行号）</td>
              </tr>
              <tr>
                <td><code>country</code></td>
                <td>String</td>
                <td>否</td>
                <td>地区代码，默认：cn</td>
              </tr>
              <tr>
                <td><code>device_id</code></td>
                <td>Number</td>
                <td>否</td>
                <td>指定设备 ID，不指定则自动选择</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ createTaskResponse }}</code></pre>
          </div>
        </div>

        <!-- 获取任务列表 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/tasks</span>
          </div>
          <p class="endpoint-desc">获取当前用户的任务列表</p>
          
          <h4>请求参数</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>page</code></td>
                <td>Number</td>
                <td>否</td>
                <td>页码，默认：1</td>
              </tr>
              <tr>
                <td><code>limit</code></td>
                <td>Number</td>
                <td>否</td>
                <td>每页数量，默认：10，最大：50</td>
              </tr>
              <tr>
                <td><code>status</code></td>
                <td>String</td>
                <td>否</td>
                <td>任务状态：running, done, error, queued</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ taskListResponse }}</code></pre>
          </div>
        </div>

        <!-- 获取任务详情 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/tasks/:id</span>
          </div>
          <p class="endpoint-desc">获取指定任务的详细信息</p>
          
          <h4>请求参数</h4>
          <table class="params-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>id</code></td>
                <td>Number</td>
                <td>是</td>
                <td>任务 ID</td>
              </tr>
            </tbody>
          </table>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ taskDetailResponse }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 用户接口 -->
      <div id="user-api" class="api-category">
        <h3>👤 用户接口</h3>

        <!-- 获取当前用户信息 -->
        <div class="api-endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/auth/me</span>
          </div>
          <p class="endpoint-desc">获取当前用户信息</p>

          <h4>响应示例</h4>
          <div class="code-block">
            <pre><code>{{ userInfoResponse }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 错误码 -->
    <section id="error-codes" class="doc-section">
      <h2>❌ 错误码</h2>
      <p>当 API 请求失败时，响应中会包含错误信息。</p>

      <h3>错误响应格式</h3>
      <div class="code-block">
        <pre><code>{{ errorResponse }}</code></pre>
      </div>

      <h3>常见错误码</h3>
      <table class="params-table">
        <thead>
          <tr>
            <th>HTTP 状态码</th>
            <th>说明</th>
            <th>解决方案</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>400</code></td>
            <td>请求参数错误</td>
            <td>检查请求参数是否正确</td>
          </tr>
          <tr>
            <td><code>401</code></td>
            <td>未认证或 Token 无效</td>
            <td>检查 Token 是否正确，是否已过期</td>
          </tr>
          <tr>
            <td><code>403</code></td>
            <td>权限不足</td>
            <td>检查账户权限或金币余额</td>
          </tr>
          <tr>
            <td><code>404</code></td>
            <td>资源不存在</td>
            <td>检查请求的资源 ID 是否正确</td>
          </tr>
          <tr>
            <td><code>429</code></td>
            <td>请求过于频繁</td>
            <td>降低请求频率，等待后重试</td>
          </tr>
          <tr>
            <td><code>500</code></td>
            <td>服务器内部错误</td>
            <td>稍后重试，如持续出现请联系客服</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 限流说明 -->
    <section id="rate-limits" class="doc-section">
      <h2>⏱️ 限流说明</h2>
      <p>为保证服务稳定，API 实施了请求频率限制。</p>

      <div class="info-box">
        <h3>限流规则</h3>
        <ul>
          <li><strong>普通用户</strong>：每分钟最多 60 次请求</li>
          <li><strong>VIP 用户</strong>：每分钟最多 120 次请求</li>
          <li><strong>创建任务</strong>：每小时最多 50 次</li>
        </ul>
      </div>

      <h3>响应头</h3>
      <p>每个 API 响应都会包含以下头部信息：</p>
      <div class="code-block">
        <pre><code>X-RateLimit-Limit: 60        # 每分钟请求限制
X-RateLimit-Remaining: 45    # 剩余请求次数
X-RateLimit-Reset: 1699999999 # 限制重置时间（Unix 时间戳）</code></pre>
      </div>

      <h3>超过限流</h3>
      <p>当超过请求限制时，API 会返回 HTTP 429 状态码，并在响应头中包含 <code>Retry-After</code> 字段，表示多少秒后可以重试。</p>
    </section>

    <!-- 示例代码 -->
    <section id="examples" class="doc-section">
      <h2>💻 示例代码</h2>
      
      <h3>Python 示例</h3>
      <div class="code-block">
        <div class="code-header">
          <span>Python</span>
          <el-button size="small" text @click="copyCode(pythonExample)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ pythonExample }}</code></pre>
      </div>

      <h3>JavaScript (Node.js) 示例</h3>
      <div class="code-block">
        <div class="code-header">
          <span>JavaScript</span>
          <el-button size="small" text @click="copyCode(jsExample)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ jsExample }}</code></pre>
      </div>

      <h3>cURL 示例</h3>
      <div class="code-block">
        <div class="code-header">
          <span>cURL</span>
          <el-button size="small" text @click="copyCode(curlExample)">
            <i class="fa fa-copy"></i> 复制
          </el-button>
        </div>
        <pre><code>{{ curlExample }}</code></pre>
      </div>
    </section>

    <!-- 返回顶部按钮 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 测试表单
const testForm = reactive({
  token: '',
  endpoint: '',
  bundleId: '',
  taskId: '',
  country: 'cn',
  keyword: '',
  requestBody: ''
})

const testing = ref(false)
const testResult = ref<any>(null)

// 处理接口选择变化
const handleEndpointChange = () => {
  // 重置动态参数
  testForm.bundleId = ''
  testForm.taskId = ''
  testForm.country = 'cn'
  testForm.keyword = ''
  testForm.requestBody = ''
  
  // 为某些接口设置默认值
  if (testForm.endpoint === 'POST:/api/tasks') {
    testForm.requestBody = JSON.stringify({
      bundle_id: 'com.tencent.xin',
      version: '12345678',
      country: 'cn'
    }, null, 2)
  }
}

// 测试 API
const testApi = async () => {
  if (!testForm.token) {
    ElMessage.warning('请输入 API Token')
    return
  }

  if (!testForm.endpoint) {
    ElMessage.warning('请选择要测试的接口')
    return
  }

  testing.value = true
  const startTime = Date.now()

  try {
    const [method, path] = testForm.endpoint.split(':')
    
    // 类型检查
    if (!method || !path) {
      ElMessage.error('接口格式错误')
      testing.value = false
      return
    }
    
    let url = path

    // 替换路径参数
    if (path.includes(':bundleId') && testForm.bundleId) {
      url = path.replace(':bundleId', testForm.bundleId)
    }
    if (path.includes(':id') && testForm.taskId) {
      url = path.replace(':id', testForm.taskId)
    }

    // 构建查询参数
    const params: any = {}
    if (testForm.country && (url.includes('/apps/') || url.includes('/tasks'))) {
      params.country = testForm.country
    }
    if (testForm.keyword && url.includes('/search')) {
      params.keyword = testForm.keyword
    }

    // 发送请求
    const config: any = {
      method: method.toLowerCase(),
      url: url,
      headers: {
        'Authorization': `Bearer ${testForm.token}`
      },
      params: Object.keys(params).length > 0 ? params : undefined
    }

    if (method === 'POST' && testForm.requestBody) {
      try {
        config.data = JSON.parse(testForm.requestBody)
      } catch (e) {
        ElMessage.error('请求体 JSON 格式错误')
        testing.value = false
        return
      }
    }

    const response = await axios(config)
    const endTime = Date.now()

    // 构建请求信息
    let requestInfo = `${method} ${url}`
    if (Object.keys(params).length > 0) {
      requestInfo += `?${new URLSearchParams(params).toString()}`
    }
    requestInfo += `\nAuthorization: Bearer ${testForm.token.substring(0, 10)}...`
    if (config.data) {
      requestInfo += `\n\n${JSON.stringify(config.data, null, 2)}`
    }

    // 保存测试结果
    testResult.value = {
      status: response.status,
      request: requestInfo,
      headers: JSON.stringify({
        'Content-Type': response.headers['content-type'],
        'X-RateLimit-Limit': response.headers['x-ratelimit-limit'],
        'X-RateLimit-Remaining': response.headers['x-ratelimit-remaining'],
        'X-RateLimit-Reset': response.headers['x-ratelimit-reset']
      }, null, 2),
      body: JSON.stringify(response.data, null, 2),
      time: endTime - startTime
    }

    ElMessage.success('请求成功')
  } catch (error: any) {
    const endTime = Date.now()
    
    // 构建错误响应
    testResult.value = {
      status: error.response?.status || 0,
      request: `${testForm.endpoint.split(':')[0]} ${testForm.endpoint.split(':')[1]}\nAuthorization: Bearer ${testForm.token.substring(0, 10)}...`,
      headers: error.response?.headers ? JSON.stringify({
        'Content-Type': error.response.headers['content-type']
      }, null, 2) : '{}',
      body: error.response?.data ? JSON.stringify(error.response.data, null, 2) : JSON.stringify({ error: error.message }, null, 2),
      time: endTime - startTime
    }

    ElMessage.error('请求失败: ' + (error.response?.data?.msg || error.message))
  } finally {
    testing.value = false
  }
}

// 清空测试结果
const clearTestResult = () => {
  testResult.value = null
}

// 示例代码（已更新域名为 www.dumpipa.com）
const exampleCurl = `curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://www.dumpipa.com/api/auth/me`

const quickStartTest = `curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://www.dumpipa.com/api/auth/me`

const quickStartApp = `curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  "https://www.dumpipa.com/api/apps/com.tencent.xin?country=cn&limit=5"`

const quickStartTask = `curl -X POST \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bundle_id": "com.tencent.xin",
    "version": "12345678",
    "country": "cn"
  }' \\
  https://www.dumpipa.com/api/tasks`

const appDetailResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "app": {
    "trackId": 414478124,
    "trackName": "微信",
    "bundleId": "com.tencent.xin",
    "artistName": "Tencent Technology (Shenzhen) Company Limited",
    "artworkUrl100": "https://...",
    "version": "8.0.46",
    "price": "0.00",
    "formattedPrice": "Free",
    "fileSizeBytes": 369098752,
    "minimumOsVersion": "12.0"
  },
  "versions": [
    {
      "version": "12345678",
      "display_version": "8.0.46",
      "isDumped": true,
      "size": "350.23 MB",
      "alist_url": "https://..."
    }
  ]
}`

const searchResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "apps": [
    {
      "trackId": 414478124,
      "trackName": "微信",
      "bundleId": "com.tencent.xin",
      "artistName": "Tencent Technology...",
      "artworkUrl100": "https://...",
      "version": "8.0.46"
    }
  ],
  "total": 1
}`

const downloadUrlResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "download_url": "https://pan.example.com/ipa/xxx.ipa",
  "size": "350.23 MB"
}`

const createTaskRequest = `{
  "bundle_id": "com.tencent.xin",
  "version": "12345678",
  "country": "cn",
  "device_id": 1
}`

const createTaskResponse = `{
  "ok": 1,
  "msg": "任务创建成功",
  "task_id": 12345,
  "status": "queued"
}`

const taskListResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "tasks": [
    {
      "id": 12345,
      "bundle_id": "com.tencent.xin",
      "app_name": "微信",
      "version": "12345678",
      "real_version": "8.0.46",
      "status": "done",
      "progress": 100,
      "status_message": "任务完成",
      "alist_url": "https://...",
      "created_at": "2025-11-07 10:30:00"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}`

const taskDetailResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "task": {
    "id": 12345,
    "bundle_id": "com.tencent.xin",
    "app_name": "微信",
    "version": "12345678",
    "real_version": "8.0.46",
    "country": "cn",
    "status": "done",
    "progress": 100,
    "status_message": "任务完成",
    "alist_url": "https://...",
    "size": 369098752,
    "device_id": 1,
    "created_at": "2025-11-07 10:30:00",
    "updated_at": "2025-11-07 10:45:00"
  }
}`

const userInfoResponse = `{
  "ok": 1,
  "msg": "操作成功",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "coins": 100.00,
    "is_vip": true,
    "vip_expires_at": "2025-12-31 23:59:59"
  }
}`

const errorResponse = `{
  "ok": 0,
  "msg": "Token 无效或已过期"
}`

const pythonExample = `import requests

API_TOKEN = "YOUR_API_TOKEN"
BASE_URL = "https://www.dumpipa.com/api"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# 获取应用信息
def get_app_info(bundle_id, country="cn"):
    url = f"{BASE_URL}/apps/{bundle_id}"
    params = {"country": country, "limit": 5}
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# 创建脱壳任务
def create_task(bundle_id, version, country="cn"):
    url = f"{BASE_URL}/tasks"
    data = {
        "bundle_id": bundle_id,
        "version": version,
        "country": country
    }
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 获取任务列表
def get_tasks(page=1, limit=10):
    url = f"{BASE_URL}/tasks"
    params = {"page": page, "limit": limit}
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# 示例使用
if __name__ == "__main__":
    # 获取微信信息
    app_info = get_app_info("com.tencent.xin", "cn")
    print(f"应用名称: {app_info['app']['trackName']}")
    
    # 创建任务
    task = create_task("com.tencent.xin", "12345678", "cn")
    print(f"任务ID: {task['task_id']}")
    
    # 获取任务列表
    tasks = get_tasks()
    print(f"任务数量: {tasks['total']}")`

const jsExample = `const axios = require('axios');

const API_TOKEN = 'YOUR_API_TOKEN';
const BASE_URL = 'https://www.dumpipa.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': \`Bearer \${API_TOKEN}\`,
    'Content-Type': 'application/json'
  }
});

// 获取应用信息
async function getAppInfo(bundleId, country = 'cn') {
  try {
    const response = await apiClient.get(\`/apps/\${bundleId}\`, {
      params: { country, limit: 5 }
    });
    return response.data;
  } catch (error) {
    console.error('获取应用信息失败:', error.response?.data || error.message);
    throw error;
  }
}

// 创建脱壳任务
async function createTask(bundleId, version, country = 'cn') {
  try {
    const response = await apiClient.post('/tasks', {
      bundle_id: bundleId,
      version: version,
      country: country
    });
    return response.data;
  } catch (error) {
    console.error('创建任务失败:', error.response?.data || error.message);
    throw error;
  }
}

// 获取任务列表
async function getTasks(page = 1, limit = 10) {
  try {
    const response = await apiClient.get('/tasks', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取任务列表失败:', error.response?.data || error.message);
    throw error;
  }
}

// 示例使用
(async () => {
  try {
    // 获取微信信息
    const appInfo = await getAppInfo('com.tencent.xin', 'cn');
    console.log('应用名称:', appInfo.app.trackName);
    
    // 创建任务
    const task = await createTask('com.tencent.xin', '12345678', 'cn');
    console.log('任务ID:', task.task_id);
    
    // 获取任务列表
    const tasks = await getTasks();
    console.log('任务数量:', tasks.total);
  } catch (error) {
    console.error('操作失败:', error);
  }
})();`

const curlExample = `# 获取应用信息
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  "https://www.dumpipa.com/api/apps/com.tencent.xin?country=cn&limit=5"

# 创建脱壳任务
curl -X POST \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bundle_id": "com.tencent.xin",
    "version": "12345678",
    "country": "cn"
  }' \\
  https://www.dumpipa.com/api/tasks

# 获取任务列表
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  "https://www.dumpipa.com/api/tasks?page=1&limit=10"

# 获取任务详情
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://www.dumpipa.com/api/tasks/12345`

// 方法
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.api-docs-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  padding-bottom: 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* 在线测试工具 */
.api-tester-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.api-tester-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.test-result {
  margin-top: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.result-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.result-section {
  margin-bottom: 20px;
}

.result-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.response-time {
  font-size: 18px;
  font-weight: 600;
  color: #10b981;
  padding: 12px;
  background: white;
  border-radius: 6px;
  text-align: center;
}

.toc-section {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toc-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin: 8px 0;
}

.toc-list a {
  color: #3b82f6;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}

.toc-list a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.toc-list ul {
  list-style: none;
  padding-left: 20px;
  margin-top: 8px;
}

.doc-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.doc-section h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.doc-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 24px 0 16px 0;
}

.doc-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
  margin: 16px 0 12px 0;
}

.doc-section p {
  color: #6b7280;
  line-height: 1.8;
  margin: 12px 0;
}

.info-box {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 4px;
}

.info-box.warning {
  background: #fef3c7;
  border-left-color: #f59e0b;
}

.info-box h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  color: #4b5563;
  line-height: 1.8;
  margin: 6px 0;
}

.code-block {
  background: #1e293b;
  border-radius: 6px;
  margin: 16px 0;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
}

.code-header span {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.code-block pre {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
}

.code-block code {
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.api-category {
  margin-top: 30px;
}

.api-endpoint {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.method {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.method.get {
  background: #10b981;
}

.method.post {
  background: #3b82f6;
}

.method.put {
  background: #f59e0b;
}

.method.delete {
  background: #ef4444;
}

.path {
  font-family: monospace;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.endpoint-desc {
  color: #6b7280;
  margin: 8px 0 16px 0;
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}

.params-table th {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border: 1px solid #e5e7eb;
}

.params-table td {
  padding: 12px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.params-table code {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  color: #1f2937;
}

.mr-2 {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .api-docs-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .doc-section,
  .api-tester-section {
    padding: 20px;
  }

  .doc-section h2 {
    font-size: 22px;
  }

  .code-block pre {
    font-size: 12px;
  }

  .params-table {
    font-size: 12px;
  }

  .params-table th,
  .params-table td {
    padding: 8px;
  }

  .endpoint-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
