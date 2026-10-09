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
import MemberCrownIcon from './components/MemberCrownIcon.vue'
import MemberPayPanel from './components/MemberPayPanel.vue'
import { usePlanSelection } from './usePlanSelection'

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

const { currentPlan, selectPlan } = usePlanSelection(currentPlans, selectedPlan)

const selectTier = (next: Tier) => {
  if (tier.value === next) return
  tier.value = next
  selectedPlan.value = next === 'vip' ? 'year' : 'rec'
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
        <MemberCrownIcon v-if="tier === 'svip'" />
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

      <MemberPayPanel :price="currentPlan.price" :qr-frame="qrFrame" />
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
}
</style>
