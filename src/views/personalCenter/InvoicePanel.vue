<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { PhoneOutlined } from '@ant-design/icons-vue'
import {
  fetchMembershipOrders,
  MembershipOrderStatus,
  type MembershipOrder,
} from '@/api/membership'
import { useServerPage } from '@/composables/useServerPage'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import emptyImg from '@/assets/personalCenter/empty-invoice.png'
import invoiceMark from '@/assets/personalCenter/编组@2x.png'
import InvoiceApplyModal from './InvoiceApplyModal.vue'

defineOptions({ name: 'InvoicePanel' })

const formatOrderAmount = (amount?: number | null) => {
  const fen = Number(amount)
  if (!Number.isFinite(fen)) return '0.00'
  return (Math.round(fen) / 100).toFixed(2)
}

const formatOrderTime = (order: MembershipOrder) => {
  const value = order.paidAt || order.createTime
  if (!value) return '—'
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : value
}

const changeTypeText = (status?: number) => {
  if (status == null) return '—'
  const labels: Record<number, string> = {
    [MembershipOrderStatus.Pending]: '待支付',
    [MembershipOrderStatus.Paid]: '已支付',
    [MembershipOrderStatus.Closed]: '已关闭',
    [MembershipOrderStatus.Expired]: '已失效',
  }
  return labels[status] ?? '—'
}

const consumColumns = [
  { title: '变动时间', dataIndex: 'paidAt', width: 170 },
  { title: '变更类型', dataIndex: 'status', width: 100 },
  { title: '套餐名称', dataIndex: 'planName', ellipsis: true },
  { title: '数量', dataIndex: 'quantity', width: 70 },
  { title: '金额', dataIndex: 'amount', width: 110 },
  { title: '操作', key: 'action', width: 90 },
]

const orderRowKey = (order: MembershipOrder) =>
  String(order.id ?? order.orderNo ?? '')

type InvoiceStatus = 'issued' | 'applying'

type InvoiceRecord = {
  id: number
  companyName: string
  invoiceType: string
  amount: string
  appliedAt: string
  status: InvoiceStatus
  phone: string
  address: string
}

const statusText: Record<InvoiceStatus, string> = {
  issued: '已开票',
  applying: '申请中',
}

const {
  currentPage,
  pageSize,
  items: orders,
  total,
  loading,
  error,
  reload,
} = useServerPage(
  (pageIndex, size) => fetchMembershipOrders({ pageIndex, pageSize: size }),
  () => 'orders',
)

const applyOpen = ref(false)
const applyAmountText = ref('0.00')

const openApply = (order: MembershipOrder) => {
  applyAmountText.value = formatOrderAmount(order.amount)
  applyOpen.value = true
}

/** 发票记录仍为视觉还原数据，开票申请接口接入后替换 */
const invoiceRecords = ref<InvoiceRecord[]>([
  {
    id: 1,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'issued',
    phone: '15390929874',
    address: '地址文案地址',
  },
  {
    id: 2,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'issued',
    phone: '15390929874',
    address: '地址文案地址',
  },
  {
    id: 3,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'applying',
    phone: '15390929874',
    address: '地址文案地址',
  },
])

const activeTab = ref<'consum' | 'invoice'>('invoice')
const selectedId = ref(invoiceRecords.value[0]?.id ?? 0)

const switchTab = (tab: 'consum' | 'invoice') => {
  activeTab.value = tab
}
</script>

