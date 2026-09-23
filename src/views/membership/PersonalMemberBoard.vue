<script setup lang="ts">
import { computed, ref } from 'vue'
import vipGem from '@/assets/membership/vip-gem.png'
import qrFrame from '@/assets/membership/qr-frame.png'
import planHighlight from '@/assets/membership/plan-highlight.png'
import svipPlanHighlight from '@/assets/membership/svip-plan-highlight.png'
import benefitSearch from '@/assets/membership/benefit-search.png'
import benefitExport from '@/assets/membership/benefit-export.png'
import benefitBatch from '@/assets/membership/benefit-batch.png'
import benefitMatch from '@/assets/membership/benefit-match.png'
import benefitQuery from '@/assets/membership/benefit-query.png'
import svipData from '@/assets/membership/svip-data.png'
import svipMatch from '@/assets/membership/svip-match.png'
import svipTech from '@/assets/membership/svip-tech.png'
import svipIndustry from '@/assets/membership/svip-industry.png'
import iconCheck from '@/assets/membership/icon-check.png'

defineOptions({ name: 'PersonalMemberBoard' })

type Tier = 'vip' | 'svip'

type Plan = {
  id: string
  tag: string
  featured: boolean
  price: number
  name?: string
  unit?: string
  daily?: string
  capacity?: string
  desc?: string
}

const tier = ref<Tier>('vip')
const selectedPlan = ref('year')

const vipPlans: Plan[] = [
  {
    id: 'month',
    name: '月度',
    price: 398,
    unit: '/人',
    daily: '1.27',
    tag: '适合先试用',
    featured: false,
  },
  {
    id: 'year',
    name: '年度',
    price: 698,
    unit: '/人',
    daily: '0.98',
    tag: '限时8折',
    featured: true,
  },
  {
    id: 'three',
    name: '三年',
    price: 980,
    unit: '/人',
    daily: '0.65',
    tag: '',
    featured: false,
  },
]

const svipPlans: Plan[] = [
  {
    id: 'trial',
    price: 998,
    capacity: '3个企业/年',
    tag: '体验，仅可买一次',
    desc: '适合刚接手第一批客户，先把服务流程跑通',
    featured: false,
  },
  {
    id: 'rec',
    price: 4998,
    capacity: '10个企业/年',
    tag: '推荐',
    desc: '覆盖中小服务机构的常规客户量，单价最优',
    featured: true,
  },
  {
    id: 'org',
    price: 9980,
    capacity: '30个企业/年',
    tag: '',
    desc: '客户量稳定的机构，超出部分可继续增购席位',
    featured: false,
  },
]

const vipBenefits = [
  { icon: benefitSearch, label: '高级搜索' },
  { icon: benefitExport, label: '导出数据' },
  { icon: benefitBatch, label: '批量查询' },
  { icon: benefitMatch, label: '匹配政策' },
  { icon: benefitQuery, label: '查询数据' },
]

const vipBullets = [
  '您管理的每个企业，都拥有一套资质、知产、研发、政策、人员、资产等数据的标准化管理系统，公开数据数据自动更新，资质证书AI识别一键对应上传，客户的文件再也不会找不到了；',
  '基于您管理的每个企业的真实数据提供更精准的政策匹配方案，并通过AI为您辅助生成各类重点政策的材料，政策申报从此如此简单；',
  '基于您管理的每个企业的产品或服务为您提供最新的全国相关科技成果信息，我们联合全国高校和科研院所推动最新技术落地转化；',
  '基于您管理的每个企业的产品或服务以及对应产业链位置，为您推荐本地及全国的同行及上下游企业，为您的客户提供更多供应链信息和拓展业务的服务。',
]

const svipBenefits = [
  {
    icon: svipData,
    title: '数据资产标准化管理',
    desc: '您将拥有一套企业的资质、知产、研发、政策、人员、资产等数据的标准化管理系统，公开数据自动更新，资质证书AI识别一键上传。',
  },
  {
    icon: svipMatch,
    title: '精准政策匹配与AI材料生成',
    desc: '基于企业的真实数据提供更精准的政策匹配方案，并通过AI为您辅助生成各类重点政策的材料，从此看懂政策申报不再多花冤枉钱。',
  },
  {
    icon: svipTech,
    title: '全国科技成果对接',
    desc: '基于您企业所从事的产品或服务，为您提供最新的全国相关科技成果信息，我们联合全国高校和科研院所推动最新技术在您这里落地转化。',
  },
  {
    icon: svipIndustry,
    title: '产业链上下游推荐',
    desc: '基于您企业所从事的产品或服务以及对应产业链位置，为您推荐本地及全国的同行及上下游企业，为您稳定供应链、拓展业务提供帮助。',
  },
]

const currentPlans = computed(() =>
  tier.value === 'vip' ? vipPlans : svipPlans,
)

