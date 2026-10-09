<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
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
        <EmptyState :image="emptyImg" style="--empty-padding: 48px 0 56px" />
      </template>
    </a-table>
  </div>
</template>

<style scoped lang="scss">
.panel-tabs-mb {
  margin-bottom: 20px;
}

.invoice-table {
  @include pc-table($header-dividers: true);
}
</style>
