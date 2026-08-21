<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DownOutlined } from '@ant-design/icons-vue'
import {
  enterpriseIndustries,
  enterpriseProvinces,
  enterpriseStatusText,
  enterpriseTotal,
  mockEnterprises,
  type EnterpriseItem,
} from '../../mock/enterpriseDb'
import { filterEnterprises } from '@/utils/filterPolicies'
import titleStyleBg from '../../assets/home/title-style.png'
import industryTagIcon from '../../assets/enterpriseDb/industry-tag.png'
import emptyIllustration from '../../assets/enterpriseDb/empty-illustration.png'

defineOptions({ name: 'EnterpriseDb' })

const COLLAPSED_PROVINCE_COUNT = 12
const COLLAPSED_INDUSTRY_COUNT = 20

const route = useRoute()
const router = useRouter()
const keyword = computed(() => String(route.query.q ?? ''))

const currentPage = ref(1)
const pageSize = 10
const showMoreProvinces = ref(true)
const showMoreIndustries = ref(false)

const filters = reactive({
  province: '',
  industries: [] as string[],
})

const visibleProvinces = computed(() =>
  showMoreProvinces.value
    ? enterpriseProvinces
    : enterpriseProvinces.slice(0, COLLAPSED_PROVINCE_COUNT),
)

const visibleIndustries = computed(() =>
  showMoreIndustries.value
    ? enterpriseIndustries
    : enterpriseIndustries.slice(0, COLLAPSED_INDUSTRY_COUNT),
)

const filteredList = computed(() =>
  filterEnterprises(mockEnterprises, {
    keyword: keyword.value,
    province: filters.province,
    industries: filters.industries,
  }),
)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

const selectProvince = (province: string) => {
  filters.province = filters.province === province ? '' : province
  currentPage.value = 1
}

watch([keyword, () => filters.industries], () => {
  currentPage.value = 1
})

const onIndustryChange = () => {
  currentPage.value = 1
}

const locationText = (item: EnterpriseItem) => `${item.province}/${item.city}`

const goDetail = (id: number) => {
  void router.push({ name: 'enterprise-db-detail', params: { id: String(id) } })
}
</script>

<template>
  <a-card class="enterprise-card" :bordered="false">
    <div class="toolbar">
      <span
        class="result-count"
        :style="{ '--result-count-bg': `url(${titleStyleBg})` }"
      >
        共收录
        <em>{{ enterpriseTotal }}</em>
        家企业
      </span>
      <a-button type="primary" class="map-btn">产业图谱</a-button>
    </div>

    <div class="filter-row">
      <span class="filter-label">注册地址：</span>
      <div class="filter-options">
        <a
          v-for="province in visibleProvinces"
          :key="province"
          class="option-link"
          :class="{ active: filters.province === province }"
          @click="selectProvince(province)"
        >
          {{ province }}
        </a>
      </div>
      <a class="more-link" @click="showMoreProvinces = !showMoreProvinces">
        {{ showMoreProvinces ? '收起' : '更多' }}
        <DownOutlined :class="{ rotated: showMoreProvinces }" />
      </a>
    </div>

    <div class="filter-row industry-row">
      <span class="filter-label">所属产业：</span>
      <div class="filter-options">
        <a-checkbox-group
          v-model:value="filters.industries"
          :options="visibleIndustries"
          @change="onIndustryChange"
        />
      </div>
      <a class="more-link" @click="showMoreIndustries = !showMoreIndustries">
        {{ showMoreIndustries ? '收起' : '更多' }}
        <DownOutlined :class="{ rotated: showMoreIndustries }" />
      </a>
    </div>

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
</template>

<style scoped lang="scss">
.hero-inner {
  padding-bottom: 34px;
}
.enterprise-card {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

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

.result-count {
  display: inline-block;
  padding-left: 20px;
  font-size: 15px;
  line-height: 26px;
  color: #343434;
  background: var(--result-count-bg) no-repeat left center;
  background-size: 94px 26px;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
    margin: 0 2px;
  }
}

.map-btn {
  height: 36px;
  padding-inline: 18px;
  border-radius: 6px;
  font-weight: 500;
}

.filter-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
}

.filter-label {
  flex-shrink: 0;
  width: 80px;
  color: #8c8c8c;
  line-height: 32px;
  font-size: 16px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 18px;
  flex: 1;
  min-width: 0;

  :deep(.ant-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
  }

  :deep(.ant-checkbox-wrapper) {
    font-size: 16px;
    color: #262626;
    margin-inline-end: 0;
  }
}

.option-link {
  color: #262626;
  line-height: 32px;
  font-size: 16px;
  cursor: pointer;

  &.active,
  &:hover {
    color: var(--pb-primary);
  }
}

.more-link {
  flex-shrink: 0;
  align-self: flex-start;
  display: flex;
  align-items: center;
  color: var(--pb-primary);
  line-height: 32px;
  white-space: nowrap;
  cursor: pointer;

  .anticon {
    margin-left: 2px;
    font-size: 12px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 8px;
}

@media (max-width: 992px) {
  .enterprise-grid {
    grid-template-columns: 1fr;
  }

  .filter-label {
    width: auto;
  }
}
</style>
