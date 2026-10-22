<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)
useRegionSync()
const VIP_PROMO_DISMISS_KEY = 'pb_vip_promo_dismiss_date'

const promoOpen = ref(false)

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

onMounted(() => {
  if (
    !isLoggedIn.value &&
    route.name !== 'membership' &&
    !route.query.invite &&
    !isPromoDismissedToday()
  ) {
    promoOpen.value = true
  }
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
    <a-layout class="app-shell">
      <AppHeader />
      <router-view />
      <VipPromoModal
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
</style>
