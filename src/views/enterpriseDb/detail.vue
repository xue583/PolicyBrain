<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { HeartFilled, LeftOutlined } from '@ant-design/icons-vue'
import {
  enterpriseStatusText,
  getEnterpriseDetail,
  type EnterprisePatent,
  type EnterprisePolicyRecord,
  type EnterpriseSoftwareCopyright,
  type EnterpriseTrademark,
  type EnterpriseWorkCopyright,
} from '../../mock/enterpriseDb'
import QualificationPanel from './QualificationPanel.vue'
import ContactPanel from './ContactPanel.vue'
import ProductIndustryPanel from './ProductIndustryPanel.vue'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import titleStyleBg from '../../assets/home/title-style.png'
import vipMatchImg from '../../assets/enterpriseDb/container-229.png'
import phoneIcon from '../../assets/enterpriseDb/phone.png'
import linkIcon from '../../assets/enterpriseDb/container.png'
import expandIcon from '../../assets/enterpriseDb/container-alt.png'
import ipPatentBg from '../../assets/enterpriseDb/container-291.png'
import ipTrademarkBg from '../../assets/enterpriseDb/container-293.png'
import ipSoftwareBg from '../../assets/enterpriseDb/container-294.png'
import ipWorkBg from '../../assets/enterpriseDb/container-295.png'

defineOptions({ name: 'EnterpriseDbDetail' })

const FOLLOW_KEY = 'pb_followed_enterprise_db'
const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const enterpriseId = computed(() => Number(route.params.id))
const enterprise = computed(() => getEnterpriseDetail(enterpriseId.value))

const activeTab = ref('policies')
const followed = ref(false)
const scopeExpanded = ref(false)
const policyPage = ref(1)
const patentPage = ref(1)
const trademarkPage = ref(1)
const softwarePage = ref(1)
const workPage = ref(1)

const loadFollowedIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

const syncFollowed = () => {
  followed.value = loadFollowedIds().includes(enterpriseId.value)
}

watch(
  enterpriseId,
  () => {
    activeTab.value = 'policies'
    scopeExpanded.value = false
    policyPage.value = 1
    patentPage.value = 1
    trademarkPage.value = 1
    softwarePage.value = 1
    workPage.value = 1
    syncFollowed()
  },
  { immediate: true },
)

const regionLine = computed(() => {
  const item = enterprise.value
  if (!item) return ''
  return `${item.province}·${item.city}·${item.district}`
})

const pagedPolicies = computed(() => {
  const list = enterprise.value?.policyRecords ?? []
  const start = (policyPage.value - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
})

const pageOf = <T,>(list: T[], page: number) => {
  const start = (page - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
}

const ipTotal = computed(() => {
  const item = enterprise.value
  if (!item) return 0
  return (
    item.patents.length +
    item.trademarks.length +
    item.softwareCopyrights.length +
    item.workCopyrights.length
  )
})

const ipSummaryCards = computed(() => {
  const item = enterprise.value
  if (!item) return []
  return [
    {
      key: 'patent',
      count: item.patents.length,
      unit: '项',
      label: '专利',
      bg: ipPatentBg,
    },
    {
      key: 'trademark',
      count: item.trademarks.length,
      unit: '件',
      label: '商标',
      bg: ipTrademarkBg,
    },
    {
      key: 'software',
      count: item.softwareCopyrights.length,
      unit: '件',
      label: '软著',
      bg: ipSoftwareBg,
    },
    {
      key: 'work',
      count: item.workCopyrights.length,
      unit: '件',
      label: '作品著作权',
      bg: ipWorkBg,
    },
  ]
})

const pagedPatents = computed(() =>
  pageOf(enterprise.value?.patents ?? [], patentPage.value),
)
const pagedTrademarks = computed(() =>
  pageOf(enterprise.value?.trademarks ?? [], trademarkPage.value),
)
const pagedSoftware = computed(() =>
  pageOf(enterprise.value?.softwareCopyrights ?? [], softwarePage.value),
)
const pagedWorks = computed(() =>
  pageOf(enterprise.value?.workCopyrights ?? [], workPage.value),
)

const ipPageTotal = (total: number) =>
  `共 ${Math.ceil(total / PAGE_SIZE) || 1} 页`

const industryPath = computed(() => {
  const item = enterprise.value
  if (!item) return ''
  return [
    ...new Set([item.industry, item.businessIndustry].filter(Boolean)),
  ].join('、')
})

const bizLabelStyle = {
  background: '#f4f7fc',
  color: '#595959',
}

const policyColumns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  { title: '政策名称', key: 'name', ellipsis: true },
  { title: '政策级别', dataIndex: 'grade', key: 'grade', width: 120 },
  { title: '扶持金额(万元)', dataIndex: 'amount', key: 'amount', width: 140 },
  { title: '项目备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  {
    title: '年度',
    dataIndex: 'year',
    key: 'year',
    width: 90,
    align: 'center' as const,
  },
  { title: '发布单位', dataIndex: 'department', key: 'department', width: 140 },
]

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

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'enterprise-db' })
}

