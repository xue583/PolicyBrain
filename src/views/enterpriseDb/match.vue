<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import type { BreadcrumbItem } from '@/components/BreadcrumbNav.vue'
import PageState from '@/components/PageState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useFollowable } from '@/composables/useFollowable'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import { downloadCsv } from '@/utils/downloadCsv'
import { fetchEnterprisePage, fetchEnterpriseRaw } from '@/api/enterprises'
import { fetchEntToPolicy } from '@/api/match'
import { mapEnterpriseDetail, readIpCounts } from '@/api/mapPortal'
import { toErrorMessage } from '@/utils/apiError'
import type { EnterpriseDetail } from '../../mock/enterpriseDb'
import {
  matchPolicyStatusText,
  type MatchPolicy,
  type MatchPolicyStatus,
} from '../../mock/enterpriseDb/matchPolicies'
import buildingIcon from '../../assets/enterpriseDb/match/icon-building.png'
import exportImg from '../../assets/enterpriseDb/match/btn-export.png'
import tagIcon from '../../assets/enterpriseDb/match/icon-tag.png'
import matchIcon from '../../assets/enterpriseDb/match/icon-match.png'
import publisherIcon from '../../assets/enterpriseDb/match/icon-publisher.png'
import starIcon from '../../assets/enterpriseDb/match/icon-star.png'
import amountIcon from '../../assets/enterpriseDb/match/icon-amount.png'
import emptyNews from '@/assets/home/empty-news.png'

defineOptions({ name: 'EnterprisePolicyMatch' })

const FOLLOW_KEY = 'pb_followed_enterprise_db'
const PAGE_SIZE = 8
/** 实测 PageSize 超过 200 会被截断，与 Swagger 的 MaxPageSize 一致 */
const SEARCH_PAGE_SIZE = 200

const statusColor: Record<MatchPolicyStatus, string> = {
  expired: 'error',
  idle: 'default',
  public: 'processing',
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const enterpriseId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : 0
})
const enterprise = ref<EnterpriseDetail | null>(null)
const policies = ref<MatchPolicy[]>([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const total = ref(0)
const pageSize = PAGE_SIZE
const ipCounts = ref({ patent: 0, brand: 0, software: 0, work: 0, policy: 0 })
const { followed, toggleFollow } = useFollowable(FOLLOW_KEY, enterpriseId)

const keywordDraft = ref('')
const followedPolicyIds = ref<number[]>([])

let loadSeq = 0

const loadEnterprise = async (id: number) => {
  const raw = await fetchEnterpriseRaw(id)
  ipCounts.value = {
    ...readIpCounts(raw),
    policy: ipCounts.value.policy,
  }
  enterprise.value = mapEnterpriseDetail(raw, {
    policyCount: ipCounts.value.policy,
  })
}

const loadPolicies = async (id: number) => {
  if (!isLoggedIn.value) {
    policies.value = []
    total.value = 0
    error.value = '登录后可查看匹配政策'
    return
  }
  const page = await fetchEntToPolicy(id, {
    pageIndex: currentPage.value,
    pageSize: PAGE_SIZE,
  })
  policies.value = page.items
  total.value = page.totalElements
  ipCounts.value = { ...ipCounts.value, policy: page.totalElements }
  if (enterprise.value) enterprise.value.policyCount = page.totalElements
}

const load = async () => {
  const id = enterpriseId.value
  if (!id) {
    enterprise.value = null
    policies.value = []
    total.value = 0
    error.value = ''
    loading.value = false
    return
  }
  const seq = ++loadSeq
  loading.value = true
  error.value = ''
  try {
    if (enterprise.value?.id !== id) await loadEnterprise(id)
    if (seq !== loadSeq) return
    await loadPolicies(id)
  } catch (err) {
    if (seq !== loadSeq) return
    policies.value = []
    total.value = 0
    if (!enterprise.value || enterprise.value.id !== id) enterprise.value = null
    error.value = toErrorMessage(err, '匹配结果加载失败')
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

watch(
  [enterpriseId, isLoggedIn],
  () => {
    followedPolicyIds.value = []
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    void load()
  },
  { immediate: true },
)

watch(currentPage, () => {
  void load()
})

const stats = computed(() => {
  if (!enterprise.value) return []
  const counts = ipCounts.value
  const rows: Array<{ label: string; value: string; hot?: boolean }> = [
    { label: '注册商标', value: String(counts.brand) },
    { label: '专利', value: String(counts.patent) },
    { label: '软件著作权', value: String(counts.software) },
    { label: '作品', value: String(counts.work) },
    { label: '匹配政策', value: String(counts.policy) },
  ]
  return rows
})

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'enterprise-db' })
}

const goDetail = () => {
  if (!enterprise.value) {
    goList()
    return
  }
  void router.push({
    name: 'enterprise-db-detail',
    params: { id: String(enterprise.value.id) },
  })
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { label: '首页', onClick: goHome },
    { label: '企业数据库', onClick: goList },
  ]
  if (enterprise.value) {
    items.push({ label: enterprise.value.name, onClick: goDetail })
  }
  items.push({ label: '匹配政策' })
  return items
})

