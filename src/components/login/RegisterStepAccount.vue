<script setup lang="ts">
import PhoneCodeFields from './PhoneCodeFields.vue'

defineOptions({ name: 'RegisterStepAccount' })

defineProps<{
  phone: string
  code: string
  phoneError: string
  countdown: number
  sendingCode: boolean
  submitting: boolean
  codeBtnText: string
  vipBanner: string
  vipBadge: string
}>()

const emit = defineEmits<{
  'update:phone': [value: string]
  'update:code': [value: string]
  blurPhone: []
  sendCode: []
  next: []
}>()
</script>

<template>
  <div class="vip-banner" :style="{ backgroundImage: `url(${vipBanner})` }">
    <div class="vip-banner-copy">
      <div class="vip-banner-title">
        <span>新用户会员礼遇</span>
        <img :src="vipBadge" alt="VIP" class="vip-badge" />
      </div>
      <p class="vip-banner-desc">完成注册与身份认证，即可获赠3个月VIP</p>
    </div>
  </div>

  <PhoneCodeFields
    :phone="phone"
    :code="code"
    :phone-error="phoneError"
    :countdown="countdown"
    :sending-code="sendingCode"
    :code-btn-text="codeBtnText"
    @update:phone="emit('update:phone', $event)"
    @update:code="emit('update:code', $event)"
    @blur-phone="emit('blurPhone')"
    @send-code="emit('sendCode')"
  />

  <button
    type="button"
    class="login-submit"
    :disabled="submitting"
    @click="emit('next')"
  >
    {{ submitting ? '校验中...' : '下一步：选择身份' }}
  </button>
</template>
