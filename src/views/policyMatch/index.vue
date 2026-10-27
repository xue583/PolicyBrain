<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  DownOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'
import type { BreadcrumbItem } from '@/components/BreadcrumbNav.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { useRegionStore } from '@/stores/region'
import { triggerNeedLogin } from '@/utils/auth'
import { downloadCsv } from '@/utils/downloadCsv'
import { toErrorMessage } from '@/utils/apiError'
import { fetchPolicyPage } from '@/api/policies'
import { fetchPolicyToEnt } from '@/api/match'
import { fetchHotKeywords } from '@/api/home'
import { loadRegionOptions, type CityOption } from '@/api/meta'
import type { MatchedEnterprise } from '@/api/mapPortal'
import type { PolicyDbItem } from '@/mock/policyDb'
import { policyDepartments } from '@/mock/policyDb'
import { cities } from '@/mock/nav'
import buildingIcon from '@/assets/enterpriseDb/match/icon-building.png'
import exportImg from '@/assets/policyMatch/vip-export@2x.png'
import emptyNews from '@/assets/home/empty-news.png'
import hotIcon from '@/assets/policyMatch/hot.png'
import hotBg from '@/assets/policyMatch/hot-bg.png'
import plusIcon from '@/assets/policyMatch/plus.png'
import regionIcon from '@/assets/policyMatch/region.png'
import toolAiIcon from '@/assets/policyMatch/tool-ai.png'
import toolManageIcon from '@/assets/policyMatch/tool-manage.png'
import rank1 from '@/assets/policyMatch/rank-1.png'
import rank2 from '@/assets/policyMatch/rank-2.png'
import rank3 from '@/assets/policyMatch/rank-3.png'

defineOptions({ name: 'PolicyMatch' })

const PAGE_SIZE = 10
const BULK_SIZE = 200
const FOLLOW_KEY = 'pb_followed_enterprise_db'
const SCORE_OPTIONS = [100, 90, 80, 70, 60]
const GRADE_COLLAPSE = 10
const DEPT_COLLAPSE = 6
const NAME_COLLAPSE = 4
const rankIcons = [rank1, rank2, rank3]

const namedOptions = (labels: string[], offset: number): CityOption[] =>
  labels.map((label, index) => ({ id: -(offset + index + 1), label }))

const FALLBACK_PROVINCES = namedOptions(
  [
    '山东省',
    '河南省',
    '湖北省',
    '湖南省',
    '广东省',
    '广西壮族自治区',
    '海南省',
    '重庆市',
  ],
  0,
)
const FALLBACK_CITIES = namedOptions(
  [
    '郑州市',
    '开封市',
    '洛阳市',
    '济源市',
    '平顶山市',
    '安阳市',
    '鹤壁市',
    '新乡市',
  ],
  20,
)
const FALLBACK_DISTRICTS = namedOptions(
  [
    '中原区',
    '二七区',
    '管城回族区',
    '金水区',
    '上街区',
    '惠济区',
    '郑州经济技术开发区',
    '郑州高新技术产业开发区',
  ],
  40,
)

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const region = useRegionStore()
const { isLoggedIn } = storeToRefs(auth)

const keywordDraft = ref(String(route.query.q ?? ''))
const keyword = ref(keywordDraft.value)
const grade = ref('')
const department = ref('')
const selectedPolicyId = ref<number | null>(null)
const score = ref<number | null>(null)
const currentPage = ref(1)

const policies = ref<PolicyDbItem[]>([])
const enterprises = ref<MatchedEnterprise[]>([])
const serverTotal = ref(0)
const policyLoading = ref(false)
const listLoading = ref(false)
const listError = ref('')
const hotKeywords = ref<string[]>([])
const followedIds = ref<number[]>([])

