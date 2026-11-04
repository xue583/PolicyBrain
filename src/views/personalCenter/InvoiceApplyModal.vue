<script setup lang="ts">
import { reactive, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'InvoiceApplyModal' })

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  /** 订单金额，单位元，已格式化为两位小数 */
  amountText: string
}>()

const auth = useAuthStore()

const invoiceTypes = [
  { value: '普票', label: '增值税普通发票' },
  { value: '专票', label: '增值税专用发票' },
]

const form = reactive({
  appliedAt: '',
  invoiceType: undefined as string | undefined,
  companyName: '',
  taxNo: '',
  bankName: '',
  bankAccount: '',
  address: '',
  email: '',
})

const errors = reactive({
  appliedAt: '',
  invoiceType: '',
  companyName: '',
  taxNo: '',
  bankName: '',
  bankAccount: '',
  address: '',
  email: '',
})

const resetErrors = () => {
  errors.appliedAt = ''
  errors.invoiceType = ''
  errors.companyName = ''
  errors.taxNo = ''
  errors.bankName = ''
  errors.bankAccount = ''
  errors.address = ''
  errors.email = ''
}

const resetForm = () => {
  resetErrors()
  form.appliedAt = dayjs().format('YYYY-MM-DD')
  form.invoiceType = undefined
  form.companyName = auth.user?.companyName?.trim() || ''
  form.taxNo = auth.user?.unifiedSocialCreditCode?.trim().toUpperCase() || ''
  form.bankName = ''
  form.bankAccount = ''
  form.address = ''
  form.email = ''
}

watch(open, (visible) => {
  if (visible) resetForm()
})

const close = () => {
  open.value = false
}

const clearError = (key: keyof typeof errors) => {
  errors[key] = ''
}

const validate = () => {
  form.companyName = form.companyName.trim()
  form.taxNo = form.taxNo.trim().toUpperCase()
  form.bankName = form.bankName.trim()
  form.bankAccount = form.bankAccount.trim()
  form.address = form.address.trim()
  form.email = form.email.trim()

  errors.appliedAt = form.appliedAt ? '' : '请选择申请日期'
  errors.invoiceType = form.invoiceType ? '' : '请选择发票类型'
  errors.companyName = form.companyName ? '' : '请输入单位名称'
  errors.taxNo = !form.taxNo
    ? '请输入单位税号'
    : /^[0-9A-Z]{15,20}$/.test(form.taxNo)
      ? ''
      : '请输入15到20位单位税号'
  errors.bankName = form.bankName ? '' : '请输入开户行'
  errors.bankAccount = form.bankAccount ? '' : '请输入账号'
  errors.address = form.address ? '' : '请输入地址'
  errors.email = !form.email
    ? '请输入邮箱'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ''
      : '请输入正确的邮箱'

  return Object.values(errors).every((item) => !item)
}

const submit = () => {
  if (!validate()) return
  message.success('开票申请已提交')
  close()
}
</script>

<template>
  <a-modal
    v-model:open="open"
    title="申请开票"
    :width="720"
    :footer="null"
    destroy-on-close
    wrap-class-name="invoice-apply-modal"
    @cancel="close"
  >
    <form class="apply-form" @submit.prevent="submit">
      <label class="field">
        <span class="field-label required">申请日期</span>
        <a-date-picker
          v-model:value="form.appliedAt"
          class="control"
          value-format="YYYY-MM-DD"
          placeholder="请选择申请日期"
          :status="errors.appliedAt ? 'error' : undefined"
          @change="clearError('appliedAt')"
        />
        <p v-if="errors.appliedAt" class="field-error">
          {{ errors.appliedAt }}
        </p>
      </label>

      <label class="field">
        <span class="field-label required">发票类型</span>
        <a-select
          v-model:value="form.invoiceType"
          class="control"
          placeholder="请选择发票类型"
          :options="invoiceTypes"
          :status="errors.invoiceType ? 'error' : undefined"
          @change="clearError('invoiceType')"
        />
        <p v-if="errors.invoiceType" class="field-error">
          {{ errors.invoiceType }}
        </p>
      </label>

      <label class="field">
        <span class="field-label required">单位名称</span>
        <a-input
          v-model:value="form.companyName"
          placeholder="请输入单位名称"
          :status="errors.companyName ? 'error' : undefined"
          @change="clearError('companyName')"
        />
        <p v-if="errors.companyName" class="field-error">
          {{ errors.companyName }}
        </p>
      </label>

      <label class="field">
        <span class="field-label required">单位税号</span>
        <a-input
          v-model:value="form.taxNo"
          placeholder="请输入单位税号"
          :status="errors.taxNo ? 'error' : undefined"
          @change="clearError('taxNo')"
        />
        <p v-if="errors.taxNo" class="field-error">{{ errors.taxNo }}</p>
      </label>

      <label class="field">
        <span class="field-label required">开户行</span>
        <a-input
          v-model:value="form.bankName"
          placeholder="请输入开户行"
          :status="errors.bankName ? 'error' : undefined"
          @change="clearError('bankName')"
        />
        <p v-if="errors.bankName" class="field-error">{{ errors.bankName }}</p>
      </label>

      <label class="field">
        <span class="field-label required">账号</span>
        <a-input
          v-model:value="form.bankAccount"
          placeholder="请输入账号"
          :status="errors.bankAccount ? 'error' : undefined"
          @change="clearError('bankAccount')"
        />
        <p v-if="errors.bankAccount" class="field-error">
          {{ errors.bankAccount }}
        </p>
      </label>

      <label class="field">
        <span class="field-label required">地址</span>
        <a-input
          v-model:value="form.address"
          placeholder="请输入地址"
          :status="errors.address ? 'error' : undefined"
          @change="clearError('address')"
        />
        <p v-if="errors.address" class="field-error">{{ errors.address }}</p>
      </label>

      <label class="field">
        <span class="field-label required">邮箱</span>
        <a-input
          v-model:value="form.email"
          placeholder="请输入邮箱"
          :status="errors.email ? 'error' : undefined"
          @change="clearError('email')"
        />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </label>

      <label class="field">
        <span class="field-label">发票金额</span>
        <a-input
          class="amount-input"
          :value="amountText"
          disabled
          addon-before="¥"
        />
      </label>

      <div class="field">
        <span class="field-label">操作</span>
        <div class="action-row">
          <a-button @click="close">取消</a-button>
          <a-button type="primary" html-type="submit">提交</a-button>
        </div>
      </div>
    </form>
  </a-modal>
</template>

<style scoped lang="scss">
.apply-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  padding-top: 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field-label {
  font-size: 14px;
  line-height: 22px;
  color: var(--pb-text);

  &.required::before {
    content: '*';
    margin-right: 4px;
    color: #ff4d4f;
  }
}

.control {
  width: 100%;
}

.field-error {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #ff4d4f;
}

.amount-input {
  :deep(.ant-input[disabled]) {
    color: var(--pb-text);
    background: #f5f7fa;
  }
}

.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

@include below-lg {
  .apply-form {
    grid-template-columns: 1fr;
  }
}
</style>
