<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EyeOutlined, HeartFilled } from '@ant-design/icons-vue'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import { getPolicyDbDetail } from '../../mock/policyDb'
import { useFollowable } from '@/composables/useFollowable'
import type { BreadcrumbItem } from '@/components/BreadcrumbNav.vue'
import PublicityPanel from './PublicityPanel.vue'
import SupportPanel from './SupportPanel.vue'
import ApplyInfoPanel from './ApplyInfoPanel.vue'
import UpdatesPanel from './UpdatesPanel.vue'

defineOptions({ name: 'PolicyDbDetail' })

const FOLLOW_KEY = 'pb_followed_policy_db'

const route = useRoute()
const router = useRouter()

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

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'policy-db' })
}

const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首页', onClick: goHome },
  { label: '政策列表', onClick: goList },
  { label: '政策详情' },
]
</script>

<template>
  <div class="policy-db-detail">
    <BreadcrumbNav :items="breadcrumbItems" @back="goList" />

    <PageState :empty="policy ? '' : '未找到该政策'">
      <template v-if="policy">
        <a-card class="detail-card header-card" :bordered="false">
          <div class="summary">
            <div class="summary-main">
              <h1 class="detail-title">{{ policy.name }}</h1>
              <div class="meta-row">
                <span>发布日期：{{ policy.date }}</span>
                <span
                  >发文机构：{{ policy.city }} - {{ policy.department }}</span
                >
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
                  <img
                    v-else
                    :src="followHeartIcon"
                    alt=""
                    class="follow-icon"
                  />
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
          </a-tabs>
        </a-card>
      </template>
    </PageState>
  </div>
</template>

<style scoped lang="scss">
.policy-db-detail {
  min-height: 480px;
}

.detail-card {
  border-radius: 16px;
  box-shadow: var(--pb-shadow-card);

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
}
</style>
