<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import vipGem from '@/assets/membership/vip-gem.png'
import iconCheck from '@/assets/membership/icon-check.png'
import planHighlight from '@/assets/membership/enterprise/plan-highlight.png'
import svipPlanHighlight from '@/assets/membership/enterprise/svip-plan-highlight.png'
import qrFrame from '@/assets/membership/enterprise/qr-frame.png'
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
import markNone from '@/assets/membership/enterprise/mark-none.png'
import markVip from '@/assets/membership/enterprise/mark-vip.png'
import markSvip from '@/assets/membership/enterprise/mark-svip.png'
import sectionApp from '@/assets/membership/enterprise/section-app.png'

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

type CompareMark = 'none' | 'vip' | 'svip'
type CompareCell = { icon?: string; note?: string }
type CompareRow =
  | { kind: 'section'; label: string; img?: string; icon?: string }
  | {
      kind: 'feature'
      label: string
      normal: CompareCell
      vip: CompareCell
      svip: CompareCell
    }

// 单元格内容：会员标记图、文字说明，或留空
type CellSpec = CompareMark | 'declare' | 'limit' | 'empty'

const declareNote = '1次/年(可单独购买)'
const limitNote = '前五条'

const glyphNews =
  'M6 2.5h7.6l4.8 4.8v12.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2zM8 9.5h8v1.6H8zM8 12.9h8v1.6H8zM8 16.3h5v1.6H8z'
const glyphPolicyDb =
  'M4.8 5a7.2 2.5 0 1 0 14.4 0a7.2 2.5 0 1 0-14.4 0zM4.8 7.6v4.4a7.2 2.5 0 0 0 14.4 0V7.6zM4.8 13.6v4.4a7.2 2.5 0 0 0 14.4 0v-4.4z'
const glyphEntDb =
  'M5.5 21V6.5L12 3l6.5 3.5V21H21v1.7H3V21zM7.5 8.5h2v2h-2zM14.5 8.5h2v2h-2zM7.5 12.5h2v2h-2zM14.5 12.5h2v2h-2zM7.5 16.5h2v2h-2zM14.5 16.5h2v2h-2z'
const glyphFileLib =
  'M3 8V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2H3zM3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z'
const glyphExtData =
  'M4 20.5h16v1.8H4zM6.5 20.5V11.5h3.2v9zM10.9 20.5V7h3.2v13.5zM15.3 20.5v-6.1h3.2v6.1z'

const markImages: Record<CompareMark, string> = {
  none: markNone,
  vip: markVip,
  svip: markSvip,
}

const compareCell = (spec: CellSpec): CompareCell => {
  if (spec === 'declare') return { note: declareNote }
  if (spec === 'limit') return { note: limitNote }
  if (spec === 'empty') return {}
  return { icon: markImages[spec] }
}

// 普通会员列固定为灰色不可用，VIP/SVIP 列默认可用，例外情况显式传入
const feature = (
  label: string,
  vip: CellSpec = 'vip',
  svip: CellSpec = 'svip',
): CompareRow => ({
  kind: 'feature',
  label,
  normal: { icon: markImages.none },
  vip: compareCell(vip),
  svip: compareCell(svip),
})

const cellKeys = ['normal', 'vip', 'svip'] as const

