<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  UserOutlined,
  EditOutlined,
  CrownOutlined,
} from '@ant-design/icons-vue'
import { fetchMyMembership, type AccountMembership } from '@/api/membership'
import { useAuthStore } from '@/stores/auth'
import {
  formatLastLogin,
  formatMembershipPeriod,
  identityLabel,
  maskPhone,
} from '@/utils/userDisplay'
import baseIcon from '@/assets/personalCenter/基础@2x.png'
import msgIcon from '@/assets/personalCenter/goutong@2x.png'
import shareIcon from '@/assets/personalCenter/fenxiang2@2x.png'
import followIcon from '@/assets/personalCenter/关注@2x.png'
import dynamicIcon from '@/assets/personalCenter/动态@2x.png'
import invoiceIcon from '@/assets/personalCenter/发票@2x.png'
import serviceIcon from '@/assets/personalCenter/客服@2x.png'
import vipAd from '@/assets/personalCenter/VIP广告@2x.png'
import userLevel from '@/assets/personalCenter/用户等级@2x.png'
import MessagePanel from './MessagePanel.vue'
import SharePanel from './SharePanel.vue'
import FollowPanel from './FollowPanel.vue'
import DynamicsPanel from './DynamicsPanel.vue'
import InvoicePanel from './InvoicePanel.vue'
import ServicePanel from './ServicePanel.vue'
import UploadAvatarModal from './UploadAvatarModal.vue'
import IdentityAuthModal from './IdentityAuthModal.vue'
import NicknameModal from './NicknameModal.vue'
import RenewMembershipModal from './RenewMembershipModal.vue'