<template>
  <div class="invoice-panel">
    <PanelTabs
      class="panel-tabs-mb"
      :tabs="[
        { key: 'consum', label: '消费记录' },
        { key: 'invoice', label: '发票记录' },
      ]"
      :active-key="activeTab"
      @update:active-key="switchTab"
    />

    <template v-if="activeTab === 'consum'">
      <a-alert
        v-if="error"
        class="order-error"
        type="error"
        show-icon
        :message="error"
      >
        <template #action>
          <a-button size="small" @click="reload">重试</a-button>
        </template>
      </a-alert>

      <a-table
        class="invoice-table"
        :columns="consumColumns"
        :data-source="orders"
        :loading="loading"
        :pagination="false"
        :row-key="orderRowKey"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'paidAt'">
            {{ formatOrderTime(record) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            {{ changeTypeText(record.status) }}
          </template>
          <template v-else-if="column.dataIndex === 'planName'">
            {{ record.planName || '—' }}
          </template>
          <template v-else-if="column.dataIndex === 'quantity'">
            {{ record.quantity ?? 0 }}
          </template>
          <template v-else-if="column.dataIndex === 'amount'">
            ¥{{ formatOrderAmount(record.amount) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <button type="button" class="apply-link" @click="openApply(record)">
              去开票
            </button>
          </template>
        </template>
        <template #emptyText>
          <EmptyState
            v-if="!loading"
            :image="emptyImg"
            text="暂无消费记录"
            style="--empty-padding: 48px 0 56px"
          />
        </template>
      </a-table>

      <PaginationBar
        v-if="total > 0"
        v-model:current="currentPage"
        :total="total"
        :page-size="pageSize"
      />

      <InvoiceApplyModal
        v-model:open="applyOpen"
        :amount-text="applyAmountText"
      />
    </template>

    <EmptyState
      v-else-if="invoiceRecords.length === 0"
      :image="emptyImg"
      style="--empty-padding: 48px 0 56px"
    />

    <div v-else class="invoice-grid">
      <button
        v-for="item in invoiceRecords"
        :key="item.id"
        type="button"
        class="invoice-card"
        :class="{ active: selectedId === item.id }"
        @click="selectedId = item.id"
      >
        <span class="status" :class="`is-${item.status}`">
          {{ statusText[item.status] }}
        </span>
        <img class="card-icon" :src="invoiceMark" alt="" />
        <div class="card-main">
          <div class="company">{{ item.companyName }}</div>
          <div class="amount-row">
            <span
              >金额:<span class="amount-value">¥{{ item.amount }}</span></span
            >
            <span class="type-tag">{{ item.invoiceType }}</span>
          </div>
          <div class="date">{{ item.appliedAt }}</div>
          <div class="contact-row">
            <span class="contact">
              <PhoneOutlined />
              {{ item.phone }}
            </span>
            <span class="contact">
              <i class="aim-icon" />
              地址: {{ item.address }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.panel-tabs-mb {
  margin: 16px 0 18px;
}

.order-error {
  margin-bottom: 16px;
}

.invoice-table {
  @include pc-table($header-dividers: true);
}

.apply-link {
  padding: 0;
  border: none;
  background: none;
  color: var(--pb-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.invoice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.invoice-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 16px 16px 14px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:hover {
    border-color: #c5d8f5;
  }

  &.active {
    border-color: #1677ff;
    background: linear-gradient(180deg, #e6f0ff 0%, #ffffff 100%);
  }
}

.status {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;

  &.is-issued {
    color: #f0a020;
    background: #fff3e4;
  }

  &.is-applying {
    color: #2ec4b0;
    background: #e7f8f5;
  }
}

.card-icon {
  display: block;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.card-main {
  min-width: 0;
  flex: 1;
}

.company {
  padding-right: 52px;
  overflow: hidden;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: #1a1a1a;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
  color: #8c8c8c;
}

.amount-value {
  color: #333;
}

.type-tag {
  padding: 0 6px;
  border-radius: 4px;
  background: #e8f3ff;
  color: #1677ff;
  font-size: 12px;
  line-height: 20px;
}

.date {
  margin-top: 10px;
  font-size: 14px;
  line-height: 20px;
  color: #8c8c8c;
}

.contact-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin-top: 8px;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 20px;
}

.contact {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  :deep(.anticon) {
    font-size: 14px;
    color: #9aa0a6;
  }
}

.aim-icon {
  position: relative;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border: 1.4px solid #9aa0a6;
  border-radius: 50%;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #9aa0a6;
    transform: translate(-50%, -50%);
  }
}

@include below-lg {
  .invoice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