const compareRows: CompareRow[] = [
  { kind: 'feature', label: '多账号统一管理', normal: {}, vip: {}, svip: {} },
  { kind: 'section', label: '功能应用', img: sectionApp },
  feature('高级搜索', 'none'),
  feature('数据导出'),
  feature('批量查询'),
  feature('智能申报', 'declare', 'declare'),
  feature('政策汇编'),
  feature('城市对比'),
  feature('政策对比'),
  feature('数据大屏'),
  feature('管理系统(标准版)'),
  feature('匹配政策(企业找政策)'),
  feature('匹配企业(政策找企业)'),
  feature('政策大脑文库上传'),
  feature('政策大脑文库下载'),

  { kind: 'section', label: '政策资讯', icon: glyphNews },
  feature('正文查看'),
  feature('政府原文跳转'),
  feature('政策数据库跳转'),

  { kind: 'section', label: '政策数据库', icon: glyphPolicyDb },
  feature('政策搜索', 'none'),
  feature('政策筛选'),
  feature('关注政策'),
  feature('支持领域'),
  feature('依据文件'),
  feature('依据文件跳转'),
  feature('申报条件'),
  feature('申报入口或材料'),
  feature('最新动态', 'limit'),
  feature('最新动态跳转'),
  feature('支持力度', 'limit'),
  feature('支持力度跳转'),
  feature('公示名单', 'limit'),
  feature('公示名单跳转业务线索'),
  feature('业务线索跳转'),

  { kind: 'section', label: '企业数据库', icon: glyphEntDb },
  feature('企业检索', 'none'),
  feature('企业筛选'),
  feature('企业导出'),
  feature('关注企业'),
  feature('企业获得政策'),
  feature('企业获得政策跳转'),
  feature('企业获得政策筛选'),
  feature('工商信息'),
  feature('股东信息'),
  feature('联系方式'),
  feature('知识产权'),
  feature('资质证书'),
  feature('招投标'),
  feature('经营异常'),
  feature('信息变动'),

  { kind: 'section', label: '政策文件库', icon: glyphFileLib },
  feature('政策文件搜索'),
  feature('政策文件筛选'),
  feature('政策文件原文(截图)'),
  feature('政策文件跳转'),

  { kind: 'section', label: '延伸数据', icon: glyphExtData },
  feature('专利成果'),
  feature('研发平台'),
  feature('研发项目'),
  feature('创业载体'),
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

const currentPlan = computed(
  () =>
    currentPlans.value.find((item) => item.id === selectedPlan.value) ??
    currentPlans.value.find((item) => item.featured) ??
    currentPlans.value[0]!,
)

const useBlueHighlight = computed(
  () =>
    tab.value === 'svip' || (tab.value === 'org' && orgSub.value === 'svip'),
)

const payPrice = computed(() => currentPlan.value.price)

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

const qrCells = (() => {
  const size = 29
  const cells: Array<[number, number]> = []
  const set = (x: number, y: number) => cells.push([x, y])
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
        if (edge || core) set(ox + x, oy + y)
      }
    }
  }
  finder(0, 0)
  finder(size - 7, 0)
  finder(0, size - 7)
  for (let i = 8; i < size - 8; i += 1) {
    if (i % 2 === 0) {
      set(i, 6)
      set(6, i)
    }
  }
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x < 9 && y < 9) || (x >= size - 9 && y < 9) || (x < 9 && y >= size - 9)
      if (inFinder) continue
      const n = (x * 17 + y * 13 + x * y) % 7
      if (n === 0 || n === 3) set(x, y)
    }
  }
  return cells
})()

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

