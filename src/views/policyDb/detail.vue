<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import {
  DownOutlined,
  EyeOutlined,
  HeartFilled,
  LeftOutlined,
  PaperClipOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import {
  getPolicyDbDetail,
  policyDbUpdateStatuses,
  policyDbYears,
  policyGrades,
  type PolicyDbUpdate,
  type PolicyDbUpdateStatus,
} from '../../mock/policyDb'
import { filterPolicyDbUpdates } from '@/utils/filterPolicies'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import PublicityPanel from './PublicityPanel.vue'
import SupportPanel from './SupportPanel.vue'

defineOptions({ name: 'PolicyDbDetail' })

const FOLLOW_KEY = 'pb_followed_policy_db'
const COLLAPSED_COUNT = 10

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const policyId = computed(() => Number(route.params.id))
const policy = computed(() => getPolicyDbDetail(policyId.value))
const regionLabel = computed(() => `河南省 ${policy.value?.city ?? '郑州市'}`)

const CLAUSE_MARKS = ['一', '二', '三', '四', '五', '六', '七', '八'] as const

const activeTab = ref('apply')
const currentPage = ref(1)
const pageSize = 10
const showMoreGrades = ref(false)
const keywordInput = ref('')
const appliedKeyword = ref('')
const followed = ref(false)
const contactOpen = ref(false)
const contactUpdate = ref<PolicyDbUpdate | null>(null)

const filters = reactive({
  grade: '',
  years: [] as number[],
  statuses: [] as PolicyDbUpdateStatus[],
})

const loadFollowedIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

const syncFollowed = () => {
  followed.value = loadFollowedIds().includes(policyId.value)
}

const resetUpdateFilters = () => {
  filters.grade = ''
  filters.years = []
  filters.statuses = []
  keywordInput.value = ''
  appliedKeyword.value = ''
  currentPage.value = 1
  showMoreGrades.value = false
}

watch(
  policyId,
  () => {
    activeTab.value = 'apply'
    resetUpdateFilters()
    syncFollowed()
  },
  { immediate: true },
)

const visibleGrades = computed(() =>
  showMoreGrades.value ? policyGrades : policyGrades.slice(0, COLLAPSED_COUNT),
)

const filteredUpdates = computed(() =>
  filterPolicyDbUpdates(policy.value?.updates ?? [], {
    grade: filters.grade,
    years: filters.years,
    statuses: filters.statuses,
    keyword: appliedKeyword.value,
  }),
)

const pagedUpdates = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUpdates.value.slice(start, start + pageSize)
})

const updateTotal = computed(() => filteredUpdates.value.length)

const selectGrade = (grade: string) => {
  filters.grade = filters.grade === grade ? '' : grade
  currentPage.value = 1
}

const toggleYear = (year: number) => {
  const index = filters.years.indexOf(year)
  if (index >= 0) filters.years.splice(index, 1)
  else filters.years.push(year)
  currentPage.value = 1
}

const toggleStatus = (status: PolicyDbUpdateStatus) => {
  const index = filters.statuses.indexOf(status)
  if (index >= 0) filters.statuses.splice(index, 1)
  else filters.statuses.push(status)
  currentPage.value = 1
}

const onSearch = () => {
  appliedKeyword.value = keywordInput.value
  currentPage.value = 1
}

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'policy-db' })
}

const toggleFollow = () => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  const ids = loadFollowedIds()
  const next = followed.value
    ? ids.filter((id) => id !== policyId.value)
    : [...ids, policyId.value]
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(next))
  followed.value = !followed.value
  message.success(followed.value ? '关注成功' : '已取消关注')
}

const openContact = (record: unknown) => {
  contactUpdate.value = record as PolicyDbUpdate
  contactOpen.value = true
}

const updateColumns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  { title: '标题', key: 'title', ellipsis: true },
  { title: '政策级别', dataIndex: 'grade', key: 'grade', width: 140 },
  { title: '发布单位', dataIndex: 'department', key: 'department', width: 150 },
  { title: '发布日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '截止日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '剩余天数', key: 'remain', width: 110 },
  { title: '联系方式', key: 'contact', width: 110 },
]
</script>

