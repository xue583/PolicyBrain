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
  submit: []
}>()
</script>

<template>
  <div class="vip-banner" :style="{ backgroundImage: `url(${vipBanner})` }">
    <div class="vip-banner-copy">
      <div class="vip-banner-title">
        <span>新用户会员礼遇</span>
        <img :src="vipBadge" alt="VIP" class="vip-badge" />
      </div>
      <p class="vip-banner-desc">完成注册即可使用，身份认证后获赠3个月VIP</p>
    </div>
  </div>

  <form @submit.prevent="emit('submit')">
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

    <button type="submit" class="login-submit" :disabled="submitting">
      {{ submitting ? '注册中...' : '完成注册' }}
    </button>
  </form>
</template>
