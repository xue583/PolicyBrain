<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { QrcodeOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import frameBg from '../assets/login/header-bg.png'
import closeIcon from '../assets/login/close.png'
import stepAccount from '../assets/login/register/step-account.png'
import stepIdentityActive from '../assets/login/register/step-identity-active.png'
import stepIdentityInactive from '../assets/login/register/step-identity-inactive.png'
import stepAuthActive from '../assets/login/register/step-auth-active.png'
import stepAuthInactive from '../assets/login/register/step-auth-inactive.png'
import vipBanner from '../assets/login/register/vip-banner.png'
import vipBadge from '../assets/login/register/vip-badge.png'
import roleEnterprise from '../assets/login/register/role-enterprise.png'
import roleService from '../assets/login/register/role-service.png'
import { ApiError } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import { PolicySmsPurpose, PolicyUserType } from '@/api/auth'
import LoginForm from './login/LoginForm.vue'
import RegisterStepAccount from './login/RegisterStepAccount.vue'
import RegisterStepIdentity from './login/RegisterStepIdentity.vue'
import RegisterStepAuth from './login/RegisterStepAuth.vue'

const auth = useAuthStore()

defineOptions({ name: 'LoginModal' })

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  success: []
}>()

const submitting = ref(false)
const sendingCode = ref(false)

type AuthTab = 'login' | 'register'
type AuthMode = 'phone' | 'qrcode'
type RegisterStep = 1 | 2 | 3
type IdentityRole = PolicyUserType | ''

const tab = ref<AuthTab>('login')
const mode = ref<AuthMode>('phone')
const registerStep = ref<RegisterStep>(1)
const phone = ref('')
const code = ref('')
const phoneError = ref('')
const countdown = ref(0)
const identity = ref<IdentityRole>('')
const identityError = ref('')
const formError = ref('')

const authForm = reactive({
  companyName: '',
  unifiedSocialCreditCode: '',
  jobTitle: '',
  nickname: '',
  invitationCode: '',
})

let timer: ReturnType<typeof setInterval> | null = null

const registerTitle = '注册政策大脑会员'