<template>
  <div class="policy-db-detail">
    <nav class="breadcrumb">
      <button type="button" class="back-btn" @click="goList">
        <LeftOutlined />
      </button>
      <div class="breadcrumb-trail">
        <a @click="goHome">首页</a>
        <span class="sep">&gt;</span>
        <a @click="goList">政策列表</a>
        <span class="sep">&gt;</span>
        <span class="current">政策详情</span>
      </div>
    </nav>

    <a-empty v-if="!policy" description="未找到该政策" />

    <template v-else>
      <a-card class="detail-card header-card" :bordered="false">
        <div class="summary">
          <div class="summary-main">
            <h1 class="detail-title">{{ policy.name }}</h1>
            <div class="meta-row">
              <span>发布日期：{{ policy.date }}</span>
              <span>发文机构：{{ policy.city }} - {{ policy.department }}</span>
            </div>
            <div class="tags-row">
              <div class="tags">
                <a-tag
                  v-for="tag in policy.tags"
                  :key="tag.text"
                  :color="tag.color"
                  :bordered="false"
                >
                  {{ tag.text }}
                </a-tag>
              </div>
              <span class="views-cell">
                <EyeOutlined />
                {{ policy.views }}浏览
              </span>
            </div>
          </div>
          <div class="follow-area">
            <a-button
              class="follow-btn"
              :class="{ followed }"
              @click="toggleFollow"
              type="primary"
              :ghost="true"
            >
              <template #icon>
                <HeartFilled v-if="followed" />
                <img v-else :src="followHeartIcon" alt="" class="follow-icon" />
              </template>
              {{ followed ? '已关注' : '关注企业' }}
            </a-button>
            <p class="follow-tip">及时获取政策动态与截止提醒</p>
          </div>
        </div>
      </a-card>

      <a-card class="detail-card content-card" :bordered="false">
        <a-tabs
          v-model:activeKey="activeTab"
          class="detail-tabs"
          :tab-bar-gutter="0"
        >
          <a-tab-pane key="apply" tab="申报信息">
            <div class="apply-info">
              <section class="apply-section">
                <h2 class="apply-title">支持领域</h2>
                <p class="apply-text">{{ policy.applyInfo.fields }}</p>
              </section>

              <section class="apply-section">
                <h2 class="apply-title">申报条件</h2>
                <ol class="apply-conditions">
                  <li
                    v-for="(item, index) in policy.applyInfo.conditions"
                    :key="index"
                  >
                    {{ index + 1 }}．{{ item }}
                  </li>
                </ol>
                <p v-if="policy.applyInfo.regulationNote" class="apply-note">
                  {{ policy.applyInfo.regulationNote }}
                </p>
                <ol
                  v-if="policy.applyInfo.regulationClauses.length"
                  class="apply-clauses"
                >
                  <li
                    v-for="(item, index) in policy.applyInfo.regulationClauses"
                    :key="item"
                  >
                    （{{ CLAUSE_MARKS[index] ?? index + 1 }}）{{ item }}
                  </li>
                </ol>
              </section>

              <section class="apply-section">
                <h2 class="apply-title">依据文件</h2>
                <div class="basis-files">
                  <a
                    v-for="file in policy.applyInfo.files"
                    :key="file.name"
                    class="basis-file"
                    :href="file.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PaperClipOutlined />
                    <span>{{ file.name }}</span>
                  </a>
                </div>
              </section>
            </div>
          </a-tab-pane>

          <a-tab-pane key="updates" tab="最新动态">
            <div class="update-filters">
              <div class="filter-row">
                <span class="filter-label">选择等级：</span>
                <div class="filter-options">
                  <a
                    v-for="grade in visibleGrades"
                    :key="grade"
                    class="option-link"
                    :class="{ active: filters.grade === grade }"
                    @click="selectGrade(grade)"
                  >
                    {{ grade }}
                  </a>
                </div>
                <a class="more-link" @click="showMoreGrades = !showMoreGrades">
                  {{ showMoreGrades ? '收起' : '更多' }}
                  <DownOutlined :class="{ rotated: showMoreGrades }" />
                </a>
              </div>

              <div class="filter-row">
                <span class="filter-label">选择年份：</span>
                <div class="filter-options">
                  <a
                    v-for="year in policyDbYears"
                    :key="year"
                    class="option-link"
                    :class="{ active: filters.years.includes(year) }"
                    @click="toggleYear(year)"
                  >
                    {{ year }}
                  </a>
                </div>
              </div>

              <div class="filter-row">
                <span class="filter-label">政策状态：</span>
                <div class="filter-options">
                  <a
                    v-for="item in policyDbUpdateStatuses"
                    :key="item.value"
                    class="option-link"
                    :class="{ active: filters.statuses.includes(item.value) }"
                    @click="toggleStatus(item.value)"
                  >
                    {{ item.label }}
                  </a>
                </div>
              </div>

              <div class="filter-row search-row">
                <span class="filter-label">原文标题：</span>
                <a-input
                  v-model:value="keywordInput"
                  class="search-input"
                  allow-clear
                  placeholder="请输入内容"
                  @press-enter="onSearch"
                >
                  <template #prefix>
                    <SearchOutlined />
                  </template>
                </a-input>
                <a-button type="primary" @click="onSearch">查询</a-button>
                <a-button @click="resetUpdateFilters">重置</a-button>
              </div>
            </div>

            <a-table
              class="db-table"
              bordered
              :columns="updateColumns"
              :data-source="pagedUpdates"
              :pagination="false"
              :row-key="(row: PolicyDbUpdate) => row.id"
              size="middle"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'index'">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </template>
                <template v-else-if="column.key === 'title'">
                  <router-link
                    class="update-title"
                    :to="{
                      name: 'news-detail',
                      params: { id: String(record.newsId) },
                    }"
                  >
                    {{ record.title }}
                  </router-link>
                </template>
                <template v-else-if="column.key === 'remain'">
                  <span v-if="record.expired" class="expired-text">已过期</span>
                  <span v-else>{{ record.daysRemaining }}</span>
                </template>
                <template v-else-if="column.key === 'contact'">
                  <a class="contact-link" @click="openContact(record)">
                    点击查看
                  </a>
                </template>
              </template>
            </a-table>

            <div class="pagination-wrap">
              <a-pagination
                v-model:current="currentPage"
                :total="updateTotal"
                :page-size="pageSize"
                :show-total="(t: number) => `共 ${t} 条`"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="support" tab="支持力度">
            <SupportPanel :key="policy.id" :list="policy.supportMeasures" />
          </a-tab-pane>

          <a-tab-pane key="publicity" tab="公示名单">
            <PublicityPanel
              :key="policy.id"
              :list="policy.publicity"
              :region-label="regionLabel"
            />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </template>

    <a-modal
      v-model:open="contactOpen"
      title="联系方式"
      :footer="null"
      destroy-on-close
    >
      <div v-if="contactUpdate" class="contact-modal">
        <p>
          <span>发布单位：</span>
          {{ contactUpdate.department }}
        </p>
        <p>
          <span>联系电话：</span>
          {{ contactUpdate.phone }}
        </p>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.policy-db-detail {
  min-height: 480px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
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
  transition: color 0.2s;

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

.detail-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-card-body) {
    padding: 28px 36px;
  }

  &.header-card {
    margin-bottom: 16px;
    background: linear-gradient(180deg, #d7e8ff 0%, #eaf3ff 55%, #f7fbff 100%);
  }

  &.content-card {
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 0;
    }
  }
}

.summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.summary-main {
  flex: 1;
  min-width: 0;
}

.detail-title {
  margin: 0 0 16px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f1f1f;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin-bottom: 14px;
  font-size: 16px;
  color: #8c8c8c;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.ant-tag) {
    margin-inline-end: 0;
    padding: 4px 12px;
    font-size: 16px;
  }
}

.views-cell {
  color: #8c8c8c;
  font-size: 16px;
}

.follow-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.follow-btn {
  height: 40px;
  padding-inline: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: rgba(41, 112, 230);

  .follow-icon {
    width: 16px;
    height: 16px;
    display: block;
  }

  &.followed {
    color: #ff4d4f;
    border-color: #ffccc7;
  }
}

.follow-tip {
  margin: 0;
  font-size: 16px;
  color: #6f6f6f;
  white-space: nowrap;
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

.update-filters {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  font-size: 15px;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.filter-label {
  flex-shrink: 0;
  width: 88px;
  color: #8c8c8c;
  line-height: 32px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  flex: 1;
  min-width: 0;
}

.option-link {
  color: #262626;
  line-height: 32px;
  cursor: pointer;

  &.active,
  &:hover {
    color: var(--pb-primary);
  }
}

.more-link {
  flex-shrink: 0;
  align-self: flex-start;
  color: var(--pb-primary);
  line-height: 32px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;

  .anticon {
    margin-left: 2px;
    font-size: 16px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.search-row {
  align-items: center;
  padding-top: 12px;
}

.search-input {
  width: 320px;
  max-width: 100%;
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

.update-title,
.contact-link {
  color: var(--pb-primary);
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.expired-text {
  color: #ff4d4f;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

.apply-info {
  padding: 8px 0 12px;
}

.apply-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.apply-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f1f1f;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    border-radius: 1px;
    background: var(--pb-primary);
  }
}

.apply-text,
.apply-conditions,
.apply-clauses,
.apply-note {
  margin: 0;
  color: #434343;
  font-size: 15px;
  line-height: 1.9;
  text-align: justify;
}

.apply-conditions,
.apply-clauses {
  padding: 0;
  list-style: none;
}

.apply-conditions li,
.apply-clauses li {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.apply-note {
  margin: 16px 0 12px;
}

.basis-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.basis-file {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  color: var(--pb-primary);
  font-size: 15px;
  line-height: 1.6;

  .anticon {
    flex-shrink: 0;
    color: #8c8c8c;
  }

  span {
    word-break: break-all;
  }

  &:hover {
    color: #4096ff;
  }
}

.contact-modal {
  p {
    margin: 0 0 12px;
    font-size: 15px;
    color: #262626;

    span {
      color: #8c8c8c;
    }
  }
}

@media (max-width: 768px) {
  .detail-card {
    :deep(.ant-card-body) {
      padding: 20px 16px;
    }

    &.content-card {
      :deep(.ant-card-body) {
        padding: 0;
      }
    }
  }

  .detail-tabs {
    :deep(.ant-tabs-content-holder) {
      padding: 16px 16px 20px;
    }
  }

  .summary {
    flex-direction: column;
  }

  .follow-area {
    align-items: flex-start;
  }

  .detail-title {
    font-size: 22px;
  }

  .filter-label {
    width: auto;
  }

  .search-input {
    width: 100%;
  }
}
</style>
