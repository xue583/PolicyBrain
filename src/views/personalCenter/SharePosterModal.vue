<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { fetchShareLink } from '@/api/account'
import posterBg from '@/assets/personalCenter/share-poster-bg@2x.png'
import { ApiError } from '@/utils/request'

defineOptions({ name: 'SharePosterModal' })

const open = defineModel<boolean>('open', { default: false })

/** 与背景图 782×880 对齐的版位，预览和保存页共用 */
const TITLE_SIZE = 0.084
const TITLE_LINE = 1.25
const COPY_TOP = 0.62
const COPY_LEFT = 0.082
const COPY_RIGHT = 0.072
const LEAD_SIZE = 0.039
const LEAD_COLOR = '#3a4862'
const REWARD_SIZE = 0.046
const REWARD_COLOR = '#243049'
const REWARD_GAP = 0.006
const NOTE_SIZE = 0.0297
const NOTE_COLOR = '#8b95a8'
const NOTE_GAP = 0.006
const NOTE_LINE = 1.5
/** 卡片高宽比，把按高度计算的间距换成 cqw */
const CARD_RATIO = 880 / 782
const gapCqw = (ratio: number) => `${ratio * CARD_RATIO * 100}cqw`

const TITLE_LINES = ['最新福利来袭', '邀请好友领会员！'] as const
const LEAD = '每邀请1名新用户注册平台，推荐人将获得'
const REWARD = '一个月VIP时长'
const NOTE_LINES = [
  '转发海报至朋友圈，或微信群，',
  '获得拉新佣金奖励、会员权益时长奖励；',
] as const
const CTA_LABEL = '立即领取会员'

const saving = ref(false)
const copying = ref(false)
const linkLoading = ref(false)
const linkError = ref('')
const inviteUrl = ref('')
let linkRequestId = 0

/** 拒绝 ASCII 控制字符，避免把接口返回值直接写成可执行链接 */
const hasControlChar = (value: string) => {
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

/** 只允许 http(s) 进入 href，避免把接口返回值直接写成可执行链接 */
const safeInviteHref = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed || hasControlChar(trimmed)) return ''
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return url.href
  } catch {
    return ''
  }
}

const safeInviteUrl = computed(() => safeInviteHref(inviteUrl.value))
const linkStatus = computed(() => {
  if (linkLoading.value) return '邀请链接生成中…'
  if (linkError.value) return linkError.value
  if (!inviteUrl.value.trim()) return '暂未获取到邀请链接'
  if (!safeInviteUrl.value) return '邀请链接无效'
  return ''
})

const loadInviteLink = async () => {
  const requestId = ++linkRequestId
  linkLoading.value = true
  linkError.value = ''
  inviteUrl.value = ''
  try {
    const data = await fetchShareLink()
    if (requestId !== linkRequestId) return
    const url = data?.inviteUrl?.trim() || ''
    inviteUrl.value = url
    if (!url) linkError.value = '暂未获取到邀请链接'
  } catch (err) {
    if (requestId !== linkRequestId) return
    const raw = err instanceof ApiError ? err.message : ''
    linkError.value =
      raw && !/^Request failed with status code/i.test(raw)
        ? raw
        : '邀请链接获取失败'
  } finally {
    if (requestId === linkRequestId) linkLoading.value = false
  }
}

const copyInvite = async () => {
  const url = safeInviteUrl.value
  if (!url || copying.value) return
  copying.value = true
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const input = document.createElement('textarea')
      input.value = url
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      const copied = document.execCommand('copy')
      input.remove()
      if (!copied) throw new Error('copy failed')
    }
    message.success('邀请链接已复制')
  } catch {
    message.error('复制失败，请稍后重试')
  } finally {
    copying.value = false
  }
}

