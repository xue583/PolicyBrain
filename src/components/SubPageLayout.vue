<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getSubPageHero } from '@/mock/policyNews'
import { SITE } from '@/constants/site'
import SiteQrBlock from '@/components/SiteQrBlock.vue'
import { useSyncedSearchQuery } from '@/composables/useRouteKeyword'
import logoLightImg from '@/assets/logo-light.png'
import heroBg from '@/assets/hero-bg.png'
import policyDbBg from '@/assets/policy-db-bg.png'
import enterpriseDbBg from '@/assets/enterpriseDb/banner@2x.png'
import matchBanner from '@/assets/enterpriseDb/match/banner.png'
import exportBanner from '@/assets/export/banner@2x.png'
import investDb from '@/assets/investDb/banner@2x.png'
import apiBg from '@/assets/api/banner@2x.png'

defineOptions({ name: 'SubPageLayout' })

const route = useRoute()

const pageKey = computed(() => (route.meta.navKey as string) || '')
const hideHero = computed(() => Boolean(route.meta.hideHero))
const fillContent = computed(() => Boolean(route.meta.fillContent))
const hero = computed(() => getSubPageHero(pageKey.value))
const heroBgByPage: Record<string, string> = {
  'policy-db': policyDbBg,
  'enterprise-db': enterpriseDbBg,
  'invest-db': investDb,
  api: apiBg,
  export: exportBanner,
}
const isPolicyMatch = computed(() => route.name === 'enterprise-db-match')
const currentHeroBg = computed(() =>
  isPolicyMatch.value ? matchBanner : (heroBgByPage[pageKey.value] ?? heroBg),
)
const showPageBg = computed(
  () =>
    (isPolicyMatch.value || !hideHero.value) &&
    pageKey.value !== 'export' &&
    pageKey.value !== 'invest-db' &&
    pageKey.value !== 'api',
)
const isOverlayBanner = computed(
  () =>
    pageKey.value === 'export' ||
    pageKey.value === 'invest-db' ||
    pageKey.value === 'api',
)
const isEnterpriseDb = computed(() => pageKey.value === 'enterprise-db')
const isPersonalCenter = computed(() => pageKey.value === 'personal-center')
const { keyword, applyKeyword } = useSyncedSearchQuery({
  clearWhen: pageKey,
})

const openBeian = () => {
  window.open(SITE.icpUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div
    class="sub-page"
    :class="{ 'personal-center-bg': isPersonalCenter, 'is-fill': fillContent }"
  >
    <div
      v-if="showPageBg"
      class="page-bg"
      :class="{ 'enterprise-bg': isEnterpriseDb }"
      :style="{ backgroundImage: `url(${currentHeroBg})` }"
    />

    <section
      v-if="!hideHero"
      class="hero"
      :class="{ 'overlay-banner': isOverlayBanner }"
    >
      <img
        v-if="isOverlayBanner"
        class="hero-banner"
        :src="currentHeroBg"
        alt=""
      />
      <div class="hero-inner" :class="{ 'no-search': hero.hideSearch }">
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

    <div
      class="page-content"
      :class="{ 'is-detail': hideHero, 'is-fill': fillContent }"
    >
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
            <router-link to="/about">
              <svg
                class="footer-nav-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="9.6" cy="6.7" r="2.9" />
                <path d="M5 20v-4.8h9.2V20" />
                <path d="M2.8 17.6h1.6" />
              </svg>
              <span>关于我们</span>
            </router-link>
            <router-link to="/about/member">
              <svg
                class="footer-nav-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="3.8" r="1.2" />
                <path d="M5.2 16.8v-5.4l3.1 2.3L12 6.6l3.7 7.1 3.1-2.3v5.4z" />
                <circle cx="12" cy="12.2" r="1.1" />
              </svg>
              <span>会员协议</span>
            </router-link>
            <router-link to="/about/agreement">
              <svg
                class="footer-nav-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="7" r="2.9" />
                <path d="M7.6 20v-2.4a4.4 4.4 0 0 1 8.8 0V20" />
                <path d="M5.4 20h13.2" />
              </svg>
              <span>用户协议</span>
            </router-link>
            <router-link to="/about/privacy">
              <svg
                class="footer-nav-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M6.8 4.2h10.4a2.4 2.4 0 0 1 2.4 2.4v10.8a2.4 2.4 0 0 1-2.4 2.4H6.8a2.4 2.4 0 0 1-2.4-2.4V6.6a2.4 2.4 0 0 1 2.4-2.4z"
                />
                <path d="M8.4 9.2h5.2M8.4 12.6h7.2" />
                <path d="M13.4 20.4l5-5" />
              </svg>
              <span>隐私政策</span>
            </router-link>
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
          <!-- 版权所有:河南政策大脑数字科技有限公司 &nbsp; &nbsp; &nbsp; -->
          Copyright © 2026 {{ SITE.name }} {{ SITE.englishName }} {{ SITE.icp }}
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.sub-page {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  overflow-x: hidden;
  background: var(--pb-bg);

  &.is-fill {
    height: calc(100vh - 64px);
    max-height: calc(100vh - 64px);
    overflow: hidden;
  }
}

.personal-center-bg {
  background: linear-gradient(180deg, rgba(215, 231, 250) 0%, #fff 100%);
}

.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 386px;
  opacity: 1;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 100%;
  pointer-events: none;
  z-index: 0;

  &.enterprise-bg::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 42%;
    background: linear-gradient(
      180deg,
      rgb(240 242 245 / 0) 0%,
      var(--pb-bg) 72%
    );
  }
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
}

.hero-banner {
  display: block;
  width: 100%;
  height: 474px;
}

// 文案叠在通栏背景上，投资项目库与数据导出共用
.overlay-banner {
  .hero-inner {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
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
    font-size: 30px;
    color: #3d5a80;
    letter-spacing: 1px;
  }

  h1 {
    margin: 0 0 15px;
    font-size: 48px;
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
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 16px 0 40px;
  background: transparent;

  &.is-detail {
    padding-top: 24px;
  }

  &.is-fill {
    min-height: 0;
    padding-bottom: 16px;
    overflow: hidden;
  }
}

.content-card {
  border-radius: var(--pb-radius-lg);
  box-shadow: var(--pb-shadow-card);

  :deep(.ant-card-body) {
    padding: 30px;
  }
}

.page-content.is-detail .content-card {
  background: transparent;
  box-shadow: none;

  :deep(.ant-card-body) {
    padding: 0;
    font-size: 16px;
  }
}

.page-footer {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  background: #1f2a37;
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
  gap: var(--pb-gap);
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

// 限宽使四项在 logo 右侧均匀铺开，同时不顶到页脚右边缘
.footer-nav {
  display: flex;
  justify-content: space-between;
  width: 520px;
  max-width: 100%;
  margin: 0 auto;

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}

.footer-nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
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

@include below-lg {
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

// 窄屏下一行放不下「logo + 四个链接」，改为 logo 在上、链接两行两列
@media (max-width: $bp-md) {
  .footer-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer-nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    row-gap: 14px;
    width: 100%;
    margin: 0;
  }
}
</style>
