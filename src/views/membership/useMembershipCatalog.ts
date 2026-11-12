import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { fetchMembershipBenefits, fetchMembershipPlans } from '@/api/membership'
import {
  asMembershipBenefits,
  toBenefitCards,
  type MembershipBenefitCard,
} from './membershipBenefits'
import {
  MEMBERSHIP_PLAN_LEVELS,
  asMembershipPlans,
  toPlanCards,
  type MembershipPlanCard,
} from './membershipPlans'

const plans = ref<MembershipPlanCard[]>([])
const benefits = ref<MembershipBenefitCard[]>([])
const loading = ref(false)
const plansFailed = ref(false)
const benefitsFailed = ref(false)
const ready = ref(false)
let inflight: Promise<void> | null = null
let loadedToken = ''

/** 测试隔离，也用于登录态切换后丢掉上一份目录 */
export const resetMembershipCatalog = () => {
  plans.value = []
  benefits.value = []
  loading.value = false
  plansFailed.value = false
  benefitsFailed.value = false
  ready.value = false
  inflight = null
  loadedToken = ''
}

const loadLevelGroups = async <T>(
  load: (level: (typeof MEMBERSHIP_PLAN_LEVELS)[number]) => Promise<T[]>,
) =>
  Promise.all(
    MEMBERSHIP_PLAN_LEVELS.map(async (level) => {
      try {
        return await load(level)
      } catch {
        return null
      }
    }),
  )

const clearCatalog = () => {
  plans.value = []
  benefits.value = []
  loading.value = false
  plansFailed.value = false
  benefitsFailed.value = false
  ready.value = true
  loadedToken = ''
}

/**
 * 开通会员页和续费弹窗共用一份在售目录。
 * 同一登录态下第二次打开不再请求。
 */
export const useMembershipCatalog = () => {
  const loadCatalog = () => {
    const auth = useAuthStore()
    const token = auth.token
    if (!auth.isLoggedIn || !token) {
      clearCatalog()
      return Promise.resolve()
    }
    if (
      ready.value &&
      !plansFailed.value &&
      !benefitsFailed.value &&
      loadedToken === token
    ) {
      return Promise.resolve()
    }
    if (inflight) return inflight

    loading.value = true
    plansFailed.value = false
    benefitsFailed.value = false
    const task = (async () => {
      try {
        const [planGroups, benefitGroups] = await Promise.all([
          loadLevelGroups(async (level) =>
            asMembershipPlans(await fetchMembershipPlans(level)),
          ),
          loadLevelGroups(async (level) =>
            asMembershipBenefits(await fetchMembershipBenefits(level)),
          ),
        ])
        if (useAuthStore().token !== token) return
        if (planGroups.every((group) => group == null)) {
          plans.value = []
          plansFailed.value = true
        } else {
          plans.value = toPlanCards(planGroups.flatMap((group) => group ?? []))
        }
        if (benefitGroups.every((group) => group == null)) {
          benefits.value = []
          benefitsFailed.value = true
        } else {
          benefits.value = toBenefitCards(
            benefitGroups.flatMap((group) => group ?? []),
          )
        }
        loadedToken = token
        ready.value = true
      } finally {
        loading.value = false
      }
    })()
    inflight = task
    return task.finally(() => {
      if (inflight === task) inflight = null
    })
  }

  return {
    plans,
    benefits,
    loading,
    plansFailed,
    benefitsFailed,
    ready,
    loadCatalog,
  }
}