defineOptions({ name: 'PersonalCenter' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

type CenterMenuItem = {
  key: string
  label: string
  icon: string
  emptyText?: string
}

const menuItems: CenterMenuItem[] = [
  { key: 'base', label: '基础资料', icon: baseIcon },
  {
    key: 'message',
    label: '消息通知',
    icon: msgIcon,
    emptyText: '暂无消息通知',
  },
  {
    key: 'share',
    label: '我的分享',
    icon: shareIcon,
    emptyText: '暂无分享内容',
  },
  {
    key: 'follow',
    label: '我的关注',
    icon: followIcon,
    emptyText: '暂无关注内容',
  },
  {
    key: 'dynamic',
    label: '关注动态',
    icon: dynamicIcon,
    emptyText: '暂无动态内容',
  },
  {
    key: 'invoice',
    label: '我的发票',
    icon: invoiceIcon,
    emptyText: '暂无发票记录',
  },
  {
    key: 'service',
    label: '联系客服',
    icon: serviceIcon,
    emptyText: '暂无客服信息',
  },
]

const validTabs = new Set(menuItems.map((item) => item.key))

const tabFromQuery = () => {
  const tab = String(route.query.tab || 'base')
  return validTabs.has(tab) ? tab : 'base'
}

const selectedMenu = ref(tabFromQuery())

watch(
  () => route.query.tab,
  () => {
    selectedMenu.value = tabFromQuery()
  },
)

const currentMenu = computed(
  () =>
    menuItems.find((item) => item.key === selectedMenu.value) ?? menuItems[0]!,
)

const certifiedIdentity = computed(() => identityLabel(user.value?.identity))

const userInfo = computed(() => {
  const profile = user.value
  const phone = profile?.phone || ''
  return {
    phone: maskPhone(phone) || '未绑定手机',
    username: profile?.nickname || phone || '未设置',
    company: profile?.companyName || '未填写',
    lastLogin: formatLastLogin(profile?.lastLoginTime) || '-',
    bindPhone: phone || '未绑定',
    identity: certifiedIdentity.value || '未认证',
    avatar: profile?.avatar || '',
  }
})

const onMenuClick = (key: string) => {
  selectedMenu.value = key
  void router.replace({
    query: key === 'base' ? {} : { tab: key },
  })
}

const goMembership = () => {
  void router.push({ name: 'membership' })
}

const membership = ref<AccountMembership | null>(null)
const membershipPeriod = computed(() =>
  formatMembershipPeriod(membership.value),
)
const hasMembershipPlan = computed(() => {
  const code = membership.value?.planCode
  return typeof code === 'string' && code.trim().length > 0
})
const renewOpen = ref(false)

const loadMembership = () => {
  if (!auth.isLoggedIn) return
  void fetchMyMembership()
    .then((data) => {
      membership.value = data && typeof data === 'object' ? data : null
    })
    .catch(() => undefined)
}

const uploadAvatarOpen = ref(false)
const identityAuthOpen = ref(false)
const nicknameOpen = ref(false)

onMounted(() => {
  void auth.loadCurrentUser().catch(() => undefined)
  loadMembership()
})
</script>

<template>
  <div class="personal-center">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div class="sidebar-card">
        <div class="user-card">
          <div class="avatar">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="用户头像" />
            <UserOutlined v-else />
          </div>
          <div class="user-meta">
            <div class="user-phone">{{ userInfo.phone }}</div>
            <div
              class="user-badge"
              :style="{ backgroundImage: `url(${userLevel})` }"
            >
              <span>{{ userInfo.identity }}</span>
            </div>
          </div>
          <div class="vip-link" @click="goMembership">
            <CrownOutlined />
            <span>开通会员，享受专享</span>
          </div>
        </div>

        <div class="sidebar-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            :class="{ active: selectedMenu === item.key }"
            @click="onMenuClick(item.key)"
          >
            <span
              class="menu-icon"
              :style="{ '--menu-icon': `url(${item.icon})` }"
            />
            <span class="menu-text">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- VIP Ad -->
      <div class="vip-ad">
        <img :src="vipAd" alt="VIP权益" />
      </div>
    </div>

    <!-- Right Content -->
    <div class="content" :class="{ 'is-invoice': selectedMenu === 'invoice' }">
      <!-- 基础资料 -->
      <template v-if="selectedMenu === 'base'">
        <h2 class="content-title">
          <span class="title-bar"></span>
          基础资料
        </h2>

        <div class="section">
          <h3 class="section-title">
            <span class="section-dot"></span>
            账号资料
          </h3>
          <div class="profile-card">
            <div class="profile-left">
              <div class="profile-avatar">
                <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="" />
                <UserOutlined v-else />
              </div>
              <a-button
                type="primary"
                class="upload-btn"
                @click="uploadAvatarOpen = true"
              >
                上传头像
              </a-button>
            </div>
            <div class="profile-info">
              <div class="info-row">
                <span class="info-label">用户名：</span>
                <span class="info-value">{{ userInfo.username }}</span>
                <button
                  type="button"
                  class="edit-icon"
                  aria-label="编辑用户名"
                  @click="nicknameOpen = true"
                >
                  <EditOutlined />
                </button>
              </div>
              <div class="info-row">
                <span class="info-label">所属公司：</span>
                <span class="info-value">{{ userInfo.company }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">上次登录：</span>
                <span class="info-value">{{ userInfo.lastLogin }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">绑定手机：</span>
                <span class="info-value">{{ userInfo.bindPhone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">认证身份：</span>
                <a-button
                  v-if="!certifiedIdentity"
                  type="primary"
                  size="small"
                  class="identity-btn"
                  @click="identityAuthOpen = true"
                >
                  身份认证
                </a-button>
                <span v-else class="info-value">{{ certifiedIdentity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">
            <span class="section-dot"></span>
            会员信息
          </h3>
          <div class="member-row">
            <span class="member-label">个人会员：</span>
            <span v-if="membershipPeriod" class="member-period">
              {{ membershipPeriod }}
            </span>
            <a-button
              v-if="hasMembershipPlan"
              type="primary"
              class="vip-btn"
              @click="renewOpen = true"
            >
              <template #icon><CrownOutlined /></template>
              续费
            </a-button>
            <a-button
              v-else
              type="primary"
              class="vip-btn"
              @click="goMembership"
            >
              <template #icon><CrownOutlined /></template>
              开通会员
            </a-button>
          </div>
        </div>
      </template>

      <template v-else>
        <h2 class="content-title">
          <span class="title-bar"></span>
          {{ currentMenu.label }}
        </h2>
        <MessagePanel v-if="selectedMenu === 'message'" />
        <SharePanel v-else-if="selectedMenu === 'share'" />
        <FollowPanel v-else-if="selectedMenu === 'follow'" />
        <DynamicsPanel v-else-if="selectedMenu === 'dynamic'" />
        <InvoicePanel v-else-if="selectedMenu === 'invoice'" />
        <ServicePanel v-else-if="selectedMenu === 'service'" />
        <div v-else class="empty-card">
          <a-empty :description="currentMenu.emptyText" />
        </div>
      </template>
    </div>

    <UploadAvatarModal v-model:open="uploadAvatarOpen" />
    <IdentityAuthModal v-model:open="identityAuthOpen" />
    <NicknameModal v-model:open="nicknameOpen" />
    <RenewMembershipModal v-model:open="renewOpen" />
  </div>
</template>

<style scoped lang="scss">
.personal-center {
  display: flex;
  gap: var(--pb-gap);
  padding: 24px 0;
}

/* Sidebar */
.sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  // gap: 16px;
}

.sidebar-card {
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: var(--pb-shadow-card);
  overflow: hidden;
}

.user-card {
  background: linear-gradient(180deg, #e7f4ff 0%, #f7fbff 58%, #fff 100%);
  padding: 24px 20px 16px;
  text-align: center;
}

.avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #e6eef5;
  color: #9aabba;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.user-phone {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a1a;
  letter-spacing: 0.02em;
}

.user-badge {
  display: inline-grid;
  grid-template-columns: 36% 1fr;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 92px;
  height: 26px;
  padding-right: 6px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;

  span {
    grid-column: 2;
    text-align: center;
  }
}

.vip-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: #d4a24c;
  cursor: pointer;

  &:hover {
    color: #b8862e;
  }
}

.sidebar-menu {
  padding: 6px 0 8px;
  border-top: 1px solid #eef2f6;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: var(--pb-primary-soft);

    .menu-text {
      color: var(--pb-primary);
      font-weight: 500;
    }

    .menu-icon {
      background-color: var(--pb-primary);
    }
  }
}

.menu-icon {
  display: block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  background-color: #333;
  mask-image: var(--menu-icon);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-image: var(--menu-icon);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}

.menu-text {
  font-size: 15px;
  color: var(--pb-text);
}

.vip-ad {
  overflow: hidden;
  box-shadow: var(--pb-shadow-card);

  img {
    width: 100%;
    display: block;
  }
}

/* Content */
.content {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: var(--pb-radius-lg);
  padding: 20px;
  box-shadow: var(--pb-shadow-card);

  &.is-invoice {
    .content-title {
      margin-bottom: 0;
      padding-bottom: 14px;
    }

    .title-bar {
      width: 4px;
      height: 16px;
      border-radius: 1px;
      transform: skewX(-22deg);
    }
  }
}

.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.content-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--pb-title);
  margin: 0 0 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--pb-line);
}

.title-bar {
  width: 4px;
  height: 20px;
  background: var(--pb-primary);
  border-radius: 2px;
}

.section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
  margin: 0 0 20px;
}

.section-dot {
  width: 8px;
  height: 8px;
  background: var(--pb-primary);
  border-radius: 50%;
}

.profile-card {
  display: flex;
  gap: 40px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
}

.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #bbb;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.upload-btn {
  font-size: 13px;
  border-radius: 6px;
}

.identity-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
}

.profile-info {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
  align-content: center;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.info-label {
  color: var(--pb-sub);
}

.info-value {
  color: var(--pb-text);
}

.edit-icon {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--pb-primary);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;

  &:hover {
    color: var(--pb-primary-hover);
  }
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-label {
  font-size: 14px;
  color: var(--pb-sub);
}

.member-period {
  font-size: 14px;
  color: var(--pb-text);
}

.vip-btn {
  background: linear-gradient(135deg, #8b6914 0%, #c8956c 100%);
  border: none;
  border-radius: 6px;
  font-weight: 500;

  &:hover {
    background: linear-gradient(135deg, #7a5c10 0%, #b8854c 100%);
  }
}

@include below-lg {
  .personal-center {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .profile-card {
    flex-direction: column;
  }

  .profile-info {
    grid-template-columns: 1fr;
  }
}
</style>
