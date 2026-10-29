<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { PolicyUserType } from '@/api/auth'
import { fetchMembershipBenefits, fetchMembershipPlans } from '@/api/membership'
import { useAuthStore } from '@/stores/auth'
import EnterpriseMemberBoard from './EnterpriseMemberBoard.vue'
import PersonalMemberBoard from './PersonalMemberBoard.vue'
import {
  asMembershipBenefits,
  toBenefitCards,
  type MembershipBenefitCard,
} from './membershipBenefits'
import {
  MEMBERSHIP_PLAN_LEVELS,
  asMembershipPlans,
  plansForIdentity,
  toPlanCards,
  type MembershipPlanCard,
} from './membershipPlans'
import bgImg from '@/assets/membership/bg.png'
import heroPush from '@/assets/membership/hero-push.png'
import heroReport from '@/assets/membership/hero-report.png'
import heroRecommend from '@/assets/membership/hero-recommend.png'
import heroLibrary from '@/assets/membership/hero-library.png'

defineOptions({ name: 'MembershipPage' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const isEnterpriseView = computed(
  () => Number(user.value?.identity) === PolicyUserType.EnterpriseService,
)

const allPlans = ref<MembershipPlanCard[]>([])
const allBenefits = ref<MembershipBenefitCard[]>([])
const catalogLoading = ref(false)
const plansFailed = ref(false)
const benefitsFailed = ref(false)

const visiblePlans = computed(() =>
  plansForIdentity(allPlans.value, user.value?.identity),
)

const planEmptyText = computed(() => {
  if (!auth.isLoggedIn) return '登录后查看在售套餐'
  if (catalogLoading.value) return '套餐加载中'
  if (plansFailed.value) return '套餐加载失败，请稍后重试'
  return '暂无在售套餐'
})

const benefitEmptyText = computed(() => {
  if (!auth.isLoggedIn) return '登录后查看会员权益'
  if (catalogLoading.value) return '权益加载中'
  if (benefitsFailed.value) return '权益加载失败，请稍后重试'
  return '暂无会员权益'
})

const loadLevelGroups = async <T,>(
  load: (level: (typeof MEMBERSHIP_PLAN_LEVELS)[number]) => Promise<T[]>,
) => {
  return Promise.all(
    MEMBERSHIP_PLAN_LEVELS.map(async (level) => {
      try {
        return await load(level)
      } catch {
        return null
      }
    }),
  )
}

const loadCatalog = async () => {
  if (!auth.isLoggedIn) {
    allPlans.value = []
    allBenefits.value = []
    catalogLoading.value = false
    plansFailed.value = false
    benefitsFailed.value = false
    return
  }

  catalogLoading.value = true
  plansFailed.value = false
  benefitsFailed.value = false
  try {
    const [planGroups, benefitGroups] = await Promise.all([
      loadLevelGroups(async (level) =>
        asMembershipPlans(await fetchMembershipPlans(level)),
      ),
      loadLevelGroups(async (level) =>
        asMembershipBenefits(await fetchMembershipBenefits(level)),
      ),
    ])
    if (planGroups.every((group) => group == null)) {
      allPlans.value = []
      plansFailed.value = true
    } else {
      allPlans.value = toPlanCards(planGroups.flatMap((group) => group ?? []))
    }
    if (benefitGroups.every((group) => group == null)) {
      allBenefits.value = []
      benefitsFailed.value = true
    } else {
      allBenefits.value = toBenefitCards(
        benefitGroups.flatMap((group) => group ?? []),
      )
    }
  } finally {
    catalogLoading.value = false
  }
}

watch(
  () => auth.isLoggedIn,
  () => void loadCatalog(),
  { immediate: true },
)

const heroFeatures = [
  { icon: heroPush, label: '政策实时推送' },
  { icon: heroReport, label: '月度数据报告' },
  { icon: heroRecommend, label: '智能匹配推荐' },
  { icon: heroLibrary, label: '基础政策库访问' },
]
</script>

<template>
  <div class="membership-page">
    <div class="page-bg" :style="{ backgroundImage: `url(${bgImg})` }" />

    <div class="page-inner">
      <section class="hero">
        <h1 class="hero-title">尊享<span>会员特权</span>，畅享无限可能!</h1>
        <p class="hero-sub">升级会员，体验更多独家优惠与专属服务</p>
        <ul class="hero-features">
          <li v-for="item in heroFeatures" :key="item.label">
            <img :src="item.icon" alt="" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <PersonalMemberBoard
        v-if="isEnterpriseView"
        :plans="visiblePlans"
        :benefits="allBenefits"
        :empty-text="planEmptyText"
        :benefit-empty-text="benefitEmptyText"
      />
      <EnterpriseMemberBoard
        v-else
        :plans="visiblePlans"
        :benefits="allBenefits"
        :empty-text="planEmptyText"
        :benefit-empty-text="benefitEmptyText"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.membership-page {
  min-height: calc(100vh - 64px);
  padding: 88px 0 56px;
  overflow-x: hidden;
  background: #03183f;
  color: #1d2b3a;
}

.page-bg {
  position: absolute;
  left: 0;
  top: -20px;
  width: 100%;
  // 图片底部约 14% 是渐隐到透明的区域，容器必须能完整显示它，
  // 否则渐隐被裁会在图片下边缘留下一条硬接线；小屏时仍保留 60vh 起底
  aspect-ratio: 3840 / 1436;
  min-height: min(720px, 60vh);
  background-repeat: no-repeat;
  background-position: right top;
  background-size: cover;
  pointer-events: none;
  z-index: 0;
}

.page-inner {
  position: relative;
  z-index: 1;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}

.hero {
  padding: 28px 0 81px;
  color: #fff;
}

.hero-title {
  margin: 20px 0 14px;
  font-family: var(--pb-font-display);
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 0.2em;
  line-height: 1.25;

  span {
    color: #f2c36b;
    font-size: 52px;
  }
}

.hero-sub {
  margin: 25px 0 50px;
  font-family: var(--pb-font-slogan);
  font-size: 22px;
  color: rgba(255, 255, 255, 0.82);
}

.hero-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  max-width: 460px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    color: rgba(255, 255, 255, 0.92);
  }

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
}

@include below-lg {
  .page-inner {
    width: calc(100% - 32px);
  }

  .hero-title {
    font-size: 26px;
  }
}
</style>
