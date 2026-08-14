<script setup lang="ts">
import { ref } from "vue";
import {
  RightOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  WechatOutlined,
} from "@ant-design/icons-vue";
import {
  featureCards,
  hotKeywords,
  industryTags,
  homeNewsList,
} from "../../mock/home";
import heroDecorSm from "../../assets/home/hero-decor-sm.png";
import heroDecorMd from "../../assets/home/hero-decor-1x.png";
import heroDecorLg from "../../assets/home/hero-decor.png";
import promoBanner from "../../assets/home/promo-banner.png";
import iconPolicy from "../../assets/home/icon-policy.png";
import iconEnterprise from "../../assets/home/icon-enterprise.png";
import iconRobot from "../../assets/home/robot.png";
import iconWorkbench from "../../assets/home/icon-workbench.svg";
import iconIndustry from "../../assets/home/icon-industry.png";
import industryBg from "../../assets/home/industry-card-bg.png";
import infoTitleBg from "../../assets/home/info-title-bg.png";
import featureCardBg from "../../assets/home/feature-card-bg.png";
import qrMini from "../../assets/home/qr-miniprogram.png";
import qrWechat from "../../assets/home/qr-wechat.png";

defineOptions({ name: "HomePage" });

const emit = defineEmits<{
  navigate: [key: string];
}>();

const searchType = ref<"policy" | "enterprise">("policy");
const keyword = ref("");
const newsTab = ref("news");
const visibleNews = ref(homeNewsList.slice(0, 5));

const iconMap: Record<string, string> = {
  policy: iconPolicy,
  enterprise: iconEnterprise,
  robot: iconRobot,
  workbench: iconWorkbench,
};

function onSearch() {
  // placeholder
}

function loadMore() {
  visibleNews.value = homeNewsList;
}

function applyHot(word: string) {
  keyword.value = word;
  onSearch();
}

function goNews() {
  emit("navigate", "news");
}
</script>

<template>
  <div class="home-page">
    <div
      class="page-bg"
      :style="{
        '--home-bg-sm': `url(${heroDecorSm})`,
        '--home-bg-md': `url(${heroDecorMd})`,
        '--home-bg-lg': `url(${heroDecorLg})`,
      }"
    />

    <section class="hero">
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

      <a
        class="promo-banner"
        :style="{ backgroundImage: `url(${promoBanner})` }"
      >
        <span class="sr-only">限时活动：注册即送3个月会员</span>
      </a>

      <div class="main-grid">
        <section class="news-panel">
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

          <ul class="news-list">
            <li
              v-for="item in visibleNews"
              :key="item.id"
              class="news-item"
              @click="goNews"
            >
              <div class="news-main">
                <div class="news-head">
                  <h3 class="news-title">
                    <i class="dot" />
                    <span>{{ item.title }}</span>
                  </h3>
                  <a class="news-status" :class="item.status" @click.stop>
                    {{ item.statusText }}
                    <span class="status-arrow"><RightOutlined /></span>
                  </a>
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

          <button type="button" class="load-more" @click="loadMore">
            点击加载更多
          </button>
        </section>

        <aside class="sidebar">
          <div
            class="industry-card"
            :style="{ backgroundImage: `url(${industryBg})` }"
          >
            <div class="industry-head">
              <img :src="iconIndustry" alt="" class="industry-icon" />
              <h3>产业标签</h3>
            </div>
            <p class="industry-desc">
              覆盖 20 个一级产业、249 个细分标签，支持按产业精准匹配企业与政策。
            </p>
            <div class="tag-cloud">
              <span v-for="tag in industryTags" :key="tag" class="industry-tag">
                {{ tag }}
              </span>
            </div>
            <a-button type="primary" class="match-btn">
              开始企业匹配
              <ArrowRightOutlined />
            </a-button>
          </div>

          <div
            class="info-card"
            :style="{ '--info-title-bg': `url(${infoTitleBg})` }"
          >
            <div class="info-block">
              <h4>关于公司</h4>
              <div class="info-links">
                <a>政治资讯</a>
                <a>政策数据库</a>
                <a>企业数据库</a>
                <a>投资项目库</a>
                <a>数据导出</a>
                <a>API接口</a>
              </div>
            </div>

            <div class="info-block">
              <h4>联系我们</h4>
              <p><PhoneOutlined /> 客服电话：13838137683</p>
              <p><WechatOutlined /> 客服微信：13838137683</p>
              <p><ClockCircleOutlined /> 工作时间：周一至周五 9:00-18:00</p>
            </div>

            <div class="info-block">
              <h4>公司信息</h4>
              <p class="address">
                <EnvironmentOutlined />
                <span>河南省郑州市高新技术产业开发区</span>
              </p>
            </div>

            <div class="qr-row">
              <div class="qr-item">
                <img :src="qrMini" alt="微信小程序" />
                <button type="button" class="qr-btn">关注微信小程序</button>
              </div>
              <div class="qr-item">
                <img :src="qrWechat" alt="公众号" />
                <button type="button" class="qr-btn">政策宝公众号</button>
              </div>
            </div>

            <p class="copyright">Copyright © 2026 政策大脑 AI Policy Brain</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  --pb-primary: #1677ff;
  --pb-title: #1a1a1a;
  --pb-text: #333;
  --pb-sub: #666;
  --pb-muted: #999;
  --pb-line: #f0f0f0;
  --pb-card: #fff;
  --pb-radius: 8px;
  --pb-shadow: 0 4px 16px rgba(22, 119, 255, 0.08);

  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -64px;
  overflow-x: hidden;
  background: #f0f2f5;
  color: var(--pb-text);
  font-family:
    "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 55%;
  background-image: var(--home-bg-sm);
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 70%;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: calc(70% - 200px);
    height: 280px;
    background: linear-gradient(
      180deg,
      rgba(240, 242, 245, 0) 0%,
      rgba(240, 242, 245, 0.45) 40%,
      #f0f2f5 60%,
      #f0f2f5 100%
    );
    pointer-events: none;
  }
}

