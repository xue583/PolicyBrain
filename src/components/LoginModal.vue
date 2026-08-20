<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
import { PolicyUserType } from '@/api/auth'
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
  if (!/^\d{4}$/.test(code.value.trim())) {
    phoneError.value = '请输入4位短信验证码'
    return
  }
  submitting.value = true
  try {
    await auth.loginBySms(phone.value, code.value.trim())
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
    // 预校验可选；失败时仍允许用户改码重试
    await auth.verifyRegisterCode(phone.value, code.value.trim())
    registerStep.value = 2
  } catch (err) {
    phoneError.value =
      err instanceof ApiError ? err.message : '验证码校验失败，请稍后重试'
  } finally {
    submitting.value = false
  }
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
    await auth.loginBySms(phone.value, code.value.trim())
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
                    @update:identity="
                      identity = $event
                      identityError = ''
                    "
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

<style lang="scss">
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  padding: 24px 16px;
  overflow: auto;
}

.login-dialog {
  position: relative;
  width: 468px;
  max-width: 100%;
  margin: auto;

  &.is-register {
    width: 520px;
  }
}

.login-close {
  position: absolute;
  top: -4px;
  right: -47px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.85;
  }
}

.login-card {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(15, 40, 80, 0.22);
}

.login-header {
  position: relative;
  height: 118px;
  background-color: #eef5ff;
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
}

.qr-toggle {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: 72px;
  height: 72px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.qr-toggle-pc {
  position: absolute;
  top: 10px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1;
}

.login-body {
  padding: 4px 42px 32px;
}

.login-welcome {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 6px;
}

.login-tab {
  position: relative;
  padding: 6px 4px 10px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 28px;
      height: 3px;
      border-radius: 2px;
      background: var(--pb-primary);
      transform: translateX(-50%);
    }
  }
}

.login-error,
.login-error-slot {
  min-height: 20px;
  margin: 0 0 8px;
  color: #ff4d4f;
  font-size: 13px;
  line-height: 20px;
}

.login-input {
  display: block;
  width: 100%;
  height: 44px;
  margin-bottom: 14px;
  padding: 0 14px;
  border: none;
  border-radius: 6px;
  background: #f5f6f8;
  color: #333;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #bbb;
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.18);
  }
}

.login-code-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.login-input--code {
  flex: 1;
  margin-bottom: 0;
  min-width: 0;
}

.code-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #e8f1ff;
  color: var(--pb-primary);
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #d6e8ff;
  }

  &:disabled {
    color: #8bb7ff;
    cursor: not-allowed;
  }
}

.login-submit,
.btn-primary {
  display: block;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 8px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.28);

  &:hover {
    background: #3c8cff;
  }
}

