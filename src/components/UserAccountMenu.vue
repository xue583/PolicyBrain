<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { identityLabel, maskPhone } from '@/utils/userDisplay'

defineOptions({ name: 'UserAccountMenu' })

type MenuKey =
  'personal-center' | 'message' | 'share' | 'follow' | 'settings' | 'logout'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const maskedPhone = computed(
  () => maskPhone(user.value?.phone) || user.value?.nickname || '已登录',
)
const companyName = computed(() => user.value?.companyName || '')
const badgeText = computed(() => identityLabel(user.value?.identity))
const avatarUrl = computed(() => user.value?.avatar || '')

const menuItems: { key: MenuKey; label: string }[] = [
  { key: 'personal-center', label: '个人中心' },
  { key: 'message', label: '消息通知' },
  { key: 'share', label: '我的分享' },
  { key: 'follow', label: '我的关注' },
  { key: 'settings', label: '账户设置' },
]

const activeKey = computed<MenuKey | ''>(() => {
  if (route.name !== 'personal-center') return ''
  const tab = String(route.query.tab || 'base')
  if (tab === 'message') return 'message'
  if (tab === 'share') return 'share'
  if (tab === 'follow') return 'follow'
  if (tab === 'settings' || tab === 'base') return 'personal-center'
  return 'personal-center'
})

const goCenter = (tab?: string) => {
  void router.push({
    name: 'personal-center',
    query: tab && tab !== 'base' ? { tab } : undefined,
  })
}

const onMenuClick = async (key: MenuKey) => {
  if (key === 'logout') {
    await auth.logout()
    message.success('已退出登录')
    return
  }
  if (key === 'personal-center' || key === 'settings') {
    goCenter('base')
    return
  }
  goCenter(key)
}
</script>

<template>
  <a-dropdown
    :trigger="['hover']"
    placement="bottomRight"
    overlay-class-name="pb-user-dropdown"
    :mouse-enter-delay="0.05"
  >
    <button
      type="button"
      class="user-avatar"
      aria-label="用户菜单"
      aria-haspopup="menu"
      @click="goCenter()"
    >
      <img v-if="avatarUrl" :src="avatarUrl" alt="" />
      <UserOutlined v-else />
    </button>
    <template #overlay>
      <div class="user-menu" role="menu">
        <div class="user-menu-head">
          <div class="user-menu-head-row">
            <span class="user-menu-phone">{{ maskedPhone }}</span>
            <span v-if="badgeText" class="user-menu-badge">
              <TeamOutlined />
              {{ badgeText }}
            </span>
          </div>
          <p v-if="companyName" class="user-menu-company">{{ companyName }}</p>
        </div>

        <div class="user-menu-list">
          <button
            v-for="item in menuItems"
            :key="item.key"
            type="button"
            class="user-menu-item"
            :class="{ active: activeKey === item.key }"
            role="menuitem"
            @click="onMenuClick(item.key)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="user-menu-divider" />

        <button
          type="button"
          class="user-menu-item logout"
          role="menuitem"
          @click="onMenuClick('logout')"
        >
          退出登录
        </button>
      </div>
    </template>
  </a-dropdown>
</template>

<style scoped lang="scss">
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #2f7cf6;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(47, 124, 246, 0.28);
  transition: transform 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover,
  &:focus-visible {
    transform: scale(1.04);
    outline: none;
  }
}
</style>

<style lang="scss">
.pb-user-dropdown {
  padding-top: 8px;

  .user-menu {
    width: 260px;
    padding: 0 0 8px;
    overflow: hidden;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(28, 55, 110, 0.14);
  }

  .user-menu-head {
    position: relative;
    padding: 18px 16px 14px;
    overflow: hidden;
    background:
      radial-gradient(
        120px 80px at 88% 20%,
        rgba(120, 196, 255, 0.45),
        transparent 70%
      ),
      linear-gradient(180deg, #e7f5ff 0%, #f7fbff 72%, #fff 100%);
  }

  .user-menu-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .user-menu-phone {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    color: #1a1a1a;
    letter-spacing: 0.02em;
  }

  .user-menu-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    height: 20px;
    padding: 0 8px;
    border-radius: 10px;
    background: linear-gradient(90deg, #2ec8d8 0%, #3ad3c4 100%);
    color: #fff;
    font-size: 11px;
    line-height: 20px;
    white-space: nowrap;

    .anticon {
      font-size: 11px;
    }
  }

  .user-menu-company {
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #9aa3b0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-menu-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px 0;
  }

  .user-menu-item {
    display: block;
    width: calc(100% - 20px);
    margin: 0 10px;
    padding: 9px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #333;
    font-size: 14px;
    line-height: 22px;
    text-align: left;
    cursor: pointer;

    &:hover,
    &.active {
      background: #eaf4ff;
      color: #1a1a1a;
    }

    &.logout {
      margin-top: 0;
    }
  }

  .user-menu-list .user-menu-item {
    width: 100%;
    margin: 0;
  }

  .user-menu-divider {
    height: 1px;
    margin: 8px 16px;
    background: #eef1f5;
  }
}
</style>
