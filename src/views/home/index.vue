<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  PhoneOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  CommentOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'
import {
  featureCards,
  hotKeywords,
  industryTags,
  homeFollowList,
  type HomeNewsItem,
} from '../../mock/home'
import { fetchNewsPage } from '@/api/news'
import { fetchIndustryNames } from '@/api/meta'
import type { PolicyItem } from '../../mock/policyNews'
import { useRegionStore } from '@/stores/region'
import { orderNewsForCity } from '@/utils/homeNews'
import { Divider } from 'ant-design-vue'
import { SITE } from '@/constants/site'
import { navItems } from '@/mock/nav'
import SiteQrBlock from '@/components/SiteQrBlock.vue'
import heroDecorSm from '../../assets/home/hero-decor-sm.png'
import heroBanner from '../../assets/home/hero-banner.mp4'
import promoBanner from '../../assets/home/promo-banner.png'
import iconPolicy from '../../assets/home/icon-policy.png'
import iconEnterprise from '../../assets/home/icon-enterprise.png'
import iconRobot from '../../assets/home/ai@2x.png'
import iconWorkbench from '../../assets/home/icon-workbench.svg'
import iconIndustry from '../../assets/home/icon-industry.png'
import industryBg from '../../assets/home/industry-card-bg.png'
import featureCardBg from '../../assets/home/feature-card-bg.png'

defineOptions({ name: 'HomePage' })

const router = useRouter()
const regionStore = useRegionStore()
const {
  city: currentCity,
  district: currentDistrict,
  cityLabels,
} = storeToRefs(regionStore)
const searchType = ref<'policy' | 'enterprise'>('policy')
const keyword = ref('')
const newsTab = ref<'news' | 'follow'>('news')
const newsLimit = ref(8)
const newsExpanded = ref(false)
const newsPanelRef = ref<HTMLElement | null>(null)
const newsListRef = ref<HTMLElement | null>(null)
const sidebarRef = ref<HTMLElement | null>(null)

const iconMap: Record<string, string> = {
  policy: iconPolicy,
  enterprise: iconEnterprise,
  robot: iconRobot,
  workbench: iconWorkbench,
}

const remoteNews = ref<HomeNewsItem[]>([])
const newsError = ref('')
const industryTagList = ref<string[]>([...industryTags])

const toHomeNews = (item: PolicyItem): HomeNewsItem => {
  const tones = ['blue', 'green', 'orange', 'gold'] as const
  const closed = item.status === 'expired' || item.daysRemaining < 0
  return {
    id: item.id,
    title: item.title,
    tags: item.tags.map((tag, index) => ({
      text: tag.text,
      tone: tones[index % tones.length] ?? 'blue',
    })),
    time: item.date,
    department: item.department,
    status: closed
      ? 'closed'
      : item.daysRemaining > 0
        ? 'remaining'
        : 'applying',
    statusText: closed
      ? '已截止'
      : item.daysRemaining > 0
        ? `仅剩${item.daysRemaining}天`
        : '正在申报',
  }
}

const currentNews = computed(() =>
  newsTab.value === 'follow' ? homeFollowList : remoteNews.value,
)

let newsRequest = 0

const loadNews = async (city: string, district: string) => {
  const requestId = ++newsRequest
  try {
    const page = await fetchNewsPage({
      pageIndex: 1,
      pageSize: 20,
      region: district || city,
    })
    if (requestId !== newsRequest) return
    remoteNews.value = orderNewsForCity(
      page.items,
      city,
      cityLabels.value,
      district,
    ).map(toHomeNews)
    newsError.value = ''
  } catch {
    if (requestId !== newsRequest) return
    remoteNews.value = []
    newsError.value = '政策资讯加载失败'
  }
}

watch(
  () =>
    `${currentCity.value}\n${currentDistrict.value}\n${cityLabels.value.join('\n')}`,
  () => {
    newsExpanded.value = false
    void loadNews(currentCity.value, currentDistrict.value)
  },
  { immediate: true },
)

