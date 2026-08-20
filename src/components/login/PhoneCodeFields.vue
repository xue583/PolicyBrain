<script setup lang="ts">
defineOptions({ name: 'PhoneCodeFields' })

defineProps<{
  phone: string
  code: string
  phoneError: string
  countdown: number
  sendingCode: boolean
  codeBtnText: string
}>()

const emit = defineEmits<{
  'update:phone': [value: string]
  'update:code': [value: string]
  blurPhone: []
  sendCode: []
}>()
</script>

<template>
  <p v-if="phoneError" class="login-error">{{ phoneError }}</p>
  <div v-else class="login-error-slot" />

  <input
    :value="phone"
    class="login-input"
    type="tel"
    maxlength="11"
    placeholder="请输入手机号"
    @input="emit('update:phone', ($event.target as HTMLInputElement).value)"
    @blur="emit('blurPhone')"
  />

  <div class="login-code-row">
    <input
      :value="code"
      class="login-input login-input--code"
      type="text"
      maxlength="6"
      placeholder="请输入短信验证码"
      @input="emit('update:code', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      class="code-btn"
      :disabled="countdown > 0 || sendingCode"
      @click="emit('sendCode')"
    >
      {{ codeBtnText }}
    </button>
  </div>
</template>
