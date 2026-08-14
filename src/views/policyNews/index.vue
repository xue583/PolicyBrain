<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SearchOutlined,
  DownOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import {
  navItems,
  regions,
  industries,
  policyLevels,
  infoTypes,
  mockPolicies,
  type PolicyItem,
} from '../../mock/policyNews'
import logoLightImg from '../../assets/logo-light.png'
import heroBg from '../../assets/hero-bg.png'

defineOptions({ name: 'PolicyNews' })

const keyword = ref('')
const activeTab = ref('expired')
const currentPage = ref(1)
const pageSize = 5
const showMoreRegions = ref(false)
const showMoreIndustries = ref(false)

const filters = reactive({
  region: '' as string,
  industries: [] as string[],
  levels: ['municipal'] as string[],
  infoTypes: ['new'] as string[],
})

const selectedConditions = computed(() => {
  const list: { key: string; label: string }[] = []
  if (filters.region) {
    list.push({ key: 'region', label: `省市地区：${filters.region}` })
  }
  filters.industries.forEach((item) => {
    list.push({ key: `industry:${item}`, label: `行业分类：${item}` })
  })
  filters.levels.forEach((value) => {
    const found = policyLevels.find((l) => l.value === value)
    if (found) list.push({ key: `level:${value}`, label: `政策级别：${found.label}` })
  })
  filters.infoTypes.forEach((value) => {
    const found = infoTypes.find((t) => t.value === value)
    if (found) list.push({ key: `type:${value}`, label: `资讯类型：${found.label}` })
  })
  return list
})

const visibleRegions = computed(() =>
  showMoreRegions.value ? regions : regions.slice(0, 12),
)

const visibleIndustries = computed(() =>
  showMoreIndustries.value ? industries : industries.slice(0, 5),
)