const contentBoxHeight = (el: HTMLElement) => {
  const style = getComputedStyle(el)
  const pad =
    (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
  const border =
    (parseFloat(style.borderTopWidth) || 0) +
    (parseFloat(style.borderBottomWidth) || 0)
  let inner = 0
  for (const child of el.children) {
    if (!(child instanceof HTMLElement)) continue
    const childStyle = getComputedStyle(child)
    inner +=
      child.offsetHeight +
      (parseFloat(childStyle.marginTop) || 0) +
      (parseFloat(childStyle.marginBottom) || 0)
  }
  return inner + pad + border
}

let resizeObserver: ResizeObserver | undefined
let fitting = false

const fittedNewsCount = () => {
  if (newsExpanded.value || newsTab.value !== 'news') return null
  const panel = newsPanelRef.value
  const list = newsListRef.value
  const sidebar = sidebarRef.value
  if (!panel || !list || !sidebar) return null
  const industry = sidebar.querySelector('.industry-card')
  const info = sidebar.querySelector('.info-card')
  if (!(industry instanceof HTMLElement) || !(info instanceof HTMLElement))
    return null
  const items = [...list.querySelectorAll<HTMLElement>('.news-item')]
  if (!items.length) return null
  const avg =
    items.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0) /
    items.length
  if (avg < 1) return null

  const sidebarStyle = getComputedStyle(sidebar)
  const sidebarGap = parseFloat(sidebarStyle.rowGap || sidebarStyle.gap) || 0
  const target = industry.offsetHeight + sidebarGap + contentBoxHeight(info)
  const panelStyle = getComputedStyle(panel)
  const pad =
    (parseFloat(panelStyle.paddingTop) || 0) +
    (parseFloat(panelStyle.paddingBottom) || 0)
  const tabs = panel.querySelector('.news-tabs')
  const tabsHeight = tabs instanceof HTMLElement ? tabs.offsetHeight : 0
  const total = currentNews.value.length
  const roomForMore = Math.max(0, target - pad - tabsHeight - 66)
  const withButton = Math.max(1, Math.ceil(roomForMore / avg))
  if (withButton >= total) {
    const room = Math.max(0, target - pad - tabsHeight)
    return Math.min(total, Math.max(1, Math.ceil(room / avg)))
  }
  return Math.min(total, withButton)
}

const syncNewsLimit = () => {
  if (fitting) return
  const count = fittedNewsCount()
  if (count == null || count === newsLimit.value) return
  fitting = true
  newsLimit.value = count
  void nextTick(() => {
    requestAnimationFrame(() => {
      fitting = false
      const next = fittedNewsCount()
      if (next != null && next > newsLimit.value) newsLimit.value = next
    })
  })
}

watch([remoteNews, newsTab], () => {
  void nextTick(() => syncNewsLimit())
})

