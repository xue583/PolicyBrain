<script setup lang="ts">
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

/** 伪二维码格子（视觉占位，非真实码） */
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
</script>

<template>
  <aside class="pay-panel" :class="[`is-${variant}`, `tone-${tone}`]">
    <div class="pay-price"><em>¥</em>{{ price }}</div>
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