const provinces = ref<CityOption[]>([])
const regionCities = ref<CityOption[]>([])
const regionDistricts = ref<CityOption[]>([])
const selectedProvinceIds = ref<number[]>([])
const selectedCityIds = ref<number[]>([])
const selectedDistrictIds = ref<number[]>([])
const usingFallbackRegion = ref(false)

const gradeOptions = ref<string[]>(['国家级', '河南省', ...cities])
const gradesExpanded = ref(true)
const deptsExpanded = ref(false)
const namesExpanded = ref(false)

const visibleGrades = computed(() =>
  gradesExpanded.value
    ? gradeOptions.value
    : gradeOptions.value.slice(0, GRADE_COLLAPSE),
)
const visibleDepartments = computed(() =>
  deptsExpanded.value
    ? policyDepartments
    : policyDepartments.slice(0, DEPT_COLLAPSE),
)
const visiblePolicies = computed(() =>
  namesExpanded.value ? policies.value : policies.value.slice(0, NAME_COLLAPSE),
)
const visibleHot = computed(() => hotKeywords.value.slice(0, 4))
const clues = computed(() => {
  if (hotKeywords.value.length) return hotKeywords.value.slice(0, 10)
  return policies.value.slice(0, 10).map((item) => item.name)
})

const hasRegionFilter = computed(
  () =>
    selectedProvinceIds.value.length +
      selectedCityIds.value.length +
      selectedDistrictIds.value.length >
    0,
)
const localMode = computed(() => score.value != null || hasRegionFilter.value)

const selectedRegionLabels = computed(() => {
  const picked = [
    ...provinces.value.filter((item) =>
      selectedProvinceIds.value.includes(item.id),
    ),
    ...regionCities.value.filter((item) =>
      selectedCityIds.value.includes(item.id),
    ),
    ...regionDistricts.value.filter((item) =>
      selectedDistrictIds.value.includes(item.id),
    ),
  ]
  return picked.map((item) => item.label)
})

const matchedItems = computed(() =>
  enterprises.value.filter((item) => {
    if (
      score.value != null &&
      item.score != null &&
      item.score !== score.value
    ) {
      return false
    }
    if (!selectedRegionLabels.value.length) return true
    const text = [
      item.province,
      item.city,
      item.district,
      item.address,
      item.regionLine,
    ]
      .filter((part) => part && part !== '-')
      .join('')
    if (!text) return true
    return selectedRegionLabels.value.some((label) => text.includes(label))
  }),
)

const displayTotal = computed(() =>
  localMode.value ? matchedItems.value.length : serverTotal.value,
)
const pagedItems = computed(() => {
  if (!localMode.value) return enterprises.value
  const start = (currentPage.value - 1) * PAGE_SIZE
  return matchedItems.value.slice(start, start + PAGE_SIZE)
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: '首页', onClick: () => void router.push({ name: 'home' }) },
  { label: '匹配企业' },
])

const textOrDash = (value: string) => (value && value !== '-' ? value : '—')

const toggleId = (list: number[], id: number) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id]

const loadFollowed = () => {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY)
    followedIds.value = raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    followedIds.value = []
  }
}

let policySeq = 0
const searchPolicies = async () => {
  const seq = ++policySeq
  policyLoading.value = true
  try {
    const page = await fetchPolicyPage({
      keyword: keyword.value.trim() || undefined,
      grade: grade.value,
      department: department.value,
      pageIndex: 1,
      pageSize: 20,
    })
    if (seq !== policySeq) return
    policies.value = page.items
    const stillThere = page.items.some(
      (item) => item.id === selectedPolicyId.value,
    )
    const nextId = stillThere
      ? selectedPolicyId.value
      : (page.items[0]?.id ?? null)
    if (nextId == null) {
      enterprises.value = []
      serverTotal.value = 0
    }
    selectedPolicyId.value = nextId
    listError.value = ''
  } catch (err) {
    if (seq !== policySeq) return
    policies.value = []
    selectedPolicyId.value = null
    enterprises.value = []
    serverTotal.value = 0
    listError.value = toErrorMessage(err, '政策搜索失败')
  } finally {
    if (seq === policySeq) policyLoading.value = false
  }
}

