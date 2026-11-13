<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import vipGem from '@/assets/membership/vip-gem.png'
import qrFrame from '@/assets/membership/enterprise/qr-frame.png'
import planHighlight from '@/assets/membership/enterprise/plan-highlight.png'
import svipPlanHighlight from '@/assets/membership/enterprise/svip-plan-highlight.png'
import perkDiscount from '@/assets/membership/enterprise/perk-discount.png'
import perkConvenient from '@/assets/membership/enterprise/perk-convenient.png'
import perkFlexible from '@/assets/membership/enterprise/perk-flexible.png'
import perkCustom from '@/assets/membership/enterprise/perk-custom.png'
import { enterpriseBenefitIcon } from './benefitIcons'
import MemberCompareTable from './components/MemberCompareTable.vue'
import MemberCrownIcon from './components/MemberCrownIcon.vue'
import MemberPayPanel from './components/MemberPayPanel.vue'
import PlanCard from './components/PlanCard.vue'
import {
  benefitsForEnterpriseTab,
  type MembershipBenefitCard,
} from './membershipBenefits'
import {
  MembershipLevel,
  orgPlanTier,
  orgPlans,
  personalPlans,
  plansByLevel,
  type MembershipPlanCard,
} from './membershipPlans'
import { usePlanSelection } from './usePlanSelection'
import { formatFen, multiplyFen } from '@/utils/money'

defineOptions({ name: 'EnterpriseMemberBoard' })

const props = withDefaults(
  defineProps<{
    plans?: MembershipPlanCard[]
    benefits?: MembershipBenefitCard[]
    emptyText?: string
    benefitEmptyText?: string
    /** 从个人中心「会员续费 / 追加开通」进入时直接落在企业套餐 */
    initialTab?: 'vip' | 'svip' | 'org'
  }>(),
  {
    plans: () => [],
    benefits: () => [],
    emptyText: '暂无在售套餐',
    benefitEmptyText: '暂无会员权益',
  },
)

type BoardTab = 'vip' | 'svip' | 'org'
type OrgSub = 'vip' | 'svip'

const tab = ref<BoardTab>('vip')
const orgSub = ref<OrgSub>('svip')
const selectedPlan = ref('')
const seats = ref(5)

watch(
  () => props.initialTab,
  (next) => {
    if (next !== 'vip' && next !== 'svip' && next !== 'org') return
    tab.value = next
    selectedPlan.value = ''
    if (next === 'org') orgSub.value = 'svip'
  },
  { immediate: true },
)

const personalLevelPlans = computed(() => personalPlans(props.plans))

/** 企业套餐页签的商务权益，接口不提供，按设计稿写死 */
const orgPerks = [
  { icon: perkDiscount, title: '更优惠', desc: '批量购买优惠，最高可享8折' },
  {
    icon: perkConvenient,
    title: '更便捷',
    desc: '采购流程便捷，发票合同统一申请查看步骤',
  },
  {
    icon: perkFlexible,
    title: '更灵活',
    desc: '灵活管理成员，解决人员流动问题',
  },
  { icon: perkCustom, title: '可定制', desc: '如有定制需求，点击联系客服' },
]

const orgGroups = computed(() => {
  const all = orgPlans(props.plans)
  return {
    all,
    vip: all.filter((plan) => orgPlanTier(plan) === 'vip'),
    svip: all.filter((plan) => orgPlanTier(plan) === 'svip'),
  }
})

/** 企业 VIP / SVIP 两档都有货时才显示子切换，否则企业页签平铺全部套餐 */
const orgSplittable = computed(
  () => orgGroups.value.vip.length > 0 && orgGroups.value.svip.length > 0,
)

const currentOrgPlans = computed(() => {
  if (!orgSplittable.value) return orgGroups.value.all
  return orgSub.value === 'svip' ? orgGroups.value.svip : orgGroups.value.vip
})

/** 企业套餐页签没有接口权益，权益区展示写死的商务权益 */
const currentBenefits = computed(() =>
  tab.value === 'org'
    ? []
    : benefitsForEnterpriseTab(props.benefits, tab.value),
)

const benefitNotes = computed(() =>
  currentBenefits.value.filter((item) => item.description),
)

const currentPlans = computed(() => {
  if (tab.value === 'svip') {
    return plansByLevel(personalLevelPlans.value, MembershipLevel.Svip)
  }
  if (tab.value === 'org') return currentOrgPlans.value
  return plansByLevel(personalLevelPlans.value, MembershipLevel.Vip)
})

const { currentPlan, selectPlan } = usePlanSelection(currentPlans, selectedPlan)

const payTone = computed<'gold' | 'blue' | 'red'>(() => {
  if (tab.value === 'svip') return 'blue'
  if (tab.value === 'org') return 'red'
  return 'gold'
})

const payableTotal = computed(() =>
  formatFen(multiplyFen(currentPlan.value?.priceFen ?? '0', seats.value)),
)

const packLabel = computed(() => {
  if (!currentPlan.value) return ''
  if (!orgSplittable.value) return currentPlan.value.name
  const kind = orgSub.value === 'svip' ? 'SVIP企业套餐' : 'VIP企业套餐'
  return `${kind}${currentPlan.value.periodLabel}`
})