onMounted(() => {
  void fetchIndustryNames()
    .then((names) => {
      if (names.length) industryTagList.value = names
    })
    .catch(() => undefined)
  if (sidebarRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => syncNewsLimit())
    resizeObserver.observe(sidebarRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

const visibleNews = computed(() => currentNews.value.slice(0, newsLimit.value))

const onSearch = () => {
  const q = keyword.value.trim()
  const name = searchType.value === 'enterprise' ? 'enterprise-db' : 'news'
  void router.push(q ? { name, query: { q } } : { name })
}

const loadMore = () => {
  newsExpanded.value = true
  newsLimit.value = currentNews.value.length
}

const applyHot = (word: string) => {
  keyword.value = word
  onSearch()
}

const goNews = (id?: number) => {
  if (id) {
    void router.push({ name: 'news-detail', params: { id: String(id) } })
  } else {
    void router.push({ name: 'news' })
  }
}

const goNav = (key: string) => {
  void router.push({ name: key })
}

const openBeian = () => {
  window.open(SITE.icpUrl, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="page-bg" :style="{ backgroundImage: `url(${heroDecorSm})` }">
        <video
          class="page-bg-video"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          disablepictureinpicture
          aria-hidden="true"
          :poster="heroDecorSm"
          :src="heroBanner"
        />
      </div>
      <div class="hero-inner">
        <h1 class="hero-title">
          <span class="line1">全国政策数据</span>
          <span class="line2">AI辅助申报平台</span>
        </h1>

        <div class="search-block">
          <div class="search-tabs">
            <button
              type="button"
              class="search-tab"
              :class="{ active: searchType === 'policy' }"
              @click="searchType = 'policy'"
            >
              搜政策
            </button>
            <button
              type="button"
              class="search-tab"
              :class="{ active: searchType === 'enterprise' }"
              @click="searchType = 'enterprise'"
            >
              搜企业
            </button>
          </div>

          <div class="search-bar">
            <input
              v-model="keyword"
              class="search-input"
              type="text"
              placeholder="请输入政策、企业名称"
              @keyup.enter="onSearch"
            />
            <button type="button" class="search-btn" @click="onSearch">
              立即检索
              <span class="search-arrow">›</span>
            </button>
          </div>

          <div class="hot-keywords">
            <span class="hot-label">热门：</span>
            <a
              v-for="word in hotKeywords"
              :key="word"
              class="hot-word"
              @click="applyHot(word)"
            >
              {{ word }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="home-body">
      <div class="feature-row">
        <a
          v-for="card in featureCards"
          :key="card.key"
          class="feature-card"
          :style="{ backgroundImage: `url(${featureCardBg})` }"
          @click="goNav(card.routeName)"
        >
          <div class="feature-icon">
            <img :src="iconMap[card.icon]" :alt="card.title" />
          </div>
          <div class="feature-text">
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
          </div>
        </a>
      </div>

      <a class="promo-banner">
        <img :src="promoBanner" alt="限时活动：注册即送3个月会员" />
      </a>

      <div class="main-grid">
        <section ref="newsPanelRef" class="news-panel">
          <div class="news-tabs">
            <button
              type="button"
              class="news-tab"
              :class="{ active: newsTab === 'news' }"
              @click="newsTab = 'news'"
            >
              政策资讯
            </button>
            <button
              type="button"
              class="news-tab"
              :class="{ active: newsTab === 'follow' }"
              @click="newsTab = 'follow'"
            >
              关注动态
            </button>
          </div>

          <ul
            v-if="visibleNews.length"
            ref="newsListRef"
            class="news-list"
            :class="{ 'has-more': newsLimit < currentNews.length }"
          >
            <li
              v-for="item in visibleNews"
              :key="item.id"
              class="news-item"
              @click="goNews(item.id)"
            >
              <span class="news-rail" aria-hidden="true">
                <i class="dot" />
              </span>
              <div class="news-main">
                <div class="news-head">
                  <h3 class="news-title">{{ item.title }}</h3>
                  <span class="news-status" :class="item.status">
                    {{ item.statusText }}
                    <InfoCircleOutlined class="status-icon" />
                  </span>
                </div>
                <div class="news-tags">
                  <span
                    v-for="tag in item.tags"
                    :key="tag.text"
                    class="news-tag"
                    :class="`tone-${tag.tone}`"
                  >
                    {{ tag.text }}
                  </span>
                </div>
                <div class="news-meta">
                  <span>{{ item.time }}</span>
                  <span>{{ item.department }}</span>
                </div>
              </div>
            </li>
          </ul>

          <a-empty
            v-else
            class="follow-empty"
            :description="
              newsTab === 'follow'
                ? '暂无关注动态，登录后可关注政策'
                : newsError || '暂无资讯'
            "
          />

          <button
            v-if="visibleNews.length && newsLimit < currentNews.length"
            type="button"
            class="load-more"
            @click="loadMore"
          >
            点击加载更多
          </button>
        </section>

        <aside ref="sidebarRef" class="sidebar">
          <div
            class="industry-card"
            :style="{ backgroundImage: `url(${industryBg})` }"
          >
            <div class="industry-head">
              <img :src="iconIndustry" alt="" class="industry-icon" />
              <h3>产业标签</h3>
            </div>
            <Divider />
            <p class="industry-desc">政策资讯已为您关联以下标签</p>
            <p class="industry-desc-sub">覆盖20个一级产业、249个细分标签</p>
            <div class="tag-cloud">
              <span
                v-for="tag in industryTagList"
                :key="tag"
                class="industry-tag"
              >
                {{ tag }}
              </span>
            </div>
            <a-button
              type="primary"
              class="match-btn"
              @click="goNav('enterprise-db')"
            >
              开始企业匹配
              <ArrowRightOutlined />
            </a-button>
          </div>

          <div class="info-card">
            <div class="info-block">
              <h4>关于公司</h4>
              <div class="info-links">
                <a
                  v-for="item in navItems.filter((n) => n.key !== 'home')"
                  :key="item.key"
                  @click="goNav(item.key)"
                >
                  {{ item.label }}
                </a>
              </div>
            </div>

            <div class="info-block">
              <h4>联系我们</h4>
              <p><PhoneOutlined /> 客服电话：{{ SITE.phone }}</p>
              <p><CommentOutlined /> 客服微信：{{ SITE.wechat }}</p>
              <p><ClockCircleOutlined /> 工作时间：{{ SITE.workHours }}</p>
            </div>

            <div class="info-block">
              <h4>公司信息</h4>
              <p class="address">
                <EnvironmentOutlined />
                <span>{{ SITE.address }}</span>
              </p>
            </div>

            <SiteQrBlock variant="sidebar" />
            <a-divider />
            <p>版权所有：{{ SITE.company }}</p>
            <p class="beian-link" @click="openBeian">
              Copyright @ 2026·{{ SITE.icp }}
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -64px;
  overflow-x: clip;
  background: #f0f2f5;
  color: var(--pb-text);
  font-family:
    'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.hero {
  position: relative;
  z-index: 1;
  width: 100%;
  overflow: hidden;
  background: transparent;
}

.page-bg {
  /* 背景视频取景参数：
     --bg-zoom 垂直放大倍率，>1 时裁掉上下只取中间展示（宽度始终平铺不裁）
     --bg-focus-y 视频中心对齐到容器的垂直位置，偏上可避开底部被内容遮挡的区域 */
  --bg-zoom: 1.4;
  --bg-focus-y: 67%;
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: var(--pb-bg);
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  pointer-events: none;
  z-index: 0;

  /* 只在与下方内容衔接处做短淡出，避免盖住动效主体 */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: min(120px, 18%);
    background: linear-gradient(
      180deg,
      rgb(240 242 245 / 0) 0%,
      rgb(240 242 245 / 0.42) 58%,
      var(--pb-bg) 100%
    );
  }
}

.page-bg-video {
  position: absolute;
  left: 0;
  top: var(--bg-focus-y);
  width: 100%;
  height: calc(var(--bg-zoom) * 100%);
  transform: translateY(-50%);
  object-fit: cover;
  object-position: center;
}

@media (prefers-reduced-motion: reduce) {
  .page-bg-video {
    display: none;
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 100px 0 200px;
  text-align: center;
}

.hero-title {
  margin: 0 0 34px;
  font-family: var(--pb-font-display);
  line-height: 1.2;

  .line1 {
    display: block;
    font-size: 36px;
    font-weight: bold;
    color: var(--pb-title);
    letter-spacing: 3px;
  }

  .line2 {
    display: block;
    margin-top: 8px;
    font-size: 48px;
    font-weight: 700;
    color: var(--pb-primary);
    letter-spacing: 2px;
  }
}

.search-block {
  width: 680px;
  max-width: 100%;
  margin: 0 auto;
  text-align: left;
}

.search-tabs {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 15px;
  padding-left: 4px;
}

.search-tab {
  position: relative;
  border: none;
  background: transparent;
  padding: 0 0 8px;
  font-size: 24px;
  color: var(--pb-text);
  cursor: pointer;
  font-family: inherit;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 24px;
      height: 3px;
      margin-left: -12px;
      border-radius: 2px;
      background: var(--pb-primary);
    }
  }
}

.search-bar {
  display: flex;
  align-items: stretch;
  height: 48px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.16);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  padding: 0 20px;
  font-size: 18px;
  color: var(--pb-text);
  background: transparent;
  font-family: inherit;

  &::placeholder {
    color: #bfbfbf;
  }
}

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 120px;
  border: none;
  background: var(--pb-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;

  &:hover {
    background: #4096ff;
  }

  .search-arrow {
    font-size: 20px;
    line-height: 1;
    font-weight: 400;
    transform: translateY(-1px);
  }
}

.hot-keywords {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 19px;
  padding-left: 4px;
  font-size: 16px;
  line-height: 1.4;

  .hot-label {
    color: var(--pb-muted);
  }

  .hot-word {
    color: var(--pb-sub);

    &:hover {
      color: var(--pb-primary);
    }
  }
}

.home-body {
  position: relative;
  z-index: 1;
  width: 78.1%;
  max-width: calc(100% - 32px);
  margin: -150px auto 0;
  padding-bottom: 56px;
}

.feature-row {
  display: grid;
  min-height: 276px;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #edf5fd;
  border-radius: var(--pb-radius-lg);
  padding: 27px 23px 0;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 96px;
  padding: 20px 18px;
  background-color: var(--pb-card);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% 100%;
  border-radius: var(--pb-radius);
  box-shadow: var(--pb-shadow);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 119, 255, 0.14);
  }
}

