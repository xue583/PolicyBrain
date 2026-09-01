<script setup lang="ts">
import { computed } from 'vue'
import {
  enterpriseStatusText,
  type EnterpriseDetail,
} from '../../mock/enterpriseDb'

defineOptions({ name: 'EnterpriseBusinessInfoPanel' })

const props = defineProps<{
  enterprise: EnterpriseDetail
}>()

const industryPath = computed(() =>
  [
    ...new Set(
      [props.enterprise.industry, props.enterprise.businessIndustry].filter(
        Boolean,
      ),
    ),
  ].join('、'),
)

const bizLabelStyle = {
  background: '#f4f7fc',
  color: '#595959',
}
</script>

<template>
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
</template>

<style scoped lang="scss">
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
</style>