let entSeq = 0
const loadEnterprises = async () => {
  const id = selectedPolicyId.value
  if (!id) {
    enterprises.value = []
    serverTotal.value = 0
    return
  }
  if (!isLoggedIn.value) {
    enterprises.value = []
    serverTotal.value = 0
    listError.value = '登录后可查看匹配企业'
    listLoading.value = false
    return
  }
  const seq = ++entSeq
  listLoading.value = true
  listError.value = ''
  try {
    const page = await fetchPolicyToEnt(id, {
      pageIndex: localMode.value ? 1 : currentPage.value,
      pageSize: localMode.value ? BULK_SIZE : PAGE_SIZE,
    })
    if (seq !== entSeq) return
    enterprises.value = page.items
    serverTotal.value = page.totalElements
  } catch (err) {
    if (seq !== entSeq) return
    enterprises.value = []
    serverTotal.value = 0
    listError.value = toErrorMessage(err, '匹配企业加载失败')
  } finally {
    if (seq === entSeq) listLoading.value = false
  }
}

const applySearch = async () => {
  keyword.value = keywordDraft.value.trim()
  const nextQuery = { ...route.query }
  if (keyword.value) nextQuery.q = keyword.value
  else delete nextQuery.q
  await router.replace({ query: nextQuery })
  if (currentPage.value !== 1) currentPage.value = 1
  await searchPolicies()
}

const applyHot = (word: string) => {
  keywordDraft.value = word
  void applySearch()
}

const selectPolicy = (id: number) => {
  selectedPolicyId.value = id
}

const selectGrade = (value: string) => {
  grade.value = grade.value === value ? '' : value
}

const selectDepartment = (value: string) => {
  department.value = department.value === value ? '' : value
}

const selectScore = (value: number) => {
  score.value = score.value === value ? null : value
  if (currentPage.value !== 1) currentPage.value = 1
}

const fillRegionPreview = async () => {
  const henan = provinces.value.find((item) => item.label.includes('河南'))
  if (!henan || henan.id < 0) return
  regionCities.value = await loadRegionOptions(henan.id).catch(
    () => [] as CityOption[],
  )
  const zhengzhou = regionCities.value.find((item) =>
    item.label.includes('郑州'),
  )
  regionDistricts.value = zhengzhou
    ? await loadRegionOptions(zhengzhou.id).catch(() => [] as CityOption[])
    : []
}

const syncCities = async () => {
  if (usingFallbackRegion.value) return
  if (!selectedProvinceIds.value.length) {
    selectedCityIds.value = []
    selectedDistrictIds.value = []
    await fillRegionPreview()
    return
  }
  const lists = await Promise.all(
    selectedProvinceIds.value.map((id) =>
      loadRegionOptions(id).catch(() => [] as CityOption[]),
    ),
  )
  regionCities.value = lists.flat()
  const allowed = new Set(regionCities.value.map((item) => item.id))
  selectedCityIds.value = selectedCityIds.value.filter((id) => allowed.has(id))
  await syncDistricts()
}

const syncDistricts = async () => {
  if (usingFallbackRegion.value) return
  const picked = selectedCityIds.value.length
    ? regionCities.value.filter((item) =>
        selectedCityIds.value.includes(item.id),
      )
    : []
  const preview =
    picked[0] ??
    regionCities.value.find((item) => item.label.includes('郑州')) ??
    regionCities.value[0]
  const source = picked.length ? picked : preview ? [preview] : []
  if (!source.length) {
    regionDistricts.value = []
    selectedDistrictIds.value = []
    return
  }
  const lists = await Promise.all(
    source.map((item) =>
      loadRegionOptions(item.id).catch(() => [] as CityOption[]),
    ),
  )
  regionDistricts.value = lists.flat()
  const allowed = new Set(regionDistricts.value.map((item) => item.id))
  selectedDistrictIds.value = selectedDistrictIds.value.filter((id) =>
    allowed.has(id),
  )
}

