<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import closeIcon from '@/assets/login/close.png'
import stepIdentityActive from '@/assets/login/register/step-identity-active.png'
import stepIdentityInactive from '@/assets/login/register/step-identity-inactive.png'
import stepAuthActive from '@/assets/login/register/step-auth-active.png'
import stepAuthInactive from '@/assets/login/register/step-auth-inactive.png'
import vipBanner from '@/assets/login/register/vip-banner.png'
import roleEnterprise from '@/assets/login/register/role-enterprise.png'
import roleService from '@/assets/login/register/role-service.png'
import { PolicyUserType } from '@/api/auth'
import RegisterStepIdentity from '@/components/login/RegisterStepIdentity.vue'
import RegisterStepAuth from '@/components/login/RegisterStepAuth.vue'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/request'

defineOptions({ name: 'IdentityAuthModal' })

const open = defineModel<boolean>('open', { default: false })

const auth = useAuthStore()

type AuthStep = 1 | 2
type IdentityRole = PolicyUserType | ''

const step = ref<AuthStep>(1)
const submitting = ref(false)
const identity = ref<IdentityRole>('')
const identityError = ref('')
const formError = ref('')

const authForm = reactive({
  companyName: '',
  unifiedSocialCreditCode: '',
  jobTitle: '',
  nickname: '',
})

const stepsCurrent = computed(() => step.value - 1)

const authSteps = computed(() => [
  {
    title: '1、身份选择',
    icon: step.value >= 1 ? stepIdentityActive : stepIdentityInactive,
  },
  {
    title: '2、身份认证',
    icon: step.value >= 2 ? stepAuthActive : stepAuthInactive,
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

const resetForm = () => {
  step.value = 1
  submitting.value = false
  identity.value = ''
  identityError.value = ''
  formError.value = ''
  const profile = auth.user
  authForm.companyName = profile?.companyName || ''
  authForm.unifiedSocialCreditCode = profile?.unifiedSocialCreditCode || ''
  authForm.jobTitle = profile?.jobTitle || ''
  authForm.nickname = profile?.nickname || ''
}

const close = () => {
  open.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

watch(
  open,
  (visible) => {
    if (visible) {
      resetForm()
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

const onIdentityChange = (value: PolicyUserType) => {
  identity.value = value
  identityError.value = ''
}

const goAuthForm = () => {
  if (!identity.value) {
    identityError.value = '请选择使用身份'
    return
  }
  identityError.value = ''
  formError.value = ''
  step.value = 2
}

const submitAuth = async () => {
  if (submitting.value) return
  const creditRequired = identity.value === PolicyUserType.EnterpriseSpecialist
  if (
    !identity.value ||
    !authForm.companyName.trim() ||
    (creditRequired && !authForm.unifiedSocialCreditCode.trim())
  ) {
    formError.value = '请填写带 * 的必填信息'
    return
  }
  formError.value = ''
  submitting.value = true
  try {
    await auth.updateProfile({
      identity: identity.value,
      companyName: authForm.companyName.trim(),
      unifiedSocialCreditCode:
        authForm.unifiedSocialCreditCode.trim() || undefined,
      jobTitle: authForm.jobTitle.trim() || undefined,
      nickname: authForm.nickname.trim() || undefined,
    })
    message.success('认证资料已提交')
    close()
  } catch (err) {
    formError.value =
      err instanceof ApiError ? err.message : '资料提交失败，请稍后重试'
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
          class="login-dialog is-register identity-auth-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="身份认证"
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
            <div class="login-body">
              <p class="login-welcome">完善身份认证</p>

              <a-steps
                class="reg-steps"
                label-placement="vertical"
                :current="stepsCurrent"
              >
                <a-step v-for="s in authSteps" :key="s.title" :title="s.title">
                  <template #icon>
                    <img class="reg-step-icon" :src="s.icon" :alt="s.title" />
                  </template>
                </a-step>
              </a-steps>

              <RegisterStepIdentity
                v-if="step === 1"
                :identity="identity"
                :identity-error="identityError"
                :roles="roles"
                @update:identity="onIdentityChange"
                @next="goAuthForm"
              />

              <RegisterStepAuth
                v-else
                :identity="identity"
                :form-error="formError"
                :submitting="submitting"
                :vip-banner="vipBanner"
                :company-name="authForm.companyName"
                :unified-social-credit-code="authForm.unifiedSocialCreditCode"
                :job-title="authForm.jobTitle"
                :nickname="authForm.nickname"
                @update:company-name="authForm.companyName = $event"
                @update:unified-social-credit-code="
                  authForm.unifiedSocialCreditCode = $event
                "
                @update:job-title="authForm.jobTitle = $event"
                @update:nickname="authForm.nickname = $event"
                @prev="step = 1"
                @submit="submitAuth"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" src="../../components/LoginModal.scss"></style>
<style scoped lang="scss">
.identity-auth-dialog :deep(.login-body) {
  padding-top: 28px;
}
</style>
