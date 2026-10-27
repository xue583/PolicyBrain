<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import {
  BankOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  ShopOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { useRegionStore } from '@/stores/region'
import {
  feedTabs,
  getFundTrend,
  getRank,
  getTrend,
  insightKpis,
  keyIndustries,
  mapOverview,
  metricOptions,
  policyFeed,
  policyTypes,
  trendHeadline,
  trendRangeOptions,
  type InsightMetric,
  type TrendRange,
} from '@/mock/insights'
import logoImg from '@/assets/logo-full.png'
import InsightPanel from './components/InsightPanel.vue'
import SparklineChart from './components/SparklineChart.vue'
import TrendChart from './components/TrendChart.vue'
import TypeDonut from './components/TypeDonut.vue'
import RegionMap from './components/RegionMap.vue'
import RegionRank from './components/RegionRank.vue'
import FundTrendChart from './components/FundTrendChart.vue'
import ApplyStatus from './components/ApplyStatus.vue'
import IndustryBars from './components/IndustryBars.vue'
import PolicyFeed from './components/PolicyFeed.vue'

defineOptions({ name: 'DataInsights' })

const regionStore = useRegionStore()
const { areaLabel } = storeToRefs(regionStore)

const now = ref(dayjs())
const trendRange = ref<TrendRange>('30d')
const fundRange = ref<TrendRange>('12m')
const mapMetric = ref<InsightMetric>('policy')
const rankMetric = ref<InsightMetric>('policy')
const typeFilter = ref('all')
const industryMetric = ref<'policy' | 'fund'>('policy')
const feedTab = ref<(typeof feedTabs)[number]>('全部')
const kpiValues = ref(insightKpis.map(() => 0))

const clockText = computed(() =>
  now.value.format('YYYY年MM月DD日 dddd HH:mm:ss'),
)
const weatherCity = computed(() =>
  areaLabel.value && areaLabel.value !== '请选择地区'
    ? areaLabel.value
    : '洛阳市',
)
const trendPoints = computed(() => getTrend(trendRange.value))
const headline = computed(() => trendHeadline[trendRange.value])
const fundPoints = computed(() => getFundTrend(fundRange.value))
const rankItems = computed(() => getRank(rankMetric.value))
const feedItems = computed(() =>
  feedTab.value === '全部'
    ? policyFeed
    : policyFeed.filter((item) => item.category === feedTab.value),
)
const industryBars = computed(() => {
  const rows = keyIndustries.map((item) => ({
    name: item.name,
    value: industryMetric.value === 'fund' ? item.fund : item.policy,
  }))
  const max = Math.max(...rows.map((row) => row.value))
  return rows.map((row) => ({
    name: row.name,
    percent: max ? (row.value / max) * 100 : 0,
    label:
      industryMetric.value === 'fund'
        ? row.value.toLocaleString('zh-CN', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
        : Math.round(row.value).toLocaleString('zh-CN'),
  }))
})

const typeOptions = [
  { label: '全部类型', value: 'all' },
  ...policyTypes.map((item) => ({ label: item.name, value: item.name })),
]
const industryMetricOptions = [
  { label: '政策数量', value: 'policy' },
  { label: '资金规模', value: 'fund' },
]
const feedTabOptions = feedTabs.map((item) => ({ label: item, value: item }))
const mapStatIcons = [BankOutlined, EnvironmentOutlined, ShopOutlined]
const kpiIcons = [
  FileTextOutlined,
  BankOutlined,
  SolutionOutlined,
  PayCircleOutlined,
  UserOutlined,
]

let clockTimer = 0
let countTimer = 0

const formatKpi = (index: number) => {
  const item = insightKpis[index]
  const value = kpiValues.value[index] ?? 0
  if (!item) return '0'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: item.precision,
    maximumFractionDigits: item.precision,
  })
}

const playCountUp = () => {
  const start = performance.now()
  const duration = 1200
  const targets = insightKpis.map((item) => item.value)
  const step = (time: number) => {
    const progress = Math.min(1, (time - start) / duration)
    const eased = 1 - (1 - progress) ** 3
    kpiValues.value = targets.map((target) => target * eased)
    if (progress < 1) countTimer = requestAnimationFrame(step)
    else kpiValues.value = targets
  }
  countTimer = requestAnimationFrame(step)
}

onMounted(() => {
  playCountUp()
  clockTimer = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(clockTimer)
  cancelAnimationFrame(countTimer)
})
</script>

