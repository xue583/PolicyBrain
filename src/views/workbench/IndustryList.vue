<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ClearOutlined,
  DownOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyOutlined,
  SearchOutlined,
  SwapOutlined,
  UpOutlined,
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
import bannerImg from '@/assets/workbench/wb-industry-banner.png'

const props = defineProps<{ role: 'enterprise' | 'service' }>()

defineOptions({ name: 'IndustryList' })

type TabKey = 'related' | 'upstream' | 'downstream'

const PAGE_SIZE = 10

const tabs: Array<{ key: TabKey; label: string; count: number }> = [
  { key: 'related', label: '相关企业', count: relatedCompanies.length },
  { key: 'upstream', label: '上游企业', count: upstreamCompanies.length },
  { key: 'downstream', label: '下游企业', count: downstreamCompanies.length },
]

const tabRows: Record<TabKey, IndustryCompany[]> = {
  related: relatedCompanies,
  upstream: upstreamCompanies,
  downstream: downstreamCompanies,
}

/** 企业视角首行省份数（收起态可见项，与设计稿图一首行一致） */
const ENTERPRISE_COLLAPSED_COUNT = 15

const activeTab = ref<TabKey>('related')
const keyword = ref('')
const regionExpanded = ref(true)
/** 设计稿默认选中河南省/郑州市；区域筛选为展示态，不联动表格数据 */
const selectedRegions = ref<string[]>(['河南省', '郑州市'])
const page = ref(1)
const jumpInput = ref('')

const provinceList = computed(() =>
  props.role === 'service' ? serviceProvinces : enterpriseProvinces,
)

const visibleProvinces = computed(() =>
  props.role === 'service' || regionExpanded.value
    ? provinceList.value
    : provinceList.value.slice(0, ENTERPRISE_COLLAPSED_COUNT),
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

const total = computed(() => filteredRows.value.length)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / PAGE_SIZE)),
)
const pagedRows = computed(() =>
  filteredRows.value.slice(
    (page.value - 1) * PAGE_SIZE,
    page.value * PAGE_SIZE,
  ),
)

watch([activeTab, keyword], () => {
  page.value = 1
})

const toggleRegion = (label: string) => {
  const list = selectedRegions.value
  const index = list.indexOf(label)
  if (index > -1) list.splice(index, 1)
  else list.push(label)
}

const clearRegions = () => {
  selectedRegions.value = []
}

const goPage = (p: number) => {
  page.value = Math.min(Math.max(p, 1), totalPages.value)
}

const jumpPage = () => {
  const p = Number.parseInt(jumpInput.value, 10)
  if (!Number.isNaN(p)) goPage(p)
  jumpInput.value = ''
}

const getPopupContainer = (node: HTMLElement) =>
  node.parentElement ?? document.body
</script>

