<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFilteredList } from '@/composables/useFilteredList'
import { useRouteKeyword } from '@/composables/useRouteKeyword'
import { useCollapsedList } from '@/composables/useCollapsedList'
import { BankOutlined, EyeOutlined } from '@ant-design/icons-vue'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import SelectedConditionsBar from '@/components/common/SelectedConditionsBar.vue'
import {
  mockPolicyDb,
  policyDbLevels,
  policyDepartments,
  policyGrades,
  policyIndustryTags,
  type PolicyDbItem,
} from '../../mock/policyDb'
import { infoTypes } from '../../mock/filters'
import { filterPolicyDb } from '@/utils/filterPolicies'

defineOptions({ name: 'PolicyDb' })

const COLLAPSED_COUNT = 10

const keyword = useRouteKeyword()

const levels = ref<string[]>(['municipal'])

const filters = reactive({
  grade: '',
  department: '',
  industryTag: '',
  infoTypes: [] as string[],
})

const statusText: Record<PolicyDbItem['status'], string> = {
  idle: '暂无动态',
  expired: '疑似过期',
}

const selectedConditions = computed(() => {
  const list: { key: string; label: string }[] = []
  if (filters.grade) {
    list.push({ key: 'grade', label: `政策等级：${filters.grade}` })
  }
  if (filters.department) {
    list.push({
      key: 'department',
      label: `发布单位：${filters.department}`,
    })
  }
  if (filters.industryTag) {
    list.push({
      key: 'industryTag',
      label: `产业标签：${filters.industryTag}`,
    })
  }
  filters.infoTypes.forEach((value) => {
    const found = infoTypes.find((t) => t.value === value)
    if (found)
      list.push({ key: `type:${value}`, label: `资讯类型：${found.label}` })
  })
  return list
})

const { showMore: showMoreGrades, visibleList: visibleGrades } =
  useCollapsedList(policyGrades, COLLAPSED_COUNT, { initialExpanded: true })
const { showMore: showMoreDepartments, visibleList: visibleDepartments } =
  useCollapsedList(policyDepartments, COLLAPSED_COUNT)
const { showMore: showMoreTags, visibleList: visibleIndustryTags } =
  useCollapsedList(policyIndustryTags, COLLAPSED_COUNT)

const filteredList = computed(() =>
  filterPolicyDb(mockPolicyDb, {
    keyword: keyword.value,
    grade: filters.grade,
    department: filters.department,
    industryTag: filters.industryTag,
    infoTypes: filters.infoTypes,
    levels: levels.value,
  }),
)

const { currentPage, pageSize, pagedList, total, resetPage } =
  useFilteredList(filteredList)

const selectFilter = (
  key: 'grade' | 'department' | 'industryTag',
  value: string,
) => {
  filters[key] = filters[key] === value ? '' : value
}

const removeCondition = (key: string) => {
  if (key === 'grade' || key === 'department' || key === 'industryTag') {
    filters[key] = ''
  } else if (key.startsWith('type:')) {
    const value = key.slice('type:'.length)
    filters.infoTypes = filters.infoTypes.filter((item) => item !== value)
  }
  resetPage()
}

const clearConditions = () => {
  filters.grade = ''
  filters.department = ''
  filters.industryTag = ''
  filters.infoTypes = []
  resetPage()
}

watch(
  [
    levels,
    keyword,
    () => filters.grade,
    () => filters.department,
    () => filters.industryTag,
    () => filters.infoTypes,
  ],
  () => {
    resetPage()
  },
)

