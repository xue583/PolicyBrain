<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  DownOutlined,
  EnvironmentOutlined,
  BellFilled,
  RightOutlined,
} from '@ant-design/icons-vue'
import { navItems } from '@/mock/nav'
import { loadRegionOptions, type CityOption } from '@/api/meta'
import { selectRegionCity, selectRegionProvince } from '@/utils/regionActions'
import { useAuthStore } from '@/stores/auth'
import { useRegionStore } from '@/stores/region'
import { onNeedLogin } from '@/utils/auth'
import logoImg from '@/assets/logo-full.png'
import logoLightImg from '@/assets/logo-light.png'
import robotImg from '@/assets/home/robot.png'
import mobileImg from '@/assets/home/container-1.png'
import vipEntryImg from '@/assets/home/vip-entry.png'
import LoginModal from './LoginModal.vue'
import UserAccountMenu from './UserAccountMenu.vue'

defineOptions({ name: 'AppHeader' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const regionStore = useRegionStore()
const { isLoggedIn } = storeToRefs(auth)
const { areaLabel } = storeToRefs(regionStore)

const provinceOptions = ref<CityOption[]>([])
const cityOptions = ref<CityOption[]>([])
const regionOpen = ref(false)
const activeProvinceId = ref<number | null>(null)
const activeCityId = ref<number | null>(null)
const cityLoading = ref(false)
const loginOpen = ref(false)
const scrolled = ref(false)

const activeNav = computed(() => (route.meta.navKey as string) || 'home')
const isHome = computed(() => route.name === 'home')
const isMembership = computed(() => route.name === 'membership')
const isImmersive = computed(() => Boolean(route.meta.immersiveHeader))
const overlayHeader = computed(() => isImmersive.value && !scrolled.value)
const headerLogo = computed(() =>
  overlayHeader.value ? logoLightImg : logoImg,
)

let offNeedLogin: (() => void) | undefined
let scrollRaf = 0

const onScroll = () => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 8
    scrollRaf = 0
  })
}

const showCities = async (province: CityOption) => {
  activeProvinceId.value = province.id
  activeCityId.value = null
  cityLoading.value = true
  cityOptions.value = []
  try {
    const list = await loadRegionOptions(province.id)
    if (activeProvinceId.value === province.id) cityOptions.value = list
  } catch {
    if (activeProvinceId.value === province.id) cityOptions.value = []
  } finally {
    if (activeProvinceId.value === province.id) cityLoading.value = false
  }
}

const selectProvince = (province: CityOption) => {
  void showCities(province)
  void selectRegionProvince(province)
}

const selectCity = (city: CityOption) => {
  const province =
    provinceOptions.value.find((item) => item.id === activeProvinceId.value) ??
    provinceOptions.value.find((item) => item.id === regionStore.provinceId)
  if (!province) return
  selectRegionCity(province, city)
  regionOpen.value = false
}

/** 打开面板时把当前选择回填到省/市两列 */
const syncColumnsWithSelection = async () => {
  let provinces = provinceOptions.value
  if (!provinces.length) {
    try {
      provinces = await loadRegionOptions()
    } catch {
      provinces = []
    }
    provinceOptions.value = provinces
  }
  const currentProvince =
    provinces.find((item) => item.id === regionStore.provinceId) ??
    provinces.find((item) => item.label === regionStore.province)
  if (!currentProvince) {
    activeProvinceId.value = null
    activeCityId.value = null
    cityOptions.value = []
    return
  }
  await showCities(currentProvince)
  const currentCity =
    cityOptions.value.find((item) => item.id === regionStore.cityId) ??
    cityOptions.value.find((item) => item.label === regionStore.city)
  activeCityId.value = currentCity?.id ?? null
}

watch(regionOpen, (open) => {
  if (open) void syncColumnsWithSelection()
})

const onNavClick = ({ key }: { key: string | number }) => {
  const name = String(key)
  if (route.name !== name) {
    void router.push({ name })
  }
}

