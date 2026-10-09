<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import vipGem from '@/assets/membership/vip-gem.png'
import qrFrame from '@/assets/membership/enterprise/qr-frame.png'
import planHighlight from '@/assets/membership/enterprise/plan-highlight.png'
import svipPlanHighlight from '@/assets/membership/enterprise/svip-plan-highlight.png'
import benefitSearch from '@/assets/membership/enterprise/benefit-search.png'
import benefitDeclare from '@/assets/membership/enterprise/benefit-declare.png'
import benefitBatch from '@/assets/membership/enterprise/benefit-batch.png'
import benefitMatch from '@/assets/membership/enterprise/benefit-match.png'
import benefitNurture from '@/assets/membership/enterprise/benefit-nurture.png'
import benefitRecommend from '@/assets/membership/enterprise/benefit-recommend.png'
import svipBenefitSearch from '@/assets/membership/enterprise/svip-benefit-search.png'
import svipBenefitDeclare from '@/assets/membership/enterprise/svip-benefit-declare.png'
import svipBenefitBatch from '@/assets/membership/enterprise/svip-benefit-batch.png'
import svipBenefitMatch from '@/assets/membership/enterprise/svip-benefit-match.png'
import svipBenefitNurture from '@/assets/membership/enterprise/svip-benefit-nurture.png'
import svipBenefitRecommend from '@/assets/membership/enterprise/svip-benefit-recommend.png'
import perkDiscount from '@/assets/membership/enterprise/perk-discount.png'
import perkConvenient from '@/assets/membership/enterprise/perk-convenient.png'
import perkFlexible from '@/assets/membership/enterprise/perk-flexible.png'
import perkCustom from '@/assets/membership/enterprise/perk-custom.png'
import MemberCompareTable from './components/MemberCompareTable.vue'
import MemberCrownIcon from './components/MemberCrownIcon.vue'
import MemberPayPanel from './components/MemberPayPanel.vue'
import { usePlanSelection } from './usePlanSelection'

defineOptions({ name: 'EnterpriseMemberBoard' })

type BoardTab = 'vip' | 'svip' | 'org'
type OrgSub = 'vip' | 'svip'
type PlanTier = 'vip' | 'svip' | `org-${OrgSub}`

type Plan = {
  id: string
  name: string
  price: number
  original?: number
  unit?: string
  daily: string
  tag?: string
  featured?: boolean
  years: number
  saved?: string
}

const tab = ref<BoardTab>('vip')
const orgSub = ref<OrgSub>('svip')
const selectedPlan = ref('three')
const seats = ref(5)

const vipPlans: Plan[] = [
  {
    id: 'three',
    name: '三年会员',
    price: 698,
    original: 2124,
    daily: '0.64',
    tag: '买二送一',
    featured: true,
    years: 3,
  },
  {
    id: 'year',
    name: '一年会员',
    price: 368,
    original: 708,
    daily: '1.01',
    tag: '超值特惠',
    years: 1,
  },
  {
    id: 'half',
    name: '半年会员',
    price: 188,
    original: 354,
    daily: '1.03',
    tag: '买二送一',
    years: 0.5,
  },
  {
    id: 'quarter',
    name: '季度会员',
    price: 128,
    original: 177,
    daily: '1.43',
    tag: '买二送一',
    years: 0.25,
  },
  {
    id: 'month',
    name: '月度',
    price: 49,
    daily: '1.63',
    tag: '买二送一',
    years: 1 / 12,
  },
]

const svipPlans: Plan[] = [
  {
    id: 'three',
    name: '三年SVIP',
    price: 3698,
    original: 5547,
    daily: '0.64',
    tag: '买2年送1年',
    featured: true,
    years: 3,
  },
  {
    id: 'two',
    name: '2年SVIP',
    price: 2698,
    original: 3796,
    daily: '1.01',
    years: 2,
  },
  {
    id: 'year',
    name: '1年SVIP',
    price: 1898,
    daily: '1.03',
    years: 1,
  },
]

const orgVipPlans: Plan[] = [
  {
    id: 'three',
    name: '三年套餐',
    price: 1680,
    unit: '/人',
    daily: '1.53',
    tag: '买二送一',
    featured: true,
    years: 3,
    saved: '420',
  },
  {
    id: 'two',
    name: '两年会员',
    price: 1088,
    unit: '/人',
    daily: '1.49',
    years: 2,
    saved: '308',
  },
  {
    id: 'year',
    name: '一年会员',
    price: 688,
    unit: '/人',
    daily: '1.88',
    years: 1,
    saved: '110',
  },
]

