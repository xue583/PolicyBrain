<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { PolicyUserType } from '@/api/auth'
import { MembershipLevel, type AccountMembership } from '@/api/membership'
import { useAuthStore } from '@/stores/auth'
import { formatMembershipPeriod } from '@/utils/userDisplay'
import MemberCrownIcon from '@/views/membership/components/MemberCrownIcon.vue'
import MemberPayPanel from '@/views/membership/components/MemberPayPanel.vue'
import PlanCard from '@/views/membership/components/PlanCard.vue'
import {
  enterpriseBenefitIcon,
  personalBenefitIcon,
} from '@/views/membership/benefitIcons'
import {
  benefitsForEnterpriseTab,
  benefitsForPersonalTab,
} from '@/views/membership/membershipBenefits'
import {
  personalPlans,
  personalPlansForTab,
  plansByLevel,
  plansForIdentity,
} from '@/views/membership/membershipPlans'
import { useMembershipCatalog } from '@/views/membership/useMembershipCatalog'
import { usePlanSelection } from '@/views/membership/usePlanSelection'
import vipGem from '@/assets/membership/vip-gem.png'
import qrFrame from '@/assets/membership/qr-frame.png'
import entQrFrame from '@/assets/membership/enterprise/qr-frame.png'
import planHighlight from '@/assets/membership/plan-highlight.png'
import svipPlanHighlight from '@/assets/membership/svip-plan-highlight.png'
import entPlanHighlight from '@/assets/membership/enterprise/plan-highlight.png'
import entSvipPlanHighlight from '@/assets/membership/enterprise/svip-plan-highlight.png'

defineOptions({ name: 'RenewMembershipModal' })

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  membership?: AccountMembership | null
}>()

const emit = defineEmits<{
  paid: []
}>()

const auth = useAuthStore()
const { user } = storeToRefs(auth)

type Tier = 'vip' | 'svip'

/**
 * 与开通会员页同一套分板：企服人员看个人板，其余身份看企业板里的个人套餐。
 * 续费弹窗只收个人会员，不带企业套餐席位。
 */
const usesPersonalBoard = computed(
  () => Number(user.value?.identity) === PolicyUserType.EnterpriseService,
)

const tier = ref<Tier>('vip')
const selectedPlan = ref('')
const {
  plans: allPlans,
  benefits: allBenefits,
  loading: catalogLoading,
  plansFailed,
  ready: catalogReady,
  loadCatalog,
} = useMembershipCatalog()

const period = computed(() => formatMembershipPeriod(props.membership))

const levelLabel = computed(() => {
  const level = Number(props.membership?.level)
  if (level === MembershipLevel.Svip) return 'SVIP会员'
  if (level === MembershipLevel.Vip) return 'VIP会员'
  return ''
})

const remainingDays = computed(() => {
  const days = props.membership?.remainingDays
  return typeof days === 'number' && days > 0 ? days : 0
})

const tierMeta = computed(() =>
  usesPersonalBoard.value
    ? {
        vip: '数据查询、导出与批量处理',
        svip: '深度数据+AI申报材料',
      }
    : {
        vip: '畅享50项权益，适合个人日常使用',
        svip: '尊享57项权益，适合办公人士深度使用',
      },
)

const visiblePlans = computed(() =>
  plansForIdentity(allPlans.value, user.value?.identity),
)

const currentPlans = computed(() => {
  if (usesPersonalBoard.value) {
    return personalPlansForTab(visiblePlans.value, tier.value)
  }
  const personal = personalPlans(visiblePlans.value)
  return plansByLevel(
    personal,
    tier.value === 'svip' ? MembershipLevel.Svip : MembershipLevel.Vip,
  )
})

const currentBenefits = computed(() =>
  usesPersonalBoard.value
    ? benefitsForPersonalTab(allBenefits.value, tier.value)
    : benefitsForEnterpriseTab(allBenefits.value, tier.value),
)

const benefitNotes = computed(() =>
  currentBenefits.value.filter((item) => item.description),
)

const { currentPlan, selectPlan } = usePlanSelection(currentPlans, selectedPlan)

const benefitHeading = computed(() => {
  if (usesPersonalBoard.value) {
    return tier.value === 'vip'
      ? {
          title: '尊享VIP基础能力权益',
          sub: '沿用现有能力，覆盖个人日常的数据查询与批量处理',
        }
      : {
          title: '尊享SVIP专属权益，在VIP之上，多出一整套企业级能力',
          sub: '',
        }
  }
  return tier.value === 'vip'
    ? { title: '尊享50+项权益', sub: '' }
    : {
        title: 'SVIP权益,包含VIP50项权益+「17项」 SVIP专属特权',
        sub: '',
      }
})