const goHome = () => {
  void router.push({ name: 'home' })
}

const goMembership = () => {
  if (route.name !== 'membership') {
    void router.push({ name: 'membership' })
  }
}

const goWorkbench = () => {
  if (route.name !== 'workspace') {
    void router.push({ name: 'workspace' })
  }
}

const openLogin = () => {
  loginOpen.value = true
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  offNeedLogin = onNeedLogin(() => {
    loginOpen.value = true
  })
  void auth.hydrateUser()
  void loadRegionOptions()
    .then((provinces) => {
      provinceOptions.value = provinces
    })
    .catch(() => undefined)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  offNeedLogin?.()
})
</script>

<template>
  <a-layout-header
    class="app-header"
    :class="{
      'is-scrolled': scrolled,
      'is-solid': !isHome && !isImmersive,
      'is-immersive': overlayHeader,
      'is-membership': isMembership,
    }"
  >
    <div class="header-inner">
      <div class="header-left">
        <div class="logo" @click="goHome">
          <img
            :src="headerLogo"
            alt="政策大脑 POLICY BRAIN"
            fetchpriority="high"
          />
        </div>

        <a-dropdown
          v-model:open="regionOpen"
          :trigger="['click']"
          placement="bottomLeft"
        >
          <a class="city-select" @click.prevent>
            <EnvironmentOutlined class="city-pin" />
            <span class="city-label">{{ areaLabel }}</span>
            <DownOutlined class="city-arrow" />
          </a>
          <template #overlay>
            <div class="city-cascader" @mousedown.stop>
              <ul class="city-cascader-col">
                <li
                  v-if="!provinceOptions.length"
                  class="city-cascader-item is-muted"
                >
                  加载中...
                </li>
                <li
                  v-for="province in provinceOptions"
                  :key="province.id"
                  class="city-cascader-item"
                  :class="{
                    'is-active': province.id === activeProvinceId,
                    'is-selected':
                      province.id === regionStore.provinceId &&
                      !regionStore.cityId,
                  }"
                  @mouseenter="showCities(province)"
                  @click.stop="selectProvince(province)"
                >
                  <span>{{ province.label }}</span>
                  <RightOutlined class="cascader-arrow" />
                </li>
              </ul>
              <ul v-if="activeProvinceId" class="city-cascader-col">
                <li v-if="cityLoading" class="city-cascader-item is-muted">
                  加载中...
                </li>
                <li
                  v-else-if="!cityOptions.length"
                  class="city-cascader-item is-muted"
                >
                  暂无城市
                </li>
                <template v-else>
                  <li
                    v-for="city in cityOptions"
                    :key="city.id"
                    class="city-cascader-item"
                    :class="{
                      'is-active': city.id === activeCityId,
                      'is-selected': city.id === regionStore.cityId,
                    }"
                    @click.stop="selectCity(city)"
                  >
                    <span>{{ city.label }}</span>
                  </li>
                </template>
              </ul>
            </div>
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
        <a class="ai-link" @click.prevent="goWorkbench">
          <img :src="robotImg" alt="" class="ai-icon" />
          <span class="ai-link-text">AI政策大脑</span>
        </a>
        <a class="mobile-link">
          <img :src="mobileImg" alt="" class="mobile-icon" />
          <span>移动端</span>
        </a>
        <a
          class="vip-link"
          :style="{ backgroundImage: `url(${vipEntryImg})` }"
          @click.prevent="goMembership"
        >
          开通会员
        </a>
        <a class="mobile-link">
          <BellFilled />
          <span>消息</span>
        </a>
        <UserAccountMenu v-if="isLoggedIn" />
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
  padding: 17px 0 17px;
  line-height: 64px;
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.61) 0%,
    rgba(255, 255, 255, 0) 100%
  );

  &.is-scrolled,
  &.is-solid {
    background: #fff !important;
  }

  &.is-scrolled {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  &.is-immersive {
    .city-select {
      color: #fff;
      background: rgba(255, 255, 255, 0.16);

      .city-pin,
      .city-arrow {
        color: #fff;
      }
    }

    .header-menu :deep(.ant-menu-item) {
      color: rgba(255, 255, 255, 0.88);

      &:hover,
      &.ant-menu-item-selected {
        color: #fff;
      }

      &.ant-menu-item-selected::after {
        border-bottom-color: #fff;
      }
    }

    .header-right {
      .ai-link,
      .mobile-link {
        color: rgba(255, 255, 255, 0.92);
      }

      .ai-link-text {
        background: linear-gradient(0deg, #d7ecff 0%, #ffffff 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }

      .mobile-icon {
        opacity: 1;
        filter: brightness(2.2);
      }
    }
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
    height: 60px;
    width: 120px;
    object-fit: contain;
  }
}

.app-header.is-membership .logo img {
  height: 37px;
}

.city-select {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  width: auto;
  min-width: 122px;
  max-width: 210px;
  height: 32px;
  background: rgba(226, 237, 255, 0.67);
  border-radius: 174px;
  padding: 0 14px 0 17px;

  .city-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .city-pin {
    color: var(--pb-primary);
    font-size: 13px;
  }

  .city-arrow {
    flex-shrink: 0;
    font-size: 10px;
    color: #999;
  }
}

.city-cascader {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.city-cascader-col {
  min-width: 148px;
  max-height: 320px;
  margin: 0;
  padding: 6px 0;
  overflow: auto;
  list-style: none;

  & + & {
    border-left: 1px solid #f0f0f0;
  }
}

.city-cascader-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 32px;
  padding: 0 12px;
  color: #343434;
  font-size: 13px;
  line-height: 32px;
  white-space: nowrap;
  cursor: pointer;

  &:hover,
  &.is-active {
    background: #f5f8ff;
    color: var(--pb-primary);
  }

  &.is-selected {
    color: var(--pb-primary);
    font-weight: 600;
  }

  &.is-muted {
    color: #999;
    cursor: default;

    &:hover {
      background: transparent;
      color: #999;
    }
  }

  .cascader-arrow {
    flex-shrink: 0;
    font-size: 10px;
    color: #bfbfbf;
  }
}

.header-menu {
  flex: 1;
  min-width: 0;
  margin-left: 8%;
  border-bottom: none;
  line-height: 62px;
  background: transparent;
  font-size: 16px;

  :deep(.ant-menu-item) {
    padding-inline: 14px;
    color: #343434;
    font-weight: 400;

    &::after {
      inset-inline: 14px;
      border-bottom-width: 2px;
    }

    &:hover {
      color: var(--pb-primary);
    }
  }

  :deep(.ant-menu-item-selected) {
    color: var(--pb-primary);
    font-weight: 500;

    &::after {
      border-bottom-color: var(--pb-primary);
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

  .ai-link {
    cursor: pointer;
  }

  .ai-icon {
    width: 24px;
    height: 22px;
    object-fit: contain;
  }

  .mobile-link {
    font-size: 16px;
  }

  .ai-link-text {
    font-weight: 500;
    font-size: 16px;
    font-style: italic;
    text-transform: none;
    background: linear-gradient(0deg, #2151a2 0%, #2fabe0 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  .vip-link {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    width: 112px;
    height: 39px;
    padding: 0 14px 0 38px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    color: #3e2a0d;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.1em;
    line-height: 39px;
    white-space: nowrap;
    text-decoration: none;
    text-shadow: 0 1px 0 rgba(255, 248, 230, 0.65);
    filter: drop-shadow(0 1px 2px rgba(176, 130, 50, 0.22));
    cursor: pointer;
    user-select: none;

    &:hover {
      filter: drop-shadow(0 1px 2px rgba(176, 130, 50, 0.22)) brightness(1.06);
      color: #d4b05c;
    }
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
}

@include below-lg {
  .header-menu {
    display: none;
  }
}
</style>