const toggleProvince = (id: number) => {
  selectedProvinceIds.value = toggleId(selectedProvinceIds.value, id)
  if (currentPage.value !== 1) currentPage.value = 1
  void syncCities()
}

const toggleCity = (id: number) => {
  selectedCityIds.value = toggleId(selectedCityIds.value, id)
  if (currentPage.value !== 1) currentPage.value = 1
  void syncDistricts()
}

const toggleDistrict = (id: number) => {
  selectedDistrictIds.value = toggleId(selectedDistrictIds.value, id)
  if (currentPage.value !== 1) currentPage.value = 1
}

const refreshGrades = async () => {
  const list = provinces.value.filter((item) => item.id > 0)
  const stored = list.find((item) => item.id === region.provinceId)
  const henan = list.find((item) => item.label.includes('河南'))
  const province = stored ?? henan ?? list[0]
  if (!province) return
  const cityOptions = await loadRegionOptions(province.id).catch(
    () => [] as CityOption[],
  )
  gradeOptions.value = [
    '国家级',
    province.label,
    ...cityOptions.map((item) => item.label),
  ]
}

const initRegions = async () => {
  try {
    provinces.value = await loadRegionOptions()
  } catch {
    provinces.value = []
  }
  if (!provinces.value.length) {
    usingFallbackRegion.value = true
    provinces.value = FALLBACK_PROVINCES
    regionCities.value = FALLBACK_CITIES
    regionDistricts.value = FALLBACK_DISTRICTS
    return
  }
  await refreshGrades()
  await fillRegionPreview()
  if (
    region.provinceId != null &&
    provinces.value.some((item) => item.id === region.provinceId)
  ) {
    selectedProvinceIds.value = [region.provinceId]
    regionCities.value = await loadRegionOptions(region.provinceId).catch(
      () => [] as CityOption[],
    )
    if (
      region.cityId != null &&
      regionCities.value.some((item) => item.id === region.cityId)
    ) {
      selectedCityIds.value = [region.cityId]
      regionDistricts.value = await loadRegionOptions(region.cityId).catch(
        () => [] as CityOption[],
      )
      if (
        region.districtId != null &&
        regionDistricts.value.some((item) => item.id === region.districtId)
      ) {
        selectedDistrictIds.value = [region.districtId]
      }
    }
  }
}

const isFollowed = (id: number) => followedIds.value.includes(id)

const toggleFollow = (id: number) => {
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  const next = isFollowed(id)
    ? followedIds.value.filter((item) => item !== id)
    : [...followedIds.value, id]
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(next))
  followedIds.value = next
  message.success(isFollowed(id) ? '关注成功' : '已取消关注')
}

const goEnterpriseMatch = (id: number) => {
  void router.push({
    name: 'enterprise-db-match',
    params: { id: String(id) },
  })
}

const exportList = async () => {
  const policy = policies.value.find(
    (item) => item.id === selectedPolicyId.value,
  )
  if (!policy) {
    message.info('请先选择政策')
    return
  }
  if (!isLoggedIn.value) {
    triggerNeedLogin()
    return
  }
  try {
    const page = await fetchPolicyToEnt(policy.id, {
      pageIndex: 1,
      pageSize: BULK_SIZE,
    })
    if (!page.items.length) {
      message.warning('暂无可导出的匹配企业')
      return
    }
    downloadCsv(`${policy.name}-匹配企业.csv`, [
      [
        '企业名称',
        '匹配度',
        '总金额',
        '法定代表人',
        '成立日期',
        '公示补贴金额',
        '注册地址',
      ],
      ...page.items.map((item) => [
        item.name,
        item.score == null ? '' : String(item.score),
        item.totalAmount,
        item.legalRep,
        item.foundedDate,
        item.subsidyText,
        item.address,
      ]),
    ])
    message.success('名单已导出')
  } catch (err) {
    message.error(toErrorMessage(err, '导出失败'))
  }
}

