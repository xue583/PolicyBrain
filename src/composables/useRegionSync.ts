import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { fetchUserContext, updateUserContext } from '@/api/account'
import { loadRegionOptions, type CityOption } from '@/api/meta'
import { resolveContextRegion } from '@/api/mapPortal'
import { useAuthStore } from '@/stores/auth'
import { useRegionStore } from '@/stores/region'
import { toErrorMessage } from '@/utils/apiError'
import { selectRegionProvince } from '@/utils/regionActions'
import {
  hasRegionIds,
  parseRegionIds,
  regionIdsKey,
  regionQueryMatches,
  sameRegionIds,
  withRegionIds,
  type RegionIds,
} from '@/utils/regionQuery'

/**
 * 地区状态同步：路由 query  ↔  region store  ↔  登录用户上下文。
 *
 * - 路由 query（provinceId/cityId/districtId）是地区信息的载体，页面间跳转不丢失
 * - store 是内存中的唯一地区状态，顶部选择器与各页面搜索区都读写它
 * - 登录用户选择地区后写回账号上下文，下次登录/刷新可恢复
 */
export const useRegionSync = () => {
  const route = useRoute()
  const router = useRouter()
  const region = useRegionStore()
  const auth = useAuthStore()
  // Pinia store 上直接读 computed 会自动解包成 boolean；watch/响应式需 storeToRefs
  const { isLoggedIn } = storeToRefs(auth)

  const storeIds = (): RegionIds => ({
    provinceId: region.provinceId,
    cityId: region.cityId,
    districtId: region.districtId,
  })

  /** 已回填或已持久化的状态，避免把回填结果当成用户选择重复写库 */
  let persistKey = ''
  let hydrateSeq = 0

  const persistContext = (ids: RegionIds) => {
    const key = regionIdsKey(ids)
    if (key === persistKey) return
    persistKey = key
    if (!isLoggedIn.value || ids.provinceId == null) return
    void updateUserContext({
      provinceId: ids.provinceId,
      cityId: ids.cityId,
      districtId: ids.districtId,
    }).catch((err: unknown) => {
      message.error(toErrorMessage(err, '地区保存失败'))
    })
  }

  const writeRegionQuery = (ids: RegionIds) => {
    if (regionQueryMatches(route.query, ids)) return
    void router.replace({ query: withRegionIds(route.query, ids) })
  }

  const applySelection = (next: {
    province: string
    provinceId: number | null
    city?: string
    cityId?: number | null
    district?: string
    districtId?: number | null
  }) => {
    persistKey = regionIdsKey({
      provinceId: next.provinceId,
      cityId: next.cityId ?? null,
      districtId: next.districtId ?? null,
    })
    region.setRegion(next)
  }

  const applyProvince = async (province: CityOption) => {
    persistKey = regionIdsKey({
      provinceId: province.id,
      cityId: null,
      districtId: null,
    })
    await selectRegionProvince(province)
  }

  /** 用路由上的省市区 id 回填 store（标签需经地区接口解析） */
  const hydrateFromRoute = async (ids: RegionIds) => {
    if (!hasRegionIds(ids)) return
    const seq = ++hydrateSeq
    const provinces = await loadRegionOptions().catch(() => [])
    if (seq !== hydrateSeq) return

    const province = provinces.find((item) => item.id === ids.provinceId)
    if (!province) {
      // query 上的省已不存在：清空地区，store → query 会顺手清掉脏参数
      applySelection({ province: '', provinceId: null })
      return
    }
    if (ids.cityId == null) {
      await applyProvince(province)
      return
    }

    const cities = await loadRegionOptions(province.id).catch(() => [])
    if (seq !== hydrateSeq) return
    region.setCityLabels(cities.map((item) => item.label))
    const city = cities.find((item) => item.id === ids.cityId)
    if (!city) {
      await applyProvince(province)
      return
    }
    if (ids.districtId == null) {
      applySelection({
        province: province.label,
        provinceId: province.id,
        city: city.label,
        cityId: city.id,
      })
      return
    }

    const districts = await loadRegionOptions(city.id).catch(() => [])
    if (seq !== hydrateSeq) return
    const district = districts.find((item) => item.id === ids.districtId)
    applySelection({
      province: province.label,
      provinceId: province.id,
      city: city.label,
      cityId: city.id,
      district: district?.label ?? '',
      districtId: district?.id ?? null,
    })
  }

  /** 登录用户没有路由地区时，用账号里保存的地区恢复 */
  const restoreFromUserContext = async () => {
    if (region.provinceId != null || !isLoggedIn.value) return
    const context = await fetchUserContext().catch(() => null)
    if (!context || region.provinceId != null) return

    const provinces = await loadRegionOptions().catch(() => [])
    const saved = resolveContextRegion(context, [], provinces)
    const province =
      provinces.find((item) => item.id === saved.provinceId) ??
      provinces.find((item) => item.label === saved.provinceLabel)
    if (!province) {
      if (saved.provinceLabel) {
        applySelection({
          province: saved.provinceLabel,
          provinceId: saved.provinceId,
        })
      }
      return
    }
    if (!saved.cityId && !saved.cityLabel) {
      await applyProvince(province)
      return
    }

    const cities = await loadRegionOptions(province.id).catch(() => [])
    region.setCityLabels(cities.map((item) => item.label))
    const city =
      cities.find((item) => item.id === saved.cityId) ??
      cities.find((item) => item.label === saved.cityLabel)
    if (!city) {
      await applyProvince(province)
      return
    }
    applySelection({
      province: province.label,
      provinceId: province.id,
      city: city.label,
      cityId: city.id,
    })
  }

  // Pinia 会把 store 上的 id 解包成普通值，直接放进 watch 数组无法跟踪后续修改。
  // 顶部只选省时 cityId、districtId 会被清空，也要靠这次监听写回账号上下文。
  watch(
    () => [region.provinceId, region.cityId, region.districtId],
    () => {
      const ids = storeIds()
      writeRegionQuery(ids)
      persistContext(ids)
    },
  )

  // 路由 query → store（地址栏修改、浏览器前进后退）
  watch(
    [
      () => route.query.provinceId,
      () => route.query.cityId,
      () => route.query.districtId,
    ],
    () => {
      const ids = parseRegionIds(route.query)
      if (sameRegionIds(ids, storeIds())) return
      // query 上没有地区时保留当前选择，交由下方导航守卫补回 query
      if (!hasRegionIds(ids)) return
      void hydrateFromRoute(ids)
    },
  )

  // 页面跳转丢失地区参数时补回，保证地区信息始终携带在路由上
  watch(
    () => route.fullPath,
    () => {
      const ids = storeIds()
      if (!hasRegionIds(ids)) return
      writeRegionQuery(ids)
    },
  )

  // 登录后恢复账号里保存的地区
  watch(isLoggedIn, (loggedIn) => {
    if (loggedIn) void restoreFromUserContext()
  })

  onMounted(() => {
    void hydrateFromRoute(parseRegionIds(route.query)).then(() =>
      restoreFromUserContext(),
    )
  })
}
