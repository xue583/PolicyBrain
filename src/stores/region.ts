import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type RegionSelection = {
  province: string
  provinceId: number | null
  city?: string
  cityId?: number | null
  district?: string
  districtId?: number | null
}

export const useRegionStore = defineStore('region', () => {
  const province = ref('')
  const provinceId = ref<number | null>(null)
  const city = ref('')
  const cityId = ref<number | null>(null)
  const district = ref('')
  const districtId = ref<number | null>(null)
  const cityLabels = ref<string[]>([])

  /** 顶部只展示省市两级，区县由各页面搜索区下钻选择 */
  const areaLabel = computed(() => {
    if (city.value) return city.value
    if (province.value) return province.value
    return '请选择地区'
  })

  /** 当前生效的最深层级名称，用于各页面列表查询 */
  const selectedLabel = computed(
    () => district.value || city.value || province.value,
  )

  const setRegion = (next: RegionSelection) => {
    province.value = next.province
    provinceId.value = next.provinceId
    city.value = next.city ?? ''
    cityId.value = next.cityId ?? null
    district.value = next.district ?? ''
    districtId.value = next.districtId ?? null
  }

  const clearRegion = () => {
    setRegion({ province: '', provinceId: null })
  }

  const setProvince = (label: string, id: number | null = null) => {
    province.value = label
    provinceId.value = id
    city.value = ''
    cityId.value = null
    district.value = ''
    districtId.value = null
  }

  const setCity = (
    provinceLabel: string,
    nextProvinceId: number | null,
    cityLabel: string,
    nextCityId: number | null = null,
  ) => {
    province.value = provinceLabel
    provinceId.value = nextProvinceId
    city.value = cityLabel
    cityId.value = nextCityId
    district.value = ''
    districtId.value = null
  }

  const setDistrict = (
    provinceLabel: string,
    nextProvinceId: number | null,
    cityLabel: string,
    nextCityId: number | null,
    districtLabel: string,
    nextDistrictId: number | null,
  ) => {
    province.value = provinceLabel
    provinceId.value = nextProvinceId
    city.value = cityLabel
    cityId.value = nextCityId
    district.value = districtLabel
    districtId.value = nextDistrictId
  }

  const setCityLabels = (labels: string[]) => {
    cityLabels.value = [...labels]
  }

  return {
    province,
    provinceId,
    city,
    cityId,
    district,
    districtId,
    cityLabels,
    areaLabel,
    selectedLabel,
    setRegion,
    clearRegion,
    setProvince,
    setCity,
    setDistrict,
    setCityLabels,
  }
})