const sceneNote = computed(() =>
  usesPersonalBoard.value
    ? '企业绑定后本年度不可更换 · 企服SVIP自动享有VIP全部权益 · 超出席位可增购'
    : '适用场景：个人日常使用，尊享50+项权益',
)

const planEmptyText = computed(() => {
  if (!auth.isLoggedIn) return '登录后查看在售套餐'
  if (catalogLoading.value) return '套餐加载中'
  if (plansFailed.value) return '套餐加载失败，请稍后重试'
  return '暂无在售套餐'
})

const highlightImage = computed(() => {
  if (usesPersonalBoard.value) {
    return tier.value === 'svip' ? svipPlanHighlight : planHighlight
  }
  return tier.value === 'svip' ? entSvipPlanHighlight : entPlanHighlight
})

const payVariant = computed<'personal' | 'enterprise'>(() =>
  usesPersonalBoard.value ? 'personal' : 'enterprise',
)

const payFrame = computed(() =>
  usesPersonalBoard.value ? qrFrame : entQrFrame,
)

const payTone = computed<'gold' | 'blue'>(() =>
  !usesPersonalBoard.value && tier.value === 'svip' ? 'blue' : 'gold',
)

const showBenefits = computed(
  () => catalogReady.value && currentPlans.value.length > 0,
)

const dailyText = (daily: string) => {
  if (!daily) return ''
  return usesPersonalBoard.value ? `折合每天¥${daily}` : `每天仅需${daily}元`
}

const benefitIcon = (name: string, index: number) =>
  usesPersonalBoard.value
    ? personalBenefitIcon(tier.value, name, index)
    : enterpriseBenefitIcon(tier.value, name, index)

const close = () => {
  open.value = false
}

const selectTier = (next: Tier) => {
  if (tier.value === next) return
  tier.value = next
  selectedPlan.value = ''
}

const onPaid = () => {
  emit('paid')
}

watch(
  open,
  (visible) => {
    if (!visible) return
    const level = Number(props.membership?.level)
    tier.value = level === MembershipLevel.Svip ? 'svip' : 'vip'
    selectedPlan.value = props.membership?.planCode?.trim() || ''
    void loadCatalog()
  },
  { immediate: true },
)
</script>

<template>
  <a-modal
    :open="open"
    :width="1040"
    :footer="null"
    :destroy-on-close="true"
    centered
    wrap-class-name="renew-membership-modal"
    @cancel="close"
  >
    <template #title>
      <span class="modal-title">会员续费</span>
    </template>
    <template #closeIcon>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <path
          d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <div
      class="renew"
      :class="[
        `is-${tier}`,
        usesPersonalBoard ? 'is-personal' : 'is-enterprise',
      ]"
    >
      <div v-if="levelLabel || period" class="status-bar">
        <span class="status-label">当前会员</span>
        <strong v-if="levelLabel">{{ levelLabel }}</strong>
        <span v-if="period" class="status-period">有效期 {{ period }}</span>
        <span v-if="remainingDays" class="status-days">
          剩余 {{ remainingDays }} 天
        </span>
      </div>

      <div class="tier-bar" role="tablist" aria-label="会员等级">
        <button
          type="button"
          role="tab"
          class="tier-tab vip"
          :class="{ 'is-active': tier === 'vip' }"
          :aria-selected="tier === 'vip'"
          @click="selectTier('vip')"
        >
          <img v-if="tier === 'vip'" :src="vipGem" alt="" />
          <span class="tier-copy">
            <strong>VIP会员</strong>
            <small>{{ tierMeta.vip }}</small>
          </span>
        </button>
        <button
          type="button"
          role="tab"
          class="tier-tab svip"
          :class="{ 'is-active': tier === 'svip' }"
          :aria-selected="tier === 'svip'"
          @click="selectTier('svip')"
        >
          <MemberCrownIcon v-if="tier === 'svip'" />
          <span class="tier-copy">
            <strong>SVIP会员</strong>
            <small>{{ tierMeta.svip }}</small>
          </span>
        </button>
      </div>

      <div class="renew-body">
        <div class="renew-main">
          <p v-if="!currentPlans.length" class="empty-note">
            {{ planEmptyText }}
          </p>
          <div v-else class="plan-row" :class="`is-${tier}`">
            <PlanCard
              v-for="plan in currentPlans"
              :key="plan.id"
              :plan="plan"
              surface="renew"
              :tone="tier"
              :selected="currentPlan?.id === plan.id"
              :highlight="currentPlan?.id === plan.id ? highlightImage : ''"
              :show-original="Boolean(plan.original)"
              :daily-text="dailyText(plan.daily)"
              :desc="plan.desc && usesPersonalBoard ? plan.desc : ''"
              @select="selectPlan(plan.id)"
            />
          </div>

          <p v-if="currentPlans.length" class="scene-note">{{ sceneNote }}</p>

          <section v-if="showBenefits" class="benefits">
            <h3>
              {{ benefitHeading.title }}
              <small v-if="benefitHeading.sub">{{ benefitHeading.sub }}</small>
            </h3>
            <ul class="benefit-list">
              <li v-for="(item, index) in currentBenefits" :key="item.id">
                <img :src="benefitIcon(item.name, index)" :alt="item.name" />
                <span>{{ item.name }}</span>
              </li>
            </ul>
            <ul v-if="benefitNotes.length" class="bullet-list">
              <li v-for="item in benefitNotes" :key="`${item.id}-note`">
                {{ item.name }}：{{ item.description }}
              </li>
            </ul>
          </section>
        </div>

        <MemberPayPanel
          v-if="currentPlan"
          :key="currentPlan.id"
          :variant="payVariant"
          :tone="payTone"
          :price="currentPlan.price"
          :plan-code="currentPlan.id"
          :qr-frame="payFrame"
          @paid="onPaid"
        />
        <aside v-else class="pay-pending">
          <p>{{ catalogLoading ? '套餐加载中' : planEmptyText }}</p>
        </aside>
      </div>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.renew {
  color: #1d2b3a;
}

