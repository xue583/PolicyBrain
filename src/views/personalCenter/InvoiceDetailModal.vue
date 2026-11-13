<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  InvoiceApplicationStatus,
  cancelInvoiceApplication,
  fetchInvoiceApplication,
  formatInvoiceAmount,
  invoiceStatusLabel,
  invoiceTypeLabel,
  type InvoiceApplication,
} from '@/api/invoices'
import { toErrorMessage } from '@/utils/apiError'

defineOptions({ name: 'InvoiceDetailModal' })

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  applicationId?: string | null
}>()

const emit = defineEmits<{
  updated: [item: InvoiceApplication]
}>()

const detail = ref<InvoiceApplication | null>(null)
const loading = ref(false)
const error = ref('')
const cancelling = ref(false)

const canCancel = computed(
  () => detail.value?.status === InvoiceApplicationStatus.Pending,
)

const formatDay = (value?: string | null) => {
  if (!value) return '—'
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY-MM-DD') : value
}

const formatTime = (value?: string | null) => {
  if (!value) return '—'
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : value
}

const statusClass = (status?: number) => {
  switch (status) {
    case InvoiceApplicationStatus.Pending:
      return 'is-pending'
    case InvoiceApplicationStatus.Issued:
      return 'is-issued'
    case InvoiceApplicationStatus.Sent:
      return 'is-sent'
    case InvoiceApplicationStatus.Cancelled:
      return 'is-cancelled'
    default:
      return ''
  }
}

const load = async (id: string) => {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchInvoiceApplication(id)
  } catch (err) {
    detail.value = null
    error.value = toErrorMessage(err, '发票详情加载失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => [open.value, props.applicationId] as const,
  ([visible, id]) => {
    if (!visible || id == null) return
    void load(id)
  },
)

const close = () => {
  open.value = false
}

const cancelApply = async () => {
  const id = detail.value?.id
  if (id == null || cancelling.value || !canCancel.value) return
  cancelling.value = true
  try {
    const updated = await cancelInvoiceApplication(id)
    detail.value = updated
    message.success('已撤销开票申请')
    emit('updated', updated)
  } catch (err) {
    message.error(toErrorMessage(err, '撤销失败'))
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <a-modal
    v-model:open="open"
    title="发票详情"
    :width="720"
    :footer="null"
    destroy-on-close
    wrap-class-name="invoice-detail-modal"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <a-alert v-if="error" type="error" show-icon :message="error">
        <template #action>
          <a-button
            v-if="applicationId != null"
            size="small"
            @click="load(applicationId)"
          >
            重试
          </a-button>
        </template>
      </a-alert>

      <template v-else-if="detail">
        <div class="detail-head">
          <span class="apply-no">{{ detail.applyNo || '—' }}</span>
          <span class="status" :class="statusClass(detail.status)">
            {{ invoiceStatusLabel(detail.status) }}
          </span>
        </div>

        <dl class="detail-grid">
          <div>
            <dt>申请日期</dt>
            <dd>{{ formatDay(detail.applyDate) }}</dd>
          </div>
          <div>
            <dt>发票类型</dt>
            <dd>{{ invoiceTypeLabel(detail.invoiceType) }}</dd>
          </div>
          <div>
            <dt>单位名称</dt>
            <dd>{{ detail.companyName || '—' }}</dd>
          </div>
          <div>
            <dt>单位税号</dt>
            <dd>{{ detail.taxNumber || '—' }}</dd>
          </div>
          <div>
            <dt>开户行</dt>
            <dd>{{ detail.bankName || '—' }}</dd>
          </div>
          <div>
            <dt>账号</dt>
            <dd>{{ detail.bankAccount || '—' }}</dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{{ detail.address || '—' }}</dd>
          </div>
          <div>
            <dt>邮箱</dt>
            <dd>{{ detail.email || '—' }}</dd>
          </div>
          <div>
            <dt>发票金额</dt>
            <dd>¥{{ formatInvoiceAmount(detail.amount) }}</dd>
          </div>
          <div>
            <dt>关联订单</dt>
            <dd>{{ detail.orderNo || '—' }}</dd>
          </div>
          <div>
            <dt>发票号码</dt>
            <dd>{{ detail.invoiceNo || '—' }}</dd>
          </div>
          <div>
            <dt>开票时间</dt>
            <dd>{{ formatTime(detail.issuedAt) }}</dd>
          </div>
          <div>
            <dt>发送至</dt>
            <dd>{{ detail.sendTarget || '—' }}</dd>
          </div>
          <div>
            <dt>发送时间</dt>
            <dd>{{ formatTime(detail.sentAt) }}</dd>
          </div>
          <div class="is-wide">
            <dt>发票文件</dt>
            <dd>
              <a
                v-if="detail.invoiceFileUrl"
                :href="detail.invoiceFileUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看发票
              </a>
              <template v-else>—</template>
            </dd>
          </div>
        </dl>

        <div class="action-row">
          <a-button @click="close">关闭</a-button>
          <a-popconfirm
            v-if="canCancel"
            title="确定撤销这张开票申请？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="cancelApply"
          >
            <a-button danger :loading="cancelling">撤销申请</a-button>
          </a-popconfirm>
        </div>
      </template>
    </a-spin>
  </a-modal>
</template>

<style scoped lang="scss">
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.apply-no {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.status {
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;

  &.is-pending {
    color: #2ec4b0;
    background: #e7f8f5;
  }

  &.is-issued {
    color: #f0a020;
    background: #fff3e4;
  }

  &.is-sent {
    color: #1677ff;
    background: #e8f3ff;
  }

  &.is-cancelled {
    color: #8c8c8c;
    background: #f5f5f5;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  margin: 0;

  div {
    min-width: 0;
  }

  .is-wide {
    grid-column: 1 / -1;
  }

  dt {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--pb-sub);
  }

  dd {
    margin: 4px 0 0;
    font-size: 14px;
    line-height: 22px;
    color: var(--pb-text);
    word-break: break-all;
  }
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@include below-lg {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