.feature-icon {
  flex-shrink: 0;
  margin-top: 2px;

  img {
    width: 64px;
    height: 62px;
    object-fit: contain;
  }
}

.feature-text {
  min-width: 0;

  h3 {
    margin-bottom: 10px;
    font-family: var(--pb-font-display);
    font-size: 20px;
    font-weight: bold;
    color: #393939;
    line-height: 1.3;
  }

  p {
    font-size: 16px;
    line-height: 1.7;
    color: #393939;
    white-space: pre-line;
  }
}

.promo-banner {
  display: block;
  width: 100%;
  overflow: hidden;
  border-radius: var(--pb-radius);
  line-height: 0;
  margin: 20px auto;

  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
  }
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 35%;
  gap: 16px;
  align-items: stretch;
}

.news-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--pb-card);
  border-radius: var(--pb-radius-lg);
  padding: 4px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.news-tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid var(--pb-line);
}

.news-tab {
  position: relative;
  border: none;
  background: transparent;
  padding: 16px 0 14px;
  font-size: 16px;
  color: var(--pb-sub);
  cursor: pointer;
  font-family: inherit;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: var(--pb-primary);
      border-radius: 1px 1px 0 0;
    }
  }
}

.news-list {
  position: relative;
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  flex: 1;

  &.has-more::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 96px;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 0) 0%,
      var(--pb-card) 78%
    );
    pointer-events: none;
    z-index: 1;
  }
}

