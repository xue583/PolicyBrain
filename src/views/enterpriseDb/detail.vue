<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { getEnterpriseDetail } from '../../mock/enterpriseDb'
import QualificationPanel from './QualificationPanel.vue'
import ContactPanel from './ContactPanel.vue'
import ProductIndustryPanel from './ProductIndustryPanel.vue'
import EnterpriseProfileCard from './EnterpriseProfileCard.vue'
import PolicyRecordsPanel from './PolicyRecordsPanel.vue'
import IntellectualPropertyPanel from './IntellectualPropertyPanel.vue'
import BusinessInfoPanel from './BusinessInfoPanel.vue'
import { useFollowable } from '@/composables/useFollowable'
import type { BreadcrumbItem } from '@/components/BreadcrumbNav.vue'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import titleStyleBg from '../../assets/home/title-style.png'

defineOptions({ name: 'EnterpriseDbDetail' })

const FOLLOW_KEY = 'pb_followed_enterprise_db'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const enterpriseId = computed(() => Number(route.params.id))
const enterprise = computed(() => getEnterpriseDetail(enterpriseId.value))

const activeTab = ref('policies')
const { followed, toggleFollow } = useFollowable(FOLLOW_KEY, enterpriseId)

watch(
  enterpriseId,
  () => {
    activeTab.value = 'policies'
  },
  { immediate: true },
)

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'enterprise-db' })
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: '首页', onClick: goHome },
  { label: '企业数据库', onClick: goList },
  { label: enterprise.value?.name ?? '企业详情' },
])

const onPolicyMatch = () => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  message.info('政策匹配功能即将上线')
}
</script>

<template>
  <div class="enterprise-detail">
    <BreadcrumbNav :items="breadcrumbItems" @back="goList" />

    <PageState :empty="enterprise ? '' : '未找到该企业'">
      <template v-if="enterprise">
        <EnterpriseProfileCard
          :key="enterprise.id"
          :enterprise="enterprise"
          :followed="followed"
          @follow="toggleFollow"
          @match="onPolicyMatch"
        />

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
              <PolicyRecordsPanel
                :key="enterprise.id"
                :records="enterprise.policyRecords"
              />
            </a-tab-pane>

            <a-tab-pane key="business" tab="工商信息">
              <BusinessInfoPanel
                :key="enterprise.id"
                :enterprise="enterprise"
              />
            </a-tab-pane>

            <a-tab-pane key="ip">
              <template #tab>
                知识产权
                <span class="tab-count">{{
                  enterprise.patents.length +
                  enterprise.trademarks.length +
                  enterprise.softwareCopyrights.length +
                  enterprise.workCopyrights.length
                }}</span>
              </template>
              <IntellectualPropertyPanel
                :key="enterprise.id"
                :patents="enterprise.patents"
                :trademarks="enterprise.trademarks"
                :software-copyrights="enterprise.softwareCopyrights"
                :work-copyrights="enterprise.workCopyrights"
              />
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
    </PageState>
  </div>
</template>

<style scoped lang="scss">
.enterprise-detail {
  min-height: 480px;
}

.detail-card {
  border-radius: 16px;
  box-shadow: var(--pb-shadow-card);

  &.content-card {
    overflow: hidden;

    :deep(.ant-card-body) {
      padding: 0;
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

@include below-lg {
  .detail-tabs {
    :deep(.ant-tabs-content-holder) {
      padding: 16px 16px 20px;
    }
  }
}
</style>
