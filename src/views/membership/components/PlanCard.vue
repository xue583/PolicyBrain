<script setup lang="ts">
import type { BenefitTone } from '../benefitIcons'
import type { MembershipPlanCard } from '../membershipPlans'

defineOptions({ name: 'PlanCard' })

withDefaults(
  defineProps<{
    plan: MembershipPlanCard
    selected: boolean
    /** 三处卡片的尺寸和选中色不同，样式按这个区分 */
    surface: 'personal' | 'enterprise' | 'renew'
    tone: BenefitTone
    highlight?: string
    priceSuffix?: string
    showOriginal?: boolean
    dailyText?: string
    savedText?: string
    desc?: string
    hotTag?: boolean
  }>(),
  {
    highlight: '',
    priceSuffix: '',
    showOriginal: false,
    dailyText: '',
    savedText: '',
    desc: '',
    hotTag: false,
  },
)

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="plan-card"
    :class="[`is-${surface}`, `is-${tone}`, { selected }]"
    :style="highlight ? { backgroundImage: `url(${highlight})` } : undefined"
    :aria-pressed="selected"
    @click="emit('select')"
  >
    <span v-if="plan.tag" class="plan-tag" :class="{ hot: hotTag }">
      {{ plan.tag }}
    </span>
    <span class="plan-name">{{ plan.name }}</span>
    <span class="plan-price">
      <em>¥</em>{{ plan.price
      }}<small v-if="priceSuffix">{{ priceSuffix }}</small>
      <del v-if="showOriginal && plan.original">¥{{ plan.original }}</del>
    </span>
    <span v-if="dailyText" class="plan-daily">{{ dailyText }}</span>
    <span v-if="savedText" class="plan-saved">{{ savedText }}</span>
    <span v-if="desc" class="plan-desc">{{ desc }}</span>
  </button>
</template>

<style scoped lang="scss">
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ece7df;
  background: #fff;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}

.plan-tag {
  position: absolute;
  left: 0;
  z-index: 2;
  background: linear-gradient(334deg, #ff3d29 0%, #fd8c3e 100%);
  color: #fff;
  font-size: 12px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  justify-content: center;
  font-weight: 700;
  line-height: 1;

  em {
    margin-right: 2px;
    font-style: normal;
    font-weight: 600;
  }

  small,
  del {
    margin-left: 4px;
    font-size: 12px;
    font-weight: 400;
  }

  del {
    text-decoration: line-through;
  }
}

.plan-card.is-personal {
  min-height: 168px;
  padding: 28px 16px 16px;
  border-radius: 6px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &.selected {
    transform: translateY(-2px);
  }

  .plan-tag {
    top: -10px;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .plan-name {
    margin-bottom: 8px;
    color: #2a3546;
    font-size: 22px;
    font-weight: 600;
  }

  .plan-price {
    color: #1f2a37;
    font-size: 46px;

    em {
      font-size: 16px;
    }

    small,
    del {
      color: #8b95a4;
    }
  }

  .plan-daily {
    margin-top: 10px;
    color: #8b93a0;
    font-size: 14px;
  }

  .plan-desc {
    padding-top: 12px;
    color: #8b93a0;
    font-size: 12px;
    line-height: 1.6;
    text-align: center;
  }

  &.is-vip.selected {
    .plan-name,
    .plan-price,
    .plan-daily {
      color: #c48a2e;
    }

    .plan-price small {
      color: #d0a45a;
    }
  }

  &.is-svip {
    min-height: 188px;
    border-color: #e4ebf7;

    &:hover,
    &.selected {
      box-shadow: 0 10px 24px rgba(61, 124, 255, 0.16);
    }
  }

  &.is-svip.selected {
    border-color: #8eb0f0;

    .plan-price {
      color: #3d7cff;
    }

    .plan-price small {
      color: #6f94e6;
    }

    .plan-desc {
      color: #5b82d6;
    }
  }
}

.plan-card.is-enterprise {
  min-height: 168px;
  padding: 28px 10px 18px;
  overflow: hidden;
  border-radius: 8px;

  .plan-tag {
    top: -1px;
    padding: 4px 10px;
    border-radius: 8px 0 8px 0;
  }

  .plan-name {
    margin-bottom: 8px;
    color: #2a3546;
    font-size: 18px;
    font-weight: 600;
  }

  .plan-price {
    color: #1f2a37;
    font-size: 36px;

    em {
      font-size: 16px;
    }

    small,
    del {
      color: #b7bec8;
    }
  }

  .plan-daily,
  .plan-saved {
    margin-top: 10px;
    color: #8b93a0;
    font-size: 13px;
  }

  .plan-saved {
    margin-top: 6px;
  }

  &.is-vip.selected {
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

  &.is-svip {
    border-color: #e4ebf7;
  }

  &.is-svip.selected {
    .plan-name,
    .plan-price,
    .plan-daily {
      color: #5b6ef5;
    }
  }

  &.is-org {
    overflow: visible;
    border-color: #f0f0f2;

    .plan-tag {
      top: -10px;
      padding: 2px 10px;
      border-radius: 4px;
      line-height: 1.5;
    }

    .plan-name {
      margin-bottom: 26px;
      color: #73534d;
    }

    .plan-price {
      color: #333;

      small {
        color: #b5b5b5;
      }
    }

    .plan-daily {
      color: #c9c9cc;
    }

    .plan-saved {
      width: calc(100% + 20px);
      margin: auto -10px -18px;
      padding: 8px 10px 10px;
      border-radius: 0 0 7px 7px;
      background: #f5f6fa;
      color: #9b9b9e;
      font-size: 13px;
      text-align: center;
    }
  }

  &.is-org.selected {
    border-color: #c2dcfc;
    background: #fafcff;

    .plan-name {
      color: #2f6bcd;
    }

    .plan-price {
      color: #ff3b4d;
    }

    .plan-daily {
      color: #c8cacc;
    }

    .plan-saved {
      background: #ddecff;
      color: #326dcf;
    }
  }
}

.plan-card.is-renew {
  min-height: 148px;
  padding: 26px 10px 14px;
  border-radius: 6px;
  transition: transform 0.2s ease;

  &:hover,
  &.selected {
    transform: translateY(-2px);
  }

  .plan-tag {
    top: 0;
    padding: 3px 8px;
    border-radius: 6px 0 6px 0;
    line-height: 1.4;
  }

  .plan-name {
    margin-bottom: 6px;
    color: #2a3546;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
  }

  .plan-price {
    color: #1f2a37;
    font-size: 28px;

    em {
      font-size: 14px;
    }

    del {
      color: #8b95a4;
    }
  }

  .plan-daily,
  .plan-desc {
    margin-top: 8px;
    color: #8b93a0;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }

  &.is-vip.selected {
    .plan-name,
    .plan-price,
    .plan-daily {
      color: #c48a2e;
    }
  }

  &.is-svip {
    border-color: #e4ebf7;
  }

  &.is-svip.selected {
    border-color: #8eb0f0;

    .plan-name,
    .plan-price,
    .plan-daily {
      color: #3d7cff;
    }
  }
}
</style>