const openTool = (name: 'workspace' | 'personal-center') => {
  void router.push({ name })
}

watch(selectedPolicyId, () => {
  if (currentPage.value !== 1) currentPage.value = 1
  void loadEnterprises()
})

watch(currentPage, () => {
  if (localMode.value) return
  void loadEnterprises()
})

watch(localMode, () => {
  if (currentPage.value !== 1) currentPage.value = 1
  void loadEnterprises()
})

watch([grade, department], () => {
  if (currentPage.value !== 1) currentPage.value = 1
  void searchPolicies()
})

watch(isLoggedIn, () => {
  void loadEnterprises()
})

watch(
  () => route.query.q,
  (q) => {
    const next = String(q ?? '')
    if (next === keyword.value) return
    keyword.value = next
    keywordDraft.value = next
    void searchPolicies()
  },
)

onMounted(() => {
  loadFollowed()
  void initRegions()
  void fetchHotKeywords('policy', 10)
    .then((groups) => {
      hotKeywords.value = groups.policies.map((item) => item.keyword)
    })
    .catch(() => {
      hotKeywords.value = []
    })
  void searchPolicies()
})
</script>

<template>
  <div class="policy-match">
    <section class="hero-stage">
      <BreadcrumbNav
        :items="breadcrumbItems"
        @back="router.push({ name: 'home' })"
      />
      <div class="hero-copy">
        <h1>申报线索索好 就上政策大脑</h1>
        <form class="search-box" @submit.prevent="applySearch">
          <input
            v-model="keywordDraft"
            type="search"
            placeholder="河南省创新型中小企业"
            aria-label="搜索政策"
            autocomplete="off"
          />
          <button type="submit" class="search-btn">
            <SearchOutlined />
            搜索
          </button>
        </form>
        <div class="hot-row">
          <span class="hot-badge" :style="{ backgroundImage: `url(${hotBg})` }">
            热门政策
          </span>
          <button
            v-for="word in visibleHot"
            :key="word"
            type="button"
            class="hot-chip"
            :class="{ on: keyword === word }"
            @click="applyHot(word)"
          >
            <div class="hot-chip-icon"></div>
            {{ word }}
          </button>
          <a-dropdown :trigger="['click']">
            <button type="button" class="policy-search-btn">
              政策检索
              <DownOutlined />
            </button>
            <template #overlay>
              <a-menu class="policy-match-menu">
                <a-menu-item v-if="!policies.length" disabled>
                  请先搜索政策
                </a-menu-item>
                <a-menu-item
                  v-for="item in policies"
                  :key="item.id"
                  @click="selectPolicy(item.id)"
                >
                  {{ item.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </section>

    <div class="match-layout">
      <div class="match-main">
        <section class="panel filter-panel">
          <div class="filter-row">
            <span class="filter-label">政策等级：</span>
            <div class="filter-options">
              <a
                v-for="item in visibleGrades"
                :key="item"
                class="option-link"
                :class="{ active: grade === item }"
                @click="selectGrade(item)"
              >
                {{ item }}
              </a>
            </div>
            <a
              v-if="gradeOptions.length > GRADE_COLLAPSE"
              class="more-link"
              @click="gradesExpanded = !gradesExpanded"
            >
              {{ gradesExpanded ? '收起' : '展开' }}
              <DownOutlined :class="{ rotated: gradesExpanded }" />
            </a>
          </div>

          <div class="filter-row">
            <span class="filter-label">发布单位：</span>
            <div class="filter-options">
              <a
                class="option-link"
                :class="{ active: department === '' }"
                @click="department = ''"
              >
                全部
              </a>
              <a
                v-for="item in visibleDepartments"
                :key="item"
                class="option-link"
                :class="{ active: department === item }"
                @click="selectDepartment(item)"
              >
                {{ item }}
              </a>
            </div>
            <a
              v-if="policyDepartments.length > DEPT_COLLAPSE"
              class="more-link"
              @click="deptsExpanded = !deptsExpanded"
            >
              {{ deptsExpanded ? '收起' : '展开' }}
              <DownOutlined :class="{ rotated: deptsExpanded }" />
            </a>
          </div>

          <div class="filter-row">
            <span class="filter-label">政策名称：</span>
            <div class="filter-options">
              <span v-if="!policies.length" class="option-empty">
                搜索后展示政策名称
              </span>
              <a
                v-for="item in visiblePolicies"
                :key="item.id"
                class="option-link"
                :class="{ active: selectedPolicyId === item.id }"
                @click="selectPolicy(item.id)"
              >
                {{ item.name }}
              </a>
            </div>
            <a
              v-if="policies.length > NAME_COLLAPSE"
              class="more-link"
              @click="namesExpanded = !namesExpanded"
            >
              {{ namesExpanded ? '收起' : '展开' }}
              <DownOutlined :class="{ rotated: namesExpanded }" />
            </a>
          </div>
        </section>

        <section class="panel result-panel">
          <div class="match-bar">
            <div class="score-options">
              <span class="score-label">匹配度选择</span>
              <button
                v-for="item in SCORE_OPTIONS"
                :key="item"
                type="button"
                class="score-option"
                :class="{ on: score === item }"
                @click="selectScore(item)"
              >
                {{ item }}分
              </button>
            </div>
            <button type="button" class="export-btn" @click="exportList">
              <img :src="exportImg" alt="导出" />
            </button>
          </div>

          <a-spin :spinning="policyLoading || listLoading">
            <div
              v-if="listError && listError !== '登录后可查看匹配企业'"
              class="result-empty"
            >
              {{ listError }}
            </div>
            <EmptyState
              v-else-if="!pagedItems.length"
              class="match-empty"
              :image="emptyNews"
              :image-width="180"
              :text="
                listError ||
                (selectedPolicyId ? '暂无匹配企业' : '请输入政策关键词进行搜索')
              "
            />
            <article
              v-for="(item, index) in pagedItems"
              :key="`${item.id}-${index}`"
              class="ent-card"
              :class="{ 'is-focus': index === 0 && currentPage === 1 }"
            >
              <div class="ent-score-row">
                <span>
                  匹配度
                  <em>{{ item.score == null ? '—' : `${item.score}分` }}</em>
                </span>
                <span>
                  总金额
                  <em>{{ item.totalAmount || '—' }}</em>
                </span>
              </div>
              <div class="ent-name-row">
                <button
                  type="button"
                  class="ent-name"
                  @click="goEnterpriseMatch(item.id)"
                >
                  <img :src="buildingIcon" alt="" />
                  <span>{{ item.name || '未命名企业' }}</span>
                </button>
                <div class="ent-actions">
                  <button
                    type="button"
                    class="ghost-btn"
                    @click="goEnterpriseMatch(item.id)"
                  >
                    匹配政策
                  </button>
                  <button
                    type="button"
                    class="ghost-btn"
                    :class="{ on: isFollowed(item.id) }"
                    @click="toggleFollow(item.id)"
                  >
                    <img v-if="!isFollowed(item.id)" :src="plusIcon" alt="" />
                    {{ isFollowed(item.id) ? '已关注' : '关注' }}
                  </button>
                </div>
              </div>
              <p class="ent-meta">
                <span>法定代表人：{{ textOrDash(item.legalRep) }}</span>
                <span>成立日期：{{ textOrDash(item.foundedDate) }}</span>
                <span>公示补贴金额：{{ textOrDash(item.subsidyText) }}</span>
                <span class="meta-address">
                  注册地址：{{ textOrDash(item.address) }}
                </span>
              </p>
              <p v-if="item.regionLine" class="region-line">
                <EnvironmentOutlined />
                <span>{{ item.regionLine }}</span>
              </p>
            </article>

            <PaginationBar
              v-if="displayTotal > PAGE_SIZE"
              v-model:current="currentPage"
              :total="displayTotal"
              :page-size="PAGE_SIZE"
            />
          </a-spin>
        </section>
      </div>

      <aside class="match-side">
        <section class="side-card">
          <h2 class="side-title">
            <img :src="regionIcon" alt="" />
            注册地址
          </h2>
          <div class="region-cols">
            <div class="region-col">
              <a-checkbox
                v-for="item in provinces"
                :key="item.id"
                class="region-check"
                :class="{ on: selectedProvinceIds.includes(item.id) }"
                :checked="selectedProvinceIds.includes(item.id)"
                @change="toggleProvince(item.id)"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
            <div class="region-col">
              <a-checkbox
                v-for="item in regionCities"
                :key="item.id"
                class="region-check"
                :class="{ on: selectedCityIds.includes(item.id) }"
                :checked="selectedCityIds.includes(item.id)"
                @change="toggleCity(item.id)"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
            <div class="region-col">
              <a-checkbox
                v-for="item in regionDistricts"
                :key="item.id"
                class="region-check"
                :class="{ on: selectedDistrictIds.includes(item.id) }"
                :checked="selectedDistrictIds.includes(item.id)"
                @change="toggleDistrict(item.id)"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
          </div>
        </section>

        <section class="side-card tool-card">
          <button type="button" class="tool-row" @click="openTool('workspace')">
            <img :src="toolAiIcon" alt="" />
            <span>智能工具</span>
          </button>
          <button
            type="button"
            class="tool-row"
            @click="openTool('personal-center')"
          >
            <img :src="toolManageIcon" alt="" />
            <span>管理系统</span>
          </button>
        </section>

        <section class="side-card">
          <h2 class="side-title">
            <img :src="hotIcon" alt="" />
            热门政策线索
          </h2>
          <p v-if="!clues.length" class="side-empty">暂无热门政策</p>
          <ul v-else class="clue-list">
            <li
              v-for="(item, index) in clues"
              :key="`${item}-${index}`"
              class="clue-item"
              @click="applyHot(item)"
            >
              <img
                v-if="index < 3"
                class="rank-icon"
                :src="rankIcons[index]"
                alt=""
              />
              <span v-else class="rank-num">{{ index + 1 }}</span>
              <span class="clue-name">{{ item }}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.policy-match {
  --filter-font-size: 14px;
  --filter-label-width: 84px;
  --filter-options-gap: 4px 16px;
  --filter-row-padding: 8px 0;
  margin-top: -8px;
}

.hero-stage {
  position: relative;
  z-index: 1;
  padding: 8px 0 25px;
}

.hero-copy h1 {
  margin: 21px 0 16px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--pb-primary);
}

.search-box {
  display: flex;
  align-items: center;
  width: min(100%, 760px);
  height: 46px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.12);

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 0 16px;
    font-size: 14px;
    color: #262626;

    &::placeholder {
      color: #bfbfbf;
    }

    &::-webkit-search-cancel-button {
      appearance: none;
    }
  }
}