const orgSvipPlans: Plan[] = [
  {
    id: 'three',
    name: '三年套餐',
    price: 2880,
    unit: '/人',
    daily: '2.64',
    tag: '买二送一',
    featured: true,
    years: 3,
    saved: '720',
  },
  {
    id: 'two',
    name: '两年会员',
    price: 1868,
    unit: '/人',
    daily: '3.04',
    years: 2,
    saved: '720',
  },
  {
    id: 'year',
    name: '一年会员',
    price: 1088,
    unit: '/人',
    daily: '4.32',
    years: 1,
    saved: '220',
  },
]

const vipBenefits = [
  { icon: benefitSearch, label: '高级搜索' },
  { icon: benefitDeclare, label: '智能申报' },
  { icon: benefitBatch, label: '批量查询' },
  { icon: benefitMatch, label: '匹配政策' },
  { icon: benefitNurture, label: '培育企业' },
  { icon: benefitRecommend, label: '个性化政策推荐' },
]

const svipBenefits = [
  { icon: svipBenefitSearch, label: '高级搜索' },
  { icon: svipBenefitDeclare, label: '智能申报' },
  { icon: svipBenefitBatch, label: '批量查询' },
  { icon: svipBenefitMatch, label: '匹配政策' },
  { icon: svipBenefitNurture, label: '培育企业' },
  { icon: svipBenefitRecommend, label: '个性化政策推荐' },
]

const benefitBullets = [
  '您将拥有一套企业的资质、知产、研发、政策、人员、资产等数据的标准化管理系统，公开数据数据自动更新，资质证书AI识别一键对应上传',
  '基于您企业的真实数据提供更精准的政策匹配方案，并通过AI为您辅助生成各类重点政策的材料，从此看懂政策申报不再多花冤枉钱；',
  '基于您企业所从事的产品或服务为您提供最新的全国相关科技成果信息，我们联合全国高校和科研院所推动最新技术在您这里落地转化；',
  '基于您企业所从事的产品或服务以及对应产业链位置，为您推荐本地及全国的同行及上下游企业，为您稳定供应链、拓展业务提供帮助；',
]

const orgPerks = [
  {
    icon: perkDiscount,
    title: '更优惠',
    desc: '批量购买优惠，最高可享8折',
  },
  {
    icon: perkConvenient,
    title: '更便捷',
    desc: '采购流程便捷，发票合同统一申请看步骤',
  },
  {
    icon: perkFlexible,
    title: '更灵活',
    desc: '灵活管理成员，解决人员流动问题',
  },
  {
    icon: perkCustom,
    title: '可定制',
    desc: '如有定制需求，点击联系客服',
  },
]

const planGroups: Record<PlanTier, Plan[]> = {
  vip: vipPlans,
  svip: svipPlans,
  'org-vip': orgVipPlans,
  'org-svip': orgSvipPlans,
}

const currentTier = computed<PlanTier>(() =>
  tab.value === 'org' ? `org-${orgSub.value}` : tab.value,
)

const currentPlans = computed(() => planGroups[currentTier.value])

const { currentPlan, selectPlan } = usePlanSelection(currentPlans, selectedPlan)

const payTone = computed<'gold' | 'blue' | 'red'>(() => {
  if (tab.value === 'svip') return 'blue'
  if (tab.value === 'org') return 'red'
  return 'gold'
})

const payableTotal = computed(() => currentPlan.value.price * seats.value)

const packLabel = computed(() => {
  const years = currentPlan.value.years
  const yearText = years >= 1 ? `${years}年` : currentPlan.value.name
  const kind = orgSub.value === 'svip' ? 'SVIP企业套餐' : 'VIP企业套餐'
  return `${kind}${yearText}`
})

const expiryText = computed(() =>
  dayjs()
    .add(Math.round(currentPlan.value.years * 12), 'month')
    .format('YYYY-MM-DD'),
)

const selectTab = (next: BoardTab) => {
  if (tab.value === next) return
  tab.value = next
  selectedPlan.value = 'three'
  if (next === 'org') orgSub.value = 'svip'
}

