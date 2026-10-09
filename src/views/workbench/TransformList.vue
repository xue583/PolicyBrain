<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RightOutlined, TagOutlined } from '@ant-design/icons-vue'
import {
  cityMap,
  collapsedIndustryCount,
  collapsedProvinceCount,
  industryList,
  provinceList,
  transformAchievements,
  type IndustryOption,
  type LegalStatus,
  type TransformAchievement,
} from '@/mock/transform'
import { usePagination } from '@/composables/usePagination'
import WbPageBanner from './components/WbPageBanner.vue'
import WbTabs from './components/WbTabs.vue'
import WbSearchBar from './components/WbSearchBar.vue'
import WbFilterRow from './components/WbFilterRow.vue'
import WbRegionFilter from './components/WbRegionFilter.vue'
import WbDataTable from './components/WbDataTable.vue'
import WbPagination from './components/WbPagination.vue'
import bannerImg from '@/assets/workbench/wb-transform-banner.png'

defineOptions({ name: 'TransformList' })

type TabKey = 'latest' | 'mine'

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'latest', label: '最新成果' },
  { key: 'mine', label: '与我相关' },
]

const PAGE_SIZE = 10

const activeTab = ref<TabKey>('latest')
const keyword = ref('')
const industryExpanded = ref(false)
const selectedRegions = ref<string[]>([])
const checkedIndustries = ref<string[]>([])

/** 级联面板：悬停中的父级产业与子项（同一时刻只有一个面板展开） */
const openIndustry = ref<IndustryOption | null>(null)
const hoveredChild = ref(-1)

const statusClassMap: Record<LegalStatus, string> = {
  授权: 'is-auth',
  实质审查: 'is-review',
  公开: 'is-open',
}

const statusClassOf = (status: LegalStatus) => statusClassMap[status]

const regionLabel = computed(() =>
  activeTab.value === 'latest' ? '全国省市' : '区域筛选',
)

const visibleIndustries = computed(() =>
  industryExpanded.value
    ? industryList
    : industryList.slice(0, collapsedIndustryCount),
)

const activeChild = computed(
  () => openIndustry.value?.children?.[hoveredChild.value] ?? null,
)

const matchRegion = (row: TransformAchievement) => {
  if (selectedRegions.value.includes(row.province)) return true
  const cities = cityMap[row.province]
  return Boolean(cities?.some((c) => selectedRegions.value.includes(c)))
}

const filteredRows = computed(() => {
  let rows = transformAchievements
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    rows = rows.filter((r) =>
      [r.unit, r.patent, r.product, ...r.tags].some((t) =>
        t.toLowerCase().includes(kw),
      ),
    )
  }
  if (selectedRegions.value.length) {
    rows = rows.filter(matchRegion)
  }
  if (checkedIndustries.value.length) {
    rows = rows.filter(
      (r) =>
        checkedIndustries.value.includes(r.industry) ||
        r.tags.some((t) => checkedIndustries.value.includes(t)),
    )
  }
  return rows
})

const {
  currentPage: page,
  total,
  pagedList: pagedRows,
  resetPage,
} = usePagination(filteredRows, { pageSize: PAGE_SIZE })

watch([keyword, selectedRegions, checkedIndustries], () => {
  resetPage()
})

const toggleIndustry = (label: string) => {
  const list = checkedIndustries.value
  const index = list.indexOf(label)
  if (index > -1) list.splice(index, 1)
  else list.push(label)
}

const onTriggerEnter = (ind: IndustryOption) => {
  openIndustry.value = ind
  hoveredChild.value = -1
}

const closeCascader = () => {
  hoveredChild.value = -1
}

const getPopupContainer = (node: HTMLElement) =>
  node.parentElement ?? document.body

const tableColumns = [
  { title: '序号', key: 'index', width: '56px' },
  { title: '单位名称', key: 'unit', width: '200px' },
  { title: '发明人', key: 'inventors', width: '118px' },
  { title: '专利成果名称', key: 'patent', width: '27%' },
  { title: '申请日', key: 'applyDate', width: '108px' },
  { title: '最新法律状态', key: 'status', width: '108px' },
  { title: '产品/服务栏', key: 'product', width: '26%' },
  { title: '涉及标签', key: 'tags', width: '128px' },
]
</script>

