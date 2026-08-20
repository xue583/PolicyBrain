<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppHeader from './components/AppHeader.vue'
import { PRIMARY_COLOR } from '@/constants/site'

dayjs.locale('zh-cn')
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        colorPrimary: PRIMARY_COLOR,
        borderRadius: 4,
      },
    }"
  >
    <a-layout class="app-shell">
      <AppHeader />
      <router-view />
    </a-layout>
  </a-config-provider>
</template>

<style>
.app-shell {
  min-height: 100vh;
  background: var(--pb-bg);
}
</style>
