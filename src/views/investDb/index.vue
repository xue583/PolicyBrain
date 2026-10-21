<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { fetchInvestProjects, fetchInvestRegions } from '@/api/invest'
import type { InvestCategory } from '@/api/invest'
import type { InvestRegion } from '../../mock/investDb'
import { useServerPage } from '@/composables/useServerPage'
import { useRegionStore } from '@/stores/region'
import ContentHeader from './components/ContentHeader.vue'
import ProjectTable from './components/ProjectTable.vue'

defineOptions({ name: 'InvestDb' })

const { province, provinceId, selectedLabel } = storeToRefs(useRegionStore())

const categories = ref<InvestCategory[]>([])
const activeType = ref('all')
const keyword = ref('')
const appliedKeyword = ref('')
const allCount = ref(0)
const collectedTotal = ref(0)

let regionList: InvestRegion[] | null = null

const stripRegionSuffix = (name: string) =>
  name.replace(
    /(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市)$/u,
    '',
  )

/** 省名对应投资库编码，如「北京市」→ beijing；没有对应编码时原样传给接口 */
const resolveInvestProvince = (
  regions: InvestRegion[],
  provinceName: string,
) => {
  if (!provinceName) return undefined
  const normalized = stripRegionSuffix(provinceName)
  const matched = regions.find((item) => {
    if (item.key === 'national' || item.label === '全国') return false
    return stripRegionSuffix(item.label) === normalized
  })
  return matched?.key ?? provinceName
}

const ensureInvestRegions = async () => {
  if (regionList) return regionList
  regionList = await fetchInvestRegions()
  return regionList
}

watch(provinceId, () => {
  activeType.value = 'all'
  categories.value = []
})

const applyKeyword = () => {
  appliedKeyword.value = keyword.value.trim()
}

const typeTabs = computed(() => [
  { key: 'all', label: '全部' },
  ...categories.value.map((item) => ({ key: item.name, label: item.name })),
])

const {
  currentPage,
  pageSize,
  items: pagedList,
  total,
  loading,
  error,
  reload,
} = useServerPage(
  async (pageIndex, pageSize) => {
    const regions = await ensureInvestRegions()
    const result = await fetchInvestProjects({
      province: resolveInvestProvince(regions, province.value),
      regionLabel: selectedLabel.value,
      category: activeType.value === 'all' ? undefined : activeType.value,
      search: appliedKeyword.value,
      pageIndex,
      pageSize,
    })
    if (result.categories.length) categories.value = result.categories
    if (activeType.value === 'all') allCount.value = result.page.totalElements
    if (result.nationalCount > 0) collectedTotal.value = result.nationalCount
    return result.page
  },
  () =>
    JSON.stringify({
      province: province.value,
      category: activeType.value,
      search: appliedKeyword.value,
    }),
  10,
)

const typeCounts = computed(() => {
  const counts: Record<string, number> = {
    all: allCount.value || total.value,
  }
  for (const item of categories.value) counts[item.name] = item.count
  return counts
})
</script>

<template>
  <PageState>
    <div class="invest-db">
      <a-alert v-if="error" type="error" show-icon :message="error">
        <template #action>
          <a-button size="small" @click="reload">重试</a-button>
        </template>
      </a-alert>

      <ContentHeader
        :total-count="collectedTotal || allCount || total"
        :keyword="keyword"
        :active-type="activeType"
        :counts="typeCounts"
        :tabs="typeTabs"
        @update:keyword="keyword = $event"
        @update:active-type="activeType = $event"
        @search="applyKeyword"
      >
        <ProjectTable
          :loading="loading"
          :data-source="pagedList"
          :total="total"
          v-model:current-page="currentPage"
          :page-size="pageSize"
        />
      </ContentHeader>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.invest-db {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: -173px;
}
</style>