<template>
  <div class="insights-page">
    <header class="cockpit-head">
      <div class="brand">
        <img :src="logoImg" alt="政策大脑" />
        <p>数据驱动政策落地 · AI赋能产业发展</p>
      </div>
      <div class="cockpit-title">
        <h1>
          <i class="title-wing" />
          全国政策数据驾驶舱
          <i class="title-wing is-right" />
        </h1>
        <p>用数据透视政策，让企业更好发展</p>
      </div>
      <div class="hero-meta">
        <span>{{ clockText }}</span>
        <span class="meta-split" />
        <!-- <span class="weather">
          <CloudOutlined />
          {{ weatherCity }} 18-26℃
        </span> -->
      </div>
    </header>

    <section class="kpi-grid">
      <article
        v-for="(item, index) in insightKpis"
        :key="item.key"
        class="kpi-card"
        :style="{ animationDelay: `${index * 70}ms` }"
      >
        <div class="kpi-main">
          <div class="kpi-top">
            <span class="kpi-icon">
              <component :is="kpiIcons[index]" />
            </span>
            <span class="kpi-label">{{ item.label }}</span>
          </div>
          <div class="kpi-figure">
            <strong>{{ formatKpi(index) }}</strong>
            <span>{{ item.unit }}</span>
          </div>
          <div class="kpi-growth">同比 ↑ {{ item.growth.toFixed(1) }}%</div>
        </div>
        <SparklineChart
          class="kpi-spark"
          variant="bar"
          :values="[...item.spark]"
          :color="item.color"
          :height="52"
        />
      </article>
    </section>

    <section class="board">
      <div class="col">
        <InsightPanel title="政策发布趋势" class="trend-panel">
          <template #extra>
            <a-segmented
              v-model:value="trendRange"
              :options="trendRangeOptions"
              size="small"
            />
          </template>
          <div class="trend-stats">
            <div>
              <i class="stat-dot is-blue" />
              <span>政策发布（条）</span>
              <strong>{{ headline.publish.toLocaleString('zh-CN') }}</strong>
              <em>↑ {{ headline.publishGrowth.toFixed(1) }}%</em>
            </div>
            <div>
              <i class="stat-dot is-green" />
              <span>申报数量（项）</span>
              <strong>{{ headline.apply.toLocaleString('zh-CN') }}</strong>
              <em>↑ {{ headline.applyGrowth.toFixed(1) }}%</em>
            </div>
          </div>
          <div class="chart-slot">
            <TrendChart :points="trendPoints" />
          </div>
        </InsightPanel>

        <InsightPanel title="政策类型分布" class="type-panel">
          <template #extra>
            <a-select
              v-model:value="typeFilter"
              size="small"
              class="panel-select"
              :options="typeOptions"
            />
          </template>
          <div class="chart-slot">
            <TypeDonut :active-name="typeFilter" />
          </div>
        </InsightPanel>
      </div>

      <InsightPanel title="全国政策分布" class="map-panel">
        <template #extra>
          <a-segmented
            v-model:value="mapMetric"
            :options="metricOptions"
            size="small"
          />
        </template>
        <div class="map-stats">
          <div v-for="(item, index) in mapOverview" :key="item.key">
            <span class="map-stat-icon">
              <component :is="mapStatIcons[index]" />
            </span>
            <div>
              <strong>
                {{ item.value }}
                <small>{{ item.unit }}</small>
              </strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div class="chart-slot is-map">
          <RegionMap :metric="mapMetric" />
        </div>
      </InsightPanel>

      <div class="col">
        <InsightPanel title="地区政策排行" class="rank-panel">
          <template #extra>
            <a-segmented
              v-model:value="rankMetric"
              :options="metricOptions"
              size="small"
            />
          </template>
          <RegionRank :metric="rankMetric" :items="rankItems" />
        </InsightPanel>

        <InsightPanel title="政策申报状态" class="status-panel">
          <template #extra>
            <span class="text-link">查看详情</span>
          </template>
          <ApplyStatus />
        </InsightPanel>
      </div>

      <InsightPanel title="重点产业政策数量" class="industry-panel">
        <template #extra>
          <a-select
            v-model:value="industryMetric"
            size="small"
            class="panel-select"
            :options="industryMetricOptions"
          />
        </template>
        <IndustryBars :items="industryBars" />
      </InsightPanel>

      <InsightPanel title="资金支持趋势" class="fund-panel">
        <template #extra>
          <a-segmented
            v-model:value="fundRange"
            :options="trendRangeOptions"
            size="small"
          />
        </template>
        <div class="chart-slot">
          <FundTrendChart :points="fundPoints" />
        </div>
      </InsightPanel>

      <InsightPanel title="最新政策动态" class="feed-panel" wrap-extra>
        <template #extra>
          <div class="feed-extra">
            <a-segmented
              v-model:value="feedTab"
              :options="feedTabOptions"
              size="small"
            />
            <span class="text-link">更多</span>
          </div>
        </template>
        <PolicyFeed :items="feedItems" />
      </InsightPanel>
    </section>
  </div>
</template>

<style scoped lang="scss">
.insights-page {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  padding: 6px 14px 8px;
  overflow: hidden;
  background-color: #e7f3ff;
  background-image:
    radial-gradient(
      920px 280px at 50% -20px,
      rgba(140, 196, 255, 0.55),
      transparent 70%
    ),
    radial-gradient(
      720px 460px at 50% 46%,
      rgba(186, 220, 255, 0.42),
      transparent 68%
    ),
    linear-gradient(rgba(120, 170, 220, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 170, 220, 0.08) 1px, transparent 1px);
  background-size:
    auto,
    auto,
    56px 56px,
    56px 56px;
}

