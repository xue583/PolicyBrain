<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import PageState from '@/components/PageState.vue'
import type { BreadcrumbItem } from '@/components/BreadcrumbNav.vue'

defineOptions({ name: 'DetailPageShell' })

const props = defineProps<{
  /** 面包屑第二项（列表页）文案 */
  listLabel: string
  /** 列表页路由 name，返回按钮与面包屑共用 */
  listRoute: string
  /** 面包屑当前项文案（详情标题） */
  detailLabel: string
  /** 数据为空时的占位文案 */
  empty: string
}>()

const router = useRouter()

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: props.listRoute })
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: '首页', onClick: goHome },
  { label: props.listLabel, onClick: goList },
  { label: props.detailLabel },
])
</script>

<template>
  <div class="detail-page">
    <BreadcrumbNav :items="breadcrumbItems" @back="goList" />
    <PageState :empty="empty">
      <slot />
    </PageState>
  </div>
</template>

<style scoped lang="scss">
.detail-page {
  min-height: 480px;
}
</style>
