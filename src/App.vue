<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import AppHeader from './components/AppHeader.vue'
import SubPageLayout from './components/SubPageLayout.vue'
import HomePage from './views/home/index.vue'
import PolicyNews from './views/policyNews/index.vue'
import { navItems } from './mock/policyNews'

dayjs.locale('zh-cn')

const navKeys = new Set(navItems.map((item) => item.key))

function readTabKey(): string {
  const key = window.location.pathname.replace(/^\/+|\/+$/g, '') || 'home'
  return navKeys.has(key) ? key : 'home'
}

function writeTabKey(key: string) {
  const path = key === 'home' ? '/' : `/${key}`
  if (window.location.pathname !== path) {
    history.pushState({ tabKey: key }, '', path)
  }
}

const activeNav = ref(readTabKey())
const currentCity = ref('郑州市')

watch(activeNav, (key) => {
  writeTabKey(key)
})

function onNavigate(key: string) {
  activeNav.value = key
}

function onPopState() {
  activeNav.value = readTabKey()
}

onMounted(() => {
  writeTabKey(activeNav.value)
  window.addEventListener('popstate', onPopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
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
      <SubPageLayout v-else :page-key="activeNav" @navigate="onNavigate">
        <template #default="{ keyword }">
          <PolicyNews v-if="activeNav === 'news'" :keyword="keyword" />
          <div v-else class="coming-soon">
            <a-empty description="该模块开发中，敬请期待" />
          </div>
        </template>
      </SubPageLayout>
    </a-layout>
  </a-config-provider>
</template>

<style>
.app-shell {
  min-height: 100vh;
  background: #f0f2f5;
}

.coming-soon {
  background: #fff;
  border-radius: 20px;
  padding: 80px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style>