.status-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 0 20px;
  padding: 10px 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, #fff6e8 0%, #fff 72%);
  color: #8a5a16;
  font-size: 13px;

  strong {
    font-size: 14px;
    font-weight: 700;
  }
}

.status-label {
  color: #a07840;
}

.status-period,
.status-days {
  color: #6d5430;
}

.status-days {
  margin-left: auto;
}

.tier-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 14px;
  background: #f6f1ea;
}

.tier-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 64px;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: #8a7a66;
  cursor: pointer;

  img,
  .crown {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  strong {
    display: block;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    font-weight: 400;
  }

  &.is-active {
    background: #fff;
  }
}

.renew.is-vip .tier-tab.vip.is-active {
  color: #c48a2e;
}

.renew.is-svip .tier-tab.svip.is-active {
  color: #5b63d6;
}

.renew.is-svip .tier-bar {
  background: #eef1ff;
}

.tier-copy {
  min-width: 0;
  text-align: left;
}

.renew-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: stretch;
}

.renew-main {
  min-width: 0;
  padding: 18px 20px 22px;
}

.plan-row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  &.is-vip {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.renew.is-personal .plan-row {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.empty-note,
.scene-note {
  margin: 0;
  color: #8b93a0;
  font-size: 13px;
  line-height: 1.6;
}

.scene-note {
  margin-top: 14px;
}

.benefits {
  margin-top: 18px;

  h3 {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 14px;
    color: #1f2a37;
    font-size: 16px;
    font-weight: 700;

    small {
      color: #8b93a0;
      font-size: 12px;
      font-weight: 400;
    }
  }
}

.renew.is-enterprise.is-svip .benefits h3 {
  color: #3d7cff;
}

.benefit-list {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: #3c4656;
    font-size: 12px;
    text-align: center;
  }

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
}

.bullet-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  color: #9e9e9e;
  font-size: 13px;
  line-height: 1.7;

  li {
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.65em;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #c3a36a;
    }
  }
}

.pay-pending {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border-left: 1px solid #f3e4d0;
  color: #8b93a0;
  font-size: 13px;
  text-align: center;

  p {
    margin: 0;
  }
}

.renew.is-svip .pay-pending {
  border-left-color: #e4ebf7;
}

@include below-lg {
  .status-days {
    margin-left: 0;
  }

  .tier-bar,
  .renew-body,
  .benefit-list,
  .plan-row,
  .plan-row.is-vip,
  .renew.is-personal .plan-row {
    grid-template-columns: 1fr;
  }

  .tier-copy {
    text-align: center;
  }

  .pay-pending {
    border-left: 0;
    border-top: 1px solid #f3e4d0;
  }
}
</style>

<style lang="scss">
.renew-membership-modal {
  .ant-modal {
    max-width: calc(100vw - 32px);
  }

  .ant-modal-content {
    padding: 0 0 8px;
    overflow: hidden;
    border-radius: 16px;
  }

  .ant-modal-header {
    margin: 0;
    padding: 16px 24px 12px;
    border-bottom: 1px solid #f0f2f5;
  }

  .ant-modal-body {
    max-height: calc(100vh - 140px);
    padding: 0 0 8px;
    overflow: auto;
  }

  .ant-modal-close {
    top: 14px;
    color: #8b93a0;
  }
}
</style>