<template>
  <div class="transform-list">
    <WbPageBanner
      title="成果转化"
      description="您可在“企业管理--产品/服务板块”更改您的产品或服务及对应的产业标签，我们将会为您提供更精准的成果转化线索。"
      :image="bannerImg"
      offset="110px"
    />

    <section class="page-card">
      <WbTabs v-model:active-key="activeTab" :tabs="tabs">
        <template #extra>
          <WbSearchBar
            v-model="keyword"
            class="card-search"
            @search="resetPage"
          />
        </template>
      </WbTabs>

      <WbRegionFilter
        v-model:selected="selectedRegions"
        :provinces="provinceList"
        :city-map="cityMap"
        :label="regionLabel"
        :collapsible="activeTab === 'latest'"
        :collapsed-count="collapsedProvinceCount"
        :gap="34"
        filled-tag
      />

      <WbFilterRow
        v-if="activeTab === 'latest'"
        v-model:expanded="industryExpanded"
        label="所属产业："
        :gap="34"
        expand-text="更多"
        collapsible
      >
        <template v-for="ind in visibleIndustries" :key="ind.label">
          <a-dropdown
            v-if="ind.children"
            :trigger="['hover', 'click']"
            placement="bottomLeft"
            :get-popup-container="getPopupContainer"
          >
            <span
              class="industry-item"
              :class="{ 'is-active': checkedIndustries.includes(ind.label) }"
              @mouseenter="onTriggerEnter(ind)"
            >
              <span
                class="tf-ck"
                :class="{ 'is-on': checkedIndustries.includes(ind.label) }"
                @click.stop="toggleIndustry(ind.label)"
              >
                <svg viewBox="0 0 12 12">
                  <path d="M2.6 6.3 5 8.6l4.4-5.2" />
                </svg>
              </span>
              <span class="item-txt">{{ ind.label }}</span>
            </span>
            <template #overlay>
              <div class="tf-cascader" @mouseleave="closeCascader">
                <div class="tf-cascader-list">
                  <div
                    v-for="(child, i) in ind.children"
                    :key="child.label"
                    class="tf-cascader-item"
                    :class="{ 'is-hover': hoveredChild === i }"
                    @mouseenter="hoveredChild = i"
                  >
                    <span
                      class="tf-ck"
                      :class="{
                        'is-on': checkedIndustries.includes(child.label),
                      }"
                      @click.stop="toggleIndustry(child.label)"
                    >
                      <svg viewBox="0 0 12 12">
                        <path d="M2.6 6.3 5 8.6l4.4-5.2" />
                      </svg>
                    </span>
                    <span
                      class="item-txt"
                      :class="{
                        'is-checked': checkedIndustries.includes(child.label),
                      }"
                    >
                      {{ child.label }}
                    </span>
                    <RightOutlined
                      v-if="child.children"
                      class="cascader-arrow"
                    />
                  </div>
                </div>
                <div
                  v-if="activeChild?.children"
                  class="tf-cascader-list is-sub"
                >
                  <div
                    v-for="sub in activeChild.children"
                    :key="sub.label"
                    class="tf-cascader-item"
                  >
                    <span
                      class="tf-ck"
                      :class="{
                        'is-on': checkedIndustries.includes(sub.label),
                      }"
                      @click.stop="toggleIndustry(sub.label)"
                    >
                      <svg viewBox="0 0 12 12">
                        <path d="M2.6 6.3 5 8.6l4.4-5.2" />
                      </svg>
                    </span>
                    <span
                      class="item-txt"
                      :class="{
                        'is-checked': checkedIndustries.includes(sub.label),
                      }"
                    >
                      {{ sub.label }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </a-dropdown>
          <span
            v-else
            class="industry-item"
            :class="{ 'is-active': checkedIndustries.includes(ind.label) }"
          >
            <span
              class="tf-ck"
              :class="{ 'is-on': checkedIndustries.includes(ind.label) }"
              @click="toggleIndustry(ind.label)"
            >
              <svg viewBox="0 0 12 12">
                <path d="M2.6 6.3 5 8.6l4.4-5.2" />
              </svg>
            </span>
            <span class="item-txt">{{ ind.label }}</span>
          </span>
        </template>
      </WbFilterRow>

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
            <div class="cell-ellipsis">{{ record.unit }}</div>
          </template>
          <template v-else-if="column.key === 'inventors'">
            <div class="cell-ellipsis">{{ record.inventors }}</div>
          </template>
          <template v-else-if="column.key === 'patent'">
            <div class="cell-ellipsis" :title="record.patent">
              {{ record.patent }}
            </div>
          </template>
          <template v-else-if="column.key === 'applyDate'">
            {{ record.applyDate }}
          </template>
          <template v-else-if="column.key === 'status'">
            <span class="status-pill" :class="statusClassOf(record.status)">
              {{ record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'product'">
            <div class="cell-ellipsis" :title="record.product">
              {{ record.product }}
            </div>
          </template>
          <template v-else-if="column.key === 'tags'">
            <span v-for="tag in record.tags" :key="tag" class="tag-pill">
              <TagOutlined class="tag-icon" />
              {{ tag }}
            </span>
          </template>
        </template>
        <template #emptyText>暂无数据</template>
      </WbDataTable>

      <WbPagination v-model:current="page" :total="total" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.transform-list {
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

.card-search {
  padding-bottom: 10px;
}

.industry-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .item-txt {
    color: #333;
    transition: color 0.2s ease;
  }

  &:hover .item-txt {
    color: var(--pb-primary);
  }
}

.tf-ck {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  svg {
    width: 10px;
    height: 10px;
    fill: none;
    stroke: #fff;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
  }

  &.is-on {
    background: var(--pb-primary);
    border-color: var(--pb-primary);

    svg {
      opacity: 1;
    }
  }
}

.tf-cascader {
  display: flex;
  min-width: 200px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(31, 56, 88, 0.12);
}

.tf-cascader-list {
  padding: 8px 0;
  min-width: 170px;

  .tf-cascader-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    cursor: pointer;

    &.is-hover {
      background: #f5f8fd;
    }

    .item-txt {
      color: #333;
      font-size: 13px;
      line-height: 20px;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .item-txt.is-checked {
      color: var(--pb-primary);
    }
  }

  &.is-sub {
    border-left: 1px solid #eef0f4;
  }
}

.cascader-arrow {
  margin-left: auto;
  color: #999;
  font-size: 11px;
}

.cell-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 13px;
  line-height: 20px;
  border-radius: 4px;

  &.is-auth {
    color: #2fb182;
    background: #e6f7ef;
  }

  &.is-review {
    color: #ff8a1e;
    background: #fdf1e2;
  }

  &.is-open {
    color: #3e7bfa;
    background: #e9f1fe;
  }
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
  font-size: 11px;
}

@include below-lg {
  :deep(.wb-tabs .ant-tabs-nav) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
