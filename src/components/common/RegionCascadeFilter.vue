<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DownOutlined, RightOutlined } from '@ant-design/icons-vue'
import { loadRegionOptions, type CityOption } from '@/api/meta'
import { useRegionStore } from '@/stores/region'
import {
  clearRegionSelection,
  selectRegionCity,
  selectRegionDistrict,
  selectRegionProvince,
} from '@/utils/regionActions'

defineOptions({ name: 'RegionCascadeFilter' })

type RegionLevel = 'national' | 'province' | 'city' | 'district'

const props = withDefaults(
  defineProps<{
    /** 筛选项标题，如“省市地区：” */
    label: string
    /** 省级列表收起展示条数，0 表示不收起 */
    collapsedCount?: number
    /** 省级列表是否默认展开全部 */
    initialExpanded?: boolean
  }>(),
  { collapsedCount: 0, initialExpanded: false },
)

const region = useRegionStore()

const level = computed<RegionLevel>(() => {
  if (region.districtId != null) return 'district'
  if (region.cityId != null) return 'city'
  if (region.provinceId != null) return 'province'
  return 'national'
})

const provinces = ref<CityOption[]>([])
const cities = ref<CityOption[]>([])
const districts = ref<CityOption[]>([])
const loading = ref(false)
const showMore = ref(props.initialExpanded)

const visibleProvinces = computed(() =>
  props.collapsedCount > 0 && !showMore.value
    ? provinces.value.slice(0, props.collapsedCount)
    : provinces.value,
)

const loadOptions = async (parentId: number | null) => {
  loading.value = true
  try {
    return await loadRegionOptions(parentId ?? undefined)
  } catch {
    return []
  } finally {
    loading.value = false
  }
}

watch(
  level,
  async (value) => {
    if (value === 'national') {
      provinces.value = await loadOptions(null)
      return
    }
    if (value === 'province') {
      cities.value = await loadOptions(region.provinceId)
      return
    }
    districts.value = await loadOptions(region.cityId)
  },
  { immediate: true },
)

const provinceOption = computed<CityOption | null>(() =>
  region.provinceId == null
    ? null
    : { id: region.provinceId, label: region.province },
)
const cityOption = computed<CityOption | null>(() =>
  region.cityId == null ? null : { id: region.cityId, label: region.city },
)

const backToNational = () => {
  clearRegionSelection()
}

const backToProvince = () => {
  const option = provinceOption.value
  if (option) void selectRegionProvince(option)
}

const backToCity = () => {
  const province = provinceOption.value
  const city = cityOption.value
  if (province && city) selectRegionCity(province, city)
}

const onProvinceClick = (option: CityOption) => {
  void selectRegionProvince(option)
}

const onCityClick = (city: CityOption) => {
  const province = provinceOption.value
  if (!province) return
  selectRegionCity(province, city)
}

const districtCache = new Map<number, CityOption[]>()
const openCityId = ref<number | null>(null)
const cityDistricts = ref<CityOption[]>([])
const districtLoading = ref(false)

const showCityDistricts = async (city: CityOption) => {
  openCityId.value = city.id
  const cached = districtCache.get(city.id)
  if (cached) {
    cityDistricts.value = cached
    return
  }
  districtLoading.value = true
  cityDistricts.value = []
  try {
    const list = await loadRegionOptions(city.id)
    districtCache.set(city.id, list)
    if (openCityId.value === city.id) cityDistricts.value = list
  } catch {
    if (openCityId.value === city.id) cityDistricts.value = []
  } finally {
    if (openCityId.value === city.id) districtLoading.value = false
  }
}

const onCityOpenChange = (city: CityOption, open: boolean) => {
  if (open) {
    void showCityDistricts(city)
    return
  }
  if (openCityId.value === city.id) {
    openCityId.value = null
    cityDistricts.value = []
  }
}