const applySearch = async () => {
  const keyword = keywordDraft.value.trim()
  if (!keyword) {
    message.info('请输入企业关键词进行搜索')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const page = await fetchEnterprisePage({
      keyword,
      pageIndex: 1,
      pageSize: 10,
    })
    const target =
      page.items.find((item) => item.name === keyword) ?? page.items[0]
    if (!target) {
      message.warning('未找到该企业')
      return
    }
    if (target.id === enterpriseId.value) {
      currentPage.value = 1
      await load()
      return
    }
    await router.push({
      name: 'enterprise-db-match',
      params: { id: String(target.id) },
    })
  } catch (err) {
    message.warning(toErrorMessage(err, '企业查询失败，请稍后重试'))
  } finally {
    if (!enterpriseId.value) loading.value = false
  }
}

const isPolicyFollowed = (id: number) => followedPolicyIds.value.includes(id)

const togglePolicyFollow = (item: MatchPolicy) => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  followedPolicyIds.value = isPolicyFollowed(item.id)
    ? followedPolicyIds.value.filter((id) => id !== item.id)
    : [...followedPolicyIds.value, item.id]
}

const exportReport = async () => {
  const current = enterprise.value
  if (!current) return
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  let page
  try {
    page = await fetchEntToPolicy(current.id, {
      pageIndex: 1,
      pageSize: SEARCH_PAGE_SIZE,
    })
  } catch (err) {
    message.error(toErrorMessage(err, '导出失败'))
    return
  }
  const rows = page.items
  if (!rows.length) {
    message.warning('暂无可导出的匹配政策')
    return
  }
  downloadCsv(`${current.name}-匹配政策.csv`, [
    [
      '政策名称',
      '政策等级',
      '匹配度',
      '发布单位',
      '政策状态',
      '最高金额(万元)',
    ],
    ...rows.map((item) => [
      item.name,
      item.grade,
      String(item.score),
      item.department,
      matchPolicyStatusText[item.status],
      item.maxAmount == null ? '' : String(item.maxAmount),
    ]),
  ])
  message.success('报告已导出')
}
</script>

