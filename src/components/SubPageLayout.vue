<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getSubPageHero, navItems } from '@/mock/policyNews'
import { SITE } from '@/constants/site'
import SiteQrBlock from '@/components/SiteQrBlock.vue'
import logoLightImg from '@/assets/logo-light.png'
import heroBg from '@/assets/hero-bg.png'
import policyDbBg from '@/assets/policy-db-bg.png'
import enterpriseDbBg from '@/assets/enterprise-db-bg.png'
import exportBanner from '@/assets/export/banner@2x.png'

defineOptions({ name: 'SubPageLayout' })

const route = useRoute()
const router = useRouter()

const pageKey = computed(() => (route.meta.navKey as string) || '')
const hideHero = computed(() => Boolean(route.meta.hideHero))
const hero = computed(() => getSubPageHero(pageKey.value))
const heroBgByPage: Record<string, string> = {
  'policy-db': policyDbBg,
  'enterprise-db': enterpriseDbBg,
  export: exportBanner,
}
const currentHeroBg = computed(() => heroBgByPage[pageKey.value] ?? heroBg)
const isFullBanner = computed(() => pageKey.value === 'export')
const keyword = ref(String(route.query.q ?? ''))

watch(
  () => route.query.q,
  (q) => {
    const next = String(q ?? '')
    if (keyword.value !== next) keyword.value = next
  },
)

watch(pageKey, () => {
  if (!route.query.q) keyword.value = ''
})

watch(keyword, (val) => {
  const q = val.trim()
  const current = String(route.query.q ?? '')
  if (q === current) return
  void router.replace({ query: q ? { q } : {} })
})

const applyKeyword = () => {
  const q = keyword.value.trim()
  const current = String(route.query.q ?? '')
  if (q === current) return
  void router.replace({ query: q ? { q } : {} })
}

const onFooterNav = (key: string) => {
  void router.push({ name: key })
}

