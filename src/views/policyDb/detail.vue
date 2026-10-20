<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRegionStore } from '@/stores/region'
import { EyeOutlined, HeartFilled } from '@ant-design/icons-vue'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import {
  fetchPolicyApplyInfo,
  fetchPolicyDetail,
  fetchPolicyPublicities,
  fetchPolicySupports,
  fetchPolicyUpdates,
} from '@/api/policies'
import type { PolicyDbApplyInfo, PolicyDbDetail } from '../../mock/policyDb'
import { toErrorMessage } from '@/utils/apiError'
import { useFollowable } from '@/composables/useFollowable'
import PageState from '@/components/PageState.vue'
import DetailCard from '@/components/common/DetailCard.vue'
import DetailPageShell from '@/components/common/DetailPageShell.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import PublicityPanel from './PublicityPanel.vue'
import SupportPanel from './SupportPanel.vue'
import ApplyInfoPanel from './ApplyInfoPanel.vue'
import UpdatesPanel from './UpdatesPanel.vue'

defineOptions({ name: 'PolicyDbDetail' })

const FOLLOW_KEY = 'pb_followed_policy_db'

const route = useRoute()
const regionStore = useRegionStore()
const { provinceId, cityId, districtId } = storeToRefs(regionStore)

const policyId = computed(() => Number(route.params.id))
const policy = ref<PolicyDbDetail | null>(null)
const loading = ref(false)
const error = ref('')
const regionLabel = computed(() => policy.value?.city || '—')

const EMPTY_APPLY_INFO: PolicyDbApplyInfo = {
  fields: '',
  applyHtml: '',
  conditions: [],
  regulationNote: '',
  regulationClauses: [],
  files: [],
}

const POLICY_TABS = ['apply', 'updates', 'support', 'publicity'] as const
type PolicyTab = (typeof POLICY_TABS)[number]

const resolveTab = (value: unknown): PolicyTab => {
  const tab = String(value ?? '')
  return (POLICY_TABS as readonly string[]).includes(tab)
    ? (tab as PolicyTab)
    : 'apply'
}

const activeTab = ref<PolicyTab>('apply')
const tabLoading = ref(false)
const tabError = ref('')
const loadedTabs = ref<Record<PolicyTab, boolean>>({
  apply: false,
  updates: false,
  support: false,
  publicity: false,
})

let pageSeq = 0
let tabSeq = 0

const resetTabState = () => {
  tabSeq += 1
  tabLoading.value = false
  tabError.value = ''
  loadedTabs.value = {
    apply: false,
    updates: false,
    support: false,
    publicity: false,
  }
}

const load = async () => {
  const id = policyId.value
  if (!id) return
  const seq = ++pageSeq
  resetTabState()
  loading.value = true
  error.value = ''
  policy.value = null
  try {
    const card = await fetchPolicyDetail(id)
    if (seq !== pageSeq || policyId.value !== id) return
    policy.value = {
      ...card,
      date: '—',
      tags: [
        card.grade ? { text: card.grade, color: 'blue' } : null,
        card.industryTag ? { text: card.industryTag, color: 'gold' } : null,
      ].filter((tag): tag is { text: string; color: string } => Boolean(tag)),
      applyInfo: { ...EMPTY_APPLY_INFO },
      supportMeasures: [],
      updates: [],
      publicity: [],
    }
  } catch (err) {
    if (seq !== pageSeq) return
    error.value = toErrorMessage(err, '未找到该政策')
  } finally {
    if (seq === pageSeq) loading.value = false
  }
  if (seq === pageSeq && policy.value) void loadTab(activeTab.value)
}

