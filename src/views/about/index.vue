<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ReadOutlined } from '@ant-design/icons-vue'
import { sanitizeHtml } from '@/utils/sanitize'
import { aboutPath, aboutSections, findAboutSection } from './sections'

defineOptions({ name: 'AboutPage' })

const route = useRoute()
const router = useRouter()

const sectionKey = computed(() => String(route.params.section || 'about'))
const current = computed(() => findAboutSection(sectionKey.value))
const safeHtml = computed(() => sanitizeHtml(current.value.html))
const bodyRef = ref<HTMLElement>()

watch(
  sectionKey,
  (key) => {
    if (!aboutSections.some((item) => item.key === key)) {
      void router.replace('/about')
      return
    }
    document.title = `${findAboutSection(key).label} - 政策大脑`
    void nextTick(() => {
      if (bodyRef.value) bodyRef.value.scrollTop = 0
    })
  },
  { immediate: true },
)

const onContentClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#')) return
  event.preventDefault()
  window.open(href, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="about-page">
    <nav class="about-menu" aria-label="关于我们">
      <router-link
        v-for="item in aboutSections"
        :key="item.key"
        class="menu-item"
        :class="{ active: item.key === current.key }"
        :to="aboutPath(item.key)"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <section class="about-main">
      <h2 class="about-title">
        <i class="title-mark" aria-hidden="true" />
        {{ current.label }}
      </h2>
      <div
        ref="bodyRef"
        class="about-body"
        @click="onContentClick"
        v-html="safeHtml"
      />
    </section>

    <div class="handbook-fab-wrap">
      <a-tooltip title="用户手册" placement="left">
        <router-link
          class="handbook-fab"
          to="/handbook"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="用户手册"
        >
          <ReadOutlined />
        </router-link>
      </a-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex: 1;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.about-menu,
.about-main {
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.about-menu {
  width: 260px;
  flex-shrink: 0;
  padding: 4px 0;
  overflow-y: auto;
}

.menu-item {
  position: relative;
  display: block;
  margin-left: 20px;
  padding: 14px 16px 14px 0;
  border-bottom: 1px solid #e7e7e7;
  color: #354053;
  font-size: 16px;
  line-height: 24px;
  text-decoration: none;

  &:hover {
    color: #1078f9;
  }

  &.active {
    color: #1078f9;

    &::after {
      content: '';
      position: absolute;
      left: -20px;
      top: 50%;
      width: 4px;
      height: 21px;
      transform: translateY(-50%);
      background: linear-gradient(#5da5ff, #1078f9);
    }
  }
}

.about-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.about-title {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 50px;
  margin: 0;
  border-bottom: 1px solid #e7e7e7;
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
}

.title-mark {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  margin-left: 16px;
  margin-right: 8px;
  border-radius: 2px;
  background: linear-gradient(270deg, #1078f9, rgba(16, 120, 249, 0));
  transform: rotate(-150deg);
}

.about-body {
  flex: 1;
  min-height: 0;
  padding: 18px 30px 40px;
  overflow-y: auto;
  color: #333;
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 8px;
  }

  :deep(a) {
    color: #1078f9;
    cursor: pointer;
  }

  :deep(strong) {
    font-weight: 600;
  }
}

.handbook-fab-wrap {
  position: fixed;
  z-index: 20;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.handbook-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(180deg, #5da5ff, #1078f9);
  color: #fff;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(16, 120, 249, 0.28);

  :deep(.anticon) {
    font-size: 20px;
  }

  &:hover {
    color: #fff;
    background: linear-gradient(180deg, #79b4ff, #0d6ae0);
  }
}

@include below-lg {
  .about-page {
    flex-direction: column;
    min-height: 0;
  }

  .handbook-fab-wrap {
    right: 10px;
  }

  .handbook-fab {
    width: 40px;
    height: 40px;
  }

  .about-menu {
    width: 100%;
  }

  .about-body {
    padding: 16px;
  }
}
</style>