.cockpit-head {
  display: grid;
  flex: none;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 56px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  img {
    display: block;
    width: 132px;
    height: 42px;
    object-fit: contain;
    object-position: left center;
  }

  p {
    margin: 0;
    color: #6d84a3;
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
  }
}

.cockpit-title {
  text-align: center;

  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0;
    color: #163a6b;
    font-family: var(--pb-font-display);
    font-size: 28px;
    font-weight: 700;
    line-height: 36px;
    letter-spacing: 2px;
  }

  p {
    margin: 2px 0 0;
    color: #7f97b5;
    font-size: 13px;
    line-height: 20px;
  }
}

.title-wing {
  position: relative;
  width: 92px;
  height: 12px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 78px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #69b1ff);
  }

  &::before {
    top: 2px;
  }

  &::after {
    bottom: 2px;
  }

  // 标题两侧的菱形装饰，对齐驾驶舱稿
  background: linear-gradient(
      135deg,
      transparent 46%,
      #69b1ff 46% 54%,
      transparent 54%
    )
    right center / 8px 8px no-repeat;

  &.is-right {
    transform: scaleX(-1);
  }
}

.hero-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  color: #4b6280;
  font-size: 13px;
  white-space: nowrap;
}

.meta-split {
  width: 1px;
  height: 14px;
  background: rgba(75, 98, 128, 0.25);
}

.weather {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kpi-grid {
  display: grid;
  flex: none;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.kpi-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 28px rgba(70, 130, 200, 0.08);
  animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.kpi-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kpi-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #69b7ff 0%, #1677ff 100%);
  color: #fff;
  font-size: 15px;
  box-shadow: 0 6px 12px rgba(22, 119, 255, 0.24);
}

.kpi-label {
  color: #667085;
  font-size: 13px;
}

.kpi-figure {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;

  strong {
    color: #1d2939;
    font-size: 22px;
    font-weight: 700;
    line-height: 28px;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: #667085;
    font-size: 12px;
  }
}

.kpi-growth {
  margin-top: 2px;
  color: #ff4d4f;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.board {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(280px, 1fr) minmax(380px, 1.32fr) minmax(
      320px,
      1.08fr
    );
  grid-template-rows: minmax(0, 1.52fr) minmax(0, 0.98fr);
  gap: 8px;
  min-height: 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.trend-panel {
  flex: 1.12;
  min-height: 0;
}

.type-panel {
  flex: 0.95;
  min-height: 0;
}

.rank-panel {
  flex: 1.55;
  min-height: 0;
}

.rank-panel :deep(.rank-list),
.industry-panel :deep(.industry-list),
.feed-panel :deep(.feed-list),
.status-panel :deep(.status-list) {
  flex: 1;
  min-height: 0;
}

.status-panel,
.industry-panel,
.fund-panel,
.feed-panel,
.map-panel {
  min-height: 0;
}

.status-panel {
  flex: 0.68;
}

.chart-slot {
  flex: 1;
  min-height: 0;
}

.chart-slot.is-map {
  min-height: 0;
}

.trend-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-bottom: 4px;

  div {
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  span {
    color: #667085;
    font-size: 12px;
  }

  strong {
    color: #1d2939;
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  em {
    color: #ff4d4f;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
  }
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.is-blue {
    background: #3b82f6;
  }

  &.is-green {
    background: #34d399;
  }
}

.map-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 4px;

  > div {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.72);
  }

  strong {
    display: block;
    color: #1d2939;
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
  }

  small {
    margin-left: 2px;
    color: #667085;
    font-size: 12px;
    font-weight: 500;
  }

  span {
    color: #667085;
    font-size: 12px;
    line-height: 18px;
  }
}

.map-stat-icon {
  display: grid;
  flex: none;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #69b7ff 0%, #1677ff 100%);
  color: #fff;
  font-size: 15px;
}

.panel-select {
  width: 96px;
}

.feed-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.text-link {
  color: #1677ff;
  font-size: 12px;
  white-space: nowrap;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@include below-lg {
  .insights-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .cockpit-head,
  .kpi-grid,
  .board {
    grid-template-columns: 1fr;
  }

  .board {
    grid-template-rows: none;
  }

  .cockpit-head {
    justify-items: center;
  }

  .brand,
  .hero-meta {
    justify-content: center;
  }

  .brand p,
  .hero-meta {
    white-space: normal;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-slot,
  .chart-slot.is-map {
    min-height: 220px;
  }
}

@media (max-height: 760px) {
  .insights-page {
    height: auto;
    overflow: visible;
  }

  .board {
    grid-template-rows: auto auto;
  }

  .chart-slot,
  .chart-slot.is-map {
    min-height: 200px;
  }
}
</style>