/** 悬浮面板里选区县：直接下钻到省/市/区三级 */
const onPanelDistrictClick = (city: CityOption, district: CityOption) => {
  const province = provinceOption.value
  if (!province) return
  selectRegionDistrict(province, city, district)
}

/** 区县列表里再点一次已选区县，退回市级 */
const onDistrictClick = (district: CityOption) => {
  const province = provinceOption.value
  const city = cityOption.value
  if (!province || !city) return
  if (region.districtId === district.id) {
    selectRegionCity(province, city)
    return
  }
  selectRegionDistrict(province, city, district)
}

const getPopupContainer = () => document.body
</script>

<template>
  <div class="filter-row region-filter">
    <span class="filter-label">{{ label }}</span>
    <div class="filter-options">
      <a
        class="option-link"
        :class="{ active: level === 'national' }"
        @click="backToNational"
      >
        全国
      </a>

      <template v-if="level !== 'national'">
        <a class="option-link region-crumb" @click="backToProvince">
          {{ region.province }}
        </a>
        <RightOutlined class="region-crumb-arrow" />
        <template v-if="level !== 'province'">
          <a class="option-link region-crumb" @click="backToCity">
            {{ region.city }}
          </a>
          <RightOutlined class="region-crumb-arrow" />
        </template>
      </template>

      <template v-if="level === 'national'">
        <a
          v-for="item in visibleProvinces"
          :key="item.id"
          class="option-link"
          :class="{ active: item.id === region.provinceId }"
          @click="onProvinceClick(item)"
        >
          {{ item.label }}
        </a>
        <span v-if="loading && !provinces.length" class="region-muted">
          加载中...
        </span>
      </template>

      <template v-else-if="level === 'province'">
        <a-dropdown
          v-for="city in cities"
          :key="city.id"
          :open="openCityId === city.id"
          trigger="hover"
          placement="bottomLeft"
          :get-popup-container="getPopupContainer"
          @open-change="(open: boolean) => onCityOpenChange(city, open)"
        >
          <a
            class="option-link region-city"
            :class="{ active: city.id === region.cityId }"
            @click="onCityClick(city)"
          >
            {{ city.label }}
          </a>
          <template #overlay>
            <div class="region-district-panel" @mousedown.stop>
              <span
                v-if="districtLoading && !cityDistricts.length"
                class="region-muted"
              >
                加载中...
              </span>
              <template v-else>
                <a
                  v-for="district in cityDistricts"
                  :key="district.id"
                  class="option-link"
                  @click="onPanelDistrictClick(city, district)"
                >
                  {{ district.label }}
                </a>
                <span v-if="!cityDistricts.length" class="region-muted">
                  暂无区县
                </span>
              </template>
            </div>
          </template>
        </a-dropdown>
        <span v-if="loading && !cities.length" class="region-muted">
          加载中...
        </span>
      </template>

      <template v-else>
        <a
          v-for="district in districts"
          :key="district.id"
          class="option-link"
          :class="{ active: district.id === region.districtId }"
          @click="onDistrictClick(district)"
        >
          {{ district.label }}
        </a>
        <span v-if="loading && !districts.length" class="region-muted">
          加载中...
        </span>
      </template>
    </div>

    <a
      v-if="level === 'national' && props.collapsedCount > 0"
      class="more-link"
      @click="showMore = !showMore"
    >
      {{ showMore ? '收起' : '更多' }}
      <DownOutlined :class="{ rotated: showMore }" />
    </a>
  </div>
</template>

<style scoped lang="scss">
.region-filter {
  --filter-options-gap: 4px 16px;
}

.region-crumb {
  color: #8c8c8c;

  &:hover {
    color: var(--pb-primary);
  }
}

.region-crumb-arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: #bfbfbf;
}

.region-muted {
  color: #999;
  line-height: 32px;
}

.region-district-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 14px;
  min-width: 300px;
  max-width: 560px;
  max-height: 320px;
  padding: 8px 14px;
  overflow: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);

  .option-link {
    line-height: 28px;
    white-space: nowrap;
  }
}
</style>
