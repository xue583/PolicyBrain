<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DownOutlined } from '@ant-design/icons-vue'
import { sanitizeHtml } from '@/utils/sanitize'
import { findHandbookChapter, handbookChapters, handbookPath } from './data'

defineOptions({ name: 'HandbookPage' })

const route = useRoute()
const router = useRouter()
const bodyRef = ref<HTMLElement>()
const menuRef = ref<HTMLElement>()
const showBackTop = ref(false)

const routeParam = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ? String(raw) : ''
}

const chapterKey = computed(() => routeParam(route.params.chapterId))
const sectionKey = computed(() => routeParam(route.params.sectionId))
const current = computed(() => findHandbookChapter(chapterKey.value))
const chapterHtml = computed(() => sanitizeHtml(current.value.html))
const sections = computed(() =>
  current.value.sections.map((section) => ({
    ...section,
    safeHtml: sanitizeHtml(section.html),
  })),
)

const scrollToCurrent = () => {
  const root = bodyRef.value
  if (!root) return
  const id = sectionKey.value
  const target = id ? root.querySelector<HTMLElement>(`#hb-${id}`) : null
  if (!target) {
    root.scrollTop = 0
    showBackTop.value = false
    return
  }
  root.scrollTo({ top: Math.max(target.offsetTop - 8, 0), behavior: 'smooth' })
  showBackTop.value = true
}

const onBodyScroll = () => {
  showBackTop.value = (bodyRef.value?.scrollTop ?? 0) > 240
}

const scrollToTop = () => {
  bodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => [chapterKey.value, sectionKey.value],
  () => {
    const chapterParam = chapterKey.value
    if (
      chapterParam &&
      !handbookChapters.some((item) => String(item.id) === chapterParam)
    ) {
      void router.replace('/handbook')
      return
    }
    const chapter = findHandbookChapter(chapterParam)
    if (
      sectionKey.value &&
      !chapter.sections.some((item) => String(item.id) === sectionKey.value)
    ) {
      void router.replace(handbookPath(chapter.id))
      return
    }
    document.title = '用户手册 - 政策大脑'
    void nextTick(() => {
      scrollToCurrent()
      menuRef.value
        ?.querySelector('.menu-item.active')
        ?.scrollIntoView({ block: 'nearest' })
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
  if (!href || href.startsWith('#') || href.startsWith('/')) return
  event.preventDefault()
  window.open(href, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="handbook-page">
    <nav ref="menuRef" class="handbook-menu" aria-label="用户手册目录">
      <p class="menu-caption">目录</p>
      <div
        v-for="chapter in handbookChapters"
        :key="chapter.id"
        class="menu-group"
      >
        <router-link
          class="menu-item"
          :class="{ active: chapter.id === current.id }"
          :to="handbookPath(chapter.id)"
          :aria-current="chapter.id === current.id ? 'true' : undefined"
        >
          <span class="menu-label">{{ chapter.name }}</span>
          <DownOutlined
            v-if="chapter.sections.length"
            class="menu-arrow"
            :class="{ open: chapter.id === current.id }"
          />
        </router-link>
        <div
          v-if="chapter.id === current.id && chapter.sections.length"
          class="submenu"
        >
          <router-link
            v-for="section in chapter.sections"
            :key="section.id"
            class="submenu-item"
            :class="{ active: String(section.id) === sectionKey }"
            :to="handbookPath(chapter.id, section.id)"
          >
            {{ section.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <section class="handbook-main">
      <h2 class="handbook-title">
        <i class="title-mark" aria-hidden="true" />
        {{ current.name }}
      </h2>
      <div
        ref="bodyRef"
        class="handbook-body"
        @scroll="onBodyScroll"
        @click="onContentClick"
      >
        <ul v-if="sections.length" class="toc">
          <li v-for="section in sections" :key="section.id">
            <router-link :to="handbookPath(current.id, section.id)">
              {{ section.name }}
            </router-link>
          </li>
        </ul>

        <article
          v-for="section in sections"
          :id="`hb-${section.id}`"
          :key="section.id"
          class="section"
        >
          <h3 class="section-title">{{ section.title }}</h3>
          <div class="section-html" v-html="section.safeHtml" />
        </article>

        <div
          v-if="!sections.length && chapterHtml"
          class="section-html"
          v-html="chapterHtml"
        />
      </div>

      <button
        v-show="showBackTop"
        type="button"
        class="back-top"
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 14.5 12 8.5l6 6" />
        </svg>
      </button>
    </section>
  </div>
</template>

<style scoped lang="scss">
.handbook-page {
  display: flex;
  flex: 1;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.handbook-menu,
.handbook-main {
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.handbook-menu {
  width: 320px;
  flex-shrink: 0;
  padding: 4px 0 12px;
  overflow-y: auto;
}

.menu-caption {
  margin: 0;
  padding: 14px 16px 14px 20px;
  border-bottom: 1px solid #e7e7e7;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-left: 20px;
  padding: 14px 16px 14px 0;
  border-bottom: 1px solid #e7e7e7;
  color: #354053;
  font-size: 15px;
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
      top: 18px;
      width: 4px;
      height: 21px;
      background: linear-gradient(#5da5ff, #1078f9);
    }
  }
}

.menu-label {
  flex: 1;
  min-width: 0;
}

.menu-arrow {
  flex-shrink: 0;
  margin-top: 6px;
  color: #8c96a8;
  font-size: 12px;
  transition: transform 0.2s;

  &.open {
    color: #1078f9;
    transform: rotate(180deg);
  }
}

.submenu-item {
  display: block;
  margin-left: 36px;
  padding: 8px 16px 8px 0;
  border-bottom: 1px solid #f2f3f5;
  color: #5c6778;
  font-size: 14px;
  line-height: 22px;
  text-decoration: none;

  &:hover,
  &.active {
    color: #1078f9;
  }
}

.handbook-main {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.handbook-title {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  min-height: 50px;
  margin: 0;
  padding: 12px 48px 12px 0;
  border-bottom: 1px solid #e7e7e7;
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
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

.handbook-body {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 18px 30px 48px;
  overflow-y: auto;
  color: #333;
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;
}

.toc {
  margin: 0 0 8px;
  padding: 0 0 8px;
  list-style: none;
  border-bottom: 1px solid #f2f3f5;

  li {
    margin: 0;
  }

  a {
    color: #1078f9;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.section-title {
  margin: 22px 0 8px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.section-html {
  :deep(p) {
    margin: 0 0 8px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 8px;
    padding-left: 1.4em;
  }

  :deep(li) {
    margin: 2px 0;
  }

  :deep(a) {
    color: #1078f9;
    cursor: pointer;
  }

  :deep(strong) {
    font-weight: 600;
  }
}

.back-top {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #1078f9;
  box-shadow: 0 6px 16px rgba(16, 120, 249, 0.35);
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: #fff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    background: #0d6ae0;
  }
}

@include below-lg {
  .handbook-page {
    flex-direction: column;
  }

  .handbook-menu {
    width: 100%;
    max-height: 240px;
  }

  .handbook-body {
    padding: 16px;
  }
}
</style>