const expiryText = computed(() => {
  const days = currentPlan.value?.durationDays ?? 0
  if (!days) return ''
  return dayjs().add(days, 'day').format('YYYY-MM-DD')
})

const selectTab = (next: BoardTab) => {
  if (tab.value === next) return
  tab.value = next
  selectedPlan.value = ''
  if (next === 'org') orgSub.value = 'svip'
}

const selectOrgSub = (next: OrgSub) => {
  orgSub.value = next
  selectedPlan.value = ''
}

const changeSeats = (delta: number) => {
  seats.value = Math.min(99, Math.max(1, seats.value + delta))
}
</script>

<template>
  <div class="enterprise-board">
    <div
      class="board"
      :class="[`is-${tab}`, tab === 'org' ? `sub-${orgSub}` : '']"
    >
      <div class="tier-bar">
        <button
          type="button"
          class="tier-tab vip"
          :class="{ active: tab === 'vip' }"
          @click="selectTab('vip')"
        >
          <img v-if="tab === 'vip'" :src="vipGem" alt="" />
          <span class="tier-copy">
            <strong>{{ tab === 'org' ? '个人会员' : 'VIP会员' }}</strong>
            <small>畅享50项权益，适合个人日常使用</small>
          </span>
        </button>
        <button
          type="button"
          class="tier-tab svip"
          :class="{ active: tab === 'svip' }"
          @click="selectTab('svip')"
        >
          <MemberCrownIcon v-if="tab === 'svip'" />
          <span class="tier-copy">
            <strong>SVIP会员</strong>
            <small>尊享57项权益，适合办公人士深度使用</small>
          </span>
        </button>
        <button
          type="button"
          class="tier-tab org"
          :class="{ active: tab === 'org' }"
          @click="selectTab('org')"
        >
          <span class="tier-copy">
            <strong>企业套餐</strong>
            <small>解决人员流动问题，适合团队多账号统一管理</small>
          </span>
        </button>
      </div>

      <div class="board-body" :class="{ 'is-single': !currentPlan }">
        <div class="board-main">
          <div v-if="tab === 'org' && orgSplittable" class="org-switch">
            <button
              type="button"
              :class="{ active: orgSub === 'vip' }"
              @click="selectOrgSub('vip')"
            >
              <img :src="vipGem" alt="" />
              VIP企业套餐
            </button>
            <button
              type="button"
              :class="{ active: orgSub === 'svip' }"
              @click="selectOrgSub('svip')"
            >
              <MemberCrownIcon mono />
              SVIP企业套餐
            </button>
          </div>

          <p v-if="!currentPlans.length" class="scene-note">{{ emptyText }}</p>
          <div v-else class="plan-row" :class="`is-${tab}`">
            <PlanCard
              v-for="plan in currentPlans"
              :key="plan.id"
              :plan="plan"
              surface="enterprise"
              :tone="tab"
              :selected="currentPlan?.id === plan.id"
              :highlight="
                currentPlan?.id === plan.id && tab !== 'org'
                  ? tab === 'svip'
                    ? svipPlanHighlight
                    : planHighlight
                  : ''
              "
              :price-suffix="tab === 'org' ? '/人' : ''"
              :show-original="Boolean(plan.original) && tab !== 'org'"
              :daily-text="plan.daily ? `每天仅需${plan.daily}元` : ''"
              :saved-text="
                plan.saved && tab === 'org' ? `已减${plan.saved}/人` : ''
              "
              @select="selectPlan(plan.id)"
            />
          </div>

          <div v-if="tab === 'org' && currentPlan" class="seat-row">
            <p>
              开通新套餐:{{ packLabel
              }}<template v-if="expiryText">（{{ expiryText }}到期）</template>
            </p>
            <div class="seat-control">
              人数：
              <button type="button" @click="changeSeats(-1)">−</button>
              <strong>{{ seats }}</strong>
              <button type="button" @click="changeSeats(1)">+</button>
            </div>
            <p class="seat-total">
              实付金额：{{ currentPlan.price }}*{{ seats }}=¥{{ payableTotal }}
            </p>
          </div>
          <p v-else-if="tab !== 'org'" class="scene-note">
            适用场景：个人日常使用，尊享50+项权益
          </p>

          <section v-if="tab !== 'org'" class="benefits">
            <h2 v-if="tab === 'vip'">尊享50+项权益</h2>
            <h2 v-else>
              SVIP权益,包含VIP50项权益+<em>「17项」</em> SVIP专属特权
            </h2>
            <p v-if="!currentBenefits.length" class="scene-note">
              {{ benefitEmptyText }}
            </p>
            <template v-else>
              <ul class="benefit-list">
                <li v-for="(item, index) in currentBenefits" :key="item.id">
                  <img
                    :src="enterpriseBenefitIcon(tab, item.name, index)"
                    :alt="item.name"
                  />
                  <span>{{ item.name }}</span>
                </li>
              </ul>
              <ul v-if="benefitNotes.length" class="bullet-list">
                <li v-for="item in benefitNotes" :key="item.id">
                  {{ item.name }}：{{ item.description }}
                </li>
              </ul>
            </template>
          </section>

          <section v-else class="org-perks">
            <h2>
              {{ orgSub === 'svip' ? 'SVIP' : 'VIP' }}权益,包含VIP50项权益+<em
                >「17项」</em
              >
              SVIP专属特权
            </h2>
            <ul>
              <li v-for="item in orgPerks" :key="item.title">
                <img :src="item.icon" alt="" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <MemberPayPanel
          v-if="currentPlan"
          variant="enterprise"
          :price="tab === 'org' ? payableTotal : currentPlan.price"
          :plan-code="currentPlan.id"
          :quantity="tab === 'org' ? seats : undefined"
          :qr-frame="qrFrame"
          :tone="payTone"
        />
      </div>
    </div>

    <MemberCompareTable v-if="tab !== 'org'" />
  </div>
