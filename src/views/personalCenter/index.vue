<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  UserOutlined,
  EditOutlined,
  CrownOutlined,
} from '@ant-design/icons-vue'
import baseIcon from '@/assets/personalCenter/基础@2x.png'
import msgIcon from '@/assets/personalCenter/容器 229@2x.png'
import shareIcon from '@/assets/personalCenter/容器@2x(1).png'
import followIcon from '@/assets/personalCenter/关注@2x.png'
import dynamicIcon from '@/assets/personalCenter/动态@2x.png'
import invoiceIcon from '@/assets/personalCenter/发票@2x.png'
import serviceIcon from '@/assets/personalCenter/客服@2x.png'
import vipAd from '@/assets/personalCenter/VIP广告@2x.png'
import userLevel from '@/assets/personalCenter/用户等级@2x.png'

defineOptions({ name: 'PersonalCenter' })

const selectedMenu = ref('base')

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

const currentMenu = computed(
  () =>
    menuItems.find((item) => item.key === selectedMenu.value) ?? menuItems[0]!,
)

const userInfo = {
  phone: '195****0937',
  username: '19545640586',
  company: '某某公司',
  lastLogin: '2026-08-16',
  bindPhone: '19545640586',
  identity: '企业专员',
}

const onMenuClick = (key: string) => {
  selectedMenu.value = key
}
</script>

<template>
  <div class="personal-center">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <!-- User Info Card -->
      <div class="user-card">
        <div class="avatar">
          <img :src="userLevel" alt="用户头像" />
        </div>
        <div class="user-phone">{{ userInfo.phone }}</div>
        <div class="user-badge">
          <img :src="userLevel" alt="" class="badge-icon" />
          <span>企业专员</span>
        </div>
        <div class="vip-link">
          <CrownOutlined />
          <span>开通会员，享受专享</span>
        </div>
      </div>

      <!-- Menu -->
      <div class="sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: selectedMenu === item.key }"
          @click="onMenuClick(item.key)"
        >
          <img :src="item.icon" alt="" class="menu-icon" />
          <span class="menu-text">{{ item.label }}</span>
        </div>
      </div>

      <!-- VIP Ad -->
      <div class="vip-ad">
        <img :src="vipAd" alt="VIP权益" />
      </div>
    </div>

    <!-- Right Content -->
    <div class="content">
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
                <UserOutlined />
              </div>
              <a-button type="primary" class="upload-btn">上传头像</a-button>
            </div>
            <div class="profile-info">
              <div class="info-row">
                <span class="info-label">用户名：</span>
                <span class="info-value">{{ userInfo.username }}</span>
                <EditOutlined class="edit-icon" />
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
                <span class="info-value">{{ userInfo.identity }}</span>
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
            <a-button type="primary" class="vip-btn">
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
        <div class="empty-card">
          <a-empty :description="currentMenu.emptyText" />
        </div>
      </template>
    </div>
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
  gap: 16px;
}

.user-card {
  background: #fff;
  border-radius: var(--pb-radius-lg);
  padding: 32px 24px 24px;
  text-align: center;
  box-shadow: var(--pb-shadow-card);
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f0f0f0;
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

.user-phone {
  font-size: 20px;
  font-weight: 600;
  color: var(--pb-title);
  margin-bottom: 8px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: linear-gradient(135deg, #4a90e2 0%, #50c6ff 100%);
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  margin-bottom: 12px;

  .badge-icon {
    width: 14px;
    height: 14px;
  }
}

.vip-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #c8956c;
  cursor: pointer;

  &:hover {
    color: #b07848;
  }
}

.sidebar-menu {
  background: #fff;
  border-radius: var(--pb-radius-lg);
  padding: 12px 0;
  box-shadow: var(--pb-shadow-card);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
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
  }
}

.menu-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.menu-text {
  font-size: 15px;
  color: var(--pb-text);
}

.vip-ad {
  border-radius: var(--pb-radius-lg);
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
  padding: 32px;
  box-shadow: var(--pb-shadow-card);
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
  padding: 24px;
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
}

.upload-btn {
  font-size: 13px;
  border-radius: 6px;
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
  color: var(--pb-primary);
  cursor: pointer;
  font-size: 13px;

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
