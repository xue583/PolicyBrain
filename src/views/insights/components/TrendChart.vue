<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { TrendPoint } from '@/mock/insights'
import { chartMotion, ensureInsightCharts } from '../registerCharts'

defineOptions({ name: 'TrendChart' })

const props = defineProps<{
  points: TrendPoint[]
}>()

ensureInsightCharts()

const option = computed(() => ({
  ...chartMotion,
  color: ['#3b82f6', '#34d399'],
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 8, top: 8, bottom: 22 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.points.map((item) => item.label),
    axisLine: { lineStyle: { color: '#e6eef8' } },
    axisTick: { show: false },
    axisLabel: { color: '#98a2b3', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    splitNumber: 4,
    axisLabel: { color: '#98a2b3', fontSize: 11 },
    splitLine: { lineStyle: { color: '#eef3f9' } },
  },
  series: [
    {
      name: '政策发布',
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 7,
      data: props.points.map((item) => item.publish),
      lineStyle: { width: 2.5, color: '#3b82f6' },
      itemStyle: { color: '#3b82f6' },
    },
    {
      name: '申报数量',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: props.points.map((item) => item.apply),
      lineStyle: { width: 2, color: '#34d399' },
      itemStyle: { color: '#34d399' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(52, 211, 153, 0.42)' },
            { offset: 1, color: 'rgba(52, 211, 153, 0.02)' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <VChart class="trend-chart" :option="option" autoresize />
</template>

<style scoped lang="scss">
.trend-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
