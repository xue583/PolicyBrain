<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useRouteKeyword } from '@/composables/useRouteKeyword'
import { useServerPage } from '@/composables/useServerPage'
import { useCollapsedList } from '@/composables/useCollapsedList'
import { BankOutlined, EyeOutlined } from '@ant-design/icons-vue'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import SelectedConditionsBar from '@/components/common/SelectedConditionsBar.vue'
import {
  policyDbLevels,
  policyDepartments,
  policyGrades,
  policyIndustryTags,
  type PolicyDbItem,
} from '../../mock/policyDb'
import { infoTypes } from '../../mock/filters'
import { fetchPolicyPage } from '@/api/policies'
import { fetchIndustryTree, type IndustryNode } from '@/api/meta'
import IndustryCascadeFilter from '@/components/common/IndustryCascadeFilter.vue'

defineOptions({ name: 'PolicyDb' })

const COLLAPSED_COUNT = 10

const keyword = useRouteKeyword()

const levels = ref<string[]>([])

const toIndustryNodes = (names: string[]): IndustryNode[] =>
  names.map((name, index) => ({ id: -(index + 1), name, children: [] }))

const industryTree = ref<IndustryNode[]>(toIndustryNodes(policyIndustryTags))

const filters = reactive({
  grade: '',
  department: '',
  industryTags: [] as string[],
  infoTypes: [] as string[],
})

const statusText: Record<PolicyDbItem['status'], string> = {
  idle: '暂无动态',
  expired: '疑似过期',
}

const listLocale = {
  ...zhCN,
  Pagination: { ...zhCN.Pagination, jump_to: '前往' },
}

const detailTo = (id: number, tab: string): RouteLocationRaw => ({
  name: 'policy-db-detail',
  params: { id: String(id) },
  query: { tab },
})

const rowLinks = (record: PolicyDbItem) => [
  { label: '申报信息', to: detailTo(record.id, 'apply') },
  { label: '政策资讯', to: { name: 'news' } satisfies RouteLocationRaw },
  { label: '支持力度', to: detailTo(record.id, 'support') },
  { label: '公示名单', to: detailTo(record.id, 'publicity') },
  {
    label: '业务线索',
    to: { name: 'enterprise-db' } satisfies RouteLocationRaw,
  },
]

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
  filters.industryTags.forEach((tag) => {
    list.push({ key: `industry:${tag}`, label: `产业标签：${tag}` })
  })
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
  useCollapsedList(industryTree, COLLAPSED_COUNT)

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
    fetchPolicyPage({
      keyword: keyword.value,
      grade: filters.grade,
      department: filters.department,
      industryTag: filters.industryTags.join(','),
      infoTypes: filters.infoTypes,
      levels: levels.value,
      pageIndex,
      pageSize,
    }),
  () =>
    JSON.stringify({
      keyword: keyword.value,
      grade: filters.grade,
      department: filters.department,
      industryTag: filters.industryTags.join(','),
      infoTypes: filters.infoTypes,
      levels: levels.value,
    }),
)

const selectFilter = (key: 'grade' | 'department', value: string) => {
  filters[key] = filters[key] === value ? '' : value
}

const removeCondition = (key: string) => {
  if (key === 'grade' || key === 'department') {
    filters[key] = ''
  } else if (key.startsWith('industry:')) {
    const value = key.slice('industry:'.length)
    filters.industryTags = filters.industryTags.filter((item) => item !== value)
  } else if (key.startsWith('type:')) {
    const value = key.slice('type:'.length)
    filters.infoTypes = filters.infoTypes.filter((item) => item !== value)
  }
}

const clearConditions = () => {
  filters.grade = ''
  filters.department = ''
  filters.industryTags = []
  filters.infoTypes = []
}

onMounted(() => {
  void fetchIndustryTree()
    .then((nodes) => {
      if (nodes.length) industryTree.value = nodes
    })
    .catch(() => undefined)
})

