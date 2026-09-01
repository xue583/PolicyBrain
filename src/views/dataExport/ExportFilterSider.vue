<script setup lang="ts">
import { DownOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import {
  ageOptions,
  capitalOptions,
  economyOptions,
  exportIndustries,
  hotPolicies,
  ipOptions,
  policyYears,
  provinces,
} from '../../mock/dataExport'

defineOptions({ name: 'ExportFilterSider' })

export type FilterTab = 'policy' | 'basic'
export type FilterKey = 'industry' | 'ip' | 'capital' | 'age' | 'economy'

export type ExportFilters = {
  keyword: string
  policies: string[]
  year: number | null
  province: string
  industry: string
  ip: string
  capital: string
  age: string
  economy: string
}

const filters = defineModel<ExportFilters>('filters', { required: true })
const filterTab = defineModel<FilterTab>('filterTab', { required: true })
const openGroups = defineModel<Record<FilterKey | 'province', boolean>>(
  'openGroups',
  { required: true },
)

const emit = defineEmits<{
  reset: []
  view: []
}>()

const groupMeta: { key: FilterKey; label: string; options: string[] }[] = [
  { key: 'industry', label: '所属行业', options: exportIndustries },
  { key: 'ip', label: '知识产权', options: ipOptions },
  { key: 'capital', label: '注册资本', options: capitalOptions },
  { key: 'age', label: '成立年限', options: ageOptions },
  { key: 'economy', label: '经济类型', options: economyOptions },
]

const toggleTag = (list: string[], value: string) => {
  const index = list.indexOf(value)
  if (index >= 0) list.splice(index, 1)
  else list.push(value)
}

const togglePolicy = (name: string) => {
  toggleTag(filters.value.policies, name)
}

const selectYear = (year: number) => {
  filters.value.year = filters.value.year === year ? null : year
}

const selectProvince = (name: string) => {
  filters.value.province = filters.value.province === name ? '' : name
}

const selectOption = (key: FilterKey, value: string) => {
  filters.value[key] = filters.value[key] === value ? '' : value
}

const toggleGroup = (key: FilterKey | 'province') => {
  openGroups.value[key] = !openGroups.value[key]
}
</script>

<template>
  <aside class="filter-sider">
    <div class="filter-tabs">
      <button
        type="button"
        :class="{ active: filterTab === 'policy' }"
        @click="filterTab = 'policy'"
      >
        政策资讯
      </button>
      <button
        type="button"
        :class="{ active: filterTab === 'basic' }"
        @click="filterTab = 'basic'"
      >
        基本筛选
      </button>
    </div>

    <div class="filter-body">
      <template v-if="filterTab === 'policy'">
        <label class="field-label">搜索政策名称</label>
        <a-input
          v-model:value="filters.keyword"
          allow-clear
          placeholder="请输入政策名称关键词搜索"
        />

        <label class="field-label">热门政策</label>
        <div class="tag-grid">
          <button
            v-for="item in hotPolicies"
            :key="item"
            type="button"
            class="filter-tag"
            :class="{ active: filters.policies.includes(item) }"
            @click="togglePolicy(item)"
          >
            {{ item }}
          </button>
        </div>

        <label class="field-label">认定年度</label>
        <div class="tag-grid years">
          <button
            v-for="year in policyYears"
            :key="year"
            type="button"
            class="filter-tag"
            :class="{ active: filters.year === year }"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </template>

      <template v-else>
        <label class="field-label">关键词搜索</label>
        <a-input
          v-model:value="filters.keyword"
          allow-clear
          placeholder="请输入政策名称关键词搜索"
        />

        <div class="filter-group">
          <button
            type="button"
            class="group-head"
            @click="toggleGroup('province')"
          >
            <span>注册地址</span>
            <span
              v-if="filters.province && !openGroups.province"
              class="group-value"
            >
              {{ filters.province }}
            </span>
            <DownOutlined :class="{ rotated: openGroups.province }" />
          </button>
          <div v-show="openGroups.province" class="tag-grid">
            <button
              v-for="item in provinces"
              :key="item"
              type="button"
              class="filter-tag"
              :class="{ active: filters.province === item }"
              @click="selectProvince(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div v-for="group in groupMeta" :key="group.key" class="filter-group">
          <button
            type="button"
            class="group-head"
            @click="toggleGroup(group.key)"
          >
            <span>{{ group.label }}</span>
            <span
              v-if="filters[group.key] && !openGroups[group.key]"
              class="group-value"
            >
              {{ filters[group.key] }}
            </span>
            <DownOutlined :class="{ rotated: openGroups[group.key] }" />
          </button>
          <div v-show="openGroups[group.key]" class="tag-grid">
            <button
              v-for="item in group.options"
              :key="item"
              type="button"
              class="filter-tag"
              :class="{ active: filters[group.key] === item }"
              @click="selectOption(group.key, item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <div class="filter-actions">
      <a-button class="reset-btn" @click="emit('reset')">重置筛选</a-button>
      <a-button type="primary" class="view-btn" @click="emit('view')">
        <FileTextOutlined />
        查看结果
      </a-button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.filter-sider {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 560px;
  max-height: 640px;
  padding-right: 8px;
  border-right: 1px solid #f0f0f0;
}

.filter-tabs {
  display: flex;
  gap: var(--pb-gap);
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  button {
    position: relative;
    padding: 0 0 10px;
    background: none;
    border: none;
    font-size: 20px;
    color: #8c8c8c;
    cursor: pointer;

    &.active {
      color: var(--pb-primary);
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--pb-primary);
        border-radius: 1px;
      }
    }
  }
}

.filter-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 8px;
}

.field-label {
  display: block;
  margin: 12px 0 8px;
  font-size: 16px;
  color: #333333;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.years {
    margin-bottom: 8px;
  }
}

.filter-tag {
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #eeeeee;
  color: #6f6f6f;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover,
  &.active {
    color: var(--pb-primary);
    background: #e6f4ff;
    border-color: #91caff;
  }
}

.filter-group {
  margin-top: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 0;
  background: none;
  border: none;
  font-size: 14px;
  color: #262626;
  cursor: pointer;

  span:first-child {
    flex-shrink: 0;
  }

  .anticon {
    margin-left: auto;
    color: #bfbfbf;
    font-size: 12px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.group-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  font-size: 13px;
  color: var(--pb-primary);
}

.filter-actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.reset-btn,
.view-btn {
  height: 40px;
}

@include below-lg {
  .filter-sider {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;
    min-height: 0;
    max-height: none;
  }
}
</style>
