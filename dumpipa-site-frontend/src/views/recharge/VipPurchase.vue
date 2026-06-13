<template>
  <div class="coin-recharge-page">
    <!-- 顶部导航栏 -->
    <div class="nut-navbar">
      <div class="nut-navbar__left" @click="goBack">
        <svg class="nut-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M642.973 1005.542 321.912 587.098a123.278 123.278 0 0 1 0-150.17l321.06-418.443a47.182 47.182 0 0 1 74.83 57.422l-321.088 418.47a28.994 28.994 0 0 0 0 35.3l321.088 418.47a47.155 47.155 0 0 1-74.83 57.395" fill="currentColor" fill-opacity="0.9"></path>
        </svg>
      </div>
      <div class="nut-navbar__title">
        <span class="title">会员开通</span>
      </div>
      <div class="nut-navbar__right"></div>
    </div>

    <!-- 我的金币 -->
    <div class="nut-cell">
      <div class="nut-cell__title">我的金币</div>
      <div class="coin-balance">
        <div class="coin-icon">
          <svg t="1677642534019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M512 896c200.298667 0 362.666667-152.810667 362.666667-341.333333s19.050667-192.533333-362.666667-192.533334S149.333333 366.144 149.333333 554.666667s162.368 341.333333 362.666667 341.333333z" fill="#FF5C00"></path>
            <path d="M149.333333 490.666667a362.666667 341.333333 0 1 0 725.333334 0 362.666667 341.333333 0 1 0-725.333334 0Z" fill="#FFCC00"></path>
            <path d="M820.224 310.698667a332.288 332.288 0 0 1 31.146667 59.349333L404.629333 816.789333a373.12 373.12 0 0 1-64.853333-25.642666z m-189.269333-142.570667c57.621333 18.816 108.629333 50.922667 148.906666 92.416L284.16 756.266667c-46.570667-35.456-83.626667-81.514667-107.008-134.314667z" fill="#FFE3B6"></path>
            <path d="M192 480a320 288 0 1 0 640 0 320 288 0 1 0-640 0Z" fill="#FF7325"></path>
            <path d="M213.333333 480a298.666667 266.666667 0 1 0 597.333334 0 298.666667 266.666667 0 1 0-597.333334 0Z" fill="#FFB329"></path>
            <path d="M808.533333 512c-17.706667 132.181333-143.722667 234.666667-296.533333 234.666667s-278.826667-102.485333-296.533333-234.666667z" fill="#FF9B1A"></path>
            <path d="M512 213.333333c108.074667 0 202.730667 51.242667 255.168 128H256.853333c52.437333-76.757333 147.093333-128 255.168-128z" fill="#FFCC00"></path>
            <path d="M587.648 510.037333l94.72-13.930666 0.298667 40.938666c-6.4 25.045333-16.426667 45.973333-30.165334 62.762667a129.92 129.92 0 0 1-51.093333 38.037333c-20.352 8.533333-46.250667 12.821333-77.674667 12.821334-38.144 0-69.290667-5.205333-93.482666-15.637334-24.170667-10.432-45.034667-28.757333-62.592-55.018666-17.557333-26.24-26.325333-59.84-26.325334-100.8 0-54.613333 15.445333-96.554667 46.314667-125.888 30.890667-29.333333 74.56-43.989333 131.050667-43.989334 44.202667 0 78.954667 8.405333 104.256 25.194667 9.962667 6.613333 28.501333 18.346667 55.594666 35.2-0.341333 16.469333-0.085333 30.549333 0.768 42.197333l-95.744 20.053334c-3.349333-10.069333-6.869333-17.408-10.538666-22.058667a61.482667 61.482667 0 0 0-22.250667-18.005333 67.328 67.328 0 0 0-29.44-6.314667c-24.576 0-43.413333 9.301333-56.490667 27.904-9.898667 13.802667-14.848 35.477333-14.848 65.024 0 36.608 5.909333 61.696 17.706667 75.264 11.818667 13.589333 28.416 20.373333 49.792 20.373333 20.736 0 36.416-5.482667 47.04-16.426666 10.602667-10.944 18.304-26.858667 23.104-47.701334z" fill="#FF5C00"></path>
            <path d="M622.933333 291.861333c18.858667 12.522667 34.112 30.058667 45.738667 52.586667l-34.24 34.197333-50.858667 10.666667c-3.349333-10.069333-6.869333-17.408-10.538666-22.058667a61.482667 61.482667 0 0 0-22.250667-18.005333 67.328 67.328 0 0 0-29.44-6.314667c-24.576 0-43.413333 9.301333-56.490667 27.904-9.898667 13.802667-14.848 35.477333-14.848 65.024 0 36.608 5.909333 61.696 17.706667 75.264 5.525333 6.357333 12.074667 11.221333 19.690667 14.592l-63.637334 63.616c-21.44-10.794667-40.149333-28.117333-56.106666-51.989333-9.92-14.848-17.045333-32.021333-21.333334-51.584l215.893334-215.893333c24.170667 3.84 44.416 11.178667 60.736 21.994666z" fill="#FFECBD"></path>
          </svg>
        </div>
        <div class="coin-amount">{{ userCoins.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 金币套餐列表 -->
    <div class="packages-section">
      <div class="packages-grid">
        <div
          v-for="pkg in vipPackages"
          :key="pkg.id"
          class="coin-pay-item"
          :class="{ selected: selectedPackage?.id === pkg.id }"
          @click="selectPackage(pkg)"
        >
          <div class="package-name-badge">{{ pkg.name }}</div>
          <svg v-if="selectedPackage?.id === pkg.id" t="1680263596756" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" class="selected-icon">
            <path d="M34.172287 948.869882l890.417609-4.90573L924.589896 62.373583 34.172287 948.869882zM605.461625 822.914192 480.882282 699.398064l22.60995-22.692838 101.228519 101.201913 213.854623-213.876112 22.60995 22.765493L605.461625 822.914192z" fill="#3369ff"></path>
          </svg>
          <div class="coin-content">
            <div class="coin-info">
              <div class="coin-icon-small">
                <svg t="1677642534019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 896c200.298667 0 362.666667-152.810667 362.666667-341.333333s19.050667-192.533333-362.666667-192.533334S149.333333 366.144 149.333333 554.666667s162.368 341.333333 362.666667 341.333333z" fill="#FF5C00"></path>
                  <path d="M149.333333 490.666667a362.666667 341.333333 0 1 0 725.333334 0 362.666667 341.333333 0 1 0-725.333334 0Z" fill="#FFCC00"></path>
                  <path d="M192 480a320 288 0 1 0 640 0 320 288 0 1 0-640 0Z" fill="#FF7325"></path>
                  <path d="M213.333333 480a298.666667 266.666667 0 1 0 597.333334 0 298.666667 266.666667 0 1 0-597.333334 0Z" fill="#FFB329"></path>
                  <path d="M808.533333 512c-17.706667 132.181333-143.722667 234.666667-296.533333 234.666667s-278.826667-102.485333-296.533333-234.666667z" fill="#FF9B1A"></path>
                  <path d="M512 213.333333c108.074667 0 202.730667 51.242667 255.168 128H256.853333c52.437333-76.757333 147.093333-128 255.168-128z" fill="#FFCC00"></path>
                </svg>
              </div>
              <div class="coin-count">{{ pkg.duration }}天</div>
            </div>
            <div class="coin-price">￥{{ parseFloat(pkg.price).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      <div class="confirm-button-wrapper">
        <el-button
          type="primary"
          class="confirm-button"
          :disabled="!selectedPackage"
          @click="handleConfirmPurchase"
        >
          确认购买
        </el-button>
      </div>
    </div>

    <!-- 底部Tabs -->
    <el-tabs v-model="activeTab" class="info-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="会员介绍" name="intro">
        <div class="tab-content">
          <div class="info-item">1、什么是会员？会员为本站提供的特权服务，开通后享受免费下载、免费砸壳等多项特权。</div>
          <div class="info-item">2、本站不提供任何破解应用、破解补丁、破解工具、破解教程等相关服务，如有相关服务请勿购买。</div>
          <div class="info-item">3、此商品为虚拟商品，未成年禁止购买。</div>
          <div class="info-item">4、购买前请您一定要仔细核对好套餐信息及付款金额，由于虚拟商品的特殊性，购买成功不支持无条件退款。</div>
          <div class="info-item">5、支付成功后会员立即生效，如未及时生效请联系售后帮您及时解决。</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="会员特权" name="usage">
        <div class="tab-content">
          <div class="info-item">1、免费下载：会员用户每天享受更多免费下载次数。</div>
          <div class="info-item">2、免费砸壳：会员用户每天享受更多免费砸壳次数。</div>
          <div class="info-item">3、专用通道：会员用户享受更快的下载和处理速度。</div>
          <div class="info-item">4、优先服务：会员用户的工单和咨询将优先处理。</div>
          <div class="info-item">5、专属客服：会员用户享受专属客服支持。</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="售后服务" name="service">
        <div class="tab-content">
          <div class="info-item">售后客服QQ：403833139</div>
          <div class="info-item">工作时间：10:00 ~ 23:59</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="购买记录" name="history">
        <div class="tab-content">
          <div v-if="ordersLoading" class="loading-wrapper">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="orders.length === 0" class="empty-wrapper">
            <el-empty description="没有购买记录" />
          </div>
          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-item">
              <div class="order-header">
                <span class="order-no">订单号：{{ order.order_no }}</span>
                <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
              </div>
              <div class="order-info">
                <div class="order-package">{{ order.package_name || '会员开通' }}</div>
                <div class="order-amount" v-if="order.pay_type === 'coin'">{{ parseFloat(order.price || 0).toFixed(0) }}金币</div>
                <div class="order-amount" v-else>￥{{ parseFloat(order.price || 0).toFixed(2) }}</div>
              </div>
              <div class="order-time">{{ formatTime(order.created_at) }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 支付方式选择弹窗（底部弹出） -->
    <div
      v-if="showPaymentMethodDialog"
      class="payment-method-overlay"
      @click="showPaymentMethodDialog = false"
    >
      <div class="payment-method-popup" @click.stop>
        <div class="payment-method-header">
          <div class="payment-method-title">选择支付方式</div>
        </div>
        <div class="payment-method-content">
          <!-- 金币支付选项 -->
          <div
            class="payment-method-item coin-payment-item"
            @click="selectCoinPayment"
          >
            <div class="payment-method-info">
              <div class="payment-method-icon">
                <svg t="1677642534019" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 896c200.298667 0 362.666667-152.810667 362.666667-341.333333s19.050667-192.533333-362.666667-192.533334S149.333333 366.144 149.333333 554.666667s162.368 341.333333 362.666667 341.333333z" fill="#FF5C00"></path>
                  <path d="M149.333333 490.666667a362.666667 341.333333 0 1 0 725.333334 0 362.666667 341.333333 0 1 0-725.333334 0Z" fill="#FFCC00"></path>
                  <path d="M192 480a320 288 0 1 0 640 0 320 288 0 1 0-640 0Z" fill="#FF7325"></path>
                  <path d="M213.333333 480a298.666667 266.666667 0 1 0 597.333334 0 298.666667 266.666667 0 1 0-597.333334 0Z" fill="#FFB329"></path>
                  <path d="M808.533333 512c-17.706667 132.181333-143.722667 234.666667-296.533333 234.666667s-278.826667-102.485333-296.533333-234.666667z" fill="#FF9B1A"></path>
                  <path d="M512 213.333333c108.074667 0 202.730667 51.242667 255.168 128H256.853333c52.437333-76.757333 147.093333-128 255.168-128z" fill="#FFCC00"></path>
                </svg>
              </div>
              <div class="payment-method-name">
                金币支付
                <span class="coin-amount-tag">(需{{ selectedPackage?.coin_price || 0 }}金币)</span>
              </div>
            </div>
            <div class="payment-method-check">
              <svg
                v-if="isCoinPaymentSelected"
                class="nut-icon selected"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zm281.6 369.778C779.378 381.156 600.178 500.622 472.178 691.2c0 0 0 2.844-2.845 2.844-8.533 5.69-48.355 36.978-88.177-8.533-39.823-51.2-62.578-99.555-142.223-142.222-2.844 0-2.844-2.845-2.844-2.845-8.533-11.377-39.822-56.888 19.911-56.888 45.511 0 91.022 11.377 162.133 73.955 5.69 5.689 14.223 5.689 17.067 0C469.333 517.69 608.711 366.933 768 318.578c0 0 19.911-2.845 31.289 14.222 5.689 11.378 11.378 22.756-5.689 36.978z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
              <svg
                v-else
                class="nut-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 1024c-136.533 0-264.533-54.044-361.244-150.756C54.044 776.534 0 648.534 0 512c0-136.533 54.044-264.533 150.756-361.244C247.466 54.044 375.466 0 512 0c136.533 0 264.533 54.044 361.244 150.756C969.956 247.466 1024 375.466 1024 512s-54.044 264.533-150.756 361.244C776.534 969.956 648.534 1024 512 1024zm0-938.667c-113.778 0-221.867 45.511-301.511 125.156S85.333 398.222 85.333 512s45.511 221.867 125.156 301.511S398.222 938.667 512 938.667s221.867-45.511 301.511-125.156S938.667 625.778 938.667 512 893.156 290.133 813.51 210.489 625.778 85.333 512 85.333z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
            </div>
          </div>

          <div class="payment-method-list">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method-item"
              :class="{ disabled: method.status !== 1 }"
              @click="selectPaymentMethod(method)"
            >
              <div class="payment-method-info">
                <div class="payment-method-icon">
                  <!-- 支付宝图标 -->
                  <svg
                    v-if="method.code === 'alipay'"
                    class="payment-icon-svg"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
                      fill="#009FE8"
                    ></path>
                  </svg>
                  <!-- 微信图标 -->
                  <svg
                    v-else-if="method.code === 'wechat' || method.code === 'wxpay'"
                    class="payment-icon-svg"
                    viewBox="0 0 1228 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M530.8928 703.1296a41.472 41.472 0 0 1-35.7376-19.8144l-2.7136-5.5808L278.272 394.752a18.7392 18.7392 0 0 1-2.048-8.1408 19.968 19.968 0 0 1 20.48-19.3536c4.608 0 8.8576 1.4336 12.288 3.84l234.3936 139.9296a64.4096 64.4096 0 0 0 54.528 5.9392L1116.2624 204.8C1004.9536 80.896 821.76 0 614.4 0 275.0464 0 0 216.576 0 483.6352c0 145.7152 82.7392 276.8896 212.2752 365.5168a38.1952 38.1952 0 0 1 17.2032 31.488 44.4928 44.4928 0 0 1-2.1504 12.3904l-27.6992 97.4848c-1.3312 4.608-3.328 9.3696-3.328 14.1312 0 10.752 9.216 19.3536 20.48 19.3536 4.4032 0 8.0384-1.536 11.776-3.584l134.5536-73.3184c10.1376-5.5296 20.7872-8.96 32.6144-8.96 6.2976 0 12.288 0.9216 18.0736 2.5088 62.72 17.0496 130.4576 26.5728 200.5504 26.5728C953.7024 967.168 1228.8 750.592 1228.8 483.6352c0-80.9472-25.4464-157.1328-70.0416-224.1024l-604.9792 436.992-4.4544 2.4064a42.1376 42.1376 0 0 1-18.432 4.1984z"
                      fill="#15BA11"
                    ></path>
                  </svg>
                  <!-- 默认图标 -->
                  <i v-else class="fa fa-credit-card payment-default-icon"></i>
                </div>
                <div class="payment-method-name" :class="{ disabled: method.status !== 1 }">
                  {{ method.name }}{{ method.status !== 1 ? '(升级维护中)' : '' }}
                </div>
              </div>
              <div class="payment-method-check">
                <svg
                  v-if="selectedPaymentMethod?.id === method.id && method.status === 1"
                  class="nut-icon selected"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zm281.6 369.778C779.378 381.156 600.178 500.622 472.178 691.2c0 0 0 2.844-2.845 2.844-8.533 5.69-48.355 36.978-88.177-8.533-39.823-51.2-62.578-99.555-142.223-142.222-2.844 0-2.844-2.845-2.844-2.845-8.533-11.377-39.822-56.888 19.911-56.888 45.511 0 91.022 11.377 162.133 73.955 5.69 5.689 14.223 5.689 17.067 0C469.333 517.69 608.711 366.933 768 318.578c0 0 19.911-2.845 31.289 14.222 5.689 11.378 11.378 22.756-5.689 36.978z"
                    fill="currentColor"
                    fill-opacity="0.9"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="nut-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    d="M512 1024c-136.533 0-264.533-54.044-361.244-150.756C54.044 776.534 0 648.534 0 512c0-136.533 54.044-264.533 150.756-361.244C247.466 54.044 375.466 0 512 0c136.533 0 264.533 54.044 361.244 150.756C969.956 247.466 1024 375.466 1024 512s-54.044 264.533-150.756 361.244C776.534 969.956 648.534 1024 512 1024zm0-938.667c-113.778 0-221.867 45.511-301.511 125.156S85.333 398.222 85.333 512s45.511 221.867 125.156 301.511S398.222 938.667 512 938.667s221.867-45.511 301.511-125.156S938.667 625.778 938.667 512 893.156 290.133 813.51 210.489 625.778 85.333 512 85.333z"
                    fill="currentColor"
                    fill-opacity="0.9"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div class="payment-type-divider"></div>
          <div class="payment-type-options">
            <div class="payment-type-item" @click="togglePaymentType('qrcode')">
              <span class="payment-type-label">电脑扫码支付</span>
              <svg
                v-if="paymentType === 'qrcode'"
                class="nut-icon selected"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zm281.6 369.778C779.378 381.156 600.178 500.622 472.178 691.2c0 0 0 2.844-2.845 2.844-8.533 5.69-48.355 36.978-88.177-8.533-39.823-51.2-62.578-99.555-142.223-142.222-2.844 0-2.844-2.845-2.844-2.845-8.533-11.377-39.822-56.888 19.911-56.888 45.511 0 91.022 11.377 162.133 73.955 5.69 5.689 14.223 5.689 17.067 0C469.333 517.69 608.711 366.933 768 318.578c0 0 19.911-2.845 31.289 14.222 5.689 11.378 11.378 22.756-5.689 36.978z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
              <svg
                v-else
                class="nut-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 1024c-136.533 0-264.533-54.044-361.244-150.756C54.044 776.534 0 648.534 0 512c0-136.533 54.044-264.533 150.756-361.244C247.466 54.044 375.466 0 512 0c136.533 0 264.533 54.044 361.244 150.756C969.956 247.466 1024 375.466 1024 512s-54.044 264.533-150.756 361.244C776.534 969.956 648.534 1024 512 1024zm0-938.667c-113.778 0-221.867 45.511-301.511 125.156S85.333 398.222 85.333 512s45.511 221.867 125.156 301.511S398.222 938.667 512 938.667s221.867-45.511 301.511-125.156S938.667 625.778 938.667 512 893.156 290.133 813.51 210.489 625.778 85.333 512 85.333z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
            </div>
            <div class="payment-type-item" @click="togglePaymentType('mobile')">
              <span class="payment-type-label">手机支付(默认)</span>
              <svg
                v-if="paymentType === 'mobile'"
                class="nut-icon selected"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zm281.6 369.778C779.378 381.156 600.178 500.622 472.178 691.2c0 0 0 2.844-2.845 2.844-8.533 5.69-48.355 36.978-88.177-8.533-39.823-51.2-62.578-99.555-142.223-142.222-2.844 0-2.844-2.845-2.844-2.845-8.533-11.377-39.822-56.888 19.911-56.888 45.511 0 91.022 11.377 162.133 73.955 5.69 5.689 14.223 5.689 17.067 0C469.333 517.69 608.711 366.933 768 318.578c0 0 19.911-2.845 31.289 14.222 5.689 11.378 11.378 22.756-5.689 36.978z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
              <svg
                v-else
                class="nut-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
              >
                <path
                  d="M512 1024c-136.533 0-264.533-54.044-361.244-150.756C54.044 776.534 0 648.534 0 512c0-136.533 54.044-264.533 150.756-361.244C247.466 54.044 375.466 0 512 0c136.533 0 264.533 54.044 361.244 150.756C969.956 247.466 1024 375.466 1024 512s-54.044 264.533-150.756 361.244C776.534 969.956 648.534 1024 512 1024zm0-938.667c-113.778 0-221.867 45.511-301.511 125.156S85.333 398.222 85.333 512s45.511 221.867 125.156 301.511S398.222 938.667 512 938.667s221.867-45.511 301.511-125.156S938.667 625.778 938.667 512 893.156 290.133 813.51 210.489 625.778 85.333 512 85.333z"
                  fill="currentColor"
                  fill-opacity="0.9"
                ></path>
              </svg>
            </div>
          </div>
          <el-button
            type="primary"
            class="confirm-payment-button"
            @click="handleConfirmPayment"
          >
            确认支付
          </el-button>
          <div class="payment-tip-text">
            在QQ或者微信应用内无法拉起支付，请在默认浏览器Safari或者其它浏览器上操作支付。
          </div>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <el-dialog
      v-model="showPaymentDialog"
      title="扫码支付"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleClosePaymentDialog"
    >
      <div class="payment-content">
        <div class="payment-tip">
          <svg
            v-if="selectedPaymentMethod?.code === 'wechat' || selectedPaymentMethod?.code === 'wxpay'"
            t="1678268118596"
            class="payment-icon"
            viewBox="0 0 1228 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 20px; height: 20px; color: #07c160;"
          >
            <path
              d="M530.8928 703.1296a41.472 41.472 0 0 1-35.7376-19.8144l-2.7136-5.5808L278.272 394.752a18.7392 18.7392 0 0 1-2.048-8.1408 19.968 19.968 0 0 1 20.48-19.3536c4.608 0 8.8576 1.4336 12.288 3.84l234.3936 139.9296a64.4096 64.4096 0 0 0 54.528 5.9392L1116.2624 204.8C1004.9536 80.896 821.76 0 614.4 0 275.0464 0 0 216.576 0 483.6352c0 145.7152 82.7392 276.8896 212.2752 365.5168a38.1952 38.1952 0 0 1 17.2032 31.488 44.4928 44.4928 0 0 1-2.1504 12.3904l-27.6992 97.4848c-1.3312 4.608-3.328 9.3696-3.328 14.1312 0 10.752 9.216 19.3536 20.48 19.3536 4.4032 0 8.0384-1.536 11.776-3.584l134.5536-73.3184c10.1376-5.5296 20.7872-8.96 32.6144-8.96 6.2976 0 12.288 0.9216 18.0736 2.5088 62.72 17.0496 130.4576 26.5728 200.5504 26.5728C953.7024 967.168 1228.8 750.592 1228.8 483.6352c0-80.9472-25.4464-157.1328-70.0416-224.1024l-604.9792 436.992-4.4544 2.4064a42.1376 42.1376 0 0 1-18.432 4.1984z"
              fill="#15BA11"
            ></path>
          </svg>
          <svg
            v-else
            t="1678267227664"
            class="payment-icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style="width: 20px; height: 20px; color: #009FE8;"
          >
            <path
              d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
              fill="#009FE8"
            ></path>
          </svg>
          <span>
            {{ selectedPaymentMethod?.code === 'wechat' || selectedPaymentMethod?.code === 'wxpay' 
              ? '请用微信扫码进行支付' 
              : selectedPaymentMethod?.code === 'alipay' 
                ? '请用支付宝扫码进行支付' 
                : '请扫码进行支付' }}
          </span>
        </div>
        <div class="qrcode-wrapper" v-if="paymentQrcode">
          <img :src="paymentQrcode" alt="支付二维码" class="qrcode-img" />
        </div>
        <div class="payment-status">
          <el-button
            type="warning"
            :disabled="checkingPayment"
            @click="checkPaymentStatus"
          >
            {{ checkingPayment ? '支付状态查询中...' : '检查支付状态' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElButton, ElDialog, ElTabs, ElTabPane, ElEmpty, ElIcon } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getVipPackages, createVipOrder } from '@/api/vipCoin'
import { createPayment, getOrderStatus } from '@/api/orders'
import { getVipOrders } from '@/api/vipCoin'
import { getPaymentMethods } from '@/api/payment'

const router = useRouter()
const userStore = useUserStore()

// 用户金币
const userCoins = ref(0)

// 会员套餐
const vipPackages = ref<any[]>([])
const selectedPackage = ref<any>(null)

// Tabs
const activeTab = ref('intro')

// 订单记录
const orders = ref<any[]>([])
const ordersLoading = ref(false)

// 支付相关
const showPaymentDialog = ref(false)
const showPaymentMethodDialog = ref(false) // 支付方式选择弹窗
const paymentMethods = ref<any[]>([]) // 支付方式列表
const selectedPaymentMethod = ref<any>(null) // 选中的支付方式
const paymentType = ref('mobile') // 支付类型：mobile(手机支付) 或 qrcode(电脑扫码支付)
const paymentQrcode = ref('')
const currentOrderNo = ref('')
const checkingPayment = ref(false)
let paymentCheckTimer: any = null
const isCoinPayment = ref(false) // 是否选择金币支付

// 获取用户金币
const fetchUserCoins = async () => {
  try {
    if (userStore.user?.id) {
      const { getUserInfo } = await import('@/api/user')
      const res = await getUserInfo(userStore.user.id)
      if (res.ok === 1) {
        // 兼容两种响应格式和字段名
        const userData = res.user || res.data?.user
        if (userData) {
          // 分站使用 balance，但也兼容 coins 字段
          userCoins.value = parseFloat(userData.coins || userData.balance || '0') || 0
        }
      }
    }
  } catch (error) {
    console.error('获取用户金币失败:', error)
  }
}

// 获取会员套餐
const fetchVipPackages = async () => {
  try {
    const res = await getVipPackages(false)
    console.log('📥 会员套餐API响应:', {
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
      vipPackages.value = packagesData
      console.log('📊 处理后的会员套餐数据:', { packagesCount: packagesData.length })
    } else if (res.ok === 1 && packagesData.length === 0) {
      console.log('会员套餐数据为空')
      vipPackages.value = []
    } else {
      console.warn('会员套餐API返回格式不正确:', res)
    }
  } catch (error) {
    ElMessage.error('获取套餐列表失败')
    console.error('获取套餐列表失败:', error)
  }
}

// 获取支付方式
const fetchPaymentMethods = async () => {
  try {
    const res = await getPaymentMethods()
    
    console.log('📥 支付方式API响应（VIP购买）:', {
      ok: res.ok,
      hasMethods: !!res.methods,
      hasData: !!res.data,
      methodsLength: res.methods?.length || res.data?.methods?.length || 0,
      keys: Object.keys(res),
    })
    
    if (res.ok === 1) {
      // 兼容两种响应格式：
      // 1. { ok: 1, methods: [...] } - 直接返回
      // 2. { ok: 1, data: { methods: [...] } } - 放在data字段中
      const methodsData = res.methods || res.data?.methods || []
      
      // 只显示启用的支付方式
      paymentMethods.value = methodsData.filter((m: any) => m.status === 1)
      
      // 默认选择第一个
      if (paymentMethods.value.length > 0) {
        selectedPaymentMethod.value = paymentMethods.value[0]
      }
      
      console.log('📊 处理后的支付方式数据:', {
        methodsCount: paymentMethods.value.length,
      })
    } else {
      console.error('❌ API返回失败:', res.msg || '未知错误')
    }
  } catch (error: any) {
    console.error('❌ 获取支付方式失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    })
  }
}

// 选择套餐
const selectPackage = (pkg: any) => {
  selectedPackage.value = pkg
}

// 确认购买 - 显示支付方式选择弹窗
const handleConfirmPurchase = () => {
  if (!selectedPackage.value) {
    ElMessage.warning('请选择会员套餐')
    return
  }

  // 显示支付方式选择弹窗
  showPaymentMethodDialog.value = true
}

// 选择支付方式
const selectPaymentMethod = (method: any) => {
  if (method.status !== 1) {
    return // 禁用的支付方式不能选择
  }
  selectedPaymentMethod.value = method
  isCoinPayment.value = false // 选择现金支付时取消金币支付
}

// 选择金币支付
const selectCoinPayment = () => {
  isCoinPayment.value = true
  selectedPaymentMethod.value = null // 清除现金支付选择
}

// 是否选中金币支付
const isCoinPaymentSelected = computed(() => isCoinPayment.value)

// 切换支付类型
const togglePaymentType = (type: 'mobile' | 'qrcode') => {
  paymentType.value = type
}

// 确认支付 - 创建订单并支付
const handleConfirmPayment = async () => {
  if (!isCoinPayment.value && !selectedPaymentMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  try {
    // 关闭支付方式选择弹窗
    showPaymentMethodDialog.value = false

    // 确定支付方式
    const payType = isCoinPayment.value ? 'coin' : (selectedPaymentMethod.value.code === 'alipay' ? 'alipay' : 'wechat')

    // 创建订单
    const orderRes = await createVipOrder({ package_id: selectedPackage.value.id, pay_type: payType })
    if (orderRes.ok !== 1) {
      ElMessage.error(orderRes.msg || '创建订单失败')
      return
    }

    // 如果是金币支付，订单已完成
    if (orderRes.status === 'paid') {
      ElMessage.success('会员开通成功！')
      fetchUserCoins() // 刷新金币余额
      fetchOrders() // 刷新订单列表
      return
    }

    // 现金支付，需要继续支付流程
    currentOrderNo.value = orderRes.order_no

    // 创建支付
    const paymentRes = await createPayment({
      order_no: currentOrderNo.value,
      payment_method_id: selectedPaymentMethod.value.id
    })
    if (paymentRes.ok !== 1) {
      ElMessage.error(paymentRes.msg || '创建支付失败')
      return
    }

    // 显示支付弹窗
    if (paymentRes.qrcode) {
      // 将支付URL转换为二维码图片URL
      // 使用在线二维码生成API
      paymentQrcode.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentRes.qrcode)}`
      showPaymentDialog.value = true
      startPaymentCheck()
    } else if (paymentRes.urlscheme) {
      // 如果有urlscheme（小程序跳转URL），也生成二维码
      paymentQrcode.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentRes.urlscheme)}`
      showPaymentDialog.value = true
      startPaymentCheck()
    } else if (paymentRes.pay_url) {
      // 如果是URL，直接跳转
      window.location.href = paymentRes.pay_url
    } else {
      ElMessage.error('支付信息异常')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
    console.error('创建订单失败:', error)
  }
}

// 开始轮询检查支付状态
const startPaymentCheck = () => {
  if (paymentCheckTimer) {
    clearInterval(paymentCheckTimer)
  }
  paymentCheckTimer = setInterval(() => {
    checkPaymentStatus()
  }, 3000) // 每3秒检查一次
}

// 检查支付状态
const checkPaymentStatus = async () => {
  if (!currentOrderNo.value || checkingPayment.value) {
    return
  }

  try {
    checkingPayment.value = true
    const res = await getOrderStatus(currentOrderNo.value)
    if (res.ok === 1) {
      if (res.status === 'paid') {
        // 支付成功
        ElMessage.success('支付成功！金币已到账')
        showPaymentDialog.value = false
        stopPaymentCheck()
        // 刷新用户金币和订单记录
        fetchUserCoins()
        if (activeTab.value === 'history') {
          fetchOrders()
        }
      } else if (res.status === 'failed' || res.status === 'cancelled') {
        // 支付失败或取消
        ElMessage.error('支付失败或已取消')
        showPaymentDialog.value = false
        stopPaymentCheck()
      }
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
  } finally {
    checkingPayment.value = false
  }
}

// 停止支付检查
const stopPaymentCheck = () => {
  if (paymentCheckTimer) {
    clearInterval(paymentCheckTimer)
    paymentCheckTimer = null
  }
}

// 关闭支付弹窗
const handleClosePaymentDialog = () => {
  stopPaymentCheck()
  paymentQrcode.value = ''
  currentOrderNo.value = ''
}

// 获取订单记录
const fetchOrders = async () => {
  try {
    ordersLoading.value = true
    const res = await getVipOrders({ page: 1, page_size: 20 })
    if (res.ok === 1 && res.orders) {
      orders.value = res.orders
    }
  } catch (error) {
    console.error('获取订单记录失败:', error)
  } finally {
    ordersLoading.value = false
  }
}

// 订单状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    failed: '支付失败',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

// 返回
const goBack = () => {
  router.back()
}

// 监听tab切换
const handleTabChange = (tab: string | number) => {
  if (tab === 'history') {
    fetchOrders()
  }
}

onMounted(() => {
  fetchUserCoins()
  fetchVipPackages()
  fetchPaymentMethods()
})
</script>

<style lang="scss" scoped>
.coin-recharge-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 8px;
  padding-bottom: 80px;
}

.nut-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #eee;

  .nut-navbar__left {
    display: flex;
    align-items: center;
    cursor: pointer;

    .nut-icon {
      width: 24px;
      height: 24px;
      color: #666;
    }
  }

  .nut-navbar__title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
  }

  .nut-navbar__right {
    width: 24px;
  }
}

.nut-cell {
  background: #fff;
  padding: 16px;
  margin: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .nut-cell__title {
    font-size: 16px;
    color: #333;
  }

  .coin-balance {
    display: flex;
    align-items: center;
    gap: 8px;

    .coin-icon {
      width: 20px;
      height: 20px;
    }

    .coin-amount {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }
}

.packages-section {
  padding: 0 10px;
  margin-top: 20px;

  .packages-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .coin-pay-item {
    position: relative;
    background: #fff;
    border: 2px solid #f8f8f8;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;

    &.selected {
      border-color: #3369ff;

      .selected-icon {
        position: absolute;
        bottom: -2px;
        right: -3px;
        width: 20px;
        height: 20px;
      }
    }

    .package-name-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #f97316;
      color: #fff;
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 0 8px 0 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70px;
      z-index: 2;
    }

    .coin-content {
      .coin-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .coin-icon-small {
          width: 30px;
          height: 30px;
        }

        .coin-count {
          font-size: 18px;
          font-weight: 500;
          color: #37a737;
        }
      }

      .coin-price {
        font-size: 16px;
        color: #666;
        font-weight: 500;
      }
    }
  }

  .confirm-button-wrapper {
    padding: 0 10px 10px;
    margin: 20px 0 30px;

    .confirm-button {
      width: 100%;
      background: #3369ff;
      border: none;
      color: #fff;
      font-size: 16px;
      padding: 12px;
      border-radius: 24px;
      box-shadow: 0 5px 6px 0 rgba(73, 105, 230, 0.22);

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }
}

.info-tabs {
  background: #fff;
  margin: 10px;
  border-radius: 8px;
  padding: 16px;

  .tab-content {
    padding: 16px 0;
    min-height: 200px;

    .info-item {
      margin-bottom: 12px;
      line-height: 1.6;
      color: #666;
      font-size: 14px;
    }

    .loading-wrapper,
    .empty-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
    }

    .orders-list {
      .order-item {
        padding: 16px;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .order-no {
            font-size: 14px;
            color: #666;
          }

          .order-status {
            font-size: 14px;
            padding: 2px 8px;
            border-radius: 4px;

            &.paid {
              color: #37a737;
              background: #e8f5e9;
            }

            &.pending {
              color: #ff9800;
              background: #fff3e0;
            }

            &.failed,
            &.cancelled {
              color: #f44336;
              background: #ffebee;
            }
          }
        }

        .order-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .order-package {
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }

          .order-amount {
            font-size: 18px;
            font-weight: 600;
            color: #3369ff;
          }
        }

        .order-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}

.payment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  .payment-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    margin-bottom: 20px;
  }

  .qrcode-wrapper {
    margin: 20px 0;

    .qrcode-img {
      width: 200px;
      height: 200px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
  }

  .payment-status {
    margin-top: 20px;
  }
}

// 支付方式选择弹窗样式
.payment-method-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2003;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.payment-method-popup {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.payment-method-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;

  .payment-method-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
}

.payment-method-content {
  padding: 10px 30px 30px;

  // 金币支付项样式（在列表外部）
  > .payment-method-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;

    &.coin-payment-item {
      .payment-method-icon .icon {
        width: 22px;
        height: 22px;
      }
    }

    .payment-method-info {
      display: flex;
      align-items: center;
      flex: 1;

      .payment-method-icon {
        width: 22px;
        height: 22px;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .payment-method-name {
        font-size: 16px;
        font-weight: 500;
        color: #333;

        .coin-amount-tag {
          font-size: 12px;
          color: #FF5C00;
          font-weight: normal;
          margin-left: 4px;
        }
      }
    }

    .payment-method-check {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      .nut-icon {
        width: 20px;
        height: 20px;
        color: #ccc;

        &.selected {
          color: #4f71ea;
        }
      }
    }
  }

  .payment-method-list {
    margin-bottom: 10px;

    .payment-method-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .payment-method-info {
        display: flex;
        align-items: center;
        flex: 1;

        .payment-method-icon {
          width: 22px;
          height: 22px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .payment-icon-svg {
            width: 100%;
            height: 100%;
            display: block;
          }

          .payment-default-icon {
            font-size: 22px;
            color: #666;
          }
        }

        .payment-method-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;

          &.disabled {
            color: #ccc;
          }
        }
      }

      &.coin-payment-item {
        .payment-method-icon .icon {
          width: 22px;
          height: 22px;
        }
      }

      .payment-method-check {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        .nut-icon {
          width: 20px;
          height: 20px;
          color: #ccc;

          &.selected {
            color: #4f71ea;
          }
        }
      }
    }
  }

  .payment-type-divider {
    height: 2px;
    border-bottom: 1px dashed #fce1e1;
    margin: 20px 0;
  }

  .payment-type-options {
    display: flex;
    justify-content: space-between;
    padding: 10px 18px;
    margin-bottom: 10px;

    .payment-type-item {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: 1;

      .payment-type-label {
        font-size: 14px;
        color: #5b5b5b;
        margin-right: 4px;
      }

      .nut-icon {
        width: 20px;
        height: 20px;
        color: #ccc;

        &.selected {
          color: #4f71ea;
        }
      }
    }
  }

  .confirm-payment-button {
    width: 100%;
    background: #3369ff;
    border: none;
    color: #fff;
    font-size: 16px;
    padding: 12px;
    border-radius: 24px;
    box-shadow: 0 5px 6px 0 rgba(73, 105, 230, 0.22);
    margin: 20px 0;
  }

  .payment-tip-text {
    text-align: center;
    color: #ccc;
    font-size: 12px;
    padding: 20px 0;
  }
}
</style>