const toggleFollow = () => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  const ids = loadFollowedIds()
  const next = followed.value
    ? ids.filter((id) => id !== enterpriseId.value)
    : [...ids, enterpriseId.value]
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(next))
  followed.value = !followed.value
  message.success(followed.value ? '关注成功' : '已取消关注')
}

const onPolicyMatch = () => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  message.info('政策匹配功能即将上线')
}

const openWebsite = () => {
  const raw = enterprise.value?.website
  if (!raw) return
  const first = raw.split(',')[0]?.trim()
  if (!first) return
  const url = /^https?:\/\//i.test(first) ? first : `https://${first}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="enterprise-detail">
    <nav class="crumb-row">
      <div class="breadcrumb">
        <button type="button" class="back-btn" @click="goList">
          <LeftOutlined />
        </button>
        <div class="breadcrumb-trail">
          <a @click="goHome">首页</a>
          <span class="sep">&gt;</span>
          <a @click="goList">企业数据库</a>
          <span class="sep">&gt;</span>
          <span class="current">{{ enterprise?.name ?? '企业详情' }}</span>
        </div>
      </div>
    </nav>

    <a-empty v-if="!enterprise" description="未找到该企业" />

    <template v-else>
      <a-card class="detail-card header-card" :bordered="false">
        <div class="profile-top">
          <div class="ent-logo">{{ enterprise.shortName }}</div>
          <div class="profile-main">
            <h1 class="ent-title">{{ enterprise.name }}</h1>
            <div class="honor-tags">
              <span
                v-for="tag in enterprise.honorTags"
                :key="tag.text"
                class="honor-tag"
                :class="tag.tone"
              >
                {{ tag.text }}
              </span>
            </div>
            <p class="sub-line">
              {{ regionLine }}
              <span class="dot">|</span>
              {{ enterprise.businessIndustry }}
              <span class="dot">|</span>
              {{ enterprise.staffCount }}人
            </p>
          </div>

          <div class="profile-aside">
            <div class="action-row">
              <a-button
                class="follow-btn"
                :class="{ followed }"
                type="primary"
                ghost
                @click="toggleFollow"
              >
                <template #icon>
                  <HeartFilled v-if="followed" />
                  <img
                    v-else
                    :src="followHeartIcon"
                    alt=""
                    class="follow-icon"
                  />
                </template>
                {{ followed ? '已关注' : '关注企业' }}
              </a-button>
              <button
                type="button"
                class="vip-match-btn"
                @click="onPolicyMatch"
              >
                <img :src="vipMatchImg" alt="VIP 政策匹配" />
              </button>
            </div>

            <div class="stats-box">
              <div class="stat">
                <span class="stat-label">已获政策：</span>
                <em>{{ enterprise.policyCount }}</em>
                <span class="stat-unit">项</span>
              </div>
              <div class="stat">
                <span class="stat-label">公示金额：</span>
                <em>{{ enterprise.publicityAmount }}</em>
                <span class="stat-unit">万元</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <p class="info-item">
            <span class="info-label">法定代表人：</span>
            <span class="info-value">{{ enterprise.legalRep }}</span>
          </p>
          <p class="info-item">
            <span class="info-label">统一社会信用代码：</span>
            <span class="info-value">{{ enterprise.creditCode }}</span>
          </p>
          <p class="info-item">
            <span class="info-label">成立日期：</span>
            <span class="info-value">{{ enterprise.foundedDate }}</span>
          </p>
          <p class="info-item">
            <span class="info-label">注册资本：</span>
            <span class="info-value"
              >{{ enterprise.registeredCapital }}万元</span
            >
          </p>
          <p class="info-item">
            <span class="info-label">企业类型：</span>
            <span class="info-value">{{ enterprise.enterpriseType }}</span>
          </p>
          <p class="info-item">
            <span class="info-label">人员规模：</span>
            <span class="info-value">{{ enterprise.staffScale }}</span>
          </p>
          <p class="info-item">
            <span class="info-label">经营状态：</span>
            <span class="info-value status" :class="enterprise.status">
              {{ enterpriseStatusText[enterprise.status] }}
            </span>
          </p>
          <p class="info-item">
            <span class="info-label">电话：</span>
            <span class="info-value phone-value">
              <img :src="phoneIcon" alt="" class="field-icon" />
              {{ enterprise.phone }}
            </span>
          </p>
          <p class="info-item">
            <span class="info-label">网站：</span>
            <span class="info-value">
              <a
                v-if="enterprise.website"
                class="site-link"
                @click="openWebsite"
              >
                <img :src="linkIcon" alt="" class="field-icon link-icon" />
                {{ enterprise.website }}
              </a>
              <span v-else>—</span>
            </span>
          </p>
          <p class="info-item scope-item">
            <span class="info-label">经营范围：</span>
            <span class="info-value scope-value">
              <span :class="{ clamped: !scopeExpanded }">
                {{ enterprise.businessScope }}
              </span>
              <a class="expand-link" @click="scopeExpanded = !scopeExpanded">
                {{ scopeExpanded ? '收起' : '展开' }}
                <img
                  :src="expandIcon"
                  alt=""
                  :class="{ rotated: scopeExpanded }"
                />
              </a>
            </span>
          </p>
        </div>
      </a-card>

      <a-card
        class="detail-card content-card"
        :bordered="false"
        :style="{ '--section-title-bg': `url(${titleStyleBg})` }"
      >
        <a-tabs
          v-model:activeKey="activeTab"
          class="detail-tabs"
          :tab-bar-gutter="0"
        >
          <a-tab-pane key="policies" tab="已获政策">
            <h2 class="section-title">
              政策扶持记录
              <em>{{ enterprise.policyRecords.length }}</em>
              条
            </h2>
            <a-table
              class="db-table"
              bordered
              :columns="policyColumns"
              :data-source="pagedPolicies"
              :pagination="false"
              :row-key="(row: EnterprisePolicyRecord) => row.id"
              size="middle"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'index'">
                  {{ (policyPage - 1) * PAGE_SIZE + index + 1 }}
                </template>
                <template v-else-if="column.key === 'name'">
                  <router-link
                    class="policy-link"
                    :to="{
                      name: 'policy-db-detail',
                      params: { id: String(record.policyId) },
                    }"
                  >
                    {{ record.name }}
                  </router-link>
                </template>
              </template>
            </a-table>
            <div class="pagination-wrap">
              <a-pagination
                v-model:current="policyPage"
                :total="enterprise.policyRecords.length"
                :page-size="PAGE_SIZE"
                :show-total="(t: number) => `共 ${t} 条`"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="business" tab="工商信息">
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
                {{ enterprise.registeredCapital }}万元
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
          </a-tab-pane>

          <a-tab-pane key="ip">
            <template #tab>
              知识产权
              <span class="tab-count">{{ ipTotal }}</span>
            </template>
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

              <section v-if="enterprise.patents.length" class="ip-section">
                <h2 class="section-title">
                  专利
                  <em>{{ enterprise.patents.length }}</em>
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
                  v-if="enterprise.patents.length > PAGE_SIZE"
                  class="pagination-wrap ip-pagination"
                >
                  <a-pagination
                    v-model:current="patentPage"
                    :total="enterprise.patents.length"
                    :page-size="PAGE_SIZE"
                    :show-total="ipPageTotal"
                  />
                </div>
              </section>

              <section v-if="enterprise.trademarks.length" class="ip-section">
                <h2 class="section-title">
                  商标
                  <em>{{ enterprise.trademarks.length }}</em>
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
                  v-if="enterprise.trademarks.length > PAGE_SIZE"
                  class="pagination-wrap ip-pagination"
                >
                  <a-pagination
                    v-model:current="trademarkPage"
                    :total="enterprise.trademarks.length"
                    :page-size="PAGE_SIZE"
                    :show-total="ipPageTotal"
                  />
                </div>
              </section>

              <section
                v-if="enterprise.softwareCopyrights.length"
                class="ip-section"
              >
                <h2 class="section-title">
                  软件著作权
                  <em>{{ enterprise.softwareCopyrights.length }}</em>
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
                  v-if="enterprise.softwareCopyrights.length > PAGE_SIZE"
                  class="pagination-wrap ip-pagination"
                >
                  <a-pagination
                    v-model:current="softwarePage"
                    :total="enterprise.softwareCopyrights.length"
                    :page-size="PAGE_SIZE"
                    :show-total="ipPageTotal"
                  />
                </div>
              </section>

              <section
                v-if="enterprise.workCopyrights.length"
                class="ip-section"
              >
                <h2 class="section-title">
                  作品著作权
                  <em>{{ enterprise.workCopyrights.length }}</em>
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
                  v-if="enterprise.workCopyrights.length > PAGE_SIZE"
                  class="pagination-wrap ip-pagination"
                >
                  <a-pagination
                    v-model:current="workPage"
                    :total="enterprise.workCopyrights.length"
                    :page-size="PAGE_SIZE"
                    :show-total="ipPageTotal"
                  />
                </div>
              </section>
            </template>
          </a-tab-pane>

          <a-tab-pane key="qualifications">
            <template #tab>
              资质证书
              <span class="tab-count">{{
                enterprise.qualifications.length
              }}</span>
            </template>
            <QualificationPanel
              :key="enterprise.id"
              :qualifications="enterprise.qualifications"
              :personnel="enterprise.qualificationPersonnel"
              :reviews="enterprise.qualificationReviews"
            />
          </a-tab-pane>

          <a-tab-pane key="contact" tab="联系方式">
            <ContactPanel
              :key="enterprise.id"
              :contacts="enterprise.contacts"
              :email="enterprise.email"
              :website="enterprise.website"
              :address="enterprise.businessInfo.registeredAddress"
            />
          </a-tab-pane>

          <a-tab-pane key="products" tab="产品/产业">
            <ProductIndustryPanel
              :key="enterprise.id"
              :products="enterprise.products"
              :industry-chains="enterprise.industryChains"
              :basis="enterprise.productBasis"
              :credibility="enterprise.productCredibility"
            />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
