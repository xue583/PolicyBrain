<script setup lang="ts">
import { computed } from 'vue'
import { displayRegisteredCapital } from '@/api/mapPortal'
import { usePagination } from '@/composables/usePagination'
import {
  enterpriseStatusText,
  type EnterpriseDetail,
  type EnterpriseShareholder,
} from '../../mock/enterpriseDb'
import EmptyState from '@/components/common/EmptyState.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import emptyNews from '@/assets/home/empty-news.png'

defineOptions({ name: 'EnterpriseBusinessInfoPanel' })

const props = defineProps<{
  enterprise: EnterpriseDetail
}>()

const industryPath = computed(() =>
  [
    ...new Set(
      [props.enterprise.industry, props.enterprise.businessIndustry].filter(
        Boolean,
      ),
    ),
  ].join('、'),
)

const capitalText = computed(() =>
  displayRegisteredCapital(props.enterprise.registeredCapital),
)

const PAGE_SIZE = 10
const { currentPage, pagedList, total, pageSize } = usePagination(
  () => props.enterprise.shareholders ?? [],
  { pageSize: PAGE_SIZE },
)

const shareholderColumns = [
  { title: '股东名称', dataIndex: 'name', key: 'name', ellipsis: true },
  {
    title: '股东类型',
    dataIndex: 'shareholderType',
    key: 'shareholderType',
    width: 160,
  },
  {
    title: '持股比例',
    dataIndex: 'shareholdingRatio',
    key: 'shareholdingRatio',
    width: 120,
  },
  {
    title: '认缴出资额',
    dataIndex: 'subscribedCapital',
    key: 'subscribedCapital',
    width: 160,
  },
  {
    title: '实缴出资额',
    dataIndex: 'paidInCapital',
    key: 'paidInCapital',
    width: 160,
  },
  {
    title: '出资比例',
    dataIndex: 'shouldProportion',
    key: 'shouldProportion',
    width: 140,
  },
]

const bizLabelStyle = {
  background: '#f4f7fc',
  color: '#595959',
}
</script>

<template>
  <a-descriptions
    v-if="enterprise.businessInfo"
    class="biz-descriptions"
    bordered
    :column="{ xs: 1, sm: 1, md: 2, lg: 3 }"
    :label-style="bizLabelStyle"
  >
    <a-descriptions-item label="统一社会信用代码">
      {{ enterprise.creditCode }}
    </a-descriptions-item>
    <a-descriptions-item label="注册号">
      {{ enterprise.businessInfo.registrationNumber }}
    </a-descriptions-item>
    <a-descriptions-item label="组织机构代码">
      {{ enterprise.businessInfo.organizationCode }}
    </a-descriptions-item>
    <a-descriptions-item label="经营状态">
      {{ enterpriseStatusText[enterprise.status] }}
    </a-descriptions-item>
    <a-descriptions-item label="法定代表人">
      {{ enterprise.legalRep }}
    </a-descriptions-item>
    <a-descriptions-item label="注册资本">
      {{ capitalText }}
    </a-descriptions-item>
    <a-descriptions-item label="企业类型">
      {{ enterprise.enterpriseType }}
    </a-descriptions-item>
    <a-descriptions-item label="成立日期">
      {{ enterprise.foundedDate }}
    </a-descriptions-item>
    <a-descriptions-item label="营业期限">
      {{ enterprise.businessInfo.businessTerm }}
    </a-descriptions-item>
    <a-descriptions-item label="参保人数">
      {{ enterprise.businessInfo.insuredCount }}
    </a-descriptions-item>
    <a-descriptions-item label="所属行业" :span="2">
      {{ industryPath }}
    </a-descriptions-item>
    <a-descriptions-item label="注册地址" :span="3">
      {{ enterprise.businessInfo.registeredAddress }}
    </a-descriptions-item>
    <a-descriptions-item label="最新注册地址变更日期" :span="3">
      {{ enterprise.businessInfo.addressChangeDate }}
    </a-descriptions-item>
    <a-descriptions-item label="经营范围" :span="3">
      {{ enterprise.businessScope }}
    </a-descriptions-item>
  </a-descriptions>

  <section class="shareholder-block">
    <SectionTitle
      title="股东信息"
      :count="enterprise.shareholders?.length ?? 0"
    />
    <PagedTable
      v-model:current="currentPage"
      class="shareholder-table"
      :show-pagination="total > 0"
      :total="total"
      :page-size="pageSize"
      :columns="shareholderColumns"
      :data-source="pagedList"
      :row-key="(row: EnterpriseShareholder) => row.id"
    >
      <template #emptyText>
        <EmptyState
          class="shareholder-empty"
          :image="emptyNews"
          text="暂无股东信息"
          :image-width="202"
        />
      </template>
    </PagedTable>
  </section>
</template>

<style scoped lang="scss">
.biz-descriptions {
  :deep(.ant-descriptions-view) {
    overflow: hidden;
    border-color: #e8e8e8;
    border-radius: 8px;

    > table {
      border-collapse: separate;
      border-spacing: 0;
    }
  }

  :deep(.ant-descriptions-row:first-child > :first-child) {
    border-top-left-radius: 8px;
  }

  :deep(.ant-descriptions-row:first-child > :last-child) {
    border-top-right-radius: 8px;
  }

  :deep(.ant-descriptions-row:last-child > :first-child) {
    border-bottom-left-radius: 8px;
  }

  :deep(.ant-descriptions-row:last-child > :last-child) {
    border-bottom-right-radius: 8px;
  }

  :deep(.ant-descriptions-item-label),
  :deep(.ant-descriptions-item-content) {
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.6;
    vertical-align: top;
    border-color: #e8e8e8;
  }

  :deep(.ant-descriptions-item-label) {
    width: 171px;
  }

  :deep(.ant-descriptions-item-content) {
    color: #262626;
    background: #fff;
  }
}

.shareholder-block {
  margin-top: 24px;
}

.shareholder-table {
  --pagination-padding: 20px 0 0;

  :deep(.ant-table-placeholder) {
    padding: 48px 16px !important;
  }

  :deep(.ant-table-placeholder .ant-empty:not(.pb-empty) .ant-empty-image) {
    display: none;
  }
}

.shareholder-empty {
  --empty-gap: 8px;
  --empty-padding: 12px 0 8px;
  --empty-text-size: 15px;
  --empty-text-weight: 400;
}
</style>