.search-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 22px;
  border: none;
  border-radius: 0 4px 4px 0;
  background: var(--pb-primary);
  color: #fff;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: var(--pb-primary-hover);
  }
}

.hot-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 35px;
  padding: 0 20px;
  min-height: 36px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.hot-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  width: 164px;
  height: 60px;
  padding: 0 16px 0 31px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  color: #fff;
  font-size: 20px;
  font-weight: 600;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
}

.hot-chip {
  max-width: 220px;
  padding: 0;
  border: none;
  background: transparent;
  color: #595959;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover,
  &.on {
    color: var(--pb-primary);
  }

  .hot-chip-icon {
    width: 5px;
    height: 5px;
    background: #0e5dd8;
    border-radius: 50%;
  }
}

.policy-search-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  height: 32px;
  margin-left: auto;
  padding: 0 14px;
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  background: #fff;
  color: var(--pb-primary);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: var(--pb-primary);
  }
}

.match-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: start;
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--pb-shadow-card);
}

.filter-panel {
  padding: 8px 18px 6px;
}

.option-empty {
  color: #bfbfbf;
  line-height: 32px;
}

.result-panel {
  margin-top: 16px;
  padding: 14px 0 8px;
}

.match-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px 8px;
}

.score-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  font-size: 14px;
}

