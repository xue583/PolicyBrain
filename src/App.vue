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

dayjs.locale('zh-cn')

const route = useRoute()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)
const promoOpen = ref(false)

onMounted(() => {
  if (!isLoggedIn.value && route.name !== 'membership') promoOpen.value = true
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
      <VipPromoModal v-model:open="promoOpen" />
    </a-layout>
  </a-config-provider>
</template>

<style>
.app-shell {
  min-height: 100vh;
  background: var(--pb-bg);
}
</style>
