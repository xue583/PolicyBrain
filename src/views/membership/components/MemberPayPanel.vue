<script setup lang="ts">
import { computed, ref } from 'vue'
import iconCheck from '@/assets/membership/icon-check.png'

defineOptions({ name: 'MemberPayPanel' })

withDefaults(
  defineProps<{
    price: number
    qrFrame: string
    /** 个人版 / 企业版（二维码区域更高、提示字号更小） */
    variant?: 'personal' | 'enterprise'
    /** 支付价格主题色：金=VIP、蓝=SVIP、红=企业套餐 */
    tone?: 'gold' | 'blue' | 'red'
  }>(),
  { variant: 'personal', tone: 'gold' },
)

type PayChannel = 'alipay' | 'wechatpay'

const channel = ref<PayChannel>('alipay')

const payMethods: Array<{ id: PayChannel; label: string; icon: string }> = [
  { id: 'alipay', label: '支付宝支付', icon: 'icon-zhifubao' },
  { id: 'wechatpay', label: '微信支付', icon: 'icon-weixin' },
]

/** 伪二维码格子（视觉占位，非真实码；随支付方式换一套图案） */
function buildQrCells(seed: number) {
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
      const n = (x * 17 + y * 13 + x * y + seed) % 7
      if (n === 0 || n === 3) set(x, y)
    }
  }
  return cells
}

const qrCells = computed(() => buildQrCells(channel.value === 'alipay' ? 2 : 5))

function selectChannel(next: PayChannel) {
  channel.value = next
}
</script>

<template>
  <aside class="pay-panel" :class="[`is-${variant}`, `tone-${tone}`]">
    <div class="pay-price"><em>¥</em>{{ price }}</div>
    <div class="pay-switch" role="tablist" aria-label="支付方式">
      <button
        v-for="item in payMethods"
        :key="item.id"
        type="button"
        role="tab"
        class="pay-switch-btn"
        :class="[`is-${item.id}`, { 'is-active': channel === item.id }]"
        :aria-selected="channel === item.id"
        @click="selectChannel(item.id)"
      >
        <IconFont class="pay-brand" :name="item.icon" :size="16" />
        {{ item.label }}
      </button>
    </div>
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
</template>

<style scoped lang="scss">
.pay-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 24px;
  border-left: 1px solid #f3e4d0;

  &.is-enterprise {
    padding: 20px 18px 24px;
  }

  &.tone-blue,
  &.tone-red {
    border-left-color: #e4ebf7;
  }
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

.tone-blue .pay-price {
  color: #5b6ef5;
}

.tone-red .pay-price {
  color: #e24b3a;
}

.pay-switch {
  display: flex;
  width: 100%;
  margin: 12px 0;
  padding: 3px;
  border-radius: 8px;
  background: #f6f1ea;
  gap: 2px;
}

.tone-blue .pay-switch,
.tone-red .pay-switch {
  background: #f3f6fb;
}

.pay-switch-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  height: 32px;
  padding: 0 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #8a7a66;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;

  &.is-active {
    background: #fff;
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(29, 43, 58, 0.08);
  }

  &.is-alipay.is-active {
    color: #1677ff;
  }

  &.is-wechatpay.is-active {
    color: #07a83a;
  }
}

.pay-brand {
  flex-shrink: 0;
  font-weight: 400;
  line-height: 1;
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

.is-enterprise .qr-box {
  height: 200px;
  padding: 28px 18px 22px;
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

.is-enterprise .pay-tips {
  font-size: 13px;
}

@include below-lg {
  .pay-panel {
    border-left: 0;
    border-top: 1px solid #f3e4d0;
  }
}
</style>
