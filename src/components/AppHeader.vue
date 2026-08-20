<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { DownOutlined, EnvironmentOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { cities, navItems } from '@/mock/policyNews'
import { useAuthStore } from '@/stores/auth'
import { onNeedLogin } from '@/utils/auth'
import logoImg from '@/assets/logo-full.png'
import robotImg from '@/assets/home/robot.png'
import mobileImg from '@/assets/home/container-1.png'
import LoginModal from './LoginModal.vue'

defineOptions({ name: 'AppHeader' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn, user } = storeToRefs(auth)

const currentCity = ref('郑州市')
const loginOpen = ref(false)
const scrolled = ref(false)

const activeNav = computed(() => (route.meta.navKey as string) || 'home')

let offNeedLogin: (() => void) | undefined

const onScroll = () => {
  scrolled.value = window.scrollY > 8
}

const onCitySelect = ({ key }: { key: string | number }) => {
  currentCity.value = String(key)
}

const onNavClick = ({ key }: { key: string | number }) => {
  const name = String(key)
  if (route.name !== name) {
    void router.push({ name })
  }
}

const goHome = () => {
  void router.push({ name: 'home' })
}

const openLogin = () => {
  loginOpen.value = true
}

const displayName = () => {
  return (
    (user.value?.nickname as string) ||
    (user.value?.phone as string) ||
    '已登录'
  )
}

const onLogout = async () => {
  await auth.logout()
  message.success('已退出登录')
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  offNeedLogin = onNeedLogin(() => {
    loginOpen.value = true
  })
  void auth.hydrateUser()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  offNeedLogin?.()
})
</script>

<template>
  <a-layout-header class="app-header" :class="{ 'is-scrolled': scrolled }">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo" @click="goHome">
          <img
            :src="logoImg"
            alt="政策大脑 POLICY BRAIN"
            fetchpriority="high"
          />
        </div>

        <a-dropdown>
          <a class="city-select" @click.prevent>
            <EnvironmentOutlined class="city-pin" />
            <span>{{ currentCity }}</span>
            <DownOutlined class="city-arrow" />
          </a>
          <template #overlay>
            <a-menu :selected-keys="[currentCity]" @click="onCitySelect">
              <a-menu-item v-for="city in cities" :key="city">{{
                city
              }}</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <a-menu
        :selected-keys="[activeNav]"
        mode="horizontal"
        class="header-menu"
        :items="navItems.map((n) => ({ key: n.key, label: n.label }))"
        @click="onNavClick"
      />

      <div class="header-right">
        <a class="ai-link">
          <img :src="robotImg" alt="" class="ai-icon" />
          <span class="ai-link-text">AI政策大脑</span>
        </a>
        <a class="mobile-link">
          <img :src="mobileImg" alt="" class="mobile-icon" />
          <span>移动端</span>
        </a>

        <template v-if="isLoggedIn">
          <a-dropdown>
            <a class="user-entry" @click.prevent>
              <span>{{ displayName() }}</span>
              <DownOutlined class="user-arrow" />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="onLogout"
                  >退出登录</a-menu-item
                >
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <a-button v-else type="primary" class="login-btn" @click="openLogin">
          登录/注册
        </a-button>
      </div>
    </div>
  </a-layout-header>

  <LoginModal v-model:open="loginOpen" />
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  padding: 17px 0 0;
  line-height: 64px;
  background: transparent !important;
  border-bottom: none;
  box-shadow: none;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  &.is-scrolled {
    background: #fff !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    padding-bottom: 17px !important;
  }
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: calc(100% - 32px);
  height: 100%;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  line-height: 1;
  cursor: pointer;

  img {
    display: block;
    height: 65px;
    width: auto;
    object-fit: contain;
  }
}

.city-select {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  width: 122px;
  height: 32px;
  background: rgba(226, 237, 255, 0.67);
  border-radius: 174px 174px 174px 174px;
  padding-left: 17px;

  .city-pin {
    color: var(--pb-primary);
    font-size: 13px;
  }

  .city-arrow {
    font-size: 10px;
    color: #999;
  }
}

.header-menu {
  flex: 1;
  min-width: 0;
  margin-left: 8%;
  border-bottom: none !important;
  line-height: 62px;
  background: transparent !important;
  font-size: 16px;

  :deep(.ant-menu-item) {
    padding-inline: 14px !important;
    color: #333;
    font-weight: 400;

    &::after {
      inset-inline: 14px !important;
      border-bottom-width: 2px !important;
    }

    &:hover {
      color: var(--pb-primary) !important;
    }
  }

  :deep(.ant-menu-item-selected) {
    color: var(--pb-primary) !important;
    font-weight: 500;

    &::after {
      border-bottom-color: var(--pb-primary) !important;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  .ai-link,
  .mobile-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #666;
    white-space: nowrap;
    line-height: 1;

    &:hover {
      color: var(--pb-primary);
    }
  }

  .ai-icon {
    width: 59px;
    height: 56px;
    object-fit: contain;
  }

  .mobile-link {
    font-size: 16px;
  }

  .ai-link-text {
    height: 23px;
    font-weight: 500;
    font-size: 24px;
    font-style: italic;
    text-transform: none;
    background: linear-gradient(0deg, #2151a2 0%, #2fabe0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  .mobile-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    opacity: 0.7;
    filter: brightness(0.3);
  }

  .login-btn {
    height: 32px;
    padding-inline: 16px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 10px rgba(22, 119, 255, 0.28);
  }

  .user-entry {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #333;
    font-size: 14px;
    white-space: nowrap;

    &:hover {
      color: var(--pb-primary);
    }
  }

  .user-arrow {
    font-size: 10px;
    color: #999;
  }
}

@media (max-width: 992px) {
  .header-menu {
    display: none;
  }
}
</style>
