<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  createMembershipOrder,
  createMembershipPayment,
  fetchMembershipOrder,
  type MembershipPayChannel,
} from '@/api/membership'
import iconCheck from '@/assets/membership/icon-check.png'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import {
  isIntentExpired,
  isMembershipActivated,
  readMembershipPaymentOutcome,
  submitAlipayCheckout,
} from '../membershipPayment'

defineOptions({ name: 'MemberPayPanel' })

const props = withDefaults(
  defineProps<{
    price: number
    /** 在售档位编码，创建支付意向时提交 */
    planCode: string
    qrFrame: string
    /** 个人版 / 企业版（二维码区域更高、提示字号更小） */
    variant?: 'personal' | 'enterprise'
    /** 支付价格主题色：金=VIP、蓝=SVIP、红=企业套餐 */
    tone?: 'gold' | 'blue' | 'red'
  }>(),
  { variant: 'personal', tone: 'gold' },
)

type PayChannel = 'alipay' | 'wechatpay'
type PayPhase =
  'idle' | 'submitting' | 'waiting' | 'success' | 'closed' | 'expired'

const POLL_INTERVAL_MS = 2000

const auth = useAuthStore()
const channel = ref<PayChannel>('alipay')
const phase = ref<PayPhase>('idle')

const payMethods: Array<{ id: PayChannel; label: string; icon: string }> = [
  { id: 'alipay', label: '支付宝支付', icon: 'icon-zhifubao' },
  { id: 'wechatpay', label: '微信支付', icon: 'icon-weixin' },
]

let pollGeneration = 0
let pollTimer = 0
let checkoutWindow: Window | null = null

const isFree = computed(() => props.price <= 0)

const actionLabel = computed(() => {
  if (phase.value === 'submitting') return '正在跳转'
  if (phase.value === 'success') return '支付成功'
  if (
    phase.value === 'waiting' ||
    phase.value === 'closed' ||
    phase.value === 'expired'
  ) {
    return '重新支付'
  }
  return isFree.value ? '立即开通' : '去支付'
})

const actionHint = computed(() => {
  if (phase.value === 'submitting') return '正在创建订单'
  if (phase.value === 'waiting') return '请在支付宝完成支付'
  if (phase.value === 'success') return '会员即将生效'
  if (phase.value === 'closed') return '订单已关闭，请重新支付'
  if (phase.value === 'expired') return '支付已超时，请重新下单'
  return isFree.value ? '当前套餐免费开通' : '跳转支付宝收银台'
})

/** 伪二维码格子（微信支付视觉占位，非真实码） */
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

const qrCells = computed(() => buildQrCells(5))

const stopPolling = () => {
  pollGeneration += 1
  window.clearTimeout(pollTimer)
  pollTimer = 0
}

const closeCheckoutWindow = () => {
  if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close()
  checkoutWindow = null
}

const resetCheckout = () => {
  const closeWindow = phase.value === 'submitting'
  stopPolling()
  if (closeWindow) closeCheckoutWindow()
  else checkoutWindow = null
  phase.value = 'idle'
}

function selectChannel(next: PayChannel) {
  channel.value = next
}

const applyOutcome = (
  outcome: ReturnType<typeof readMembershipPaymentOutcome>,
) => {
  if (outcome === 'pending') return false
  phase.value = outcome === 'paid' ? 'success' : outcome
  if (outcome === 'paid') message.success('支付成功')
  return true
}

const pollOrder = async (
  orderNo: string,
  expiresAt: string | null | undefined,
  generation: number,
) => {
  if (generation !== pollGeneration) return
  if (isIntentExpired(expiresAt)) {
    phase.value = 'expired'
    return
  }
  try {
    const status = await fetchMembershipOrder(orderNo)
    if (generation !== pollGeneration) return
    if (applyOutcome(readMembershipPaymentOutcome(status))) return
  } catch {
    if (generation !== pollGeneration) return
  }
  pollTimer = window.setTimeout(() => {
    void pollOrder(orderNo, expiresAt, generation)
  }, POLL_INTERVAL_MS)
}

const openAlipayPlaceholder = (popup: Window) => {
  popup.document.open()
  popup.document.write(
    '<!DOCTYPE html><title>支付宝支付</title><p style="font:14px/1.6 sans-serif;padding:24px;color:#1d2b3a">正在跳转支付宝，请稍候…</p>',
  )
  popup.document.close()
}

const goAlipay = async () => {
  if (phase.value === 'submitting' || phase.value === 'success') return
  if (!auth.isLoggedIn) {
    triggerNeedLogin()
    message.warning('请先登录后再支付')
    return
  }
  const planCode = props.planCode.trim()
  if (!planCode) {
    message.warning('请选择套餐')
    return
  }

  stopPolling()
  const generation = pollGeneration
  phase.value = 'submitting'

  const payChannel: MembershipPayChannel = isFree.value ? 'free' : 'alipay'
  if (payChannel === 'alipay') {
    checkoutWindow = window.open('', '_blank')
    if (!checkoutWindow) {
      phase.value = 'idle'
      message.warning('浏览器拦截了支付窗口，请允许弹窗后重试')
      return
    }
    openAlipayPlaceholder(checkoutWindow)
  }

  try {
    const intent = await createMembershipOrder(planCode)
    if (generation !== pollGeneration) return
    const orderNo = intent.orderNo?.trim()
    if (!orderNo) {
      closeCheckoutWindow()
      phase.value = 'idle'
      message.error('未获取到订单号')
      return
    }

    const ticket = await createMembershipPayment(orderNo, payChannel)
    if (generation !== pollGeneration) return

    if (payChannel === 'free' || isMembershipActivated(ticket.membership)) {
      closeCheckoutWindow()
      phase.value = 'success'
      message.success(payChannel === 'free' ? '开通成功' : '支付成功')
      return
    }

    const html = ticket.redirectHtml?.trim() ?? ''
    if (!html || !submitAlipayCheckout(checkoutWindow, html)) {
      closeCheckoutWindow()
      phase.value = 'idle'
      message.warning(
        html
          ? '浏览器拦截了支付窗口，请允许弹窗后重试'
          : '未获取到支付宝支付页面',
      )
      return
    }

    phase.value = 'waiting'
    void pollOrder(orderNo, intent.expiresAt, generation)
  } catch {
    if (generation !== pollGeneration) return
    closeCheckoutWindow()
    phase.value = 'idle'
  }
}

watch(
  () => props.planCode,
  () => {
    resetCheckout()
  },
)

onUnmounted(() => {
  stopPolling()
  checkoutWindow = null
})
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
      <div v-if="channel === 'alipay'" class="pay-action">
        <button
          type="button"
          class="pay-go"
          :class="{ 'is-success': phase === 'success' }"
          :disabled="phase === 'submitting' || phase === 'success'"
          @click="goAlipay"
        >
          {{ actionLabel }}
        </button>
        <p class="pay-action-hint" aria-live="polite">{{ actionHint }}</p>
      </div>
      <svg v-else class="qr-code" viewBox="0 0 29 29" aria-hidden="true">
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

.pay-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  text-align: center;
}

.pay-go {
  min-width: 96px;
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 18px;
  background: #1677ff;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  &.is-success {
    background: #07a83a;
  }
}

.pay-action-hint {
  margin: 0;
  max-width: 112px;
  color: #8a7a66;
  font-size: 12px;
  line-height: 1.4;
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
