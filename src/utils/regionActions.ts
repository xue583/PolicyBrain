import type { CityOption } from '@/api/mapPortal'
import { loadRegionOptions } from '@/api/meta'
import { useRegionStore } from '@/stores/region'

/**
 * 地区选择动作：顶部选择器与各页面搜索区的地区筛选用同一套入口，
 * 保证 store（及路由 query）始终只有一份地区状态。
 */

/** 选择省份，并缓存其下级城市名称（首页资讯排序用） */
export const selectRegionProvince = async (option: CityOption) => {
  const region = useRegionStore()
  region.setProvince(option.label, option.id)
  try {
    const cities = await loadRegionOptions(option.id)
    region.setCityLabels(cities.map((item) => item.label))
    return cities
  } catch {
    region.setCityLabels([])
    return []
  }
}

export const selectRegionCity = (province: CityOption, city: CityOption) => {
  useRegionStore().setCity(province.label, province.id, city.label, city.id)
}

export const selectRegionDistrict = (
  province: CityOption,
  city: CityOption,
  district: CityOption,
) => {
  useRegionStore().setDistrict(
    province.label,
    province.id,
    city.label,
    city.id,
    district.label,
    district.id,
  )
}

export const clearRegionSelection = () => {
  useRegionStore().clearRegion()
}
