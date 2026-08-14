<script setup lang="ts">
import { ref } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppHeader from './components/AppHeader.vue'
import HomePage from './views/home/index.vue'
import PolicyNews from './views/policyNews/index.vue'

dayjs.locale('zh-cn')

const activeNav = ref('home')
const currentCity = ref('郑州市')

function onNavigate(key: string) {
  activeNav.value = key
}
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 4,
      },
    }"
  >
    <a-layout class="app-shell">
      <AppHeader v-model:active-nav="activeNav" v-model:current-city="currentCity" />
      <HomePage v-if="activeNav === 'home'" @navigate="onNavigate" />
      <PolicyNews v-else-if="activeNav === 'news'" />
      <div v-else class="page-placeholder">
        <a-empty description="该模块开发中，敬请期待" />
      </div>
    </a-layout>
  </a-config-provider>
</template>

<style>
.app-shell {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 48px 16px;
}
</style>
