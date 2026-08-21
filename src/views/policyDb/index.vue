<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  BankOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
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

const route = useRoute()
const keyword = computed(() => String(route.query.q ?? ''))

const currentPage = ref(1)
const pageSize = 10
const levels = ref<string[]>(['municipal'])
const showMoreGrades = ref(true)
const showMoreDepartments = ref(false)
const showMoreTags = ref(false)

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

const visibleGrades = computed(() =>
  showMoreGrades.value ? policyGrades : policyGrades.slice(0, COLLAPSED_COUNT),
)

const visibleDepartments = computed(() =>
  showMoreDepartments.value
    ? policyDepartments
    : policyDepartments.slice(0, COLLAPSED_COUNT),
)

const visibleIndustryTags = computed(() =>
  showMoreTags.value
    ? policyIndustryTags
    : policyIndustryTags.slice(0, COLLAPSED_COUNT),
)

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

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

const selectFilter = (
  key: 'grade' | 'department' | 'industryTag',
  value: string,
) => {
  filters[key] = filters[key] === value ? '' : value
  currentPage.value = 1
}

const removeCondition = (key: string) => {
  if (key === 'grade' || key === 'department' || key === 'industryTag') {
    filters[key] = ''
  } else if (key.startsWith('type:')) {
    const value = key.slice('type:'.length)
    filters.infoTypes = filters.infoTypes.filter((item) => item !== value)
  }
  currentPage.value = 1
}

const clearConditions = () => {
  filters.grade = ''
  filters.department = ''
  filters.industryTag = ''
  filters.infoTypes = []
  currentPage.value = 1
}

watch([levels, keyword, () => filters.infoTypes], () => {
  currentPage.value = 1
})

const onFilterChange = () => {
  currentPage.value = 1
}

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
  <div class="policy-db">
    <div class="filter-panel">
      <a-card style="border-radius: 20px">
        <div class="filter-row">
          <span class="filter-label">政策等级：</span>
          <div class="filter-options">
            <a
              v-for="grade in visibleGrades"
              :key="grade"
              class="option-link"
              :class="{ active: filters.grade === grade }"
              @click="selectFilter('grade', grade)"
            >
              {{ grade }}
            </a>
          </div>
          <a class="more-link" @click="showMoreGrades = !showMoreGrades">
            {{ showMoreGrades ? '收起' : '更多' }}
            <DownOutlined :class="{ rotated: showMoreGrades }" />
          </a>
        </div>

        <div class="filter-row">
          <span class="filter-label">发布单位：</span>
          <div class="filter-options">
            <a
              v-for="dept in visibleDepartments"
              :key="dept"
              class="option-link"
              :class="{ active: filters.department === dept }"
              @click="selectFilter('department', dept)"
            >
              {{ dept }}
            </a>
          </div>
          <a
            class="more-link"
            @click="showMoreDepartments = !showMoreDepartments"
          >
            {{ showMoreDepartments ? '收起' : '更多' }}
            <DownOutlined :class="{ rotated: showMoreDepartments }" />
          </a>
        </div>

        <div class="filter-row">
          <span class="filter-label">产业标签：</span>
          <div class="filter-options">
            <a
              v-for="tag in visibleIndustryTags"
              :key="tag"
              class="option-link"
              :class="{ active: filters.industryTag === tag }"
              @click="selectFilter('industryTag', tag)"
            >
              {{ tag }}
            </a>
          </div>
          <a class="more-link" @click="showMoreTags = !showMoreTags">
            {{ showMoreTags ? '收起' : '更多' }}
            <DownOutlined :class="{ rotated: showMoreTags }" />
          </a>
        </div>

        <div class="filter-row">
          <span class="filter-label">资讯类型：</span>
          <div class="filter-options">
            <a-checkbox-group
              v-model:value="filters.infoTypes"
              :options="infoTypes"
              @change="onFilterChange"
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

    <a-card style="border-radius: 20px">
      <div class="db-panel">
        <div class="toolbar">
          <span class="result-count">
            共找到 <em>{{ total }}</em> 项政策
          </span>
          <div class="level-filter">
            <span class="level-label">政策级别:</span>
            <a-checkbox-group
              v-model:value="levels"
              :options="policyDbLevels"
            />
          </div>
        </div>

        <a-table
          class="db-table"
          bordered
          :columns="columns"
          :data-source="pagedList"
          :pagination="false"
          :row-key="(row: PolicyDbItem) => row.id"
          size="middle"
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
              <span :class="record.support ? 'support-text' : 'support-empty'">
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
        </a-table>

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
    </a-card>
  </div>
</template>

<style scoped lang="scss">
.filter-panel {
  padding: 0 0 8px;
  margin-bottom: 12px;
  font-size: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  font-size: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.filter-label {
  flex-shrink: 0;
  width: 88px;
  color: #8c8c8c;
  line-height: 32px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  flex: 1;
  min-width: 0;

  :global(.ant-checkbox-wrapper) {
    font-size: 16px;
  }
}

.option-link {
  color: #262626;
  line-height: 32px;
  cursor: pointer;

  &.active,
  &:hover {
    color: var(--pb-primary);
  }
}

.more-link {
  flex-shrink: 0;
  align-self: flex-start;
  color: var(--pb-primary);
  line-height: 32px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;

  .anticon {
    margin-left: 2px;
    font-size: 16px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.selected-section {
  border-top: 1px dashed #f0f0f0;
  padding-top: 4px;
}

.selected-row {
  align-items: center;
  border-bottom: none !important;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  min-height: 32px;
}

.condition-tag {
  display: flex;
  color: var(--pb-primary) !important;
  background: #fff !important;
  border-color: #91caff !important;
  border-radius: 10px;
  font-size: 18px;
  padding: 8px 16px;

  :global(.ant-tag-close-icon) {
    color: var(--pb-primary) !important;
    font-size: 16px !important;
  }
}

.clear-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 32px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--pb-primary);
  }
}

.empty-selected {
  color: #bfbfbf;
  line-height: 32px;
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

.result-count {
  font-size: 15px;
  color: #595959;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
    margin: 0 2px;
  }
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

.db-table {
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #fff;

  :deep(.ant-table) {
    font-size: 16px;
    background: #fff;
    overflow: hidden;
    border-radius: 12px;
  }

  :deep(.ant-table-container) {
    overflow: hidden;
    border: none !important;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 16px;
    font-weight: 600;
    border-color: #e8e8e8 !important;
    padding: 22px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 16px;
    background: #fff !important;
    border-color: #e8e8e8 !important;
    vertical-align: middle;
    padding: 22px !important;
  }
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0 4px;
}

@media (max-width: 768px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-label {
    width: auto;
  }
}
</style>