.enterprise-detail {
  min-height: 480px;
}

.crumb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  font-size: 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #595959;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &:hover {
    color: var(--pb-primary);
  }
}

.breadcrumb-trail {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
  min-width: 0;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  a {
    color: var(--pb-primary);
    cursor: pointer;

    &:hover {
      color: #4096ff;
    }
  }

  .sep {
    color: #bfbfbf;
  }

  .current {
    color: #595959;
  }
}

.crumb-follow {
  flex-shrink: 0;
}

.detail-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-card-body) {
    padding: 28px 32px;
  }

  &.header-card {
    margin-bottom: 16px;
  }

  &.content-card {
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 0;
    }
  }
}

.profile-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ent-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.ent-title {
  margin: 0 0 14px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
  color: #1f1f1f;
}

.honor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.honor-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;

  &.blue {
    color: var(--pb-primary);
    background: #e6f4ff;
    border: 1px solid #91caff;
  }

  &.orange {
    color: #d46b08;
    background: #fff7e6;
    border: 1px solid #ffd591;
  }
}

.sub-line {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.6;

  .dot {
    margin: 0 8px;
    color: #d9d9d9;
  }
}

.profile-aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.stats-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 36px;
  width: 438px;
  height: 56px;
  padding: 0 28px 0 48px;
  background: url('../../assets/enterpriseDb/container-599.png') no-repeat
    center / 100% 100%;
}

