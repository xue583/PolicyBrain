<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFilteredList } from '@/composables/useFilteredList'
import { useRouteKeyword } from '@/composables/useRouteKeyword'
import { useCollapsedList } from '@/composables/useCollapsedList'
import FilterRow from '@/components/common/FilterRow.vue'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import {
  enterpriseIndustries,
  enterpriseProvinces,
  enterpriseStatusText,
  enterpriseTotal,
  mockEnterprises,
  type EnterpriseItem,
} from '../../mock/enterpriseDb'
import { filterEnterprises } from '@/utils/filterPolicies'
import industryTagIcon from '../../assets/enterpriseDb/industry-tag.png'
import emptyIllustration from '../../assets/enterpriseDb/empty-illustration.png'

defineOptions({ name: 'EnterpriseDb' })

const COLLAPSED_PROVINCE_COUNT = 12
const COLLAPSED_INDUSTRY_COUNT = 20

const router = useRouter()
const keyword = useRouteKeyword()

const filters = reactive({
  province: '',
  industries: [] as string[],
})

const { showMore: showMoreProvinces, visibleList: visibleProvinces } =
  useCollapsedList(enterpriseProvinces, COLLAPSED_PROVINCE_COUNT, {
    initialExpanded: true,
  })

const { showMore: showMoreIndustries, visibleList: visibleIndustries } =
  useCollapsedList(enterpriseIndustries, COLLAPSED_INDUSTRY_COUNT)

const filteredList = computed(() =>
  filterEnterprises(mockEnterprises, {
    keyword: keyword.value,
    province: filters.province,
    industries: filters.industries,
  }),
)

const { currentPage, pageSize, pagedList, total, resetPage } =
  useFilteredList(filteredList)

const selectProvince = (province: string) => {
  filters.province = filters.province === province ? '' : province
}

watch([keyword, () => filters.province, () => filters.industries], () => {
  resetPage()
})

const locationText = (item: EnterpriseItem) => `${item.province}/${item.city}`

const goDetail = (id: number) => {
  void router.push({ name: 'enterprise-db-detail', params: { id: String(id) } })
}
</script>

<template>
  <PageState>
    <a-card class="enterprise-card" :bordered="false">
      <div class="toolbar">
        <ResultCountBar
          class="total-count"
          prefix="共收录"
          :total="enterpriseTotal"
          unit="家企业"
          decorated
        />
        <a-button type="primary" class="map-btn">产业图谱</a-button>
      </div>

      <FilterRow
        label="注册地址："
        v-model:expanded="showMoreProvinces"
        collapsible
      >
        <a
          v-for="province in visibleProvinces"
          :key="province"
          class="option-link"
          :class="{ active: filters.province === province }"
          @click="selectProvince(province)"
        >
          {{ province }}
        </a>
      </FilterRow>

      <FilterRow
        class="industry-row"
        label="所属产业："
        v-model:expanded="showMoreIndustries"
        collapsible
      >
        <a-checkbox-group
          v-model:value="filters.industries"
          :options="visibleIndustries"
        />
      </FilterRow>

      <div v-if="!pagedList.length" class="empty-state">
        <img :src="emptyIllustration" alt="" class="empty-illustration" />
        <p>未找到符合条件的企业，请调整筛选后再试</p>
      </div>

      <div v-else class="enterprise-grid">
        <article
          v-for="item in pagedList"
          :key="item.id"
          class="ent-item"
          @click="goDetail(item.id)"
        >
          <div class="ent-head">
            <div class="ent-title-wrap">
              <img :src="industryTagIcon" alt="" class="ent-icon" />
              <router-link
                class="ent-name"
                :to="{
                  name: 'enterprise-db-detail',
                  params: { id: String(item.id) },
                }"
                @click.stop
              >
                {{ item.name }}
              </router-link>
              <span class="status-tag" :class="item.status">
                {{ enterpriseStatusText[item.status] }}
              </span>
            </div>
            <span class="ent-location">{{ locationText(item) }}</span>
          </div>

          <div class="ent-policy-row">
            <p class="ent-policy">已获政策: {{ item.policyCount }}项</p>
            <div class="ent-tags">
              <span
                v-for="(tag, index) in item.tags"
                :key="tag"
                class="ent-tag"
                :class="index % 2 ? 'blue' : 'orange'"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="ent-meta-row">
            <p class="ent-meta">
              <span class="meta-label">注册地址:</span>
              <span class="meta-value-wrap">
                <a-tooltip :title="item.address">
                  <span class="meta-value">{{ item.address }}</span>
                </a-tooltip>
              </span>
            </p>
            <p class="ent-meta">
              <span class="meta-label">工商行业:</span>
              <span class="meta-value-wrap">
                <a-tooltip :title="item.businessIndustry">
                  <span class="meta-value">{{ item.businessIndustry }}</span>
                </a-tooltip>
              </span>
            </p>
          </div>
        </article>
      </div>

      <div class="pagination-wrap">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          show-quick-jumper
          :show-size-changer="false"
          :show-total="(t: number) => `共 ${t} 条`"
        />
      </div>
    </a-card>
  </PageState>
</template>

<style scoped lang="scss">
.hero-inner {
  padding-bottom: 34px;
}
.enterprise-card {
  border-radius: var(--pb-radius-lg);
  box-shadow: var(--pb-shadow-card);
  --filter-row-border: none;
  --filter-label-width: 80px;
  --filter-options-gap: 4px 18px;
  --pagination-padding: 20px 0 8px;

  :deep(.ant-card-body) {
    padding: 24px 28px 16px;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.total-count {
  --rc-color: #343434;
}

.map-btn {
  height: 36px;
  padding-inline: 18px;
  border-radius: 6px;
  font-weight: 500;
}

:deep(.filter-options .ant-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}

:deep(.filter-options .ant-checkbox-wrapper) {
  font-size: 16px;
  color: #262626;
  margin-inline-end: 0;
}

.option-link {
  font-size: 16px;
}

:deep(.more-link .anticon) {
  font-size: 12px;
}

.industry-row {
  margin-bottom: 8px;
}

.enterprise-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 8px 0 4px;
}

.ent-item {
  min-width: 0;
  padding: 18px 20px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: #91caff;
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
  }
}

.ent-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.ent-title-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 32px;
  color: #8c8c8c;
  font-size: 15px;

  .empty-illustration {
    width: 220px;
    height: auto;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
  }
}

.ent-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.ent-name {
  color: var(--pb-primary);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-all;

  &:hover {
    color: #4096ff;
  }
}

.ent-location {
  flex-shrink: 0;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 22px;
  white-space: nowrap;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;

  &.active {
    color: #52c41a;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
  }

  &.revoked,
  &.cancelled {
    color: #8c8c8c;
    background: #fafafa;
    border: 1px solid #d9d9d9;
  }
}

.ent-policy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin-bottom: 12px;
}

.ent-policy {
  flex-shrink: 0;
  margin: 0;
  font-size: 16px;
  color: #595959;
}

.ent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.ent-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 22px;

  &.orange {
    color: #d46b08;
    background: #fff7e6;
    border: 1px solid #ffd591;
  }

  &.blue {
    color: var(--pb-primary);
    background: #e6f4ff;
    border: 1px solid #91caff;
  }
}

.ent-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.ent-meta {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 16px;
  color: #8c8c8c;
  line-height: 1.6;
}

.meta-label {
  flex-shrink: 0;
  margin-right: 4px;
}

.meta-value-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.meta-value {
  display: block;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@include below-lg {
  .enterprise-grid {
    grid-template-columns: 1fr;
  }

  :deep(.filter-label) {
    width: auto;
  }
}
</style>
