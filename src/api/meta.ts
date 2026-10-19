import { request } from '@/utils/request'
import {
  mapIndustryNames,
  mapIndustryTree,
  mapInfoTypeOptions,
  mapRegionTreeIndex,
  type CityOption,
  type IndustryNode,
} from '@/api/mapPortal'

export type { CityOption, IndustryNode }

/** 省市区整棵树只请求一次，选中省/市/区都从这里取，不再按选中项逐个请求。 */
let regionIndexPromise: Promise<Map<string, CityOption[]>> | null = null

const loadRegionIndex = () => {
  if (!regionIndexPromise) {
    regionIndexPromise = request({
      url: '/meta/regions',
      method: 'get',
      params: { level: 2 },
      hideError: true,
    })
      .then((data) => mapRegionTreeIndex(data))
      .catch((err: unknown) => {
        regionIndexPromise = null
        throw err
      })
  }
  return regionIndexPromise
}

/**
 * 地区选项。首次调用拉取省市区全量并缓存，之后同一会话内不再请求。
 * pid 为空返回省级，传入父级 id 返回其直接下级。
 */
export const loadRegionOptions = async (
  pid?: number,
): Promise<CityOption[]> => {
  const index = await loadRegionIndex()
  const key = pid == null ? 'root' : String(pid)
  return index.get(key) ?? []
}

export const fetchIndustryNames = async () => {
  const data = await request({
    url: '/meta/industries',
    method: 'get',
    params: { level: 1 },
    hideError: true,
  })
  return mapIndustryNames(data)
}

/** 一级产业及其子级。接口 level 表示展开深度，3 覆盖到末级标签。 */
export const fetchIndustryTree = async () => {
  const data = await request({
    url: '/meta/industries',
    method: 'get',
    params: { level: 3 },
    hideError: true,
  })
  return mapIndustryTree(data)
}

export const fetchInfoTypeOptions = async () => {
  const data = await request({
    url: '/meta/dict',
    method: 'get',
    params: { names: 'info_type' },
    hideError: true,
  })
  return mapInfoTypeOptions(data)
}

/** 不传 pid 时取省级；传入父级 id 时取其下级。结果来自全量缓存。 */
export const fetchRegionOptions = (pid?: number) => loadRegionOptions(pid)

export const fetchCityOptions = (parentId: number) =>
  loadRegionOptions(parentId)

export const fetchProvinceOptions = async () => {
  const options = await loadRegionOptions()
  return options.map((item) => item.label)
}