const currentPlan = computed(
  () =>
    currentPlans.value.find((item) => item.id === selectedPlan.value) ??
    currentPlans.value.find((item) => item.featured) ??
    currentPlans.value[0]!,
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

const selectTier = (next: Tier) => {
  if (tier.value === next) return
  tier.value = next
  selectedPlan.value = next === 'vip' ? 'year' : 'rec'
}

const selectPlan = (id: string) => {
  selectedPlan.value = id
}
</script>

<template>
  <div class="board" :class="`is-${tier}`">
    <div class="tier-bar">
      <button
        type="button"
        class="tier-tab vip"
        :class="{ active: tier === 'vip' }"
        @click="selectTier('vip')"
      >
        <img v-if="tier === 'vip'" :src="vipGem" alt="" />
        <strong>VIP会员</strong>
        <span>数据查询、导出与批量处理</span>
      </button>
      <button
        type="button"
        class="tier-tab svip"
        :class="{ active: tier === 'svip' }"
        @click="selectTier('svip')"
      >
        <svg
          v-if="tier === 'svip'"
          class="crown"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#e2b45a"
            d="M3.2 16.6 5.6 8.2l4.2 4.6L12 5.1l2.2 7.7 4.2-4.6 2.4 8.4H3.2z"
          />
          <path fill="#f0d27a" d="M12 5.1 9.8 12.8 5.6 8.2 3.2 16.6h8.8V5.1z" />
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
        <strong>SVIP会员</strong>
        <span>深度数据+AI申报材料</span>
      </button>
    </div>

    <div class="board-body">
      <div class="board-main">
        <div class="plan-row">
          <button
            v-for="plan in currentPlans"
            :key="plan.id"
            type="button"
            class="plan-card"
            :class="{ selected: selectedPlan === plan.id }"
            :style="
              selectedPlan === plan.id
                ? {
                    backgroundImage: `url(${
                      tier === 'vip' ? planHighlight : svipPlanHighlight
                    })`,
                  }
                : undefined
            "
            :aria-pressed="selectedPlan === plan.id"
            @click="selectPlan(plan.id)"
          >
            <span
              v-if="plan.tag"
              class="plan-tag"
              :class="{ hot: plan.featured }"
            >
              {{ plan.tag }}
            </span>
            <span v-if="plan.name" class="plan-name">{{ plan.name }}</span>
            <span class="plan-price">
              <em>¥</em>{{ plan.price
              }}<small v-if="plan.unit">{{ plan.unit }}</small>
            </span>
            <span v-if="plan.capacity" class="plan-capacity">{{
              plan.capacity
            }}</span>
            <span v-if="plan.daily" class="plan-daily"
              >折合每天¥{{ plan.daily }}</span
            >
            <span v-if="plan.desc" class="plan-desc">{{ plan.desc }}</span>
          </button>
        </div>

        <p class="bind-note">
          企业绑定后本年度不可更换 · 企服SVIP自动享有VIP全部权益 ·
          超出席位可增购
        </p>

        <section v-if="tier === 'vip'" class="benefits">
          <h2>
            尊享VIP基础能力权益
            <small>沿用现有能力，覆盖个人日常的数据查询与批量处理</small>
          </h2>
          <ul class="benefit-list">
            <li v-for="item in vipBenefits" :key="item.label">
              <img :src="item.icon" :alt="item.label" />
              <span>{{ item.label }}</span>
            </li>
          </ul>
          <ul class="bullet-list">
            <li v-for="(text, index) in vipBullets" :key="index">
              {{ text }}
            </li>
          </ul>
        </section>

        <section v-else class="svip-benefits">
          <h2>尊享SVIP专属权益，在VIP之上，多出一整套企业级能力</h2>
          <ul>
            <li v-for="item in svipBenefits" :key="item.title">
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
        <div class="pay-price"><em>¥</em>{{ currentPlan.price }}</div>
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
          <svg
            class="qr-code"
            viewBox="0 0 29 29"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
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
</template>

<style scoped lang="scss">
.board {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(4, 24, 63, 0.28);
}

.tier-bar {
  display: flex;
  align-items: stretch;
  height: 64px;
  background: #fff;
}

.tier-tab {
  position: relative;
  z-index: 0;
  display: inline-flex;
  flex: 1 1 50%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 0 24px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  line-height: 1.2;
  white-space: nowrap;
  outline: none;

  img,
  .crown,
  strong,
  span {
    position: relative;
    z-index: 1;
  }

  img,
  .crown {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .crown {
    filter: drop-shadow(0 1px 1px rgba(176, 120, 40, 0.28));
  }

  strong {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  span {
    font-size: 13px;
    font-weight: 400;
  }
}

.tier-tab.vip {
  span {
    color: #333333;
  }
}

.tier-tab.svip {
  color: #c49a4a;

  span {
    color: #c4a07a;
  }
}

.board.is-vip {
  .tier-tab.svip {
    z-index: 1;
    flex: 0 0 calc(50% + 40px);
    margin-left: -40px;
    padding-left: 64px;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        148deg,
        #fff7f0 0 36px,
        #ffe4d0 58px,
        #ffeadc 100%
      );
      clip-path: polygon(
        0 0,
        100% 0,
        100% 100%,
        40px 100%,
        30px 78%,
        12px 42%,
        2px 14%,
        0 6%
      );
      filter: drop-shadow(-8px 2px 12px rgba(198, 136, 88, 0.16));
    }
  }
}

.board.is-svip {
  .tier-tab.vip {
    z-index: 1;
    flex: 0 0 calc(50% + 40px);
    margin-right: -40px;
    padding-right: 64px;
    color: #3d7cff;

    span {
      color: #7ea6e6;
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        -148deg,
        #eef5ff 0 36px,
        #d4e6ff 58px,
        #c2ddfb 100%
      );
      clip-path: polygon(
        0 0,
        100% 0,
        calc(100% - 0px) 6%,
        calc(100% - 2px) 14%,
        calc(100% - 12px) 42%,
        calc(100% - 30px) 78%,
        calc(100% - 40px) 100%,
        0 100%
      );
      filter: drop-shadow(8px 2px 12px rgba(61, 124, 255, 0.14));
    }
  }
}

