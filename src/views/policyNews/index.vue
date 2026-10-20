<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRouteKeyword } from '@/composables/useRouteKeyword'
import { useCollapsedList } from '@/composables/useCollapsedList'
import { useServerPage } from '@/composables/useServerPage'
import {
  DownOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import {
  industries as fallbackIndustries,
  policyLevels,
  infoTypes as fallbackInfoTypes,
  type PolicyItem,
} from '../../mock/policyNews'
import { fetchNewsPage } from '@/api/news'
import {
  fetchIndustryTree,
  fetchInfoTypeOptions,
  type IndustryNode,
} from '@/api/meta'
import IndustryCascadeFilter from '@/components/common/IndustryCascadeFilter.vue'
import { useRegionStore } from '@/stores/region'
import { clearRegionSelection } from '@/utils/regionActions'
import RegionCascadeFilter from '@/components/common/RegionCascadeFilter.vue'

defineOptions({ name: 'PolicyNews' })

const router = useRouter()

const keyword = useRouteKeyword()
const region = useRegionStore()
const { selectedLabel: regionLabel } = storeToRefs(region)

const filters = reactive({
  industries: [] as string[],
  levels: [] as string[],
  infoTypes: [] as string[],
})

const toIndustryNodes = (names: string[]): IndustryNode[] =>
  names.map((name, index) => ({ id: -(index + 1), name, children: [] }))

const industryTree = ref<IndustryNode[]>(toIndustryNodes(fallbackIndustries))
const infoTypes = ref<Array<{ label: string; value: string }>>(
  fallbackInfoTypes.map((item) => ({ ...item })),
)

const { showMore: showMoreIndustries, visibleList: visibleIndustries } =
  useCollapsedList(industryTree, 8)

const selectedConditions = computed(() => {
  const list: { key: string; label: string }[] = []
  if (regionLabel.value) {
    list.push({ key: 'region', label: `省市地区：${regionLabel.value}` })
  }
  filters.industries.forEach((item) => {
    list.push({ key: `industry:${item}`, label: `行业分类：${item}` })
  })
  filters.levels.forEach((value) => {
    const found = policyLevels.find((l) => l.value === value)
    if (found)
      list.push({ key: `level:${value}`, label: `政策级别：${found.label}` })
  })
  filters.infoTypes.forEach((value) => {
    const found = infoTypes.value.find((t) => t.value === value)
    if (found)
      list.push({ key: `type:${value}`, label: `资讯类型：${found.label}` })
  })
  return list
})

const {
  currentPage,
  pageSize,
  items: pagedList,
  total,
  loading,
  error,
  reload,
} = useServerPage(
  (pageIndex, pageSize) =>
    fetchNewsPage({
      keyword: keyword.value,
      provinceId: region.provinceId,
      cityId: region.cityId,
      districtId: region.districtId,
      industries: filters.industries,
      levels: filters.levels,
      infoTypes: filters.infoTypes,
      pageIndex,
      pageSize,
    }),
  () =>
    JSON.stringify({
      keyword: keyword.value,
      provinceId: region.provinceId,
      cityId: region.cityId,
      districtId: region.districtId,
      industries: filters.industries,
      levels: filters.levels,
      infoTypes: filters.infoTypes,
    }),
)

const removeCondition = (key: string) => {
  if (key === 'region') {
    clearRegionSelection()
  } else if (key.startsWith('industry:')) {
    const value = key.slice('industry:'.length)
    filters.industries = filters.industries.filter((i) => i !== value)
  } else if (key.startsWith('level:')) {
    const value = key.slice('level:'.length)
    filters.levels = filters.levels.filter((i) => i !== value)
  } else if (key.startsWith('type:')) {
    const value = key.slice('type:'.length)
    filters.infoTypes = filters.infoTypes.filter((i) => i !== value)
  }
}

const clearConditions = () => {
  clearRegionSelection()
  filters.industries = []
  filters.levels = []
  filters.infoTypes = []
}

onMounted(() => {
  void fetchIndustryTree()
    .then((nodes) => {
      if (nodes.length) industryTree.value = nodes
    })
    .catch(() => undefined)
  void fetchInfoTypeOptions()
    .then((options) => {
      if (options.length) infoTypes.value = options
    })
    .catch(() => undefined)
})

const openDetail = (item: PolicyItem) => {
  void router.push({ name: 'news-detail', params: { id: String(item.id) } })
}
</script>

<template>
  <PageState>
    <div class="policy-news">
      <!-- Filters -->
      <div class="filter-panel">
        <a-card class="pb-card-lg">
          <RegionCascadeFilter label="省市地区：" :collapsed-count="12" />

          <div class="filter-row">
            <span class="filter-label">行业分类：</span>
            <div class="filter-options">
              <IndustryCascadeFilter
                v-model="filters.industries"
                :options="visibleIndustries"
              />
              <a
                class="more-link"
                @click="showMoreIndustries = !showMoreIndustries"
              >
                {{ showMoreIndustries ? '收起' : '更多' }}
                <DownOutlined :class="{ rotated: showMoreIndustries }" />
              </a>
            </div>
          </div>

          <div class="filter-row">
            <span class="filter-label">政策级别：</span>
            <div class="filter-options">
              <a-checkbox-group
                v-model:value="filters.levels"
                :options="policyLevels"
              />
            </div>
          </div>

          <div class="filter-row">
            <span class="filter-label">资讯类型：</span>
            <div class="filter-options">
              <a-checkbox-group
                v-model:value="filters.infoTypes"
                :options="infoTypes"
              />
            </div>
          </div>

          <div class="selected-section">
            <div class="filter-row selected-row">
              <span class="filter-label">已选条件：</span>
              <div class="selected-tags">
                <template v-if="selectedConditions.length">
                  <a-tag
                    v-for="item in selectedConditions"
                    :key="item.key"
                    closable
                    class="condition-tag"
                    @close="removeCondition(item.key)"
                  >
                    {{ item.label }}
                  </a-tag>
                </template>
                <span v-else class="empty-selected">暂无筛选条件</span>
              </div>
              <a
                v-if="selectedConditions.length"
                class="clear-link"
                @click="clearConditions"
              >
                <DeleteOutlined />
                删除
              </a>
            </div>
          </div>
        </a-card>
      </div>

      <!-- Tips -->
      <div class="result-bar">共找到 {{ total }} 条政策资讯</div>

      <a-alert
        v-if="error"
        class="list-alert"
        type="error"
        show-icon
        :message="error"
      >
        <template #action>
          <a-button size="small" @click="reload">重试</a-button>
        </template>
      </a-alert>

      <!-- List -->
      <a-spin :spinning="loading">
        <div class="list-section">
          <a-empty
            v-if="!loading && !pagedList.length"
            description="暂无政策资讯"
          />
          <div v-else class="policy-cards">
            <div
              v-for="item in pagedList"
              :key="item.id"
              class="policy-card"
              @click="openDetail(item)"
            >
              <span
                class="status-badge"
                :class="item.status === 'expired' ? 'expired' : 'applying'"
              >
                {{ item.status === 'expired' ? '已过期' : '申报中' }}
              </span>

              <div class="item-head">
                <a class="item-title">{{ item.title }}</a>
              </div>

              <div class="item-tags">
                <template v-for="(tag, index) in item.tags" :key="tag.text">
                  <a-tag :color="tag.color">{{ tag.text }}</a-tag>
                  <a-tag v-if="index === 0" color="processing">{{
                    item.department
                  }}</a-tag>
                </template>
              </div>

              <p class="item-desc">{{ item.description }}</p>

              <div class="item-meta">
                <span>发布日期：{{ item.date }}</span>
                <span>发文机构：{{ item.department }}</span>
              </div>

              <a-divider class="tabs-divider" />

              <div class="item-remain">
                <ClockCircleOutlined />
                <span
                  class="remain-text"
                  :class="{ danger: item.daysRemaining <= 0 }"
                >
                  剩余天数：{{ item.daysRemaining }}天
                </span>
                <span>｜</span>
                <span class="date-range"
                  >{{ item.date }} 至 {{ item.endDate }}</span
                >
              </div>
            </div>
          </div>

          <div class="pagination-wrap">
            <a-pagination
              v-model:current="currentPage"
              :total="total"
              :page-size="pageSize"
              show-quick-jumper
              :show-total="(t: number) => `共 ${t} 条`"
            />
          </div>
        </div>
      </a-spin>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.filter-panel {
  padding: 0 0 8px;
  margin-bottom: 12px;
  font-size: 16px;
}

.filter-label {
  width: auto;
}

.filter-options :global(.ant-checkbox-wrapper) {
  font-size: 16px;
}

.tabs-divider {
  margin: 8px 0 4px;
  border-color: #f0f0f0;
}

.result-bar {
  padding-left: 12px;
  margin-bottom: 16px;
  font-size: 18px;
  color: #343434;
  border-left: 3px solid var(--pb-primary);
}

.list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-card {
  position: relative;
  padding: 20px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  box-shadow: var(--pb-shadow-card);
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  overflow: hidden;

  &:hover {
    box-shadow: 0 6px 20px rgba(22, 119, 255, 0.1);
    transform: translateY(-1px);

    .item-title {
      color: var(--pb-primary);
    }
  }
}

.item-head {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding-right: 72px;
}

.item-title {
  flex: 1;
  font-size: 22px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.4;
}

.status-badge {
  position: absolute;
  top: 20px;
  right: 0;
  min-width: 64px;
  padding: 4px 14px 4px 20px;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%);

  &.applying {
    background: linear-gradient(90deg, #ed7901 0%, #ed790100 100%);
  }

  &.expired {
    background: linear-gradient(90deg, #bfbfbf 0%, #ed790100 100%);
  }
}

.item-tags {
  margin-bottom: 10px;

  :deep(.ant-tag) {
    margin-inline-end: 10px;
    font-size: 14px;
  }
}

.item-desc {
  margin: 0 0 12px;
  color: #8c8c8c;
  font-size: 16px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pb-gap);
  margin-bottom: 10px;
  color: #8c8c8c;
  font-size: 16px;
}

.item-remain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 14px;
  margin-top: 10px;

  .anticon {
    color: #8c8c8c;
  }
}

.remain-text {
  color: var(--pb-primary);

  &.danger {
    color: #ff4d4f;
  }
}

.date-range {
  color: #8c8c8c;
}

.pagination-wrap {
  --pagination-padding: 8px 0 4px;
}
</style>