.news-item {
  position: relative;
  padding: 14px 8px 14px 36px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #f3f7ff;

    .news-title {
      color: var(--pb-primary);
    }

    .dot {
      background: #5b96f6;
      box-shadow: 0 0 0 3px #f3f7ff;
    }
  }
}

.news-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10px;
  display: flex;
  justify-content: center;
  width: 16px;
  padding-top: 22px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    border-left: 1px dashed #c5d8f6;
    transform: translateX(-50%);
  }

  .dot {
    position: relative;
    z-index: 1;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8ebaf8;
    box-shadow: 0 0 0 3px var(--pb-card);
  }
}

.news-item:first-child .news-rail::before {
  top: 26px;
}

.news-item:last-child .news-rail::before {
  bottom: auto;
  height: 26px;
}

.news-item:only-child .news-rail::before {
  display: none;
}

.news-main {
  min-width: 0;
}

.news-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.news-title {
  margin: 0;
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.5;
  transition: color 0.2s;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.news-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 22px;

  &.tone-blue {
    color: #3d7eff;
    background: #e8f2ff;
  }

  &.tone-green {
    color: #3aaa6a;
    background: #e8f8ee;
  }

  &.tone-orange {
    color: #e8893a;
    background: #fff1e4;
  }

  &.tone-gold {
    color: #e0a020;
    background: #fff6df;
  }

  &.tone-purple {
    color: #722ed1;
    background: #f9f0ff;
  }

  &.tone-cyan {
    color: #08979c;
    background: #e6fffb;
  }
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: var(--pb-muted);
  line-height: 1.4;
}

