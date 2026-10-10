<script setup lang="ts">
defineOptions({ name: 'IconFont' })

/** 阿里矢量图标库（iconfont font-class，含彩色图标） */
const ICON_FONT_HREF = 'https://at.alicdn.com/t/c/font_5222789_ybgcryd314.css'
const ICON_FONT_STYLE_ID = 'pb-iconfont-stylesheet'

function ensureIconFontStylesheet() {
  if (typeof document === 'undefined') return
  if (document.getElementById(ICON_FONT_STYLE_ID)) return
  const link = document.createElement('link')
  link.id = ICON_FONT_STYLE_ID
  link.rel = 'stylesheet'
  link.href = ICON_FONT_HREF
  document.head.appendChild(link)
}

ensureIconFontStylesheet()

const props = defineProps<{
  /** 图标名，支持 dianzan 或 icon-dianzan */
  name: string
  /** 字号，数字按 px 计 */
  size?: number | string
  /** 单色图标颜色；彩色图标使用字库自带颜色 */
  color?: string
}>()

const iconClass = computed(() =>
  props.name.startsWith('icon-') ? props.name : `icon-${props.name}`,
)

const iconStyle = computed(() => ({
  fontSize:
    props.size == null || props.size === ''
      ? undefined
      : typeof props.size === 'number'
        ? `${props.size}px`
        : props.size,
  color: props.color || undefined,
}))
</script>

<template>
  <i
    class="iconfont pb-icon"
    :class="iconClass"
    :style="iconStyle"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.pb-icon {
  display: inline-block;
  line-height: 1;
  vertical-align: -0.125em;
}
</style>