<template>
  <div class="match-page">
    <section class="hero-stage">
      <div class="hero-inner">
        <BreadcrumbNav
          :items="breadcrumbItems"
          @back="enterprise ? goDetail() : goList()"
        />
        <div class="hero-copy">
          <div class="hero-heading">
            <h1>企业找政策（匹配政策）</h1>
            <p>目前已有22条国家级政策、397条省级政策、809条市级政策加入匹配</p>
          </div>
          <form class="search-box" @submit.prevent="applySearch">
            <input
              v-model="keywordDraft"
              type="search"
              placeholder="请输入企业关键词进行搜索"
              aria-label="搜索企业"
              autocomplete="off"
            />
            <button type="submit" class="search-btn">
              <SearchOutlined />
              搜索
            </button>
          </form>
        </div>

        <article v-if="enterprise" class="company-card">
          <div class="company-top">
            <h2>
              <img :src="buildingIcon" alt="" />
              {{ enterprise.name }}
            </h2>
            <div class="company-actions">
              <button type="button" class="export-btn" @click="exportReport">
                <img :src="exportImg" alt="导出报告" />
              </button>
              <button
                type="button"
                class="follow-chip"
                :class="{ on: followed }"
                @click="toggleFollow"
              >
                {{ followed ? '已关注' : '+ 关注' }}
              </button>
            </div>
          </div>
          <div class="stats">
            <span v-for="item in stats" :key="item.label">
              {{ item.label }}：<em :class="{ hot: item.hot }">{{
                item.value
              }}</em>
            </span>
          </div>
        </article>
      </div>
    </section>

    <PageState
      :loading="Boolean(enterpriseId) && loading && !enterprise"
      :error="enterpriseId && !enterprise ? error : ''"
      :empty="
        enterpriseId && !loading && !error && !enterprise ? '未找到该企业' : ''
      "
      @retry="load"
    >
      <section v-if="!enterpriseId" class="result-card">
        <div v-if="loading" class="result-empty">加载中...</div>
        <EmptyState
          v-else
          class="match-empty"
          :image="emptyNews"
          :image-width="202"
          text="请输入企业关键词进行搜索"
        />
      </section>
      <section v-else-if="enterprise" class="result-card">
        <ResultCountBar
          class="result-head"
          prefix="共查到"
          :total="total"
          unit="条记录"
          decorated
        />

        <div v-if="error" class="result-empty">
          {{ error }}
        </div>
        <div v-else-if="loading" class="result-empty">加载中...</div>
        <EmptyState
          v-else-if="!policies.length"
          class="match-empty"
          :image="emptyNews"
          :image-width="202"
          text="暂无匹配政策"
        />

        <article
          v-for="item in policies"
          :key="item.id"
          class="policy-row"
          :class="{ highlight: item.highlight }"
        >
          <div class="policy-main">
            <h3>
              {{ item.name }}
              <span v-if="item.badge" class="badge" :class="item.badge.tone">
                {{ item.badge.text }}
              </span>
            </h3>
            <div class="meta">
              <span class="meta-item">
                <img :src="tagIcon" alt="" />
                政策等级：{{ item.grade }}
              </span>
              <span class="meta-item">
                <img :src="matchIcon" alt="" />
                匹配度：
                <img class="star" :src="starIcon" alt="" />
                <em>{{ item.score }}分</em>
              </span>
              <span class="meta-item">
                <img :src="publisherIcon" alt="" />
                <span class="dept-text">发布单位：{{ item.department }}</span>
              </span>
              <span class="meta-item">
                <img :src="tagIcon" alt="" />
                政策状态：
                <a-tag class="status-tag" :color="statusColor[item.status]">
                  {{ matchPolicyStatusText[item.status] }}
                </a-tag>
              </span>
            </div>
            <p v-if="item.incubatorNote" class="incubator">
              <span>孵化器项</span> | {{ item.incubatorNote }}
            </p>
          </div>

          <div class="policy-side">
            <button
              type="button"
              class="follow-chip"
              :class="{ on: isPolicyFollowed(item.id) }"
              @click="togglePolicyFollow(item)"
            >
              {{ isPolicyFollowed(item.id) ? '已关注' : '+ 关注' }}
            </button>
            <div v-if="item.maxAmount != null" class="amount">
              <div class="amount-main">
                <img :src="amountIcon" alt="" />
                <span>最高金额：</span>
                <strong>{{ item.maxAmount }}</strong>
                <span>万元</span>
              </div>
              <p
                v-for="line in item.amountLines"
                :key="line"
                class="amount-line"
              >
                {{ line }}
              </p>
            </div>
          </div>
        </article>

        <PaginationBar
          v-if="total > pageSize"
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
        />
      </section>
    </PageState>
  </div>
</template>

<style scoped lang="scss">
.match-page {
  min-height: 480px;
  // 抵消详情内容区顶部留白，标题贴着页头下的页面背景
  margin-top: -24px;
}

