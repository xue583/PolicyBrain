<script setup lang="ts">
import { computed, ref } from 'vue'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'FollowPanel' })

type FollowedCompany = {
  id: number
  name: string
  address: string
  industry: string
  policyCount: number
}

type PolicyChange = {
  id: number
  policyName: string
  changeType: string
  before: string
  after: string
  changedAt: string
}

/** 视觉还原用 Mock 数据，接入后端后替换 */
const companyNames = [
  '河南中科干细胞基因工程有限公司',
  '郑州紫江包装有限公司',
  '众智学府信息技术有限公司',
]
const companyAddresses = [
  '河南省 郑州市 郑州航空港经济综合试验区',
  '河南省 郑州市 郑州高新技术产业开发区',
  '河南省 郑州市 中原区',
]
const policyCounts = [6, 7, 4, 8, 6, 7, 4, 8, 1, 1, 5, 3, 2, 9, 6]

const companyRecords = ref<FollowedCompany[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: companyNames[i % companyNames.length]!,
    address: companyAddresses[i % companyAddresses.length]!,
    industry: '包装制造',
    policyCount: policyCounts[i]!,
  })),
)

const policyNames = [
  '关于组织开展2026年度高新技术企业认定工作的通知',
  '郑州市推进制造业数字化转型专项资金申报指南',
  '关于印发河南省专精特新中小企业培育实施方案的通知',
  '郑州市人工智能创新发展若干措施申报工作安排',
  '关于公开征集2026年重点领域科技攻关需求的通知',
]
const changeTypes = ['申报条件', '支持力度', '申报时间', '依据文件']
const changePairs = [
  ['企业成立满 1 年', '企业成立满 2 年'],
  ['最高补贴 50 万元', '最高补贴 80 万元'],
  ['申报截止 2026/9/30', '申报截止 2026/10/31'],
  ['需提供市级资质', '需提供省级资质'],
] as const

const policyRecords = ref<PolicyChange[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    policyName: policyNames[i % policyNames.length]!,
    changeType: changeTypes[i % changeTypes.length]!,
    before: changePairs[i % changePairs.length]![0],
    after: changePairs[i % changePairs.length]![1],
    changedAt: '2026/8/24 09:15:07',
  })),
)

const activeTab = ref<'company' | 'policy'>('company')
const current = ref(1)
const pageSize = 10

const activeRecords = computed(() =>
  activeTab.value === 'company' ? companyRecords.value : policyRecords.value,
)

const pagedRecords = computed(() =>
  activeRecords.value.slice(
    (current.value - 1) * pageSize,
    current.value * pageSize,
  ),
)

const switchTab = (tab: 'company' | 'policy') => {
  activeTab.value = tab
  current.value = 1
}

const removeCompany = (id: number) => {
  companyRecords.value = companyRecords.value.filter((item) => item.id !== id)
  if (pagedRecords.value.length === 0 && current.value > 1) current.value -= 1
}
</script>

<template>
  <div class="follow-panel">
    <div class="follow-tabs">
      <button
        type="button"
        class="follow-tab"
        :class="{ active: activeTab === 'company' }"
        @click="switchTab('company')"
      >
        企业
      </button>
      <button
        type="button"
        class="follow-tab"
        :class="{ active: activeTab === 'policy' }"
        @click="switchTab('policy')"
      >
        政策
      </button>
    </div>

    <a-table
      class="follow-table"
      :columns="
        activeTab === 'company'
          ? [
              { title: '序号', dataIndex: 'id', width: 48 },
              { title: '企业名称', dataIndex: 'name', ellipsis: true },
              { title: '注册地址', dataIndex: 'address', ellipsis: true },
              { title: '所属行业', dataIndex: 'industry', width: 90 },
              { title: '获取政策数量', dataIndex: 'policyCount', width: 104 },
              { title: '操作', dataIndex: 'action', width: 64 },
            ]
          : [
              { title: '序号', dataIndex: 'id', width: 48 },
              { title: '政策名称', dataIndex: 'policyName', ellipsis: true },
              { title: '变动类型', dataIndex: 'changeType', width: 90 },
              { title: '变动前', dataIndex: 'before', ellipsis: true },
              { title: '变动后', dataIndex: 'after', ellipsis: true },
              { title: '变动时间', dataIndex: 'changedAt', width: 150 },
            ]
      "
      :data-source="pagedRecords"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a
            class="remove-link"
            @click.prevent="removeCompany((record as FollowedCompany).id)"
            >删除</a
          >
        </template>
      </template>
      <template #emptyText>
        <div class="table-empty">
          <img :src="emptyImg" alt="" />
          <p>暂无数据</p>
        </div>
      </template>
    </a-table>

    <div v-if="activeRecords.length > 0" class="table-pagination">
      <span class="table-total">共{{ activeRecords.length }}条</span>
      <a-pagination
        v-model:current="current"
        :total="activeRecords.length"
        :page-size="pageSize"
        :show-size-changer="false"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.follow-tabs {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--pb-line);
}

.follow-tab {
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

.follow-table {
  :deep(.ant-table-cell) {
    padding: 13px 8px;
    font-size: 13px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #ecf3ff;
    color: var(--pb-text);
    font-weight: 600;
  }

  :deep(.ant-table-container) {
    border: 1px solid #dce7f9;
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-inline-end: none;
  }

  :deep(.ant-table-tbody > tr > td:first-child) {
    padding-left: 16px;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f7faff;
  }
}

.remove-link {
  color: var(--pb-primary);
  cursor: pointer;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 0 48px;

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

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0 8px;
}

.table-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--pb-text);
}
</style>
