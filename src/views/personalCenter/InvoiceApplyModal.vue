<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import {
  InvoiceType,
  createInvoiceApplication,
  formatInvoiceAmount,
} from '@/api/invoices'
import { useAuthStore } from '@/stores/auth'
import { toErrorMessage } from '@/utils/apiError'

defineOptions({ name: 'InvoiceApplyModal' })

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  /** 订单实付金额，单位分。提交时原样上送，不超过实付 */
  amountFen: number
  /** 会员订单号。填写后由后端校验订单归属、已支付与实付金额 */
  orderNo: string
}>()

const emit = defineEmits<{
  submitted: []
}>()

const auth = useAuthStore()
const submitting = ref(false)
const submitError = ref('')

const amountText = computed(() => formatInvoiceAmount(props.amountFen))

const invoiceTypes = [
  { value: InvoiceType.Ordinary, label: '增值税普通发票' },
  { value: InvoiceType.Special, label: '增值税专用发票' },
]

const disableFutureDate = (current: Dayjs) =>
  !!current && current.startOf('day').isAfter(dayjs().startOf('day'))

const form = reactive({
  appliedAt: '',
  invoiceType: undefined as number | undefined,
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
  submitError.value = ''
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

  const today = dayjs().startOf('day')
  const picked = dayjs(form.appliedAt)
  errors.appliedAt = !form.appliedAt
    ? '请选择申请日期'
    : !picked.isValid()
      ? '请选择申请日期'
      : picked.startOf('day').isAfter(today)
        ? '申请日期不得晚于当天'
        : ''
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

const submit = async () => {
  if (submitting.value || !validate()) return
  const amount = Math.round(Number(props.amountFen))
  const orderNo = props.orderNo.trim()
  if (!orderNo) {
    submitError.value = '缺少订单号，无法申请开票'
    return
  }
  if (!Number.isFinite(amount) || amount < 0) {
    submitError.value = '发票金额无效'
    return
  }

  submitting.value = true
  submitError.value = ''
  try {
    await createInvoiceApplication({
      invoiceType: form.invoiceType!,
      companyName: form.companyName,
      taxNumber: form.taxNo,
      email: form.email,
      amount,
      orderNo,
      applyDate: `${form.appliedAt}T00:00:00`,
      bankName: form.bankName,
      bankAccount: form.bankAccount,
      address: form.address,
    })
    message.success('开票申请已提交')
    emit('submitted')
    close()
  } catch (err) {
    submitError.value = toErrorMessage(err, '开票申请提交失败')
  } finally {
    submitting.value = false
  }
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
          :disabled-date="disableFutureDate"
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
          <a-button :disabled="submitting" @click="close">取消</a-button>
          <a-button type="primary" html-type="submit" :loading="submitting">
            提交
          </a-button>
        </div>
      </div>

      <p v-if="submitError" class="form-error">{{ submitError }}</p>
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

.field-error,
.form-error {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #ff4d4f;
}

.form-error {
  grid-column: 1 / -1;
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