<template>
  <div class="industry-list">
    <section
      class="page-banner"
      :style="{ backgroundImage: `url(${bannerImg})` }"
    >
      <div class="banner-text">
        <h2>产业数据</h2>
        <p>
          您可在“企业管理--产品/服务板块”更改您的产品或服务及对应的产业标签，我们将会为您提供更精准的产业线索。
        </p>
      </div>
    </section>

    <section class="page-card">
      <div v-if="role === 'service'" class="serve-head">
        <span class="serve-icon">
          <SwapOutlined class="serve-icon-glyph" />
        </span>
        <h2 class="serve-title">{{ serviceEnterpriseTitle }}</h2>
      </div>

      <div class="tabs-row">
        <div class="tabs">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            class="tab"
            :class="{ 'is-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}（{{ tab.count }}）
          </span>
        </div>
        <div v-if="role === 'enterprise'" class="search-box">
          <div class="search-input">
            <SearchOutlined class="search-icon" />
            <input v-model="keyword" placeholder="请输入企业或产品或服务" />
          </div>
          <button type="button" class="search-btn" @click="goPage(1)">
            搜 索
          </button>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">区域筛选：</span>
        <div class="filter-body" :class="{ 'no-fold': role === 'service' }">
          <template v-for="p in visibleProvinces" :key="p">
            <a-dropdown
              v-if="cityMap[p]"
              :trigger="['hover', 'click']"
              placement="bottomLeft"
              :get-popup-container="getPopupContainer"
            >
              <span
                class="region-item"
                :class="{ 'is-active': selectedRegions.includes(p) }"
                @click="toggleRegion(p)"
              >
                {{ p }}
              </span>
              <template #overlay>
                <div class="ind-city-panel">
                  <span
                    v-for="c in cityMap[p]"
                    :key="c"
                    class="city-item"
                    :class="{ 'is-active': selectedRegions.includes(c) }"
                    @click="toggleRegion(c)"
                  >
                    {{ c }}
                  </span>
                </div>
              </template>
            </a-dropdown>
            <span
              v-else
              class="region-item"
              :class="{ 'is-active': selectedRegions.includes(p) }"
              @click="toggleRegion(p)"
            >
              {{ p }}
            </span>
          </template>
          <span
            v-if="role === 'enterprise'"
            class="fold-btn"
            @click="regionExpanded = !regionExpanded"
          >
            {{ regionExpanded ? '收起' : '展开' }}
            <UpOutlined v-if="regionExpanded" class="fold-icon" />
            <DownOutlined v-else class="fold-icon" />
          </span>
        </div>
      </div>

      <div v-if="selectedRegions.length" class="filter-row selected-row">
        <span class="filter-label">已选：</span>
        <div class="filter-body selected-body">
          <span
            v-for="label in selectedRegions"
            :key="label"
            class="selected-tag"
          >
            {{ label }}
            <span class="tag-close" @click="toggleRegion(label)">
              <svg viewBox="0 0 10 10"><path d="m2 2 6 6M8 2 2 8" /></svg>
            </span>
          </span>
          <span class="clear-btn" @click="clearRegions">
            <ClearOutlined class="clear-icon" />
            清空
          </span>
        </div>
      </div>

      <div class="table-wrap">
        <table class="ind-table">
          <colgroup>
            <col style="width: 56px" />
            <col style="width: 240px" />
            <col style="width: 11%" />
            <col style="width: 21.5%" />
            <col style="width: 21.5%" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>单位名称</th>
              <th>所在省市</th>
              <th>主营产品</th>
              <th>涉及标签</th>
              <th>注册地址</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in pagedRows" :key="row.id">
              <td>{{ (page - 1) * PAGE_SIZE + i + 1 }}</td>
              <td>
                <div class="cell-ellipsis" :title="row.unit">
                  {{ row.unit }}
                </div>
              </td>
              <td>
                <span class="loc-cell">
                  <EnvironmentOutlined class="loc-icon" />
                  {{ row.province }}
                </span>
              </td>
              <td>
                <div class="cell-ellipsis" :title="row.product">
                  {{ row.product }}
                </div>
              </td>
              <td>
                <div class="tag-group">
                  <span
                    v-for="(tag, ti) in row.tags"
                    :key="`${tag}-${ti}`"
                    class="tag-pill"
                  >
                    <SafetyOutlined class="tag-icon" />
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td>
                <div class="cell-ellipsis" :title="row.address">
                  {{ row.address }}
                </div>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="6" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span class="pager-total">共{{ total }}条</span>
        <span
          class="pager-nav"
          :class="{ 'is-disabled': page === 1 }"
          @click="goPage(page - 1)"
        >
          <LeftOutlined />
        </span>
        <span
          v-for="p in totalPages"
          :key="p"
          class="pager-num"
          :class="{ 'is-active': p === page }"
          @click="goPage(p)"
        >
          {{ p }}
        </span>
        <span
          class="pager-nav"
          :class="{ 'is-disabled': page === totalPages }"
          @click="goPage(page + 1)"
        >
          <RightOutlined />
        </span>
        <span class="pager-jump">
          前往
          <input
            v-model="jumpInput"
            class="pager-input"
            @keydown.enter="jumpPage"
          />
          页
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.industry-list {
  flex: 1;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.page-banner {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 18px 26px 18px 90px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  border-radius: 16px;
}

.banner-text {
  h2 {
    margin: 0;
    color: #1f1f1f;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin: 6px 0 0;
    color: #999;
    font-size: 14px;
    line-height: 1.5;
  }
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

.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.serve-head + .tabs-row {
  margin-top: 10px;
}

.tabs {
  display: flex;
  gap: 36px;
}

.tab {
  position: relative;
  padding: 16px 2px 13px;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }

  &.is-active {
    color: var(--pb-primary);

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      background: var(--pb-primary);
      border-radius: 2px;
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.search-input {
  display: flex;
  align-items: center;
  width: 264px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d9e2f2;
  border-radius: 6px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--pb-primary);
  }
}

.search-icon {
  color: #666;
  font-size: 14px;
}

.search-input input {
  flex: 1;
  min-width: 0;
  margin-left: 6px;
  color: #333;
  font-size: 13px;
  border: none;
  outline: none;

  &::placeholder {
    color: #999;
  }
}

.search-btn {
  height: 34px;
  padding: 0 16px;
  color: #fff;
  font-size: 14px;
  background: var(--pb-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
}

.filter-row {
  display: flex;
  margin-top: 18px;
  font-size: 14px;
  line-height: 22px;
}

.filter-label {
  flex-shrink: 0;
  width: 84px;
  color: #1f1f1f;
  font-weight: 600;
}

.filter-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  column-gap: 28px;
  row-gap: 14px;
  min-width: 0;
  padding-right: 70px;

  &.no-fold {
    padding-right: 0;
  }
}

.region-item {
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover,
  &.is-active {
    color: var(--pb-primary);
  }
}

.fold-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  top: 0;
  right: 0;
  color: var(--pb-primary);
  cursor: pointer;
}

