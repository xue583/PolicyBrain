<script setup lang="ts">
import { ref } from 'vue'
import { PhoneOutlined } from '@ant-design/icons-vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import emptyImg from '@/assets/personalCenter/empty-invoice.png'
import invoiceMark from '@/assets/personalCenter/编组@2x.png'

defineOptions({ name: 'InvoicePanel' })

type ConsumRecord = {
  id: number
  changedAt: string
  changeType: string
  planName: string
  quantity: number
  amount: string
}

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

/** 视觉还原用 Mock 数据，接入后端后替换 */
const consumRecords = ref<ConsumRecord[]>([])
const invoiceRecords = ref<InvoiceRecord[]>([
  {
    id: 1,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'issued',
    phone: '18236992863',
    address: '地址文案地址',
  },
  {
    id: 2,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'issued',
    phone: '18236992863',
    address: '地址文案地址',
  },
  {
    id: 3,
    companyName: '郑州政策宝企业管理咨询有限公司',
    invoiceType: '普票',
    amount: '0.01',
    appliedAt: '2024-05-04',
    status: 'applying',
    phone: '18236992863',
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

    <a-table
      v-if="activeTab === 'consum'"
      class="invoice-table"
      :columns="[
        { title: '变动时间', dataIndex: 'changedAt', width: 150 },
        { title: '变更类型', dataIndex: 'changeType', width: 90 },
        { title: '套餐名称', dataIndex: 'planName' },
        { title: '数量', dataIndex: 'quantity', width: 70 },
        { title: '金额', dataIndex: 'amount', width: 90 },
        { title: '操作', dataIndex: 'action', width: 70 },
      ]"
      :data-source="consumRecords"
      :pagination="false"
    >
      <template #emptyText>
        <EmptyState :image="emptyImg" style="--empty-padding: 48px 0 56px" />
      </template>
    </a-table>

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

.invoice-table {
  @include pc-table($header-dividers: true);
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