const selectOrgSub = (next: OrgSub) => {
  orgSub.value = next
  selectedPlan.value = 'three'
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

      <div class="board-body">
        <div class="board-main">
          <div v-if="tab === 'org'" class="org-switch">
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

          <div class="plan-row" :class="`is-${tab}`">
            <button
              v-for="plan in currentPlans"
              :key="plan.id"
              type="button"
              class="plan-card"
              :class="{ selected: selectedPlan === plan.id }"
              :style="
                selectedPlan === plan.id && tab !== 'org'
                  ? {
                      backgroundImage: `url(${
                        tab === 'svip' ? svipPlanHighlight : planHighlight
                      })`,
                    }
                  : undefined
              "
              :aria-pressed="selectedPlan === plan.id"
              @click="selectPlan(plan.id)"
            >
              <span v-if="plan.tag" class="plan-tag">{{ plan.tag }}</span>
              <span class="plan-name">{{ plan.name }}</span>
              <span class="plan-price">
                <em>¥</em>{{ plan.price
                }}<small v-if="plan.unit">{{ plan.unit }}</small>
                <del v-if="plan.original">¥{{ plan.original }}</del>
              </span>
              <span class="plan-daily">每天仅需{{ plan.daily }}元</span>
              <span v-if="plan.saved" class="plan-saved"
                >已减{{ plan.saved }}/人</span
              >
            </button>
          </div>

          <div v-if="tab === 'org'" class="seat-row">
            <p>开通新套餐:{{ packLabel }}（{{ expiryText }}到期）</p>
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
          <p v-else class="scene-note">适用场景：个人日常使用，尊享50+项权益</p>

          <section v-if="tab !== 'org'" class="benefits">
            <h2 v-if="tab === 'vip'">尊享50+项权益</h2>
            <h2 v-else>
              SVIP权益,包含VIP50项权益+<em>「17项」</em> SVIP专属特权
            </h2>
            <ul class="benefit-list">
              <li
                v-for="item in tab === 'vip' ? vipBenefits : svipBenefits"
                :key="item.label"
              >
                <img :src="item.icon" :alt="item.label" />
                <span>{{ item.label }}</span>
              </li>
            </ul>
            <ul class="bullet-list">
              <li v-for="(text, index) in benefitBullets" :key="index">
                {{ text }}
              </li>
            </ul>
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
          variant="enterprise"
          :price="currentPlan.price"
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

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 168px;
  padding: 28px 10px 18px;
  border: 1px solid #ece7df;
  border-radius: 8px;
  background: #fff;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  overflow: hidden;
}

.plan-tag {
  position: absolute;
  top: -1px;
  left: 0;
  padding: 4px 10px;
  border-radius: 8px 0 8px 0;
  background: linear-gradient(334deg, #ff3d29 0%, #fd8c3e 100%);
  color: #fff;
  font-size: 12px;
  z-index: 2;
}

.plan-name {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2a3546;
}

.plan-price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: center;
  color: #1f2a37;
  font-size: 36px;
  font-weight: 700;
  line-height: 1;

  em {
    margin-right: 2px;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }

  small,
  del {
    margin-left: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #b7bec8;
  }

  del {
    text-decoration: line-through;
  }
}

.plan-daily,
.plan-saved {
  margin-top: 10px;
  font-size: 13px;
  color: #8b93a0;
}

.plan-saved {
  margin-top: 6px;
}

.board.is-vip .plan-card.selected {
  .plan-name,
  .plan-price {
    color: #e07a2f;
  }

  .plan-daily {
    width: calc(100% + 20px);
    margin: auto -10px -18px;
    padding: 8px 10px 10px;
    background: linear-gradient(90deg, #ff8a3d 0%, #ff4d3a 100%);
    color: #fff;
  }
}

.board.is-svip {
  .plan-card {
    border-color: #e4ebf7;
  }

  .plan-card.selected {
    .plan-name,
    .plan-price,
    .plan-daily {
      color: #5b6ef5;
    }
  }
}

.board.is-org {
  .plan-card {
    border-color: #dce7f7;
  }

  .plan-card.selected {
    background: #fff;
    border-color: #3d7cff;

    .plan-name,
    .plan-price,
    .plan-daily {
      color: #e24b3a;
    }
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
