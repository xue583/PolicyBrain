<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import { getSubPageHero, navItems } from "../mock/policyNews";
import logoLightImg from "../assets/logo-light.png";
import heroBg from "../assets/hero-bg.png";
import qrMini from "../assets/home/qr-miniprogram.png";
import qrWechat from "../assets/home/qr-wechat.png";

defineOptions({ name: "SubPageLayout" });

const props = defineProps<{
  pageKey: string;
}>();

const emit = defineEmits<{
  navigate: [key: string];
}>();

const keyword = ref("");
const hero = computed(() => getSubPageHero(props.pageKey));

watch(
  () => props.pageKey,
  () => {
    keyword.value = "";
  },
);

function onFooterNav(key: string) {
  emit("navigate", key);
}
</script>

<template>
  <div class="sub-page">
    <div class="page-bg" :style="{ backgroundImage: `url(${heroBg})` }" />

    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-slogan">{{ hero.slogan }}</p>
          <h1>{{ hero.title }}</h1>
          <p class="hero-desc">{{ hero.description }}</p>
          <div class="search-bar">
            <a-input
              v-model:value="keyword"
              size="large"
              allow-clear
              :placeholder="hero.searchPlaceholder"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
            <a-button type="primary" size="large" class="search-btn">
              搜索
            </a-button>
          </div>
        </div>
      </div>
    </section>

    <div class="page-content">
      <slot :keyword="keyword" />
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
            <p><strong>客服热线：</strong>400-000-0000</p>
            <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
            <p><strong>联系地址：</strong>河南省郑州市金水区某某大厦</p>
          </div>
          <div class="footer-col disclaimer">
            <p>
              本平台所发布的政策信息均来源于公开渠道，仅供参考。具体申报条件、材料要求及办理流程以主管部门正式文件为准。平台不对因信息使用产生的任何直接或间接损失承担责任。如有疑问，请咨询相关主管部门或平台客服。
            </p>
          </div>
          <div class="footer-col qr">
            <div class="qr-item">
              <img :src="qrWechat" alt="关注微信公众号" />
              <span>关注微信公众号</span>
            </div>
            <div class="qr-item">
              <img :src="qrMini" alt="政策大脑小程序" />
              <span>政策大脑小程序</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          Copyright © 2026 政策大脑 AI Policy Brain　豫ICP备00000000号-1
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.sub-page {
  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -64px;
  overflow-x: hidden;
  background: #f0f2f5;
}

.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 40%;
  opacity: 1;
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

.hero-inner {
  position: relative;
  display: flex;
  align-items: center;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 150px 0 72px;
}

.hero-copy {
  flex: 1;
  max-width: 640px;

  .hero-slogan {
    margin: 0 0 8px;
    font-size: 16px;
    color: #3d5a80;
    letter-spacing: 1px;
  }

  h1 {
    margin: 0 0 15px;
    font-size: 40px;
    font-weight: 700;
    color: #1677ff;
    line-height: 1.2;
  }

  .hero-desc {
    margin: 0 0 20px;
    font-size: 13px;
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
}

.qr {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;

  img {
    width: 88px;
    height: 88px;
    object-fit: contain;
    border-radius: 4px;
    background: #fff;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
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

  .qr {
    justify-content: flex-start;
  }
}
</style>
