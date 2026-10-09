<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  EnvironmentOutlined,
  SafetyOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue'
import { cityMap } from '@/mock/transform'
import {
  downstreamCompanies,
  enterpriseProvinces,
  relatedCompanies,
  serviceEnterpriseTitle,
  serviceProvinces,
  upstreamCompanies,
  type IndustryCompany,
} from '@/mock/industry'
import { usePagination } from '@/composables/usePagination'
import WbPageBanner from './components/WbPageBanner.vue'
import WbTabs from './components/WbTabs.vue'
import WbSearchBar from './components/WbSearchBar.vue'
import WbRegionFilter from './components/WbRegionFilter.vue'
import WbDataTable from './components/WbDataTable.vue'
import WbPagination from './components/WbPagination.vue'
import bannerImg from '@/assets/workbench/wb-industry-banner.png'

const props = defineProps<{ role: 'enterprise' | 'service' }>()

defineOptions({ name: 'IndustryList' })

type TabKey = 'related' | 'upstream' | 'downstream'

const PAGE_SIZE = 10

/** 企业视角首行省份数（收起态可见项，与设计稿图一首行一致） */
const ENTERPRISE_COLLAPSED_COUNT = 15

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'related', label: `相关企业（${relatedCompanies.length}）` },
  { key: 'upstream', label: `上游企业（${upstreamCompanies.length}）` },
  { key: 'downstream', label: `下游企业（${downstreamCompanies.length}）` },
]

const tabRows: Record<TabKey, IndustryCompany[]> = {
  related: relatedCompanies,
  upstream: upstreamCompanies,
  downstream: downstreamCompanies,
}

const activeTab = ref<TabKey>('related')
const keyword = ref('')
const selectedRegions = ref<string[]>(['河南省', '郑州市'])

const provinceList = computed(() =>
  props.role === 'service' ? serviceProvinces : enterpriseProvinces,
)

const filteredRows = computed(() => {
  let rows = tabRows[activeTab.value]
  if (props.role === 'enterprise') {
    const kw = keyword.value.trim().toLowerCase()
    if (kw) {
      rows = rows.filter((r) =>
        [r.unit, r.product, ...r.tags].some((t) =>
          t.toLowerCase().includes(kw),
        ),
      )
    }
  }
  return rows
})

const {
  currentPage: page,
  total,
  pagedList: pagedRows,
  resetPage,
} = usePagination(filteredRows, { pageSize: PAGE_SIZE })

watch([activeTab, keyword], () => {
  resetPage()
})

const tableColumns = [
  { title: '序号', key: 'index', width: '56px' },
  { title: '单位名称', key: 'unit', width: '240px' },
  { title: '所在省市', key: 'province', width: '11%' },
  { title: '主营产品', key: 'product', width: '21.5%' },
  { title: '涉及标签', key: 'tags', width: '21.5%' },
  { title: '注册地址', key: 'address' },
]
</script>

<template>
  <div class="industry-list">
    <WbPageBanner
      title="产业数据"
      description="您可在“企业管理--产品/服务板块”更改您的产品或服务及对应的产业标签，我们将会为您提供更精准的产业线索。"
      :image="bannerImg"
    />

    <section class="page-card">
      <div v-if="role === 'service'" class="serve-head">
        <span class="serve-icon">
          <SwapOutlined class="serve-icon-glyph" />
        </span>
        <h2 class="serve-title">{{ serviceEnterpriseTitle }}</h2>
      </div>

      <WbTabs
        v-model:active-key="activeTab"
        :tabs="tabs"
        :class="{ 'after-serve-head': role === 'service' }"
      >
        <template v-if="role === 'enterprise'" #extra>
          <WbSearchBar
            v-model="keyword"
            class="card-search"
            @search="resetPage"
          >
            搜 索
          </WbSearchBar>
        </template>
      </WbTabs>

      <WbRegionFilter
        v-model:selected="selectedRegions"
        :provinces="provinceList"
        :city-map="cityMap"
        :collapsible="role === 'enterprise'"
        :collapsed-count="ENTERPRISE_COLLAPSED_COUNT"
        :reserve-fold-space="role === 'enterprise'"
      />

      <WbDataTable
        :columns="tableColumns"
        :data-source="pagedRows"
        row-key="id"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (page - 1) * PAGE_SIZE + index + 1 }}
          </template>
          <template v-else-if="column.key === 'unit'">
            <div class="cell-ellipsis" :title="record.unit">
              {{ record.unit }}
            </div>
          </template>
          <template v-else-if="column.key === 'province'">
            <span class="loc-cell">
              <EnvironmentOutlined class="loc-icon" />
              {{ record.province }}
            </span>
          </template>
          <template v-else-if="column.key === 'product'">
            <div class="cell-ellipsis" :title="record.product">
              {{ record.product }}
            </div>
          </template>
          <template v-else-if="column.key === 'tags'">
            <div class="tag-group">
              <span
                v-for="(tag, ti) in record.tags"
                :key="`${tag}-${ti}`"
                class="tag-pill"
              >
                <SafetyOutlined class="tag-icon" />
                {{ tag }}
              </span>
            </div>
          </template>
          <template v-else-if="column.key === 'address'">
            <div class="cell-ellipsis" :title="record.address">
              {{ record.address }}
            </div>
          </template>
        </template>
        <template #emptyText>暂无数据</template>
      </WbDataTable>

      <WbPagination v-model:current="page" :total="total" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.industry-list {
  flex: 1;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.page-card {
  margin-top: 20px;
  padding: 0 22px 24px;
  background: #fff;
  border-radius: 16px;
}

.serve-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 2px 0;
}

.serve-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4e97ff 0%, #2e6be6 100%);
  border-radius: 8px;
}

.serve-icon-glyph {
  color: #fff;
  font-size: 15px;
  transform: rotate(180deg);
}

.serve-title {
  margin: 0;
  color: #1f1f1f;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.4;
}

.after-serve-head {
  margin-top: 10px;
}

.card-search {
  padding: 10px 0;
}

.cell-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.loc-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.loc-icon {
  color: #999;
  font-size: 14px;
}

.tag-group {
  display: flex;
  gap: 14px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  color: #2f6fe4;
  font-size: 13px;
  line-height: 20px;
  background: #e9f1fe;
  border-radius: 4px;
}

.tag-icon {
  font-size: 12px;
}

@include below-lg {
  :deep(.wb-tabs .ant-tabs-nav) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .serve-title {
    font-size: 17px;
  }
}
</style>
