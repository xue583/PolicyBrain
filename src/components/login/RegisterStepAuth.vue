<script setup lang="ts">
import { PolicyUserType } from '@/api/auth'

defineOptions({ name: 'RegisterStepAuth' })

defineProps<{
  identity: PolicyUserType | ''
  formError: string
  submitting: boolean
  vipBanner: string
  companyName: string
  unifiedSocialCreditCode: string
  jobTitle: string
  nickname: string
  invitationCode: string
}>()

const emit = defineEmits<{
  'update:companyName': [value: string]
  'update:unifiedSocialCreditCode': [value: string]
  'update:jobTitle': [value: string]
  'update:nickname': [value: string]
  'update:invitationCode': [value: string]
  prev: []
  submit: []
}>()
</script>

<template>
  <div class="auth-head">
    <h3>企业专业认证资料</h3>
    <p>带*的信息用于确认服务身份</p>
  </div>

  <p v-if="formError" class="login-error">{{ formError }}</p>

  <div class="auth-form">
    <div class="form-row">
      <label class="form-item">
        <span class="form-label"><i>*</i>公司名称或简称</span>
        <input
          :value="companyName"
          class="form-input"
          placeholder="请输入内容"
          @input="
            emit(
              'update:companyName',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </label>
    </div>

    <div class="form-row">
      <label class="form-item">
        <span class="form-label"
          ><i v-if="identity === PolicyUserType.EnterpriseSpecialist">*</i
          >统一社会信用代码</span
        >
        <input
          :value="unifiedSocialCreditCode"
          class="form-input"
          placeholder="请输入内容"
          @input="
            emit(
              'update:unifiedSocialCreditCode',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </label>
    </div>

    <div class="form-row form-row--2">
      <label class="form-item">
        <span class="form-label">职务</span>
        <input
          :value="jobTitle"
          class="form-input"
          placeholder="请输入内容"
          @input="
            emit('update:jobTitle', ($event.target as HTMLInputElement).value)
          "
        />
      </label>
      <label class="form-item">
        <span class="form-label">个人昵称</span>
        <input
          :value="nickname"
          class="form-input"
          placeholder="请输入内容"
          @input="
            emit('update:nickname', ($event.target as HTMLInputElement).value)
          "
        />
      </label>
    </div>

    <div class="form-row">
      <label class="form-item">
        <span class="form-label">邀请人邀请码</span>
        <input
          :value="invitationCode"
          class="form-input"
          placeholder="请输入内容"
          @input="
            emit(
              'update:invitationCode',
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </label>
    </div>
  </div>

  <div
    class="vip-banner vip-banner--auth"
    :style="{ backgroundImage: `url(${vipBanner})` }"
  >
    <div class="vip-banner-copy">
      <div class="vip-banner-title">
        <span>认证礼遇</span>
      </div>
      <p class="vip-banner-desc">
        提交后自动获赠3个月VIP，后期更有专属工作台板块上线，敬请期待
      </p>
    </div>
  </div>

  <div class="reg-actions">
    <button type="button" class="btn-ghost" @click="emit('prev')">
      上一步：身份选择
    </button>
    <button
      type="button"
      class="btn-primary"
      :disabled="submitting"
      @click="emit('submit')"
    >
      {{ submitting ? '提交中...' : '下一步：完成认证并领取VIP' }}
    </button>
  </div>
</template>