.board-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
}

.board-main {
  min-width: 0;
  padding: 22px 28px 28px;
}

.plan-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 168px;
  padding: 28px 16px 16px;
  border: 1px solid #ece7df;
  border-radius: 6px;
  background: #fff;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &.selected {
    transform: translateY(-2px);
  }
}

.plan-tag {
  position: absolute;
  top: -10px;
  left: 0;
  padding: 4px 10px;
  border-radius: 6px;
  background: linear-gradient(334deg, #ff3d29 0%, #fd8c3e 100%);
  color: white;
  font-size: 12px;
  z-index: 2;
}

.plan-name {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 600;
  color: #2a3546;
}

.plan-price {
  display: flex;
  align-items: baseline;
  color: #1f2a37;
  font-size: 46px;
  font-weight: 700;
  line-height: 1;

  em {
    margin-right: 2px;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }

  small {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 400;
    color: #8b95a4;
  }
}

.plan-capacity {
  margin-top: 8px;
  font-size: 14px;
  color: #5b6573;
}

.plan-daily {
  margin-top: 10px;
  font-size: 14px;
  color: #8b93a0;
}

.plan-desc {
  padding-top: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #8b93a0;
  text-align: center;
}

.board.is-vip .plan-card.selected {
  .plan-name,
  .plan-price,
  .plan-daily {
    color: #c48a2e;
  }

  .plan-price small {
    color: #d0a45a;
  }
}

.board.is-svip {
  .plan-card {
    border-color: #e4ebf7;
    min-height: 188px;

    &:hover,
    &.selected {
      box-shadow: 0 10px 24px rgba(61, 124, 255, 0.16);
    }
  }

  .plan-card.selected {
    border-color: #8eb0f0;

    .plan-price,
    .plan-capacity {
      color: #3d7cff;
    }

    .plan-price small {
      color: #6f94e6;
    }

    .plan-desc {
      color: #5b82d6;
    }
  }

  .svip-benefits {
    background: linear-gradient(
      180deg,
      #ebf4ff 0%,
      rgba(235, 244, 255, 0.2) 100%
    );
    border-radius: 6px;
    padding: 15px 21px;
  }

  .svip-benefits h2 {
    color: #3d7cff;
  }
}

.bind-note {
  margin: 29px 0 15px;
  font-size: 13px;
  color: #8b93a0;
}

.benefits h2,
.svip-benefits h2 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 700;
  color: #1f2a37;

  small {
    font-size: 13px;
    font-weight: 400;
    color: #8b93a0;
  }
}

.benefit-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 22px;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #3c4656;
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
  font-size: 14px;
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

.svip-benefits ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 28px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  img {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    object-fit: contain;
    margin-top: 2px;
  }

  strong {
    display: block;
    margin-bottom: 6px;
    font-size: 16px;
    color: #2a3546;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.7;
    color: #333333;
  }
}

.pay-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 24px;
  border-left: 1px solid #f3e4d0;
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
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
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
  font-size: 14px;
  line-height: 1.7;
}

@include below-lg {
  .tier-bar {
    flex-direction: column;
    min-height: 0;
  }

  .tier-bar {
    flex-direction: column;
    height: auto;
  }

  .board.is-vip .tier-tab.svip,
  .board.is-svip .tier-tab.vip,
  .tier-tab.vip,
  .tier-tab.svip {
    flex: none;
    width: 100%;
    margin: 0;
    padding: 14px 20px;
    clip-path: none;
    filter: none;

    &::before {
      display: none;
    }
  }

  .board-body {
    grid-template-columns: 1fr;
  }

  .plan-row,
  .benefit-list,
  .svip-benefits ul {
    grid-template-columns: 1fr;
  }

  .pay-panel {
    border-left: 0;
    border-top: 1px solid #f3e4d0;
  }
}
</style>