const openBeian = () => {
  window.open(SITE.icpUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="sub-page">
    <div
      v-if="!hideHero && !isFullBanner"
      class="page-bg"
      :style="{ backgroundImage: `url(${currentHeroBg})` }"
    />

    <section
      v-if="!hideHero"
      class="hero"
      :class="{ 'full-banner': isFullBanner }"
    >
      <img
        v-if="isFullBanner"
        class="hero-banner"
        :src="currentHeroBg"
        alt="数据导出"
      />
      <div v-else class="hero-inner" :class="{ 'no-search': hero.hideSearch }">
        <div class="hero-copy">
          <p class="hero-slogan">{{ hero.slogan }}</p>
          <h1>{{ hero.title }}</h1>
          <p class="hero-desc">{{ hero.description }}</p>
          <div v-if="!hero.hideSearch" class="search-bar">
            <a-input
              v-model:value="keyword"
              size="large"
              allow-clear
              :placeholder="hero.searchPlaceholder"
              @press-enter="applyKeyword"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
            <a-button
              type="primary"
              size="large"
              class="search-btn"
              @click="applyKeyword"
            >
              搜索
            </a-button>
          </div>
        </div>
      </div>
    </section>

    <div class="page-content" :class="{ 'is-detail': hideHero }">
      <router-view />
      <!-- <a-card class="content-card" :bordered="false">
        <router-view />
      </a-card> -->
    </div>

    <footer class="page-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="logo light">
            <img :src="logoLightImg" alt="政策大脑 POLICY BRAIN" />
          </div>
          <div class="footer-nav">
            <a
              v-for="item in navItems"
              :key="item.key"
              :class="{ active: item.key === pageKey }"
              @click="onFooterNav(item.key)"
            >
              {{ item.label }}
            </a>
          </div>
        </div>

        <div class="footer-main">
          <div class="footer-col contact">
            <p><strong>客服热线：</strong>{{ SITE.phone }}</p>
            <p><strong>工作时间：</strong>{{ SITE.workHours }}</p>
            <p><strong>联系地址：</strong>{{ SITE.address }}</p>
          </div>
          <div class="footer-col disclaimer">
            <p>
              免责声明:以上信息基于公开信息得出，由于存在更新延迟，不保证数据与实际数据相符，仅供参考，不构成任何明示或暗示的观点或保证。
            </p>
            <p>
              隐私服务:以上信息虽基于公开信息得出，但我们非常尊重个人隐私和意愿，若企业数据库中联系方式对您带来困扰，请联系客服删除此项。
            </p>
          </div>
          <div class="footer-col qr">
            <SiteQrBlock variant="footer" />
          </div>
        </div>

        <div class="footer-bottom" @click="openBeian">
          Copyright © 2026 {{ SITE.name }} {{ SITE.englishName }} {{ SITE.icp }}
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.sub-page {
  position: relative;
  min-height: calc(100vh - 64px);
  overflow-x: hidden;
  background: var(--pb-bg);
}

.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 386px;
  opacity: 1;
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 100%;
  pointer-events: none;
  z-index: 0;
}

.logo {
  display: flex;
  align-items: center;
  line-height: 1;

  img {
    display: block;
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  &.light img {
    height: 48px;
  }
}

.hero {
  position: relative;
  z-index: 1;
  width: 100%;
  background: transparent;

  &.full-banner {
    line-height: 0;
  }
}

.hero-banner {
  display: block;
  width: 100%;
  height: auto;
}

.hero-inner {
  position: relative;
  display: flex;
  align-items: center;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 50px 0 35px;

  &.no-search {
    padding-bottom: 48px;

    .hero-copy {
      max-width: 760px;
    }
  }
}

.hero-copy {
  flex: 1;
  max-width: 640px;

  .hero-slogan {
    margin: 0 0 8px;
    font-size: 36px;
    color: #3d5a80;
    letter-spacing: 1px;
  }

  h1 {
    margin: 0 0 15px;
    font-size: 64px;
    font-weight: 700;
    color: var(--pb-primary);
    line-height: 1.2;
  }

  .hero-desc {
    margin: 0 0 20px;
    font-size: 16px;
    color: #343434;
  }
}

.search-bar {
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.12);

  :deep(.ant-input-affix-wrapper) {
    flex: 1;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .search-btn {
    height: auto;
    border-radius: 0;
    padding-inline: 28px;
  }
}

.page-content {
  position: relative;
  z-index: 1;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 16px 0 40px;
  min-height: 600px;
  background: transparent;

  &.is-detail {
    padding-top: 24px;
  }
}

.content-card {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-card-body) {
    padding: 30px;
  }
}

.page-content.is-detail .content-card {
  background: transparent;
  box-shadow: none;

  :deep(.ant-card-body) {
    padding: 0;
    font-size: 16px !important;
  }
}

.page-footer {
  position: relative;
  z-index: 1;
  background: #1f2a37 !important;
  color: rgba(255, 255, 255, 0.75);
  padding: 40px 0 0;
}

.footer-inner {
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  gap: 20px;

  a {
    color: rgba(255, 255, 255, 0.75);

    &:hover,
    &.active {
      color: #fff;
    }
  }
}

.footer-main {
  display: grid;
  grid-template-columns: 280px 1fr 220px;
  gap: 32px;
  padding: 28px 0;
}

.footer-col {
  p {
    margin: 0 0 10px;
    line-height: 1.7;
    font-size: 13px;
  }

  strong {
    color: #fff;
    font-weight: 500;
  }
}

.disclaimer p {
  color: rgba(255, 255, 255, 0.55);
  margin: 0 auto;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}

@media (max-width: 992px) {
  .hero-inner {
    padding: 32px 0 28px;
  }

  .hero-copy h1 {
    font-size: 32px;
  }

  .search-bar {
    max-width: 100%;
  }

  .footer-main {
    grid-template-columns: 1fr;
  }
}
</style>
