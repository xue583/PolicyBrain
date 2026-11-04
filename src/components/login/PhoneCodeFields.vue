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

  <a-input
    :value="phone"
    class="login-input"
    type="tel"
    :maxlength="11"
    placeholder="请输入手机号"
    @update:value="emit('update:phone', $event)"
    @blur="emit('blurPhone')"
  />

  <div class="login-code-row">
    <a-input
      :value="code"
      class="login-input login-input--code"
      :maxlength="4"
      placeholder="请输入短信验证码"
      @update:value="emit('update:code', $event)"
    />
    <a-button
      class="code-btn"
      :disabled="countdown > 0 || sendingCode"
      @click="emit('sendCode')"
    >
      {{ codeBtnText }}
    </a-button>
  </div>
</template>