</template>

<style scoped lang="scss">
.enterprise-board {
  color: #1d2b3a;
}

.board {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(4, 24, 63, 0.28);
}

.tier-bar {
  display: grid;
  grid-template-columns: 1.05fr 1fr 1fr;
  min-height: 72px;
}

.tier-tab {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
  outline: none;

  img,
  .crown {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  strong {
    display: block;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    font-weight: 400;
    opacity: 0.86;
  }
}

.tier-copy {
  min-width: 0;
  text-align: center;
}

.board.is-vip {
  .tier-tab.vip {
    z-index: 2;
    background: #fff;
    color: #c48a2e;
  }

  .tier-tab.svip,
  .tier-tab.org {
    color: #c49a4a;
    background: linear-gradient(180deg, #fff7ef 0%, #f6dfc4 100%);
  }

  .tier-tab.svip {
    clip-path: polygon(22px 0, 100% 0, 100% 100%, 0 100%);
    margin-left: -18px;
    padding-left: 28px;
  }
}

.board.is-svip {
  .tier-bar {
    background: linear-gradient(180deg, #eef0ff 0%, #d9dcff 100%);
  }

  .tier-tab.vip,
  .tier-tab.org {
    color: #5d66c9;
  }

  .tier-tab.svip {
    z-index: 2;
    background: #fff;
    color: #5b63d6;
    border-radius: 18px 18px 0 0;
  }
}

.board.is-org {
  .tier-bar {
    background: linear-gradient(180deg, #7eb6ff 0%, #4d8ef7 100%);
  }

  .tier-tab {
    color: rgba(255, 255, 255, 0.88);
  }

  .tier-tab.org {
    z-index: 2;
    color: #3d7cff;
    background: #fff;
    border-radius: 18px 18px 0 0;
  }
}

.board-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;

  &.is-single {
    grid-template-columns: minmax(0, 1fr);
  }
}

.board-main {
  min-width: 0;
  padding: 20px 24px 28px;
}

.org-switch {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 4px 0 18px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border: 1px solid #d7e4f7;
    border-radius: 20px;
    background: #fff;
    color: #5b6573;
    cursor: pointer;

    img,
    .crown {
      width: 16px;
      height: 16px;
    }

    &.active {
      border-color: #3d7cff;
      color: #3d7cff;
      box-shadow: 0 0 0 1px #3d7cff;
    }
  }
}

.plan-row {
  display: grid;
  gap: 12px;

  &.is-vip {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  &.is-svip,
  &.is-org {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.scene-note,
.seat-row {
  margin: 18px 0 14px;
  font-size: 13px;
  color: #8b93a0;
}

.seat-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  p {
    margin: 0;
  }
}

.seat-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  button {
    width: 22px;
    height: 22px;
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    line-height: 1;
  }

  strong {
    min-width: 18px;
    text-align: center;
    color: #3d7cff;
  }
}

.seat-total {
  color: #5b6573;
}

.benefits h2,
.org-perks h2 {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2a37;

  em {
    font-style: normal;
    color: #5b6ef5;
  }
}

.board.is-svip .benefits h2,
.board.is-org .org-perks h2 {
  color: #4d63f2;
}

.benefit-list {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #3c4656;
    text-align: center;
  }

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
}

.bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
  color: #9e9e9e;
  font-size: 13px;
  line-height: 1.85;

  li {
    position: relative;
    padding-left: 14px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.7em;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #c3a36a;
    }
  }
}

.board.is-svip .bullet-list li::before {
  background: #8aa0f0;
}

.org-perks {
  padding: 16px 18px 8px;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    #ebf4ff 0%,
    rgba(235, 244, 255, 0.35) 100%
  );

  ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  img {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    object-fit: contain;
  }

  strong {
    display: block;
    margin-bottom: 4px;
    color: #2a3546;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: #5b6573;
  }
}

@include below-lg {
  .tier-bar,
  .board-body,
  .plan-row.is-vip,
  .plan-row.is-svip,
  .plan-row.is-org,
  .benefit-list,
  .org-perks ul {
    display: flex;
    flex-direction: column;
  }

  .tier-tab.svip {
    clip-path: none !important;
    margin: 0 !important;
    padding: 14px 16px !important;
  }
}
</style>
