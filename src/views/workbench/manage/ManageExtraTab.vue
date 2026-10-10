<script setup lang="ts">
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { getEnterpriseDetail } from '@/mock/enterpriseDb'
import {
  manageAssetMetrics,
  manageAssets,
  manageBackupMetrics,
  manageBackups,
  manageFinance,
  manageFinanceMetrics,
  manageRdMetrics,
  manageRdProjects,
  manageStaff,
  manageStaffMetrics,
  type ManageRow,
} from '@/mock/manage'
import { downloadCsv } from '@/utils/downloadCsv'
import ContactPanel from '@/views/enterpriseDb/ContactPanel.vue'
import IntellectualPropertyPanel from '@/views/enterpriseDb/IntellectualPropertyPanel.vue'
import PolicyRecordsPanel from '@/views/enterpriseDb/PolicyRecordsPanel.vue'
import ProductIndustryPanel from '@/views/enterpriseDb/ProductIndustryPanel.vue'
import QualificationPanel from '@/views/enterpriseDb/QualificationPanel.vue'
import WbEmptyState from '../components/WbEmptyState.vue'
import ManageRecordPanel from './ManageRecordPanel.vue'

defineOptions({ name: 'ManageExtraTab' })

defineProps<{ tab: string }>()

const enterprise = computed(() => getEnterpriseDetail(1))

const staffColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
  { title: '部门', dataIndex: 'dept', key: 'dept', width: 140 },
  { title: '职务', dataIndex: 'title', key: 'title', width: 150 },
  { title: '学历', dataIndex: 'education', key: 'education', width: 90 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '在职状态', dataIndex: 'status', key: 'status', width: 110 },
]

const financeColumns = [
  { title: '年度', dataIndex: 'year', key: 'year', width: 90 },
  { title: '营业收入(万元)', dataIndex: 'revenue', key: 'revenue', width: 150 },
  { title: '净利润(万元)', dataIndex: 'profit', key: 'profit', width: 140 },
  { title: '资产总额(万元)', dataIndex: 'assets', key: 'assets', width: 150 },
  {
    title: '负债总额(万元)',
    dataIndex: 'liability',
    key: 'liability',
    width: 150,
  },
  {
    title: '研发费用(万元)',
    dataIndex: 'rdExpense',
    key: 'rdExpense',
    width: 150,
  },
  { title: '纳税额(万元)', dataIndex: 'tax', key: 'tax', width: 140 },
]

const assetColumns = [
  { title: '资产名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '资产类别', dataIndex: 'category', key: 'category', width: 120 },
  {
    title: '原值(万元)',
    dataIndex: 'originalValue',
    key: 'originalValue',
    width: 120,
  },
  { title: '净值(万元)', dataIndex: 'netValue', key: 'netValue', width: 120 },
  {
    title: '购置日期',
    dataIndex: 'purchasedAt',
    key: 'purchasedAt',
    width: 120,
  },
  { title: '使用状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '存放地点', dataIndex: 'location', key: 'location', width: 180 },
]

const rdColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name', ellipsis: true },
  {
    title: '项目类型',
    dataIndex: 'projectType',
    key: 'projectType',
    width: 110,
  },
  { title: '起止时间', dataIndex: 'period', key: 'period', width: 200 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
  { title: '经费(万元)', dataIndex: 'budget', key: 'budget', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
]

const backupColumns = [
  { title: '资料名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '大小', dataIndex: 'size', key: 'size', width: 110 },
  { title: '备份时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 130 },
  { title: '操作', key: 'action', width: 90 },
]

const onBackup = (row: ManageRow) => {
  if (!row.name) return
  const base = row.name.replace(/\.[^.]+$/, '')
  downloadCsv(`${base}.csv`, [
    ['资料名称', '类型', '大小', '备份时间'],
    [
      row.name,
      String(row.type ?? ''),
      String(row.size ?? ''),
      String(row.updatedAt ?? ''),
    ],
  ])
  message.success(`已下载「${row.name}」`)
}
</script>

<template>
  <WbEmptyState v-if="!enterprise" text="暂无企业数据" />

  <IntellectualPropertyPanel
    v-else-if="tab === '知识产权'"
    :show-summary="false"
    :patents="enterprise.patents"
    :trademarks="enterprise.trademarks"
    :software-copyrights="enterprise.softwareCopyrights"
    :work-copyrights="enterprise.workCopyrights"
  />

  <ProductIndustryPanel
    v-else-if="tab === '品牌/产品'"
    :products="enterprise.products"
    :industry-chains="enterprise.industryChains"
    :basis="enterprise.productBasis"
    :credibility="enterprise.productCredibility"
  />

  <ManageRecordPanel
    v-else-if="tab === '人员管理'"
    title="人员名册"
    :metrics="manageStaffMetrics"
    :columns="staffColumns"
    :rows="manageStaff"
    :min-width="820"
  />

  <QualificationPanel
    v-else-if="tab === '资质证书'"
    :qualifications="enterprise.qualifications"
    :personnel="enterprise.qualificationPersonnel"
    :reviews="enterprise.qualificationReviews"
  />

  <PolicyRecordsPanel
    v-else-if="tab === '政策管理'"
    :records="enterprise.policyRecords"
  />

  <ManageRecordPanel
    v-else-if="tab === '财务数据'"
    title="近三年财务数据"
    :metrics="manageFinanceMetrics"
    :columns="financeColumns"
    :rows="manageFinance"
    :min-width="980"
  />

  <ManageRecordPanel
    v-else-if="tab === '资产管理'"
    title="资产台账"
    :metrics="manageAssetMetrics"
    :columns="assetColumns"
    :rows="manageAssets"
    :min-width="1040"
  />

  <ManageRecordPanel
    v-else-if="tab === '研发管理'"
    title="研发项目"
    :metrics="manageRdMetrics"
    :columns="rdColumns"
    :rows="manageRdProjects"
    :min-width="960"
  />

  <ContactPanel
    v-else-if="tab === '联系方式'"
    unlocked
    :contacts="enterprise.contacts"
    :email="enterprise.email"
    :website="enterprise.website"
    :address="enterprise.businessInfo.registeredAddress"
  />

  <ManageRecordPanel
    v-else-if="tab === '资料备份'"
    title="资料备份"
    :metrics="manageBackupMetrics"
    :columns="backupColumns"
    :rows="manageBackups"
    :min-width="760"
    @action="onBackup"
  />
</template>