.hero-stage {
  position: relative;
  z-index: 1;
}

.hero-inner {
  position: relative;
  z-index: 1;
  padding: 24px 0 22px;
}

.hero-heading {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--pb-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #8c8c8c;
  }
}

.search-box {
  display: flex;
  align-items: center;
  width: 722px;
  max-width: 100%;
  height: 50px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.12);

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: #262626;
    padding: 0 16px;

    &::placeholder {
      color: #bfbfbf;
    }

    &::-webkit-search-cancel-button {
      appearance: none;
    }
  }
}

.search-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  height: 100%;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: var(--pb-primary-hover);
  }
}

.company-card {
  margin-top: 22px;
  padding: 16px 22px 14px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(31, 56, 88, 0.06);
}

.company-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1f1f1f;

    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
  }
}

.company-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
}

.export-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    height: 36px;
    width: auto;
  }
}

.follow-chip {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--pb-primary);
  border-radius: 4px;
  background: #fff;
  color: var(--pb-primary);
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: #e6f4ff;
  }

  &.on {
    background: var(--pb-primary);
    color: #fff;
  }
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  margin-top: 14px;
  padding-top: 12px;
  font-size: 16px;
  color: #8c8c8c;
  background: #f4f7fc;
  padding: 13px 23px;

  em {
    font-style: normal;
    font-weight: 600;
    color: #434343;

    &.hot {
      color: #ff7a1a;
    }
  }
}

.result-card {
  margin-top: 16px;
  padding: 18px 8px 8px;
  background: #fff;
  border-radius: 20px;
  box-shadow: var(--pb-shadow-card);
  overflow: hidden;
}

.result-head {
  display: inline-flex;
  margin: 0 16px 10px;
  --rc-color: #343434;
  font-size: 18px;
}

.result-empty {
  padding: 48px 16px;
  color: #8c8c8c;
  text-align: center;
}

.match-empty {
  --empty-gap: 12px;
  --empty-padding: 24px 0 32px;
  --empty-text-size: 16px;
  --empty-text-weight: 400;
  --empty-text-color: #8c8c8c;
}

.policy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px;
  border-top: 1px solid #f2f2f2;
  margin-top: 10px;

  &.highlight {
    background: linear-gradient(
      270deg,
      #ffece3 0%,
      rgba(255, 246, 237, 0) 100%
    );
  }
}

.policy-main {
  flex: 1;
  min-width: 0;
}

.policy-main h3 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f1f1f;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 2px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;

  &.blue {
    background: #1677ff;
  }

  &.green {
    background: #21b36a;
  }
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  min-width: 0;
}

.meta-item {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 14px;
  white-space: nowrap;

  img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  em {
    font-style: normal;
    font-weight: 600;
    color: #ff8c1a;
  }
}

.star {
  width: 12px;
  height: 12px;
  margin: 0 1px;
}

.dept-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  margin-inline-end: 0;
  line-height: 18px;
}

.incubator {
  margin: 8px 0 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.6;
  background: linear-gradient(90deg, #ecf3ff 0%, rgba(236, 243, 255, 0) 100%);
  padding: 4px;

  span {
    margin-right: 8px;
    color: var(--pb-primary);
    font-weight: bold;
  }
}

.policy-side {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 18px;
}

.amount {
  min-width: 240px;
  text-align: right;
}

.amount-main {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: #ff7a1a;
  font-size: 14px;

  img {
    width: 18px;
    height: 18px;
  }

  strong {
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
  }
}

.amount-line {
  margin: 2px 0 0;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.5;
}

.result-card :deep(.pb-pagination) {
  padding: 8px 16px 16px;
}

@include below-lg {
  .hero-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .search-box,
  .company-top,
  .policy-row {
    width: 100%;
  }

  .company-top,
  .policy-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .policy-side,
  .amount-main {
    justify-content: flex-start;
  }

  .amount {
    min-width: 0;
    text-align: left;
  }

  .meta {
    flex-wrap: wrap;
  }
}
</style>