const columns = [
  {
    title: '政策名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '政策等级',
    dataIndex: 'grade',
    key: 'grade',
    width: 148,
    align: 'center',
  },
  {
    title: '发布单位',
    dataIndex: 'department',
    key: 'department',
    width: 168,
    align: 'center',
    ellipsis: { showTitle: false },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 128,
    align: 'center',
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    key: 'views',
    width: 112,
    align: 'center',
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
            <IndustryCascadeFilter
              v-model="filters.industryTags"
              :options="visibleIndustryTags"
            />
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

          <a-config-provider :locale="listLocale">
            <a-alert
              v-if="error"
              type="error"
              show-icon
              :message="error"
              style="margin-bottom: 12px"
            >
              <template #action>
                <a-button size="small" @click="reload">重试</a-button>
              </template>
            </a-alert>
            <PagedTable
              v-model:current="currentPage"
              class="policy-table"
              :loading="loading"
              :with-index="false"
              quick-jumper
              :show-total="(count: number) => `共${count}条`"
              :scroll="{ x: 860 }"
              :total="total"
              :page-size="pageSize"
              :columns="columns"
              :data-source="pagedList"
              :row-key="(row: PolicyDbItem) => row.id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="name-cell">
                    <router-link
                      class="policy-name"
                      :to="detailTo(record.id, 'apply')"
                    >
                      {{ record.name }}
                    </router-link>
                    <div class="name-links">
                      <router-link
                        v-for="link in rowLinks(record as PolicyDbItem)"
                        :key="link.label"
                        class="name-link"
                        :to="link.to"
                      >
                        {{ link.label }}
                      </router-link>
                    </div>
                  </div>
                </template>
                <template v-else-if="column.key === 'grade'">
                  <span class="grade-badge">
                    <BankOutlined />
                    {{ record.grade }}
                  </span>
                </template>
                <template v-else-if="column.key === 'department'">
                  <a-tooltip :title="record.department">
                    <span class="dept-name">{{ record.department }}</span>
                  </a-tooltip>
                </template>
                <template v-else-if="column.key === 'status'">
                  <span class="status-tag" :class="record.status">
                    {{ statusText[record.status as PolicyDbItem['status']] }}
                  </span>
                </template>
                <template v-else-if="column.key === 'views'">
                  <span class="views-cell">
                    <EyeOutlined />
                    {{ record.views }}
                  </span>
                </template>
              </template>
            </PagedTable>
          </a-config-provider>
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
  --db-table-font-size: 15px;
  --db-table-cell-padding: 16px 18px;

  :deep(.db-table) {
    border-color: #e6edf5;
    border-radius: 8px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #3b82f6;
    font-weight: 600;
    text-align: center !important;
    border-bottom-color: #e6edf5;
    border-inline-end: none !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-bottom-color: #f0f0f0;
    border-inline-end: none !important;
  }

  :deep(.ant-table-tbody > tr:last-child > td) {
    border-bottom: none;
  }

  :deep(.ant-pagination) {
    align-items: center;
  }

  :deep(.ant-pagination-total-text) {
    margin-inline-end: 8px;
    color: #262626;
    font-weight: 600;
  }
}

.name-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}

.policy-name {
  color: #262626;
  font-weight: 500;
  line-height: 22px;

  &:hover {
    color: var(--pb-primary);
  }
}

.name-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.name-link {
  color: var(--pb-primary);
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;

  &:hover {
    color: var(--pb-primary-hover);
  }
}

.grade-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 10px;
  border-radius: 4px;
  background: #e8f3ff;
  color: var(--pb-primary);
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;

  .anticon {
    font-size: 13px;
  }
}

.dept-name {
  display: block;
  overflow: hidden;
  color: #434343;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    color: #fa8c16;
    background: #fff7e6;
  }

  &.expired {
    color: #ff4d4f;
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
