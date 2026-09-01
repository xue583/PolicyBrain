<script setup lang="ts">
import { computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import type {
  EnterprisePatent,
  EnterpriseSoftwareCopyright,
  EnterpriseTrademark,
  EnterpriseWorkCopyright,
} from '../../mock/enterpriseDb'
import ipPatentBg from '../../assets/enterpriseDb/container-291.png'
import ipTrademarkBg from '../../assets/enterpriseDb/container-293.png'
import ipSoftwareBg from '../../assets/enterpriseDb/container-294.png'
import ipWorkBg from '../../assets/enterpriseDb/container-295.png'

defineOptions({ name: 'EnterpriseIntellectualPropertyPanel' })

const PAGE_SIZE = 10

const props = defineProps<{
  patents: EnterprisePatent[]
  trademarks: EnterpriseTrademark[]
  softwareCopyrights: EnterpriseSoftwareCopyright[]
  workCopyrights: EnterpriseWorkCopyright[]
}>()

const ipTotal = computed(
  () =>
    props.patents.length +
    props.trademarks.length +
    props.softwareCopyrights.length +
    props.workCopyrights.length,
)

const ipSummaryCards = computed(() => [
  {
    key: 'patent',
    count: props.patents.length,
    unit: '项',
    label: '专利',
    bg: ipPatentBg,
  },
  {
    key: 'trademark',
    count: props.trademarks.length,
    unit: '件',
    label: '商标',
    bg: ipTrademarkBg,
  },
  {
    key: 'software',
    count: props.softwareCopyrights.length,
    unit: '件',
    label: '软著',
    bg: ipSoftwareBg,
  },
  {
    key: 'work',
    count: props.workCopyrights.length,
    unit: '件',
    label: '作品著作权',
    bg: ipWorkBg,
  },
])

const { currentPage: patentPage, pagedList: pagedPatents } = usePagination(
  () => props.patents,
  { pageSize: PAGE_SIZE },
)
const { currentPage: trademarkPage, pagedList: pagedTrademarks } =
  usePagination(() => props.trademarks, { pageSize: PAGE_SIZE })
const { currentPage: softwarePage, pagedList: pagedSoftware } = usePagination(
  () => props.softwareCopyrights,
  { pageSize: PAGE_SIZE },
)
const { currentPage: workPage, pagedList: pagedWorks } = usePagination(
  () => props.workCopyrights,
  { pageSize: PAGE_SIZE },
)

const ipPageTotal = (total: number) =>
  `共 ${Math.ceil(total / PAGE_SIZE) || 1} 页`

const patentColumns = [
  { title: '序号', key: 'index', width: 64, align: 'center' as const },
  { title: '专利名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '申请日', dataIndex: 'applyDate', key: 'applyDate', width: 120 },
  { title: '申请号', dataIndex: 'applyNo', key: 'applyNo', width: 156 },
  {
    title: '公开（公告）日',
    dataIndex: 'publishDate',
    key: 'publishDate',
    width: 140,
  },
  {
    title: '公开（公告）号',
    dataIndex: 'publishNo',
    key: 'publishNo',
    width: 150,
  },
  {
    title: '最新法律状态',
    dataIndex: 'legalStatus',
    key: 'legalStatus',
    width: 140,
  },
  { title: '专利类型', dataIndex: 'patentType', key: 'patentType', width: 110 },
]

const trademarkColumns = [
  { title: '序号', key: 'index', width: 64, align: 'center' as const },
  { title: '商标', dataIndex: 'mark', key: 'mark', width: 140 },
  { title: '商标名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate', width: 130 },
  { title: '注册号', dataIndex: 'registerNo', key: 'registerNo', width: 140 },
  { title: '国际分类', dataIndex: 'intlClass', key: 'intlClass', width: 110 },
  { title: '商标状态', dataIndex: 'status', key: 'status', width: 160 },
]

const softwareColumns = [
  { title: '序号', key: 'index', width: 64, align: 'center' as const },
  { title: '软件全称', dataIndex: 'fullName', key: 'fullName', ellipsis: true },
  { title: '软件简称', dataIndex: 'shortName', key: 'shortName', width: 150 },
  {
    title: '登记批准日期',
    dataIndex: 'approveDate',
    key: 'approveDate',
    width: 140,
  },
  { title: '登记号', dataIndex: 'registerNo', key: 'registerNo', width: 150 },
  { title: '分类号', dataIndex: 'classNo', key: 'classNo', width: 130 },
  { title: '版本号', dataIndex: 'version', key: 'version', width: 90 },
  {
    title: '首次发表日期',
    dataIndex: 'firstPublishDate',
    key: 'firstPublishDate',
    width: 140,
  },
]

const workColumns = [
  { title: '序号', key: 'index', width: 64, align: 'center' as const },
  { title: '作品全称', dataIndex: 'fullName', key: 'fullName', ellipsis: true },
  { title: '登记号', dataIndex: 'registerNo', key: 'registerNo', width: 240 },
  { title: '作品类别', dataIndex: 'category', key: 'category', width: 110 },
  {
    title: '创作完成日期',
    dataIndex: 'completeDate',
    key: 'completeDate',
    width: 140,
  },
  {
    title: '登记日期',
    dataIndex: 'registerDate',
    key: 'registerDate',
    width: 140,
  },
  {
    title: '首次发表日期',
    dataIndex: 'firstPublishDate',
    key: 'firstPublishDate',
    width: 140,
  },
]
</script>

<template>
  <div v-if="!ipTotal" class="tab-empty">
    <img :src="ipPatentBg" alt="" />
    <p>暂无知识产权信息</p>
  </div>
  <template v-else>
    <div class="ip-summary">
      <article
        v-for="card in ipSummaryCards"
        :key="card.key"
        class="ip-summary-card"
        :style="{ backgroundImage: `url(${card.bg})` }"
      >
        <p class="ip-summary-value">
          {{ card.count }}
          <span>{{ card.unit }}</span>
        </p>
        <p class="ip-summary-label">{{ card.label }}</p>
      </article>
    </div>

    <section v-if="patents.length" class="ip-section">
      <h2 class="section-title">
        专利
        <em>{{ patents.length }}</em>
        条
      </h2>
      <a-table
        class="db-table"
        bordered
        :columns="patentColumns"
        :data-source="pagedPatents"
        :pagination="false"
        :row-key="(row: EnterprisePatent) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (patentPage - 1) * PAGE_SIZE + index + 1 }}
          </template>
          <template v-else-if="column.key === 'name'">
            <span class="ip-name">{{ record.name }}</span>
          </template>
        </template>
      </a-table>
      <div
        v-if="patents.length > PAGE_SIZE"
        class="pagination-wrap ip-pagination"
      >
        <a-pagination
          v-model:current="patentPage"
          :total="patents.length"
          :page-size="PAGE_SIZE"
          :show-total="ipPageTotal"
        />
      </div>
    </section>

    <section v-if="trademarks.length" class="ip-section">
      <h2 class="section-title">
        商标
        <em>{{ trademarks.length }}</em>
        条
      </h2>
      <a-table
        class="db-table"
        bordered
        :columns="trademarkColumns"
        :data-source="pagedTrademarks"
        :pagination="false"
        :row-key="(row: EnterpriseTrademark) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (trademarkPage - 1) * PAGE_SIZE + index + 1 }}
          </template>
          <template v-else-if="column.key === 'mark'">
            <span class="tm-mark">{{ record.mark }}</span>
          </template>
        </template>
      </a-table>
      <div
        v-if="trademarks.length > PAGE_SIZE"
        class="pagination-wrap ip-pagination"
      >
        <a-pagination
          v-model:current="trademarkPage"
          :total="trademarks.length"
          :page-size="PAGE_SIZE"
          :show-total="ipPageTotal"
        />
      </div>
    </section>

    <section v-if="softwareCopyrights.length" class="ip-section">
      <h2 class="section-title">
        软件著作权
        <em>{{ softwareCopyrights.length }}</em>
        条
      </h2>
      <a-table
        class="db-table"
        bordered
        :columns="softwareColumns"
        :data-source="pagedSoftware"
        :pagination="false"
        :row-key="(row: EnterpriseSoftwareCopyright) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.key === 'index'">
            {{ (softwarePage - 1) * PAGE_SIZE + index + 1 }}
          </template>
        </template>
      </a-table>
      <div
        v-if="softwareCopyrights.length > PAGE_SIZE"
        class="pagination-wrap ip-pagination"
      >
        <a-pagination
          v-model:current="softwarePage"
          :total="softwareCopyrights.length"
          :page-size="PAGE_SIZE"
          :show-total="ipPageTotal"
        />
      </div>
    </section>

    <section v-if="workCopyrights.length" class="ip-section">
      <h2 class="section-title">
        作品著作权
        <em>{{ workCopyrights.length }}</em>
        条
      </h2>
      <a-table
        class="db-table"
        bordered
        :columns="workColumns"
        :data-source="pagedWorks"
        :pagination="false"
        :row-key="(row: EnterpriseWorkCopyright) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.key === 'index'">
            {{ (workPage - 1) * PAGE_SIZE + index + 1 }}
          </template>
        </template>
      </a-table>
      <div
        v-if="workCopyrights.length > PAGE_SIZE"
        class="pagination-wrap ip-pagination"
      >
        <a-pagination
          v-model:current="workPage"
          :total="workCopyrights.length"
          :page-size="PAGE_SIZE"
          :show-total="ipPageTotal"
        />
      </div>
    </section>
  </template>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: #262626;
  background: var(--section-title-bg) no-repeat left center;
  background-size: 94px 26px;

  em {
    font-style: normal;
    color: var(--pb-primary);
  }
}

.ip-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.ip-summary-card {
  min-height: 133px;
  padding: 20px 96px 16px 22px;
  overflow: hidden;
  border-radius: 12px;
  background-color: #eaf4ff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.ip-summary-value {
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.15;
  color: #0e5dd8;

  span {
    margin-left: 4px;
    font-size: 16px;
    font-weight: 400;
    color: #333333;
  }
}

.ip-summary-label {
  margin: 8px 0 0;
  font-size: 22px;
  line-height: 1.4;
  color: #333333;
}

.ip-section {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ip-name {
  color: var(--pb-primary);
}

.tm-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  max-width: 120px;
  padding: 6px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
  color: #262626;
  font-size: 12px;
  line-height: 1.3;
  text-align: center;
  word-break: break-all;
}

.pagination-wrap {
  --pagination-padding: 20px 0 0;

  &.ip-pagination {
    --pagination-justify: flex-end;
  }
}

.tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
  color: #8c8c8c;

  img {
    width: min(420px, 100%);
    height: auto;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
  }
}

@include below-lg {
  .ip-summary {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
