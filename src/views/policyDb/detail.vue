<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { EyeOutlined, HeartFilled } from '@ant-design/icons-vue'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import { getPolicyDbDetail } from '../../mock/policyDb'
import { useFollowable } from '@/composables/useFollowable'
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

const policyId = computed(() => Number(route.params.id))
const policy = computed(() => getPolicyDbDetail(policyId.value))
const regionLabel = computed(() => `河南省 ${policy.value?.city ?? '郑州市'}`)

const activeTab = ref('apply')
const { followed, toggleFollow } = useFollowable(FOLLOW_KEY, policyId)

watch(
  policyId,
  () => {
    activeTab.value = 'apply'
  },
  { immediate: true },
)
</script>

<template>
  <DetailPageShell
    list-label="政策列表"
    list-route="policy-db"
    detail-label="政策详情"
    :empty="policy ? '' : '未找到该政策'"
  >
    <template v-if="policy">
      <DetailCard
        variant="header"
        style="
          --detail-header-bg: linear-gradient(
            180deg,
            #d7e8ff 0%,
            #eaf3ff 55%,
            #f7fbff 100%
          );
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
            <ApplyInfoPanel :key="policy.id" :apply-info="policy.applyInfo" />
          </a-tab-pane>

          <a-tab-pane key="updates" tab="最新动态">
            <UpdatesPanel :key="policy.id" :updates="policy.updates" />
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
