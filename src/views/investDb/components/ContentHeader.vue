<script setup lang="ts">
import { investTypeTabs, type InvestProjectType } from '../../../mock/investDb'

defineProps<{
  totalCount: number
  regionLabel: string
  keyword: string
  activeType: InvestProjectType
  counts: Record<InvestProjectType, number>
}>()

defineEmits<{
  'update:keyword': [value: string]
  'update:activeType': [value: InvestProjectType]
}>()
</script>

<template>
  <a-card :bordered="false" class="content-card">
    <a-flex
      class="content-header"
      justify="space-between"
      align="center"
      wrap="wrap"
      :gap="12"
    >
      <span class="result-count">
        <span class="result-count-label">共收录</span>
        <em>{{ totalCount.toLocaleString('zh-CN') }}</em>
        <span class="result-count-label">家企业</span>
      </span>
      <a-input-search
        :value="keyword"
        class="project-search"
        :placeholder="`搜索${regionLabel}项目名称、代码或单位`"
        enter-button="搜索"
        allow-clear
        @update:value="$emit('update:keyword', $event)"
      />
    </a-flex>

    <a-divider style="margin: 16px 0 14px" />

    <a-radio-group :value="activeType" class="type-filter">
      <a-radio-button
        v-for="tab in investTypeTabs"
        :key="tab.key"
        :value="tab.key"
        @click="$emit('update:activeType', tab.key)"
      >
        {{ tab.label }} {{ counts[tab.key] }}
      </a-radio-button>
    </a-radio-group>
  </a-card>
</template>

<style scoped lang="scss">
.content-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.content-header {
  min-height: 48px;
}

.result-count {
  font-size: 15px;
  color: #595959;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
    margin: 0 4px;
  }
}

.project-search {
  width: 360px;
  max-width: 100%;

  :deep(.ant-input-search-button) {
    font-weight: 500;
  }
}

.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.ant-radio-button-wrapper) {
    height: auto;
    padding: 6px 14px;
    border-radius: 999px !important;
    border-inline-start-width: 1px;
    line-height: 22px;
    font-size: 14px;
    color: #595959;
    background: #fff;

    &::before {
      display: none;
    }
  }

  :deep(.ant-radio-button-wrapper-checked) {
    color: var(--pb-primary);
    border-color: var(--pb-primary) !important;
    background: #fff;
    font-weight: 500;
  }
}
</style>