const columns = [
  {
    title: '政策名称/支持产业',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '支持力度',
    dataIndex: 'support',
    key: 'support',
    ellipsis: true,
  },
  {
    title: '发布部门',
    dataIndex: 'department',
    key: 'department',
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    key: 'views',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
]
</script>

<template>
  <PageState>
    <div class="policy-db">
      <div class="filter-panel">
        <a-card class="pb-card-lg">
          <FilterRow
            label="政策等级："
            v-model:expanded="showMoreGrades"
            collapsible
          >
            <a
              v-for="grade in visibleGrades"
              :key="grade"
              class="option-link"
              :class="{ active: filters.grade === grade }"
              @click="selectFilter('grade', grade)"
            >
              {{ grade }}
            </a>
          </FilterRow>

          <FilterRow
            label="发布单位："
            v-model:expanded="showMoreDepartments"
            collapsible
          >
            <a
              v-for="dept in visibleDepartments"
              :key="dept"
              class="option-link"
              :class="{ active: filters.department === dept }"
              @click="selectFilter('department', dept)"
            >
              {{ dept }}
            </a>
          </FilterRow>

          <FilterRow
            label="产业标签："
            v-model:expanded="showMoreTags"
            collapsible
          >
            <a
              v-for="tag in visibleIndustryTags"
              :key="tag"
              class="option-link"
              :class="{ active: filters.industryTag === tag }"
              @click="selectFilter('industryTag', tag)"
            >
              {{ tag }}
            </a>
          </FilterRow>

          <div class="filter-row">
            <span class="filter-label">资讯类型：</span>
            <div class="filter-options">
              <a-checkbox-group
                v-model:value="filters.infoTypes"
                :options="infoTypes"
              />
            </div>
          </div>

          <SelectedConditionsBar
            :conditions="selectedConditions"
            @remove="removeCondition"
            @clear="clearConditions"
          />
        </a-card>
      </div>

      <a-card class="pb-card-lg">
        <div class="db-panel">
          <div class="toolbar">
            <ResultCountBar :total="total" unit="项政策" />
            <div class="level-filter">
              <span class="level-label">政策级别:</span>
              <a-checkbox-group
                v-model:value="levels"
                :options="policyDbLevels"
              />
            </div>
          </div>

          <PagedTable
            v-model:current="currentPage"
            class="policy-table"
            :with-index="false"
            quick-jumper
            :total="total"
            :page-size="pageSize"
            :columns="columns"
            :data-source="pagedList"
            :row-key="(row: PolicyDbItem) => row.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <router-link
                  class="policy-name"
                  :to="{
                    name: 'policy-db-detail',
                    params: { id: String(record.id) },
                  }"
                >
                  {{ record.name }}
                </router-link>
              </template>
              <template v-else-if="column.key === 'support'">
                <span
                  :class="record.support ? 'support-text' : 'support-empty'"
                >
                  {{ record.support || '—' }}
                </span>
              </template>
              <template v-else-if="column.key === 'department'">
                <div class="dept-cell">
                  <BankOutlined class="dept-icon" />
                  <span class="dept-city">{{ record.city }}</span>
                  <span class="dept-name">{{ record.department }}</span>
                </div>
              </template>
              <template v-else-if="column.key === 'views'">
                <span class="views-cell">
                  <EyeOutlined />
                  {{ record.views }}
                </span>
              </template>
              <template v-else-if="column.key === 'status'">
                <span class="status-tag" :class="record.status">
                  {{ statusText[record.status as PolicyDbItem['status']] }}
                </span>
              </template>
            </template>
          </PagedTable>
        </div>
      </a-card>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.filter-panel {
  padding: 0 0 8px;
  margin-bottom: 12px;
  font-size: 16px;
}

.filter-options :global(.ant-checkbox-wrapper) {
  font-size: 16px;
}

.db-panel {
  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 0 0 12px;
}

.level-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 18px;

  :deep(.ant-checkbox-wrapper) {
    font-size: 16px;
    color: #262626;
  }
}

.level-label {
  color: #8c8c8c;
  white-space: nowrap;
}

.policy-table {
  --db-table-font-size: 16px;
  --db-table-cell-padding: 22px;
}

.policy-name {
  color: var(--pb-primary);
  font-weight: 500;

  &:hover {
    color: #4096ff;
  }
}

.support-text {
  color: #595959;
}

.support-empty {
  color: #bfbfbf;
}

.dept-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: #595959;
}

.dept-icon {
  color: var(--pb-primary);
  font-size: 14px;
}

.dept-city {
  color: var(--pb-primary);
}

.dept-name {
  color: #595959;
}

.views-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;

  .anticon {
    font-size: 14px;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;

  &.idle {
    color: #d48806;
    background: #fff7e6;
  }

  &.expired {
    color: #cf1322;
    background: #fff1f0;
  }
}

@media (max-width: 768px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  :deep(.filter-label) {
    width: auto;
  }
}
</style>
