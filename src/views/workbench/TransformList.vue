<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ClearOutlined,
  DownOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  TagOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
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
const regionExpanded = ref(true)
const industryExpanded = ref(false)
const selectedRegions = ref<string[]>([])
const checkedIndustries = ref<string[]>([])
const page = ref(1)
const jumpInput = ref('')

/** 级联面板：悬停中的父级产业与子项（同一时刻只有一个面板展开） */
const openIndustry = ref<IndustryOption | null>(null)
const hoveredChild = ref(-1)

const statusClassMap: Record<LegalStatus, string> = {
  授权: 'is-auth',
  实质审查: 'is-review',
  公开: 'is-open',
}

const visibleProvinces = computed(() =>
  activeTab.value === 'mine' || regionExpanded.value
    ? provinceList
    : provinceList.slice(0, collapsedProvinceCount),
)

const visibleIndustries = computed(() =>
  industryExpanded.value
    ? industryList
    : industryList.slice(0, collapsedIndustryCount),
)

const regionLabel = computed(() =>
  activeTab.value === 'latest' ? '全国省市' : '区域筛选',
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

watch([keyword, selectedRegions, checkedIndustries], () => {
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
  <div class="transform-list">
    <section
      class="page-banner"
      :style="{ backgroundImage: `url(${bannerImg})` }"
    >
      <div class="banner-text">
        <h2>成果转化</h2>
        <p>
          您可在“企业管理--产品/服务板块”更改您的产品或服务及对应的产业标签，我们将会为您提供更精准的成果转化线索。
        </p>
      </div>
    </section>

    <section class="page-card">
      <div class="tabs-row">
        <div class="tabs">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            class="tab"
            :class="{ 'is-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </span>
        </div>
        <div class="search-box">
          <div class="search-input">
            <SearchOutlined class="search-icon" />
            <input v-model="keyword" placeholder="请输入企业或产品或服务" />
          </div>
          <button type="button" class="search-btn" @click="goPage(1)">
            搜索
          </button>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">{{ regionLabel }}：</span>
        <div class="filter-body">
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
                <div class="tf-city-panel">
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
            v-if="activeTab === 'latest'"
            class="fold-btn"
            @click="regionExpanded = !regionExpanded"
          >
            {{ regionExpanded ? '收起' : '展开' }}
            <UpOutlined v-if="regionExpanded" class="fold-icon" />
            <DownOutlined v-else class="fold-icon" />
          </span>
        </div>
      </div>

      <div v-if="activeTab === 'latest'" class="filter-row">
        <span class="filter-label">所属产业：</span>
        <div class="filter-body">
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
          <span class="fold-btn" @click="industryExpanded = !industryExpanded">
            {{ industryExpanded ? '收起' : '更多' }}
            <DownOutlined v-if="!industryExpanded" class="fold-icon" />
            <UpOutlined v-else class="fold-icon" />
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
        <table class="tf-table">
          <colgroup>
            <col style="width: 56px" />
            <col style="width: 200px" />
            <col style="width: 118px" />
            <col style="width: 27%" />
            <col style="width: 108px" />
            <col style="width: 108px" />
            <col style="width: 26%" />
            <col style="width: 128px" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>单位名称</th>
              <th>发明人</th>
              <th>专利成果名称</th>
              <th>申请日</th>
              <th>最新法律状态</th>
              <th>产品/服务栏</th>
              <th>涉及标签</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in pagedRows" :key="row.id">
              <td>{{ (page - 1) * PAGE_SIZE + i + 1 }}</td>
              <td>
                <div class="cell-ellipsis">{{ row.unit }}</div>
              </td>
              <td>
                <div class="cell-ellipsis">{{ row.inventors }}</div>
              </td>
              <td>
                <div class="cell-ellipsis" :title="row.patent">
                  {{ row.patent }}
                </div>
              </td>
              <td>{{ row.applyDate }}</td>
              <td>
                <span class="status-pill" :class="statusClassMap[row.status]">{{
                  row.status
                }}</span>
              </td>
              <td>
                <div class="cell-ellipsis" :title="row.product">
                  {{ row.product }}
                </div>
              </td>
              <td>
                <span v-for="tag in row.tags" :key="tag" class="tag-pill">
                  <TagOutlined class="tag-icon" />
                  {{ tag }}
                </span>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="8" class="empty-cell">暂无数据</td>
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
.transform-list {
  flex: 1;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.page-banner {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 18px 26px 18px 110px;
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

.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.tabs {
  display: flex;
  gap: 36px;
}

.tab {
  position: relative;
  padding: 18px 2px 14px;
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
  padding-bottom: 10px;
}

.search-input {
  display: flex;
  align-items: center;
  width: 264px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--pb-primary);
  }
}

.search-icon {
  color: #bfbfbf;
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
    color: #bfbfbf;
  }
}

.search-btn {
  height: 36px;
  padding: 0 18px;
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
  column-gap: 34px;
  row-gap: 14px;
  min-width: 0;
  padding-right: 70px;
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
  background: #e9f2ff;
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

.tf-table {
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
}
</style>