/* register steps — ant-design-vue Steps */
.reg-steps {
  margin: 16px 0 18px;

  :deep(.ant-steps-item) {
    position: relative;
    flex: 1;
    overflow: visible;
    padding-inline-start: 0 !important;
  }

  /* 关掉 antd 默认连线，避免错位溢出 */
  :deep(.ant-steps-item-tail) {
    display: none !important;
  }

  /* 自绘连线：当前节点右缘 → 下一节点左缘 */
  :deep(.ant-steps-item:not(:last-child)::after) {
    content: '';
    position: absolute;
    top: 14px;
    left: calc(50% + 18px);
    z-index: 0;
    width: calc(100% - 36px);
    border-top: 1px dashed #c5cdd8;
    pointer-events: none;
  }

  :deep(.ant-steps-item-finish:not(:last-child)::after) {
    border-top: 1px solid var(--pb-primary);
  }

  :deep(.ant-steps-item-container) {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  :deep(.ant-steps-item-icon) {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 28px !important;
    height: 28px !important;
    margin: 0 !important;
    margin-inline-start: 0 !important;
    margin-inline-end: 0 !important;
    line-height: 28px !important;
    background: transparent !important;
    border: none !important;
  }

  :deep(.ant-steps-item-custom .ant-steps-item-icon > .ant-steps-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    line-height: 1;
    top: 0;
  }

  :deep(.ant-steps-item-content) {
    display: block !important;
    width: 100% !important;
    margin-top: 8px !important;
    text-align: center;
  }

  :deep(.ant-steps-item-title) {
    display: inline-block;
    padding-inline-end: 0 !important;
    color: #999 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    white-space: nowrap;
  }

  :deep(.ant-steps-item-title::after) {
    display: none !important;
  }

  :deep(.ant-steps-item-process .ant-steps-item-title),
  :deep(.ant-steps-item-finish .ant-steps-item-title) {
    color: var(--pb-primary) !important;
    font-weight: 500;
  }
}

.reg-step-icon {
  display: block;
  width: 28px;
  height: 28px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 50%;
}

/* VIP banner */
.vip-banner {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  margin-bottom: 10px;
  padding: 0 14px 0 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.vip-banner-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.vip-banner-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3a2a14;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.vip-badge {
  height: 16px;
  width: auto;
  object-fit: contain;
}

.vip-banner-desc {
  margin: 4px 0 0;
  color: #c48a2e;
  font-size: 12px;
  line-height: 1.3;
}

.vip-banner--auth {
  margin-top: 8px;
  margin-bottom: 16px;

  .vip-banner-desc {
    max-width: 92%;
  }
}

/* identity step */
.identity-head {
  margin: 8px 0 14px;
  text-align: center;

  h3 {
    margin: 0 0 6px;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 12px;
  }
}

.identity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.identity-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f5f8fc;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &.selected {
    border-color: var(--pb-primary);
    background: #f0f6ff;

    .identity-check {
      border-color: var(--pb-primary);
      background: var(--pb-primary);

      &::after {
        opacity: 1;
      }
    }
  }
}

.identity-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
}

.identity-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1a1a1a;
    font-size: 15px;
    font-weight: 600;
  }

  span {
    color: #999;
    font-size: 12px;
  }
}

.identity-check {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1.5px solid #c5cdd8;
  border-radius: 50%;
  background: #fff;

  &::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    opacity: 0;
    transform: rotate(45deg);
  }
}

.reg-actions {
  display: flex;
  gap: 12px;
}

.btn-ghost {
  flex: 1;
  height: 46px;
  border: 1px solid var(--pb-primary);
  border-radius: 8px;
  background: #fff;
  color: var(--pb-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f0f6ff;
  }
}

.reg-actions .btn-primary {
  flex: 1.2;
  box-shadow: none;
  font-size: 14px;
  padding: 0 8px;
}

/* auth form — multi formItem per row */
.auth-head {
  margin: 4px 0 12px;

  h3 {
    margin: 0 0 6px;
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 12px;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;

  &--2 .form-item {
    flex: 1;
    min-width: 0;
  }
}

.form-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.form-label {
  color: #333;
  font-size: 13px;
  line-height: 1.2;

  i {
    margin-right: 2px;
    color: #ff4d4f;
    font-style: normal;
  }
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #bbb;
  }

  &:focus {
    border-color: var(--pb-primary);
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.12);
  }
}

.login-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
}

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  height: 168px;
  margin: 8px 0 16px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  background: #fafbfc;
}

.qr-placeholder {
  font-size: 72px;
  color: #c5cdd8;
}

.qr-hint {
  margin: 0;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.login-fade-enter-active,
.login-fade-leave-active {
  transition: opacity 0.2s ease;

  .login-dialog {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
}

.login-fade-enter-from,
.login-fade-leave-to {
  opacity: 0;

  .login-dialog {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
}

@media (max-width: 560px) {
  .login-dialog,
  .login-dialog.is-register {
    width: 100%;
  }

  .login-body {
    padding: 4px 22px 28px;
  }

  .form-row--2 {
    flex-direction: column;
  }

  .reg-actions {
    flex-direction: column;
  }
}
</style>