const selectPlan = (id: string) => {
  selectedPlan.value = id
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
          <svg
            v-if="tab === 'svip'"
            class="crown"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#e2b45a"
              d="M3.2 16.6 5.6 8.2l4.2 4.6L12 5.1l2.2 7.7 4.2-4.6 2.4 8.4H3.2z"
            />
            <path
              fill="#f0d27a"
              d="M12 5.1 9.8 12.8 5.6 8.2 3.2 16.6h8.8V5.1z"
            />
            <rect
              x="4.2"
              y="16.4"
              width="15.6"
              height="2.2"
              rx="0.6"
              fill="#d4a24c"
            />
            <rect
              x="5"
              y="18.8"
              width="14"
              height="2.1"
              rx="0.5"
              fill="#c4923e"
            />
            <circle cx="12" cy="5.1" r="1.15" fill="#f6e7a8" />
            <circle cx="5.6" cy="8.2" r="1.05" fill="#f6e7a8" />
            <circle cx="18.4" cy="8.2" r="1.05" fill="#f6e7a8" />
          </svg>
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
              <svg class="crown" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3.2 16.6 5.6 8.2l4.2 4.6L12 5.1l2.2 7.7 4.2-4.6 2.4 8.4H3.2z"
                />
              </svg>
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
                        useBlueHighlight ? svipPlanHighlight : planHighlight
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

        <aside class="pay-panel">
          <div class="pay-price"><em>¥</em>{{ payPrice }}</div>
          <p class="pay-scan">
            <svg class="pay-brand" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#09bb07" />
              <path
                fill="#fff"
                d="M9.2 11.1c-.5 0-.9-.4-.9-.8s.4-.8.9-.8.9.4.9.8-.4.8-.9.8zm5.6 0c-.5 0-.9-.4-.9-.8s.4-.8.9-.8.9.4.9.8-.4.8-.9.8zM12 6.2c-3.6 0-6.5 2.4-6.5 5.3 0 1.7.9 3.2 2.3 4.2l-.6 1.8 2-.9c.8.2 1.6.4 2.8.4 3.6 0 6.5-2.4 6.5-5.3S15.6 6.2 12 6.2z"
              />
            </svg>
            <svg class="pay-brand" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#1677ff" />
              <path
                fill="#fff"
                d="M17.4 14.2c-.9.8-2.3 1.4-3.8 1.6l-1.6-3.8c.7-.2 1.3-.6 1.8-1.1.7.6 1.4 1.4 1.9 2.3.6-.4 1.1-.8 1.7-1.1-.4-.7-1-1.5-1.7-2.2 1.1-.9 1.8-2.1 2-3.4H9.4v1.1h3.3c-.1.7-.4 1.4-.9 2H9.4v1.1h2.1c-.6.6-1.4 1-2.3 1.2v1.2c1.5-.2 2.8-.8 3.7-1.6l1.3 3.2c-.2 0-.4.1-.6.1H9.4v1.2h8z"
              />
            </svg>
            扫码支付
          </p>
          <div class="qr-box" :style="{ backgroundImage: `url(${qrFrame})` }">
            <svg class="qr-code" viewBox="0 0 29 29" aria-hidden="true">
              <rect width="29" height="29" fill="#fff" />
              <g fill="#1a1a1a">
                <rect
                  v-for="cell in qrCells"
                  :key="`${cell[0]}-${cell[1]}`"
                  :x="cell[0]"
                  :y="cell[1]"
                  width="1"
                  height="1"
                />
              </g>
            </svg>
          </div>
          <p class="pay-safe">
            <img :src="iconCheck" alt="" />
            放心购
          </p>
          <ol class="pay-tips">
            <li>开通前请阅读《政策大脑会员服务协议》和购买须知</li>
            <li>完成支付后可在个人中心-我的发票中申请发票</li>
            <li>会员自支付完成之时起5分钟内生效</li>
          </ol>
        </aside>
      </div>
    </div>

    <section v-if="tab !== 'org'" class="compare">
      <h2>会员权益明细对比</h2>
      <div class="compare-table">
        <div class="compare-head">
          <div class="col-label">
            <strong>权益对比</strong>
            <small>升级会员，立领多项特权</small>
          </div>
          <div class="col-normal">
            <strong>普通会员</strong>
            <small>登录即可畅享服务</small>
          </div>
          <div class="col-vip">
            <strong>VIP会员</strong>
            <span class="compare-pill gold">尊享50+项权益</span>
          </div>
          <div class="col-svip">
            <strong>SVIP会员</strong>
            <span class="compare-pill blue">尊享额外价格优惠</span>
          </div>
        </div>
        <div
          v-for="(row, index) in compareRows"
          :key="row.kind === 'section' ? row.label : `${row.label}-${index}`"
          class="compare-row"
          :class="row.kind"
        >
          <template v-if="row.kind === 'section'">
            <div class="compare-section">
              <img v-if="row.img" :src="row.img" alt="" />
              <svg
                v-else
                class="section-glyph"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path :d="row.icon" fill="currentColor" fill-rule="evenodd" />
              </svg>
              {{ row.label }}
            </div>
            <div class="col-normal" />
            <div class="col-vip" />
            <div class="col-svip" />
          </template>
          <template v-else>
            <div class="col-label">{{ row.label }}</div>
            <div v-for="key in cellKeys" :key="key" :class="`col-${key}`">
              <img v-if="row[key].icon" :src="row[key].icon" alt="" />
              <span v-if="row[key].note" class="cell-note">{{
                row[key].note
              }}</span>
            </div>
          </template>
        </div>
      </div>
    </section>
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

.pay-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 18px 24px;
  border-left: 1px solid #f3e4d0;
}