const close = () => {
  open.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(
  open,
  (visible) => {
    if (visible) {
      window.addEventListener('keydown', onKeydown)
      void loadInviteLink()
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const blobToDataUrl = async (blob: Blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const size = 0x8000
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size))
  }
  const type = blob.type || 'image/png'
  return `data:${type};base64,${btoa(binary)}`
}

/** 图片无法携带可点击链接，保存为内嵌背景的海报页，按钮和地址都指向邀请链接 */
const buildPosterHtml = (background: string, href: string) => {
  const titleHtml = TITLE_LINES.map((line) =>
    line.endsWith('！')
      ? `<span>${escapeHtml(line.slice(0, -1))}<i class="bang">！</i></span>`
      : `<span>${escapeHtml(line)}</span>`,
  ).join('')
  const hrefAttr = escapeHtml(href)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>邀请好友领会员</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background: #e7eef8;
    font-family: "Alibaba PuHuiTi 2.0", "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  .poster {
    position: relative;
    width: min(440px, 100%);
    aspect-ratio: 782 / 880;
    container-type: inline-size;
    background: url("${background}") center / 100% 100% no-repeat;
    filter: drop-shadow(0 18px 36px rgba(15, 40, 90, 0.22));
  }
  .title {
    position: absolute;
    top: 30%;
    left: 8%;
    right: 8%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    color: #fff;
    font-size: ${TITLE_SIZE * 100}cqw;
    font-weight: 700;
    line-height: ${TITLE_LINE};
    letter-spacing: 0.5px;
    text-align: center;
    text-shadow: 0 2px 10px rgba(8, 52, 150, 0.28);
  }
  .title span { display: block; }
  .bang {
    display: inline-block;
    width: 0.42em;
    font-style: normal;
    letter-spacing: 0;
  }
  .copy {
    position: absolute;
    top: ${COPY_TOP * 100}%;
    right: ${COPY_RIGHT * 100}%;
    bottom: 6%;
    left: ${COPY_LEFT * 100}%;
    display: flex;
    flex-direction: column;
  }
  .lead, .reward, .note { margin: 0; }
  .lead {
    margin-top: 10px;
    color: ${LEAD_COLOR};
    font-size: ${LEAD_SIZE * 100}cqw;
  }
  .reward {
    margin-top: ${gapCqw(REWARD_GAP)};
    color: ${REWARD_COLOR};
    font-size: ${REWARD_SIZE * 100}cqw;
    font-weight: 700;
  }
  .note {
    margin-top: ${gapCqw(NOTE_GAP)};
    color: ${NOTE_COLOR};
    font-size: ${NOTE_SIZE * 100}cqw;
    line-height: ${NOTE_LINE};
  }
  .links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
  }
  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 10.4cqw;
    min-height: 40px;
    border-radius: 8px;
    background: #1677ff;
    color: #fff;
    font-size: 3.7cqw;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    box-shadow: 0 8px 18px rgba(22, 119, 255, 0.28);
  }
  .cta svg { width: 1.05em; height: 1.05em; }
  .cta:hover { background: #0958d9; }
  .cta:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .url {
    color: #1677ff;
    font-size: 3cqw;
    line-height: 1.45;
    text-align: center;
    text-decoration: none;
    word-break: break-all;
  }
  .url:hover { text-decoration: underline; }
  .url:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
</style>
</head>
<body>
  <main class="poster">
    <h1 class="title">${titleHtml}</h1>
    <div class="copy">
      <p class="lead">${escapeHtml(LEAD)}</p>
      <p class="reward">${escapeHtml(REWARD)}</p>
      <p class="note">${NOTE_LINES.map((line) => escapeHtml(line)).join('<br />')}</p>
      <div class="links">
        <a class="cta" href="${hrefAttr}" target="_blank" rel="noopener noreferrer">${escapeHtml(CTA_LABEL)}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h8"/><path d="M8.5 4.5 12 8l-3.5 3.5"/></svg></a>
        <a class="url" href="${hrefAttr}" target="_blank" rel="noopener noreferrer">${hrefAttr}</a>
      </div>
    </div>
  </main>
</body>
</html>`
}

const savePoster = async () => {
  const href = safeInviteUrl.value
  if (!href || saving.value) return
  saving.value = true
  try {
    const response = await fetch(posterBg)
    if (!response.ok) throw new Error('poster load failed')
    const background = await blobToDataUrl(await response.blob())
    if (!background.startsWith('data:image/') || /["\\\s)]/.test(background)) {
      throw new Error('poster invalid')
    }
    const blob = new Blob([buildPosterHtml(background, href)], {
      type: 'text/html;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '邀请好友领会员.html'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    message.success('海报已保存，用浏览器打开后点击按钮即可访问链接')
  } catch {
    message.error('海报保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="share-poster-fade">
      <div v-if="open" class="share-poster-overlay" @click.self="close">
        <div
          class="share-poster-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="分享海报"
        >
          <button
            type="button"
            class="share-poster-close"
            aria-label="关闭"
            @click="close"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M7 7l10 10M17 7L7 17" />
            </svg>
          </button>

          <div class="share-poster-card">
            <img class="share-poster-bg" :src="posterBg" alt="" />

            <div
              class="share-poster-title"
              :style="{
                fontSize: `${TITLE_SIZE * 100}cqw`,
                lineHeight: TITLE_LINE,
              }"
            >
              <span v-for="line in TITLE_LINES" :key="line">
                <template v-if="line.endsWith('！')">
                  {{ line.slice(0, -1) }}<i class="title-bang">！</i>
                </template>
                <template v-else>{{ line }}</template>
              </span>
            </div>

            <div
              class="share-poster-body"
              :style="{
                top: `${COPY_TOP * 100}%`,
                left: `${COPY_LEFT * 100}%`,
                right: `${COPY_RIGHT * 100}%`,
              }"
            >
              <p
                class="share-poster-lead"
                :style="{
                  color: LEAD_COLOR,
                  fontSize: `${LEAD_SIZE * 100}cqw`,
                  marginTop: '10px',
                }"
              >
                {{ LEAD }}
              </p>
              <p
                class="share-poster-reward"
                :style="{
                  color: REWARD_COLOR,
                  fontSize: `${REWARD_SIZE * 100}cqw`,
                  marginTop: gapCqw(REWARD_GAP),
                }"
              >
                {{ REWARD }}
              </p>
              <p
                class="share-poster-note"
                :style="{
                  color: NOTE_COLOR,
                  fontSize: `${NOTE_SIZE * 100}cqw`,
                  lineHeight: NOTE_LINE,
                  marginTop: gapCqw(NOTE_GAP),
                }"
              >
                <template v-for="(line, index) in NOTE_LINES" :key="line">
                  <br v-if="index > 0" />{{ line }}
                </template>
              </p>
              <div class="share-poster-link">
                <a
                  v-if="safeInviteUrl"
                  class="share-poster-cta"
                  :href="safeInviteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ CTA_LABEL }}
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 8h8" />
                    <path d="M8.5 4.5 12 8l-3.5 3.5" />
                  </svg>
                </a>
                <a
                  v-if="safeInviteUrl"
                  class="share-poster-url"
                  :href="safeInviteUrl"
                  :title="safeInviteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ safeInviteUrl }}
                </a>
                <p v-else class="share-poster-url is-muted">{{ linkStatus }}</p>
              </div>
            </div>
          </div>
          <div class="share-poster-actions">
            <button
              type="button"
              class="share-poster-copy"
              :disabled="!safeInviteUrl || copying"
              @click="copyInvite"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="5.2" y="5.2" width="8" height="8" rx="1.4" />
                <path
                  d="M10.6 5.2V3.6A1.4 1.4 0 0 0 9.2 2.2H3.6A1.4 1.4 0 0 0 2.2 3.6v5.6A1.4 1.4 0 0 0 3.6 10.6H5.2"
                />
              </svg>
              复制去分享
            </button>
            <button
              type="button"
              class="share-poster-save"
              :disabled="saving || !safeInviteUrl"
              @click="savePoster"
            >
              <svg
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M8 2.4v8.4" />
                <path d="M4.6 7.8L8 11.2l3.4-3.4" />
              </svg>
              保存海报
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.share-poster-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 48px 56px;
  background: rgba(47, 56, 72, 0.46);
}

.share-poster-dialog {
  position: relative;
  width: min(440px, calc(100vw - 96px));
}

.share-poster-close {
  position: absolute;
  top: -14px;
  right: -6px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #8c8c8c;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 40, 90, 0.22);

  svg {
    display: block;
    width: 14px;
    height: 14px;
  }

  &:hover,
  &:focus-visible {
    color: #595959;
    outline: none;
  }
}

.share-poster-card {
  position: relative;
  width: 100%;
  aspect-ratio: 782 / 880;
  container-type: inline-size;
}

.share-poster-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 18px 36px rgba(15, 40, 90, 0.28));
}

.share-poster-title {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 30%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 0 2px 10px rgba(8, 52, 150, 0.28);

  span {
    display: block;
  }

  .title-bang {
    display: inline-block;
    width: 0.42em;
    font-style: normal;
    letter-spacing: 0;
    vertical-align: baseline;
  }
}

.share-poster-body {
  position: absolute;
  bottom: 6%;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.share-poster-link {
  display: flex;
  flex-direction: column;
  gap: 1.8cqw;
  margin-top: auto;
  padding-top: 2.4cqw;
}

.share-poster-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 10.4cqw;
  min-height: 40px;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  font-size: 3.7cqw;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  box-shadow: 0 8px 18px rgba(22, 119, 255, 0.28);

  svg {
    display: block;
    width: 1.05em;
    height: 1.05em;
  }

  &:hover {
    background: #0958d9;
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
}

.share-poster-lead,
.share-poster-reward,
.share-poster-note {
  margin: 0;
}

.share-poster-reward {
  font-weight: 700;
}

.share-poster-url {
  margin: 0;
  color: #1677ff;
  font-size: 3cqw;
  line-height: 1.45;
  text-align: center;
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }

  &.is-muted {
    color: #8b95a8;
    text-align: left;

    &:hover {
      text-decoration: none;
    }
  }
}

.share-poster-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.share-poster-copy,
.share-poster-save {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
  max-width: 180px;
  height: 40px;
  min-height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #1677ff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(22, 80, 160, 0.12);

  svg {
    display: block;
    width: 1.05em;
    height: 1.05em;
  }

  &:hover:not(:disabled) {
    color: #0958d9;
  }

  &:focus-visible {
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }
}

.share-poster-fade-enter-active,
.share-poster-fade-leave-active {
  transition: opacity 0.22s ease;

  .share-poster-dialog {
    transition:
      transform 0.22s ease,
      opacity 0.22s ease;
  }
}

.share-poster-fade-enter-from,
.share-poster-fade-leave-to {
  opacity: 0;

  .share-poster-dialog {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .share-poster-fade-enter-active,
  .share-poster-fade-leave-active {
    transition: none;
  }
}
</style>
