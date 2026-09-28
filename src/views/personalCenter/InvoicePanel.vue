<script setup lang="ts">
import { ref } from 'vue'
import emptyImg from '@/assets/personalCenter/empty-invoice.png'

defineOptions({ name: 'InvoicePanel' })

type ConsumRecord = {
  id: number
  changedAt: string
  changeType: string
  planName: string
  quantity: number
  amount: string
}

type InvoiceRecord = {
  id: number
  invoiceType: string
  amount: string
  appliedAt: string
  status: string
}

/** 视觉还原用 Mock 数据，接入后端后替换（当前为空数据状态） */
const consumRecords = ref<ConsumRecord[]>([])
const invoiceRecords = ref<InvoiceRecord[]>([])

const activeTab = ref<'consum' | 'invoice'>('consum')

const switchTab = (tab: 'consum' | 'invoice') => {
  activeTab.value = tab
}
</script>

<template>
  <div class="invoice-panel">
    <div class="invoice-tabs">
      <button
        type="button"
        class="invoice-tab"
        :class="{ active: activeTab === 'consum' }"
        @click="switchTab('consum')"
      >
        消费记录
      </button>
      <button
        type="button"
        class="invoice-tab"
        :class="{ active: activeTab === 'invoice' }"
        @click="switchTab('invoice')"
      >
        发票记录
      </button>
    </div>

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
        <div class="table-empty">
          <img :src="emptyImg" alt="" />
          <p>暂无数据</p>
        </div>
      </template>
    </a-table>

    <a-table
      v-else
      class="invoice-table"
      :columns="[
        { title: '申请时间', dataIndex: 'appliedAt', width: 150 },
        { title: '发票类型', dataIndex: 'invoiceType' },
        { title: '发票金额', dataIndex: 'amount', width: 100 },
        { title: '状态', dataIndex: 'status', width: 90 },
        { title: '操作', dataIndex: 'action', width: 70 },
      ]"
      :data-source="invoiceRecords"
      :pagination="false"
    >
      <template #emptyText>
        <div class="table-empty">
          <img :src="emptyImg" alt="" />
          <p>暂无数据</p>
        </div>
      </template>
    </a-table>
  </div>
</template>

<style scoped lang="scss">
.invoice-tabs {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--pb-line);
}

.invoice-tab {
  position: relative;
  padding: 0 2px 14px;
  border: none;
  background: none;
  font-size: 16px;
  font-family: inherit;
  color: var(--pb-text);
  cursor: pointer;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 3px;
      border-radius: 2px;
      background: var(--pb-primary);
    }
  }
}

.invoice-table {
  :deep(.ant-table-cell) {
    padding: 13px 8px;
    font-size: 13px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #ecf3ff;
    color: var(--pb-text);
    font-weight: 600;
    border-inline-end: 1px solid rgba(255, 255, 255, 0.9);

    &:last-child {
      border-inline-end: none;
    }
  }

  :deep(.ant-table-container) {
    border: 1px solid #dce7f9;
    border-radius: 8px;
    overflow: hidden;
  }
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 48px 0 56px;

  img {
    width: 150px;
    height: auto;
    user-select: none;
  }

  p {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--pb-primary);
  }
}
</style>