.score-label {
  color: #262626;
  font-weight: 600;
}

.score-option {
  padding: 0;
  border: none;
  background: transparent;
  color: #8c8c8c;
  font-size: 14px;
  cursor: pointer;

  &.on {
    color: #ff7a1a;
    font-weight: 700;
  }
}

.export-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  line-height: 0;
  cursor: pointer;

  img {
    display: block;
    width: 111px;
    height: 32px;
  }
}

.result-empty {
  padding: 48px 16px;
  color: #8c8c8c;
  text-align: center;
}

.match-empty {
  --empty-gap: 12px;
  --empty-padding: 28px 0 36px;
  --empty-text-size: 15px;
  --empty-text-color: #8c8c8c;
}

.ent-card {
  margin: 0 16px 12px;
  padding: 14px 16px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;

  &.is-focus {
    border-color: #91caff;
    background: linear-gradient(180deg, #f7fbff 0%, #fff 56%);
  }
}

.ent-score-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #8c8c8c;
  font-size: 14px;

  em {
    margin-left: 4px;
    font-style: normal;
    font-weight: 700;
    color: #ff7a1a;
  }
}

.ent-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ent-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--pb-primary);
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.ent-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--pb-primary);
  border-radius: 4px;
  background: #fff;
  color: var(--pb-primary);
  font-size: 14px;
  cursor: pointer;

  img {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  &:hover {
    background: #e6f4ff;
  }

  &.on {
    background: var(--pb-primary);
    color: #fff;
  }
}

