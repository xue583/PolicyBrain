<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import DetailCard from '@/components/common/DetailCard.vue'
import DetailPageShell from '@/components/common/DetailPageShell.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'

defineOptions({ name: 'EnterpriseDbDetail' })

const FOLLOW_KEY = 'pb_followed_enterprise_db'

const route = useRoute()
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

const onPolicyMatch = () => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  message.info('政策匹配功能即将上线')
}
</script>

<template>
  <DetailPageShell
    list-label="企业数据库"
    list-route="enterprise-db"
    :detail-label="enterprise?.name ?? '企业详情'"
    :empty="enterprise ? '' : '未找到该企业'"
  >
    <template v-if="enterprise">
      <EnterpriseProfileCard
        :key="enterprise.id"
        :enterprise="enterprise"
        :followed="followed"
        @follow="toggleFollow"
        @match="onPolicyMatch"
      />

      <DetailCard variant="content" flush>
        <DetailTabs v-model:activeKey="activeTab">
          <a-tab-pane key="policies" tab="已获政策">
            <PolicyRecordsPanel
              :key="enterprise.id"
              :records="enterprise.policyRecords"
            />
          </a-tab-pane>

          <a-tab-pane key="business" tab="工商信息">
            <BusinessInfoPanel :key="enterprise.id" :enterprise="enterprise" />
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
        </DetailTabs>
      </DetailCard>
    </template>
  </DetailPageShell>
</template>

<style scoped lang="scss">
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
  .detail-tabs :deep(.ant-tabs-content-holder) {
    padding: 16px 16px 20px;
  }
}
</style>
