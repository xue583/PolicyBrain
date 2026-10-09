<script setup lang="ts">
defineOptions({ name: 'WbPageBanner' })

withDefaults(
  defineProps<{
    title: string
    description: string
    image: string
    /** 左侧文字避让区宽度，随各页 banner 背景图的插画区域调整 */
    offset?: string
  }>(),
  { offset: '90px' },
)
</script>

<template>
  <section
    class="wb-banner"
    :style="{ backgroundImage: `url(${image})`, paddingLeft: offset }"
  >
    <div class="banner-text">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.wb-banner {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 18px 26px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  border-radius: 16px;
}

.banner-text {
  h2 {
    margin: 0;
    color: #1f1f1f;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin: 6px 0 0;
    color: #999;
    font-size: 14px;
    line-height: 1.5;
  }
}
</style>