const loadTab = async (tab: PolicyTab) => {
  const id = policyId.value
  const current = policy.value
  if (!id || !current || loadedTabs.value[tab]) return
  const seq = ++tabSeq
  tabLoading.value = true
  tabError.value = ''
  try {
    if (tab === 'apply') {
      const applyInfo = await fetchPolicyApplyInfo(id)
      if (seq !== tabSeq) return
      current.applyInfo = applyInfo
    } else if (tab === 'updates') {
      const updates = await fetchPolicyUpdates(id)
      if (seq !== tabSeq) return
      current.updates = updates
    } else if (tab === 'support') {
      const supportMeasures = await fetchPolicySupports(id, {
        provinceId: provinceId.value,
        cityId: cityId.value,
        districtId: districtId.value,
      })
      if (seq !== tabSeq) return
      current.supportMeasures = supportMeasures
    } else {
      const publicity = await fetchPolicyPublicities(id)
      if (seq !== tabSeq) return
      current.publicity = publicity
    }
    loadedTabs.value[tab] = true
  } catch (err) {
    if (seq !== tabSeq) return
    tabError.value = toErrorMessage(err, '内容加载失败')
  } finally {
    if (seq === tabSeq) tabLoading.value = false
  }
}

const isTabPending = (tab: PolicyTab) =>
  activeTab.value === tab && tabLoading.value

const tabErrorOf = (tab: PolicyTab) =>
  activeTab.value === tab ? tabError.value : ''

const { followed, toggleFollow } = useFollowable(FOLLOW_KEY, policyId)

watch(policyId, () => void load(), { immediate: true })

watch([provinceId, cityId, districtId], () => {
  if (!policy.value) return
  loadedTabs.value.support = false
  if (activeTab.value === 'support') void loadTab('support')
})

watch(
  () => route.query.tab,
  () => {
    activeTab.value = resolveTab(route.query.tab)
  },
  { immediate: true },
)

watch(activeTab, (tab) => {
  if (!policy.value) return
  void loadTab(tab)
})
</script>

<template>
  <DetailPageShell
    list-label="政策列表"
    list-route="policy-db"
    detail-label="政策详情"
    :loading="loading"
    :error="error"
    :empty="!loading && !error && !policy ? '未找到该政策' : ''"
    @retry="load"
  >
    <template v-if="policy">
      <DetailCard
        variant="header"
        style="
          --detail-header-bg: linear-gradient(180deg, #dbe9ff 0%, #ffffff 50%);
        "
      >
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
              type="primary"
              :ghost="true"
              @click="toggleFollow"
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
      </DetailCard>

      <DetailCard variant="content">
        <DetailTabs v-model:activeKey="activeTab">
          <a-tab-pane key="apply" tab="申报信息">
            <PageState
              :loading="isTabPending('apply')"
              :error="tabErrorOf('apply')"
              @retry="loadTab('apply')"
            >
              <ApplyInfoPanel
                v-if="loadedTabs.apply"
                :key="policy.id"
                :apply-info="policy.applyInfo"
              />
            </PageState>
          </a-tab-pane>

          <a-tab-pane key="updates" tab="最新动态">
            <PageState
              :loading="isTabPending('updates')"
              :error="tabErrorOf('updates')"
              @retry="loadTab('updates')"
            >
              <UpdatesPanel
                v-if="loadedTabs.updates"
                :key="policy.id"
                :updates="policy.updates"
              />
            </PageState>
          </a-tab-pane>

          <a-tab-pane key="support" tab="支持力度">
            <PageState
              :loading="isTabPending('support')"
              :error="tabErrorOf('support')"
              @retry="loadTab('support')"
            >
              <SupportPanel
                v-if="loadedTabs.support"
                :key="policy.id"
                :list="policy.supportMeasures"
              />
            </PageState>
          </a-tab-pane>

          <a-tab-pane key="publicity" tab="公示名单">
            <PageState
              :loading="isTabPending('publicity')"
              :error="tabErrorOf('publicity')"
              @retry="loadTab('publicity')"
            >
              <PublicityPanel
                v-if="loadedTabs.publicity"
                :key="policy.id"
                :list="policy.publicity"
                :region-label="regionLabel"
              />
            </PageState>
          </a-tab-pane>
        </DetailTabs>
      </DetailCard>
    </template>
  </DetailPageShell>
</template>

<style scoped lang="scss">
.summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--pb-gap);
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

@media (max-width: 768px) {
  .detail-tabs :deep(.ant-tabs-content-holder) {
    padding: 16px 16px 20px;
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
}
</style>