.fold-icon {
  font-size: 11px;
}

.ind-city-panel {
  display: flex;
  flex-wrap: wrap;
  column-gap: 26px;
  row-gap: 12px;
  min-width: 520px;
  max-width: 720px;
  padding: 14px 18px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(31, 56, 88, 0.12);
}

.city-item {
  color: #333;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover,
  &.is-active {
    color: var(--pb-primary);
  }
}

.selected-row {
  margin-top: 20px;
}

.selected-body {
  column-gap: 14px;
  padding-right: 0;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px;
  color: var(--pb-primary);
  font-size: 13px;
  line-height: 20px;
  background: #fff;
  border: 1px solid #8ab6f5;
  border-radius: 4px;
}

.tag-close {
  display: inline-flex;
  cursor: pointer;

  svg {
    width: 9px;
    height: 9px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
  }

  &:hover {
    color: #ff4d4f;
  }
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }
}

.clear-icon {
  font-size: 14px;
}

.table-wrap {
  margin-top: 20px;
  overflow-x: auto;
  border: 1px solid #eef0f4;
  border-radius: 8px;
}

.ind-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 400;
    text-align: left;
    border-bottom: 1px solid #eef0f4;

    &:not(:last-child) {
      border-right: 1px solid #eef0f4;
    }
  }

  thead th {
    color: #3f74b8;
    font-weight: 600;
    white-space: nowrap;
    background: #e9f1fb;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  td {
    color: #333;
    white-space: nowrap;
  }
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

.empty-cell {
  padding: 40px 0 !important;
  color: #999;
  text-align: center !important;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  color: #333;
  font-size: 14px;
}

.pager-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }

  &.is-disabled {
    color: #d9d9d9;
    cursor: not-allowed;
  }
}

.pager-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 4px;
  cursor: pointer;
  border-radius: 4px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }

  &.is-active {
    color: #fff;
    background: var(--pb-primary);

    &:hover {
      color: #fff;
    }
  }
}

.pager-jump {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.pager-input {
  width: 40px;
  height: 26px;
  color: #333;
  font-size: 13px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: var(--pb-primary);
  }
}

@include below-lg {
  .tabs-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .serve-title {
    font-size: 17px;
  }
}
</style>
