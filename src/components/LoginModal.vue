<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import frameBg from '../assets/login/header-bg.png'
import closeIcon from '../assets/login/close.png'
import vipBanner from '../assets/login/register/vip-banner.png'
import vipBadge from '../assets/login/register/vip-badge.png'
import { ApiError } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import { consumeInviteRegister, getInviteCode } from '@/utils/auth'
import LoginForm from './login/LoginForm.vue'
import RegisterStepAccount from './login/RegisterStepAccount.vue'

const auth = useAuthStore()

defineOptions({ name: 'LoginModal' })

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  success: []
}>()

const submitting = ref(false)
const sendingCode = ref(false)

type AuthTab = 'login' | 'register'

const SMS_CODE_RE = /^\d{4}$/

const tab = ref<AuthTab>('login')
const phone = ref('')
const code = ref('')
const phoneError = ref('')
const countdown = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const registerTitle = '注册政策大脑会员'

const codeBtnText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '获取验证码',
)

const stopCountdown = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  countdown.value = 0
}

const resetAll = () => {
  tab.value = 'login'
  phone.value = ''
  code.value = ''
  phoneError.value = ''
  sendingCode.value = false
  stopCountdown()
}

const close = () => {
  open.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

watch(
  open,
  (v) => {
    if (v) {
      resetAll()
      if (consumeInviteRegister()) tab.value = 'register'
      window.addEventListener('keydown', onKeydown)
    } else {
      stopCountdown()
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  stopCountdown()
  window.removeEventListener('keydown', onKeydown)
})

const switchTab = (next: AuthTab) => {
  tab.value = next
  code.value = ''
  phoneError.value = ''
  stopCountdown()
}

const validatePhone = (value: string) => {
  if (!value || !/^1\d{10}$/.test(value)) {
    phoneError.value = '请输入正确的11位手机号'
    return false
  }
  phoneError.value = ''
  return true
}

const validateSmsCode = () => {
  if (!SMS_CODE_RE.test(code.value.trim())) {
    phoneError.value = '请输入4位短信验证码'
    return false
  }
  return true
}

const onPhoneBlur = () => {
  if (phone.value) validatePhone(phone.value)
}

const startCountdown = () => {
  stopCountdown()
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) stopCountdown()
  }, 1000)
}

const sendCode = async () => {
  if (countdown.value > 0 || sendingCode.value) return
  if (!validatePhone(phone.value)) return
  sendingCode.value = true
  try {
    await auth.requestSmsCode(phone.value)
    message.success('验证码已发送')
    startCountdown()
  } catch (err) {
    phoneError.value =
      err instanceof ApiError ? err.message : '验证码发送失败，请稍后重试'
  } finally {
    sendingCode.value = false
  }
}

const onLoginSubmit = async () => {
  if (submitting.value) return
  if (!validatePhone(phone.value)) return
  if (!validateSmsCode()) return
  submitting.value = true
  try {
    await auth.loginBySms(
      phone.value,
      code.value.trim(),
      getInviteCode() || undefined,
    )
    message.success('登录成功')
    emit('success')
    close()
  } catch (err) {
    phoneError.value =
      err instanceof ApiError ? err.message : '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const submitRegister = async () => {
  if (submitting.value) return
  if (!validatePhone(phone.value)) return
  if (!validateSmsCode()) return
  submitting.value = true
  try {
    await auth.loginBySms(
      phone.value,
      code.value.trim(),
      getInviteCode() || undefined,
    )
    message.success('注册成功')
    emit('success')
    close()
  } catch (err) {
    phoneError.value =
      err instanceof ApiError ? err.message : '注册失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="login-fade">
      <div v-if="open" class="login-overlay" @click.self="close">
        <div
          class="login-dialog"
          :class="{ 'is-register': tab === 'register' }"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            class="login-close"
            aria-label="关闭"
            @click="close"
          >
            <img :src="closeIcon" alt="" />
          </button>

          <div class="login-card">
            <div
              class="login-header"
              :style="{ backgroundImage: `url(${frameBg})` }"
            ></div>

            <div class="login-body">
              <LoginForm
                v-if="tab === 'login'"
                v-model:phone="phone"
                v-model:code="code"
                :phone-error="phoneError"
                :countdown="countdown"
                :sending-code="sendingCode"
                :submitting="submitting"
                :code-btn-text="codeBtnText"
                @switch-tab="switchTab"
                @blur-phone="onPhoneBlur"
                @send-code="sendCode"
                @submit="onLoginSubmit"
              />

              <template v-else>
                <p class="login-welcome">{{ registerTitle }}</p>

                <div class="login-tabs">
                  <button
                    type="button"
                    class="login-tab"
                    @click="switchTab('login')"
                  >
                    登录
                  </button>
                  <button type="button" class="login-tab active">注册</button>
                </div>

                <RegisterStepAccount
                  v-model:phone="phone"
                  v-model:code="code"
                  :phone-error="phoneError"
                  :countdown="countdown"
                  :sending-code="sendingCode"
                  :submitting="submitting"
                  :code-btn-text="codeBtnText"
                  :vip-banner="vipBanner"
                  :vip-badge="vipBadge"
                  @blur-phone="onPhoneBlur"
                  @send-code="sendCode"
                  @submit="submitRegister"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" src="./LoginModal.scss"></style>