.ent-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin: 10px 0 0;
  color: #8c8c8c;
  font-size: 13px;
  line-height: 1.6;
}

.meta-address {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  padding: 6px 10px;
  border-radius: 4px;
  background: #fff4e8;
  color: #ff7a1a;
  font-size: 13px;
}

.side-card {
  margin-bottom: 16px;
  padding: 16px 14px 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--pb-shadow-card);
}

.side-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 700;

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
}

.region-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 8px;
  max-height: 292px;
  overflow: auto;
}

.region-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.region-check {
  display: flex;
  max-width: 100%;
  margin-inline-start: 0;
  font-size: 13px;
  color: #595959;

  :deep(.ant-checkbox + span) {
    overflow: hidden;
    padding-inline-end: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.on :deep(.ant-checkbox + span) {
    color: var(--pb-primary);
  }
}

.tool-card {
  padding-top: 8px;
  padding-bottom: 8px;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 4px;
  border: none;
  border-bottom: 1px solid #f5f5f5;
  background: transparent;
  color: #262626;
  font-size: 15px;
  text-align: left;
  cursor: pointer;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: var(--pb-primary);
  }
}

.side-empty {
  margin: 0;
  color: #bfbfbf;
  font-size: 13px;
}

.clue-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.clue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  color: #434343;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: var(--pb-primary);
  }
}

.rank-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.rank-num {
  width: 20px;
  color: #8c8c8c;
  font-weight: 600;
  text-align: center;
}

.clue-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.policy-match-menu) {
  max-height: 320px;
  overflow: auto;
}

@include below-lg {
  .match-layout {
    grid-template-columns: 1fr;
  }

  .policy-search-btn {
    margin-left: 0;
  }

  .meta-address {
    white-space: normal;
  }
}
</style>