const codeBtnText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s` : '获取验证码',
)

/** a-steps 的 current 从 0 起 */
const stepsCurrent = computed(() => registerStep.value - 1)

const registerSteps = computed(() => [
  {
    title: '1、账户验证',
    icon: stepAccount,
  },
  {
    title: '2、身份选择',
    icon: registerStep.value >= 2 ? stepIdentityActive : stepIdentityInactive,
  },
  {
    title: '3、身份认证',
    icon: registerStep.value >= 3 ? stepAuthActive : stepAuthInactive,
  },
])

const roles = [
  {
    key: PolicyUserType.EnterpriseSpecialist,
    title: '企业专员',
    desc: '负责所在企业的政策管理与申报',
    icon: roleEnterprise,
  },
  {
    key: PolicyUserType.EnterpriseService,
    title: '企服人员',
    desc: '负责所在企业的政策管理与申报',
    icon: roleService,
  },
]

const stopCountdown = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  countdown.value = 0
}

const resetAll = () => {
  tab.value = 'login'
  mode.value = 'phone'
  registerStep.value = 1
  phone.value = ''
  code.value = ''
  phoneError.value = ''
  identity.value = ''
  identityError.value = ''
  formError.value = ''
  sendingCode.value = false
  authForm.companyName = ''
  authForm.unifiedSocialCreditCode = ''
  authForm.jobTitle = ''
  authForm.nickname = ''
  authForm.invitationCode = ''
  stopCountdown()
}

watch(open, (v) => {
  if (v) resetAll()
  else stopCountdown()
})

onUnmounted(() => {
  stopCountdown()
})

const close = () => {
  open.value = false
}

const switchTab = (next: AuthTab) => {
  tab.value = next
  phoneError.value = ''
  identityError.value = ''
  formError.value = ''
  mode.value = 'phone'
  registerStep.value = 1
}

const toggleQr = () => {
  mode.value = mode.value === 'phone' ? 'qrcode' : 'phone'
  phoneError.value = ''
}

const validatePhone = (value: string) => {
  if (!value || !/^1\d{10}$/.test(value)) {
    phoneError.value = '请输入正确的11位手机号'
    return false
  }
  phoneError.value = ''
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
    await auth.requestSmsCode(
      phone.value,
      tab.value === 'register'
        ? PolicySmsPurpose.Register
        : PolicySmsPurpose.Login,
    )
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
  if (!/^\d{4}$/.test(code.value.trim())) {
    phoneError.value = '请输入4位短信验证码'
    return
  }
  submitting.value = true
  try {
    await auth.loginBySms(
      phone.value,
      code.value.trim(),
      PolicySmsPurpose.Login,
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

const goRegisterStep2 = async () => {
  if (submitting.value) return
  if (!validatePhone(phone.value)) return
  if (!/^\d{4}$/.test(code.value.trim())) {
    phoneError.value = '请输入4位短信验证码'
    return
  }
  submitting.value = true
  try {
    await auth.verifyRegisterCode(phone.value, code.value.trim())
    registerStep.value = 2
  } catch (err) {
    phoneError.value =
      err instanceof ApiError ? err.message : '验证码校验失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const onIdentityChange = (value: PolicyUserType) => {
  identity.value = value
  identityError.value = ''
}

const goRegisterStep3 = () => {
  if (!identity.value) {
    identityError.value = '请选择使用身份'
    return
  }
  identityError.value = ''
  registerStep.value = 3
}

const submitRegister = async () => {
  if (submitting.value) return
  const creditRequired = identity.value === PolicyUserType.EnterpriseSpecialist
  if (
    !authForm.companyName.trim() ||
    (creditRequired && !authForm.unifiedSocialCreditCode.trim())
  ) {
    formError.value = '请填写带 * 的必填信息'
    return
  }
  if (!validatePhone(phone.value) || !/^\d{4}$/.test(code.value.trim())) {
    formError.value = '请返回账户验证步骤检查手机号与验证码'
    return
  }
  formError.value = ''
  submitting.value = true
  try {
    await auth.loginBySms(
      phone.value,
      code.value.trim(),
      PolicySmsPurpose.Register,
    )
    try {
      await auth.updateProfile({
        identity: identity.value || undefined,
        companyName: authForm.companyName.trim(),
        unifiedSocialCreditCode:
          authForm.unifiedSocialCreditCode.trim() || undefined,
        jobTitle: authForm.jobTitle.trim() || undefined,
        nickname: authForm.nickname.trim() || undefined,
        invitationCode: authForm.invitationCode.trim() || undefined,
      })
    } catch {
      // 资料更新失败不影响已建立的会话
    }
    message.success('注册成功')
    emit('success')
    close()
  } catch (err) {
    formError.value =
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
            >
              <button
                type="button"
                class="qr-toggle"
                :title="mode === 'phone' ? '扫码登录' : '手机号登录'"
                @click="toggleQr"
              >
                <span v-if="mode === 'qrcode'" class="qr-toggle-pc">PC</span>
              </button>
            </div>

            <div class="login-body">
              <template v-if="mode === 'phone'">
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

                  <a-steps
                    class="reg-steps"
                    label-placement="vertical"
                    :current="stepsCurrent"
                  >
                    <a-step
                      v-for="s in registerSteps"
                      :key="s.title"
                      :title="s.title"
                    >
                      <template #icon>
                        <img
                          class="reg-step-icon"
                          :src="s.icon"
                          :alt="s.title"
                        />
                      </template>
                    </a-step>
                  </a-steps>

                  <RegisterStepAccount
                    v-if="registerStep === 1"
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
                    @next="goRegisterStep2"
                  />

                  <RegisterStepIdentity
                    v-else-if="registerStep === 2"
                    :identity="identity"
                    :identity-error="identityError"
                    :roles="roles"
                    @update:identity="onIdentityChange"
                    @prev="registerStep = 1"
                    @next="goRegisterStep3"
                  />

                  <RegisterStepAuth
                    v-else
                    :identity="identity"
                    :form-error="formError"
                    :submitting="submitting"
                    :vip-banner="vipBanner"
                    :company-name="authForm.companyName"
                    :unified-social-credit-code="
                      authForm.unifiedSocialCreditCode
                    "
                    :job-title="authForm.jobTitle"
                    :nickname="authForm.nickname"
                    :invitation-code="authForm.invitationCode"
                    @update:company-name="authForm.companyName = $event"
                    @update:unified-social-credit-code="
                      authForm.unifiedSocialCreditCode = $event
                    "
                    @update:job-title="authForm.jobTitle = $event"
                    @update:nickname="authForm.nickname = $event"
                    @update:invitation-code="authForm.invitationCode = $event"
                    @prev="registerStep = 2"
                    @submit="submitRegister"
                  />
                </template>
              </template>

              <div v-else class="login-qr">
                <p class="login-welcome">
                  微信扫码{{ tab === 'login' ? '登录' : '注册' }}
                </p>
                <div class="qr-box">
                  <QrcodeOutlined class="qr-placeholder" />
                </div>
                <p class="qr-hint">打开微信扫一扫，关注「政策大脑」完成认证</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" src="./LoginModal.scss"></style>
