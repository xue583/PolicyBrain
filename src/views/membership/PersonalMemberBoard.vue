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
import {
  benefitsForPersonalTab,
  type MembershipBenefitCard,
} from './membershipBenefits'
import { personalPlansForTab, type MembershipPlanCard } from './membershipPlans'
import { usePlanSelection } from './usePlanSelection'

defineOptions({ name: 'PersonalMemberBoard' })

const props = withDefaults(
  defineProps<{
    plans?: MembershipPlanCard[]
    benefits?: MembershipBenefitCard[]
    emptyText?: string
    benefitEmptyText?: string
  }>(),
  {
    plans: () => [],
    benefits: () => [],
    emptyText: '暂无在售套餐',
    benefitEmptyText: '暂无会员权益',
  },
)

type Tier = 'vip' | 'svip'

const tier = ref<Tier>('vip')
const selectedPlan = ref('')

const vipIcons = [
  benefitSearch,
  benefitExport,
  benefitBatch,
  benefitMatch,
  benefitQuery,
]
const svipIcons = [svipData, svipMatch, svipTech, svipIndustry]

const benefitIcon = (name: string, index: number) => {
  if (/导出/.test(name)) return benefitExport
  if (/批量/.test(name)) return benefitBatch
  if (/匹配/.test(name)) return benefitMatch
  if (/科技|成果/.test(name)) return svipTech
  if (/产业|上下游/.test(name)) return svipIndustry
  if (/申报|材料/.test(name)) return svipMatch
  if (/数据/.test(name)) return svipData
  if (/查询|搜索/.test(name)) return benefitSearch
  const pool = tier.value === 'svip' ? svipIcons : vipIcons
  return pool[index % pool.length] ?? benefitSearch
}

const currentPlans = computed(() =>
  personalPlansForTab(props.plans, tier.value),
)

const currentBenefits = computed(() =>
  benefitsForPersonalTab(props.benefits, tier.value),
)

const benefitNotes = computed(() =>
  currentBenefits.value.filter((item) => item.description),
)

const { currentPlan, selectPlan } = usePlanSelection(currentPlans, selectedPlan)

const selectTier = (next: Tier) => {
  if (tier.value === next) return
  tier.value = next
  selectedPlan.value = ''
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

    <div class="board-body" :class="{ 'is-single': !currentPlan }">
      <div class="board-main">
        <p v-if="!currentPlans.length" class="bind-note">{{ emptyText }}</p>
        <div v-else class="plan-row">
          <button
            v-for="plan in currentPlans"
            :key="plan.id"
            type="button"
            class="plan-card"
            :class="{ selected: currentPlan?.id === plan.id }"
            :style="
              currentPlan?.id === plan.id
                ? {
                    backgroundImage: `url(${
                      tier === 'vip' ? planHighlight : svipPlanHighlight
                    })`,
                  }
                : undefined
            "
            :aria-pressed="currentPlan?.id === plan.id"
            @click="selectPlan(plan.id)"
          >
            <span
              v-if="plan.tag"
              class="plan-tag"
              :class="{ hot: plan.featured }"
            >
              {{ plan.tag }}
            </span>
            <span class="plan-name">{{ plan.name }}</span>
            <span class="plan-price">
              <em>¥</em>{{ plan.price }}
              <del v-if="plan.original">¥{{ plan.original }}</del>
            </span>
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
          <p v-if="!currentBenefits.length" class="bind-note">
            {{ benefitEmptyText }}
          </p>
          <template v-else>
            <ul class="benefit-list">
              <li v-for="(item, index) in currentBenefits" :key="item.id">
                <img :src="benefitIcon(item.name, index)" :alt="item.name" />
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

        <section v-else class="svip-benefits">
          <h2>尊享SVIP专属权益，在VIP之上，多出一整套企业级能力</h2>
          <p v-if="!currentBenefits.length" class="bind-note">
            {{ benefitEmptyText }}
          </p>
          <ul v-else>
            <li v-for="(item, index) in currentBenefits" :key="item.id">
              <img :src="benefitIcon(item.name, index)" alt="" />
              <div>
                <strong>{{ item.name }}</strong>
                <p v-if="item.description">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <MemberPayPanel
        v-if="currentPlan"
        :price="currentPlan.price"
        :plan-code="currentPlan.id"
        :qr-frame="qrFrame"
      />
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

  &.is-single {
    grid-template-columns: minmax(0, 1fr);
  }
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

  small,
  del {
    margin-left: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #8b95a4;
  }

  del {
    text-decoration: line-through;
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