.board.is-svip .pay-panel,
.board.is-org .pay-panel {
  border-left-color: #e4ebf7;
}

.pay-price {
  color: #d08a2a;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.1;

  em {
    margin-right: 2px;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
  }
}

.board.is-svip .pay-price {
  color: #5b6ef5;
}

.board.is-org .pay-price {
  color: #e24b3a;
}

.pay-scan {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 12px;
  font-size: 13px;
  color: #8a7a66;
}

.pay-brand {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.qr-box {
  width: 168px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 18px 22px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.qr-code {
  width: 100%;
  height: 100%;
}

.pay-safe {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 16px;
  font-size: 13px;
  color: #7a8aa0;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
}

.pay-tips {
  width: 100%;
  margin: 0;
  padding-left: 16px;
  color: #9e9e9e;
  font-size: 13px;
  line-height: 1.7;
}

.compare {
  margin-top: 24px;
  padding: 36px 28px 28px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(4, 24, 63, 0.16);

  h2 {
    margin: 0 0 28px;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #1f2a37;
  }
}

.compare-table {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr 1fr;
}

.compare-head,
.compare-row {
  display: contents;
}

.compare-head > div,
.compare-row > div {
  min-height: 48px;
  padding: 10px 16px;
  border-top: 1px solid #eef1f6;
  border-left: 1px solid #eef1f6;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  color: #3c4656;
  background: #fff;
}

.compare-head > div:first-child,
.compare-row > div:first-child,
.compare-section {
  border-left: 0;
  justify-content: flex-start;
  text-align: left;
}

.compare-head > div {
  min-height: 96px;
  border-top: 0;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  strong {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }

  small {
    font-size: 12px;
    color: #9aa3af;
  }
}

.compare-head .col-label {
  align-items: flex-start;
  background: #fafdff;
  border-radius: 16px 16px 0 0;

  strong {
    color: #1f2a37;
  }
}

.compare-head .col-normal {
  background: #fafdff;
  border-radius: 16px 16px 0 0;
}

.compare-head .col-vip {
  position: relative;
  color: #d08a2a;
  background: radial-gradient(
    ellipse 90% 80% at 50% 0%,
    #ffd9a0 0%,
    #fff3de 42%,
    #fff 78%
  );
  border-radius: 16px 16px 0 0;
  border-left-color: #f6e6c8;

  strong {
    color: #e0a03a;
  }
}

.compare-head .col-svip {
  color: #3d7cff;
  background: linear-gradient(180deg, #eef5ff 0%, #fff 72%);
  border-radius: 16px 16px 0 0;

  strong {
    color: #3d7cff;
  }
}

.compare-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 2px 12px;
  border-radius: 11px;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;

  &.gold {
    background: linear-gradient(
      90deg,
      rgba(237, 121, 1, 0) 0.68%,
      rgba(237, 121, 1, 0.33) 52.86%,
      rgba(237, 121, 1, 0) 100%
    );
    color: #333333;
  }

  &.blue {
    background: linear-gradient(
      270deg,
      rgba(14, 93, 216, 0) 0%,
      rgba(14, 93, 216, 0.36) 53.48%,
      rgba(14, 93, 216, 0) 100%
    );
    color: #333333;
  }
}

.compare-row > .col-label {
  color: #2a3546;
}

.compare-row.section > div {
  background: #fff;
  border-top-color: #eef1f6;
}

.compare-row > .compare-section {
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #8c4c0b;

  img,
  .section-glyph {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    object-fit: contain;
  }
}

.compare-row img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.cell-note {
  font-size: 13px;
  color: #8b93a0;
}

.compare-row > .col-vip .cell-note {
  color: #c49a4a;
}

.compare-row > .col-svip .cell-note {
  color: #7a8aa0;
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

  .pay-panel {
    border-left: 0;
    border-top: 1px solid #f3e4d0;
  }

  .compare {
    overflow-x: auto;
  }

  .compare-table {
    min-width: 760px;
  }
}
</style>