.stat {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
}

.stat-label,
.stat-unit {
  color: #262626;
  font-size: 14px;
  line-height: 1;
}

.stat em {
  margin: 0 2px;
  font-style: normal;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--pb-primary);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.follow-btn {
  height: 40px;
  padding-inline: 18px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .follow-icon {
    width: 16px;
    height: 16px;
    display: block;
  }
}

.crumb-follow.followed {
  color: #fff;
  background: var(--pb-primary);
  border-color: var(--pb-primary);
}

.vip-match-btn {
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    height: 40px;
    width: auto;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px 24px;
  margin-top: 22px;
  padding: 22px 26px;
  border-top: 1px solid #f0f0f0;
  background: #f4f7fc;
}

.info-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.info-label {
  flex-shrink: 0;
  width: 120px;
  color: #8c8c8c;
}

.info-value {
  min-width: 0;
  color: #262626;
  word-break: break-all;

  &.status.active {
    color: #52c41a;
  }
}

.phone-value,
.site-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.field-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.link-icon {
  width: 16px;
  height: 16px;
}

.site-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}

.scope-item {
  grid-column: 1 / -1;
}

.scope-value {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;

  .clamped {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }
}

.expand-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--pb-primary);
  white-space: nowrap;

  img {
    width: 14px;
    height: 14px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.detail-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;

    &::before {
      border-bottom: none;
    }
  }

  :deep(.ant-tabs-nav-wrap) {
    overflow: hidden;
  }

  :deep(.ant-tabs-nav-list) {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-nav-operations) {
    display: none;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    justify-content: center;
    margin: 0;
    padding: 16px 8px;
    font-size: 16px;
    color: #262626;
    background: #fff;
    position: relative;

    + .ant-tabs-tab {
      border-left: 1px solid #e8e8e8;
    }

    .ant-tabs-tab-btn {
      color: inherit;
    }

    &:hover {
      color: var(--pb-primary);
    }

    &.ant-tabs-tab-active {
      color: var(--pb-primary);
      font-weight: 600;
      background: linear-gradient(
        180deg,
        rgba(174, 205, 255, 0.57) 0%,
        rgba(174, 205, 255, 0) 100%
      );

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--pb-primary);
      }
    }
  }

  :deep(.ant-tabs-ink-bar) {
    display: none;
  }

  :deep(.ant-tabs-content-holder) {
    padding: 20px 36px 28px;
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 1px 5px 4px;
  background: url('../../assets/enterpriseDb/tips.png') no-repeat center / 100%
    100%;
  color: var(--pb-primary);
  font-size: 12px;
  font-weight: 600;
}

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

.db-table {
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #fff;

  :deep(.ant-table) {
    font-size: 15px;
    background: #fff;
    overflow: hidden;
    border-radius: 12px;
  }

  :deep(.ant-table-container) {
    overflow: hidden;
    border: none !important;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 15px;
    font-weight: 600;
    border-color: #e8e8e8 !important;
    padding: 16px 18px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 15px;
    background: #fff !important;
    border-color: #e8e8e8 !important;
    vertical-align: middle;
    padding: 16px 18px !important;
  }
}

.policy-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 0;

  &.ip-pagination {
    justify-content: flex-end;
  }
}

.biz-descriptions {
  :deep(.ant-descriptions-view) {
    border-color: #e8e8e8;
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
    width: 168px;
  }

  :deep(.ant-descriptions-item-content) {
    color: #262626;
    background: #fff;
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

@media (max-width: 992px) {
  .profile-top,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .ip-summary {
    grid-template-columns: 1fr 1fr;
  }

  .profile-top {
    flex-direction: column;
  }

  .profile-aside,
  .stats-box {
    width: 100%;
  }

  .info-label {
    width: 110px;
  }

  .detail-tabs {
    :deep(.ant-tabs-content-holder) {
      padding: 16px 16px 20px;
    }
  }
}
</style>
