<script setup lang="ts">
import PhoneCodeFields from './PhoneCodeFields.vue'

defineOptions({ name: 'LoginForm' })

defineProps<{
  phone: string
  code: string
  phoneError: string
  countdown: number
  sendingCode: boolean
  submitting: boolean
  codeBtnText: string
}>()

const emit = defineEmits<{
  'update:phone': [value: string]
  'update:code': [value: string]
  switchTab: ['register']
  blurPhone: []
  sendCode: []
  submit: []
}>()
</script>

<template>
  <p class="login-welcome">欢迎登录政策大脑平台</p>

  <div class="login-tabs">
    <button type="button" class="login-tab active">登录</button>
    <button
      type="button"
      class="login-tab"
      @click="emit('switchTab', 'register')"
    >
      注册
    </button>
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
    @click="emit('submit')"
  >
    {{ submitting ? '登录中...' : '登录账号' }}
  </button>
</template>