@media (min-width: 1440px) {
  .page-bg {
    background-image: var(--home-bg-md);
  }
}

@media (min-width: 1920px) {
  .page-bg {
    background-image: var(--home-bg-lg);
  }
}

.hero {
  position: relative;
  z-index: 1;
  width: 100%;
  background: transparent;
}

.hero-inner {
  width: 1200px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 108px 0 200px;
  text-align: center;
}

.hero-title {
  margin: 59px 0 34px;
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
    font-size: 64px;
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
  margin-bottom: 10px;
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
      content: "";
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
  font-size: 14px;
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
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding-bottom: 56px;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #edf5fd;
  border-radius: 20px;
  padding: 27px 23px;
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
    margin: 0 0 12px 20px;
    font-size: 26px;
    font-weight: 600;
    color: var(--pb-title);
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 16px;
    line-height: 1.7;
    margin-left: 20px;
    color: var(--pb-muted);
    white-space: pre-line;
  }
}

.promo-banner {
  display: block;
  width: 100%;
  height: 160px;
  margin-bottom: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  border-radius: var(--pb-radius);
  padding: 4px 24px 20px;
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
  font-size: 22px;
  color: var(--pb-sub);
  cursor: pointer;
  font-family: inherit;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;

    &::after {
      content: "";
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
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.news-item {
  padding: 18px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover .news-title span {
    color: var(--pb-primary);
  }
}

.news-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
}

.news-title {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  min-width: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--pb-title);
  line-height: 1.5;

  .dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 9px;
    border-radius: 50%;
    background: var(--pb-primary);
  }

  span {
    transition: color 0.2s;
  }
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
  border-radius: 2px;
  font-size: 12px;
  line-height: 22px;

  &.tone-blue {
    color: #1677ff;
    background: #e6f4ff;
  }

  &.tone-green {
    color: #389e0d;
    background: #f6ffed;
  }

  &.tone-orange {
    color: #d46b08;
    background: #fff7e6;
  }

  &.tone-gold {
    color: #d48806;
    background: #fffbe6;
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
  gap: 6px;
  margin-top: 2px;
  font-size: 13px;
  white-space: nowrap;
  line-height: 1;

  &.applying {
    color: var(--pb-primary);
  }

  &.remaining {
    color: #ff4d4f;
  }

  &.closed {
    color: var(--pb-muted);
  }

  .status-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid currentColor;
    font-size: 9px;
    opacity: 0.85;
  }
}

.load-more {
  display: block;
  width: 100%;
  height: 58px;
  background: #e4eeff;
  border-radius: 8px;
  margin-top: 8px;
  padding: 11px;
  border: none;
  color: var(--pb-primary);
  font-size: 20px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;

  &:hover {
    background: #bae0ff;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.industry-card {
  padding: 18px 16px 16px;
  border-radius: 24px;
  background-color: #eef5ff;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 12px rgba(22, 119, 255, 0.06);
}

.industry-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 24px;
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
  font-size: 12px;
  line-height: 1.7;
  color: var(--pb-muted);
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
  color: var(--pb-sub);
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
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #4096ff;
  }
}

.info-card {
  flex: 1;
  background: var(--pb-card);
  border-radius: var(--pb-radius);
  padding: 18px 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-block {
  margin-bottom: 18px;

  h4 {
    margin: 0 0 10px;
    padding: 6px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #343434;
    background: var(--info-title-bg) no-repeat left / 21% 100%;
  }

  p {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--pb-sub);
    line-height: 1.6;

    .anticon {
      margin-right: 6px;
      color: var(--pb-primary);
    }
  }

  .address {
    display: flex;
    align-items: flex-start;
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
    font-size: 12px;
    color: var(--pb-sub);

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
  border: 1px solid var(--pb-primary);
  border-radius: 4px;
  background: #fff;
  color: var(--pb-primary);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;

  &:hover {
    background: #e6f4ff;
  }
}

.copyright {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #bfbfbf;
  line-height: 1.5;
}

@media (max-width: 992px) {
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

  .promo-banner {
    height: 60px;
  }

  .hero-title .line1 {
    font-size: 20px;
  }

  .hero-title .line2 {
    font-size: 26px;
  }
}
</style>