const filteredList = computed(() => {
  let list = mockPolicies.filter((item) =>
    activeTab.value === 'expired' ? item.status === 'expired' : item.status === 'normal',
  )

  if (keyword.value.trim()) {
    const kw = keyword.value.trim()
    list = list.filter(
      (item) => item.title.includes(kw) || item.description.includes(kw),
    )
  }

  return list
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

function selectRegion(region: string) {
  filters.region = filters.region === region ? '' : region
  currentPage.value = 1
}

function removeCondition(key: string) {
  if (key === 'region') {
    filters.region = ''
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
  currentPage.value = 1
}

function clearConditions() {
  filters.region = ''
  filters.industries = []
  filters.levels = []
  filters.infoTypes = []
  currentPage.value = 1
}

function onSearch() {
  currentPage.value = 1
}

function onTabChange() {
  currentPage.value = 1
}

function onFilterChange() {
  currentPage.value = 1
}

function openDetail(item: PolicyItem) {
  console.log('open detail', item.id)
}
</script>

<template>
  <div class="policy-page">
    <div class="page-bg" :style="{ backgroundImage: `url(${heroBg})` }" />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-slogan">政策脉动，一手掌握</p>
          <h1>政策资讯</h1>
          <p class="hero-desc">支持省、市、区县三级筛选，实时追踪全国政策动态。</p>
          <div class="search-bar">
            <a-input
              v-model:value="keyword"
              size="large"
              allow-clear
              placeholder="搜索政策关键词或项目名称"
              @press-enter="onSearch"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
            <a-button type="primary" size="large" class="search-btn" @click="onSearch">
              搜索
            </a-button>
          </div>
        </div>
      </div>
    </section>

    <div class="page-content">
      <!-- Filters -->
      <div class="filter-panel">
        <div class="filter-row">
          <span class="filter-label">省市地区：</span>
          <div class="filter-options">
            <a
              v-for="region in visibleRegions"
              :key="region"
              class="region-link"
              :class="{ active: filters.region === region }"
              @click="selectRegion(region)"
            >
              {{ region }}
            </a>
            <a class="more-link" @click="showMoreRegions = !showMoreRegions">
              {{ showMoreRegions ? '收起' : '更多' }}
              <DownOutlined :class="{ rotated: showMoreRegions }" />
            </a>
          </div>
        </div>

        <div class="filter-row">
          <span class="filter-label">行业分类：</span>
          <div class="filter-options">
            <a-checkbox-group
              v-model:value="filters.industries"
              :options="visibleIndustries"
              @change="onFilterChange"
            />
            <a class="more-link" @click="showMoreIndustries = !showMoreIndustries">
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
              @change="onFilterChange"
            />
          </div>
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

        <div class="filter-row selected-row">
          <span class="filter-label">已选条件：</span>
          <div class="selected-tags">
            <template v-if="selectedConditions.length">
              <a-tag
                v-for="item in selectedConditions"
                :key="item.key"
                closable
                color="processing"
                @close="removeCondition(item.key)"
              >
                {{ item.label }}
              </a-tag>
              <a class="clear-link" @click="clearConditions">
                <CloseOutlined />
                清空
              </a>
            </template>
            <span v-else class="empty-selected">暂无筛选条件</span>
          </div>
        </div>
      </div>

      <div class="result-bar">共找到 {{ total }} 条政策资讯</div>

      <!-- List -->
      <div class="list-panel">
        <a-tabs v-model:activeKey="activeTab" @change="onTabChange">
          <a-tab-pane key="normal" tab="正常资讯" />
          <a-tab-pane key="expired" tab="已过期资讯" />
        </a-tabs>

        <a-list :data-source="pagedList" item-layout="vertical" :split="false">
          <template #renderItem="{ item }">
            <a-list-item class="policy-item" @click="openDetail(item)">
              <div class="item-head">
                <a class="item-title">{{ item.title }}</a>
                <a-tag v-if="item.status === 'expired'" class="status-tag">
                  <ClockCircleOutlined />
                  已过期
                </a-tag>
                <a-tag v-else color="success" class="status-tag">申报中</a-tag>
              </div>

              <div class="item-tags">
                <a-tag v-for="tag in item.tags" :key="tag.text" :color="tag.color">
                  {{ tag.text }}
                </a-tag>
              </div>

              <p class="item-desc">{{ item.description }}</p>

              <div class="item-foot">
                <div class="meta">
                  <span>
                    <ClockCircleOutlined />
                    {{ item.date }}
                  </span>
                  <span>
                    <BankOutlined />
                    {{ item.department }}
                  </span>
                </div>
                <div class="remain" :class="{ danger: item.daysRemaining <= 0 }">
                  <ClockCircleOutlined />
                  剩余天数: {{ item.daysRemaining }}天
                </div>
              </div>
            </a-list-item>
          </template>
          <template #footer>
            <div class="pagination-wrap">
              <a-pagination
                v-model:current="currentPage"
                :total="total"
                :page-size="pageSize"
                show-quick-jumper
                :show-total="(t: number) => `共${t}条`"
              />
            </div>
          </template>
        </a-list>
      </div>
    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="logo light">
            <img :src="logoLightImg" alt="政策大脑 POLICY BRAIN" />
          </div>
          <div class="footer-nav">
            <a v-for="item in navItems" :key="item.key">{{ item.label }}</a>
          </div>
        </div>

        <div class="footer-main">
          <div class="footer-col contact">
            <p><strong>客服热线：</strong>400-000-0000</p>
            <p><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
            <p><strong>联系地址：</strong>河南省郑州市金水区某某大厦</p>
          </div>
          <div class="footer-col disclaimer">
            <p>
              本平台所发布的政策信息均来源于公开渠道，仅供参考。具体申报条件、材料要求及办理流程以主管部门正式文件为准。平台不对因信息使用产生的任何直接或间接损失承担责任。如有疑问，请咨询相关主管部门或平台客服。
            </p>
          </div>
          <div class="footer-col qr">
            <div class="qr-item">
              <div class="qr-box">公众号</div>
              <span>关注微信公众号</span>
            </div>
            <div class="qr-item">
              <div class="qr-box">小程序</div>
              <span>政策大脑小程序</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          Copyright © 2026 政策大脑 AI Policy Brain　豫ICP备00000000号-1
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.policy-page {
  position: relative;
  min-height: calc(100vh - 64px);
  margin-top: -64px;
  overflow-x: hidden;
  background: #f0f2f5;
}

.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 760px;
  opacity: 1;
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 70%;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: calc(70% - 200px);
    height: 280px;
    background: linear-gradient(
      180deg,
      rgba(240, 242, 245, 0) 0%,
      rgba(240, 242, 245, 0.45) 40%,
      #f0f2f5 60%,
      #f0f2f5 100%
    );
    pointer-events: none;
  }
}

.logo {
  display: flex;
  align-items: center;
  line-height: 1;

  img {
    display: block;
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  &.light img {
    height: 48px;
  }
}

.hero {
  position: relative;
  z-index: 1;
  width: 100%;
  background: transparent;
}

.hero-inner {
  position: relative;
  display: flex;
  align-items: center;
  width: 1200px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 112px 0 40px;
}

.hero-copy {
  flex: 1;
  max-width: 640px;

  .hero-slogan {
    margin: 0 0 8px;
    font-size: 16px;
    color: #3d5a80;
    letter-spacing: 1px;
  }

  h1 {
    margin: 0 0 10px;
    font-size: 40px;
    font-weight: 700;
    color: #1677ff;
    line-height: 1.2;
  }

  .hero-desc {
    margin: 0 0 20px;
    font-size: 13px;
    color: #8c8c8c;
  }
}

.search-bar {
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.12);

  :deep(.ant-input-affix-wrapper) {
    flex: 1;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .search-btn {
    height: auto;
    border-radius: 0;
    padding-inline: 28px;
  }
}

.page-content {
  position: relative;
  z-index: 1;
  width: 1200px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 16px 0 40px;
  background: transparent;
}

.filter-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.filter-label {
  flex-shrink: 0;
  width: 84px;
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
}

.region-link {
  color: #262626;
  line-height: 32px;

  &.active,
  &:hover {
    color: #1677ff;
  }
}

.more-link {
  color: #1677ff;
  line-height: 32px;
  white-space: nowrap;

  .anticon {
    margin-left: 2px;
    font-size: 10px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.clear-link {
  color: #8c8c8c;
  font-size: 13px;

  &:hover {
    color: #1677ff;
  }
}

.empty-selected {
  color: #bfbfbf;
  line-height: 32px;
}

.result-bar {
  background: #e6f4ff;
  color: #1677ff;
  padding: 10px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
}

.list-panel {
  background: #fff;
  border-radius: 8px;
  padding: 8px 24px 24px;
}

.policy-item {
  padding: 20px 0 !important;
  border-bottom: 1px solid #f0f0f0 !important;
  cursor: pointer;

  &:hover .item-title {
    color: #1677ff;
  }
}

.item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.item-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.4;
}

.status-tag {
  flex-shrink: 0;
  margin-inline-end: 0 !important;
}

.item-tags {
  margin-bottom: 10px;
}

.item-desc {
  margin: 0 0 14px;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #8c8c8c;
  font-size: 13px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .anticon {
    margin-right: 6px;
  }
}

.remain {
  color: #fa8c16;
  white-space: nowrap;

  &.danger {
    color: #ff4d4f;
  }

  .anticon {
    margin-right: 4px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}

.page-footer {
  position: relative;
  z-index: 1;
  background: #1f2a37 !important;
  color: rgba(255, 255, 255, 0.75);
  padding: 40px 0 0;
}

.footer-inner {
  width: 1200px;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  a {
    color: rgba(255, 255, 255, 0.75);

    &:hover {
      color: #fff;
    }
  }
}

.footer-main {
  display: grid;
  grid-template-columns: 280px 1fr 220px;
  gap: 32px;
  padding: 28px 0;
}

.footer-col {
  p {
    margin: 0 0 10px;
    line-height: 1.7;
    font-size: 13px;
  }

  strong {
    color: #fff;
    font-weight: 500;
  }
}

.disclaimer p {
  color: rgba(255, 255, 255, 0.55);
}

.qr {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.qr-box {
  width: 88px;
  height: 88px;
  background: #fff;
  color: #1f2a37;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 13px;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

@media (max-width: 992px) {
  .hero-inner {
    padding: 32px 0 28px;
  }

  .hero-copy h1 {
    font-size: 32px;
  }

  .search-bar {
    max-width: 100%;
  }

  .footer-main {
    grid-template-columns: 1fr;
  }

  .qr {
    justify-content: flex-start;
  }
}
</style>
