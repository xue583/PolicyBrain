<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppHeader from './components/AppHeader.vue'
import VipPromoModal from './components/VipPromoModal.vue'
import { PRIMARY_COLOR } from '@/constants/site'
import { useAuthStore } from '@/stores/auth'
import { useRegionSync } from '@/composables/useRegionSync'
import {
  markInviteRegister,
  rememberInviteCode,
  triggerNeedLogin,
} from '@/utils/auth'

dayjs.locale('zh-cn')

const route = useRoute()
const isCockpit = computed(() => route.meta.cockpit === true)
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)
useRegionSync()
const VIP_PROMO_DISMISS_KEY = 'pb_vip_promo_dismiss_date'

const promoOpen = ref(false)
const PROMO_DELAY_MS = 3000
let promoTimer = 0

const isPromoDismissedToday = () => {
  try {
    return (
      localStorage.getItem(VIP_PROMO_DISMISS_KEY) ===
      dayjs().format('YYYY-MM-DD')
    )
  } catch {
    return false
  }
}

const dismissPromoToday = () => {
  try {
    localStorage.setItem(VIP_PROMO_DISMISS_KEY, dayjs().format('YYYY-MM-DD'))
  } catch {
    // 存储不可用时仍关闭本次弹窗
  }
}

const canShowPromo = () =>
  !isCockpit.value &&
  !isLoggedIn.value &&
  route.name !== 'membership' &&
  !route.query.invite &&
  !isPromoDismissedToday()

const armPromo = () => {
  window.clearTimeout(promoTimer)
  if (!canShowPromo()) return
  promoTimer = window.setTimeout(() => {
    if (canShowPromo()) promoOpen.value = true
  }, PROMO_DELAY_MS)
}

onMounted(armPromo)
onUnmounted(() => {
  window.clearTimeout(promoTimer)
})

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) promoOpen.value = false
})

watch(
  () => route.name,
  (name) => {
    if (name === 'membership') promoOpen.value = false
  },
  { immediate: true },
)

watch(
  () => route.query.invite,
  (invite) => {
    const value = Array.isArray(invite) ? invite[0] : invite
    if (typeof value !== 'string' || !value.trim()) return
    rememberInviteCode(value)
    if (isLoggedIn.value) return
    promoOpen.value = false
    markInviteRegister()
    triggerNeedLogin()
  },
  { immediate: true },
)
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        colorPrimary: PRIMARY_COLOR,
        borderRadius: 8,
        borderRadiusLG: 20,
        colorBgLayout: 'transparent',
        fontFamily: 'var(--pb-font-body)',
      },
      components: {
        Layout: {
          colorBgHeader: 'transparent',
          colorBgBody: 'transparent',
        },
        Menu: {
          colorItemBg: 'transparent',
          colorItemTextHover: PRIMARY_COLOR,
          colorItemTextSelected: PRIMARY_COLOR,
        },
      },
    }"
  >
    <a-layout class="app-shell" :class="{ 'is-cockpit': isCockpit }">
      <AppHeader v-if="!isCockpit" />
      <router-view />
      <VipPromoModal
        v-if="!isCockpit"
        v-model:open="promoOpen"
        @dismiss-today="dismissPromoToday"
      />
    </a-layout>
  </a-config-provider>
</template>

<style>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--pb-bg);
}

.app-shell.is-cockpit {
  height: 100vh;
  overflow: hidden;
  background: #e7f3ff;
}

@media (max-width: 992px), (max-height: 760px) {
  .app-shell.is-cockpit {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}
</style>