.news-status {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 14px;
  white-space: nowrap;
  line-height: 1.4;

  &.applying {
    color: #2f6bff;
  }

  &.remaining {
    color: #ff4d4f;
  }

  &.closed {
    color: var(--pb-muted);
  }

  .status-icon {
    font-size: 14px;
  }
}

.load-more {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 48px;
  background: #eaf2ff;
  border-radius: 8px;
  margin-top: 8px;
  padding: 11px;
  border: none;
  color: #2f6bff;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;

  &:hover {
    background: #bae0ff;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
}

.industry-card {
  padding: 18px 16px 16px;
  border-radius: 30px;
  background-color: #eef5ff;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.06);

  :deep(.ant-divider-horizontal) {
    margin: 10px 0 15px;
    border-block-start: 1px solid rgba(255, 255, 255, 0.8);
  }
}

.industry-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--pb-title);
  }

  .industry-icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }
}

.industry-desc {
  margin: 0 0 14px;
  font-size: 20px;
  color: #0c164a;
  font-family: AlibabaPuHuiTi_2_65_Medium;
  font-weight: 500;
}

.industry-desc-sub {
  font-size: 12px;
  font-family: AlibabaPuHuiTi_2_55_Regular;
  font-size: 14px;
  color: #3d3d3d;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.industry-tag {
  width: 79px;
  height: 30px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #0e5dd8;
  color: #3d3d3d;
  line-height: 30px;
  text-align: center;
  cursor: default;

  &:hover {
    color: var(--pb-primary);
    border-color: #91caff;
  }
}

.match-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 245px;
  height: 58px;
  background: #0e5dd8;
  border-radius: 4px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #4096ff;
  }
}

.info-card {
  background: var(--pb-card);
  border-radius: var(--pb-radius-lg);
  padding: 18px 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-block {
  margin-bottom: 18px;

  h4 {
    margin: 0 0 10px;
    padding: 0 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #343434;
    border-left: 3px solid var(--pb-primary);
  }

  p {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--pb-sub);
    line-height: 1.6;

    .anticon {
      margin-right: 6px;
      vertical-align: middle;
    }
  }

  .address {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;

    .anticon {
      margin-top: 2px;
      margin-right: 0;
    }
  }
}

.info-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;

  a {
    font-size: 14px;
    color: #343434;

    &:hover {
      color: var(--pb-primary);
    }
  }
}

.qr-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  img {
    width: 92px;
    height: 92px;
    object-fit: contain;
    border-radius: 4px;
    background: #fff;
  }
}

.qr-btn {
  height: 26px;
  padding: 0 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.beian-link {
  cursor: pointer;
}

.copyright {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #bfbfbf;
  line-height: 1.5;
}

@media (max-width: 1400px) {
  .feature-text {
    h3 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    p {
      margin-left: 0;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

@include below-lg {
  .feature-row {
    grid-template-columns: 1fr 1fr;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .hero-title .line2 {
    font-size: 30px;
  }

  .search-block {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .feature-row {
    grid-template-columns: 1fr;
  }

  .promo-banner img {
    height: 72px;
    aspect-ratio: auto;
    object-fit: cover;
    object-position: center;
  }

  .hero-title .line1 {
    font-size: 20px;
  }

  .hero-title .line2 {
    font-size: 26px;
  }
}
</style>
