<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import {
  formatMetricValue,
  type InsightMetric,
  type RankItem,
} from '@/mock/insights'

defineOptions({ name: 'RegionRank' })

const props = defineProps<{
  metric: InsightMetric
  items: RankItem[]
}>()

const bars = ref<number[]>([])

watch(
  () => props.items.map((item) => item.percent).join(','),
  async () => {
    bars.value = props.items.map(() => 0)
    await nextTick()
    requestAnimationFrame(() => {
      bars.value = props.items.map((item) => item.percent)
    })
  },
  { immediate: true },
)
</script>

<template>
  <ol class="rank-list">
    <li v-for="(item, index) in items" :key="`${metric}-${item.name}`">
      <span class="rank-no" :class="`is-${index + 1}`">{{ index + 1 }}</span>
      <span class="rank-name">{{ item.name }}</span>
      <a-progress
        class="rank-bar"
        :percent="bars[index] ?? 0"
        :show-info="false"
        :stroke-width="8"
        :stroke-color="{ '0%': '#9fd0ff', '100%': '#1677ff' }"
        trail-color="rgba(22, 119, 255, 0.08)"
      />
      <span class="rank-value">
        {{ formatMetricValue(metric, item.value) }}
      </span>
      <span class="rank-growth">↑ {{ item.growth.toFixed(1) }}%</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.rank-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  margin: 2px 0 0;
  padding: 0;
  overflow: hidden;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 20px 52px minmax(0, 1fr) 64px 58px;
    align-items: center;
    gap: 6px;
    min-height: 0;
  }
}

.rank-no {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e8f1fb;
  color: #5b7ea8;
  font-size: 11px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;

  &.is-1 {
    background: linear-gradient(180deg, #ffe08a, #f5b942);
    color: #fff;
  }

  &.is-2 {
    background: linear-gradient(180deg, #e7edf5, #b7c3d4);
    color: #fff;
  }

  &.is-3 {
    background: linear-gradient(180deg, #f3c59a, #d39262);
    color: #fff;
  }
}

.rank-name {
  color: #344054;
  font-size: 13px;
}

.rank-bar {
  margin: 0;

  :deep(.ant-progress-outer) {
    display: flex;
  }

  :deep(.ant-progress-inner) {
    background: rgba(22, 119, 255, 0.08);
  }
}

.rank-value {
  color: #1d2939;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.rank-growth {
  color: #ff4d4f;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
