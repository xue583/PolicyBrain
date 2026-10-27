<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { FundPoint } from '@/mock/insights'
import { chartMotion, ensureInsightCharts } from '../registerCharts'

defineOptions({ name: 'FundTrendChart' })

const props = defineProps<{
  points: FundPoint[]
}>()

ensureInsightCharts()

const option = computed(() => ({
  ...chartMotion,
  tooltip: { trigger: 'axis' },
  legend: {
    top: 0,
    left: 0,
    itemWidth: 10,
    itemHeight: 8,
    textStyle: { color: '#667085', fontSize: 12 },
  },
  grid: { left: 42, right: 42, top: 32, bottom: 22 },
  xAxis: {
    type: 'category',
    data: props.points.map((item) => item.label),
    axisLine: { lineStyle: { color: '#e6eef8' } },
    axisTick: { show: false },
    axisLabel: { color: '#98a2b3', fontSize: 11 },
  },
  yAxis: [
    {
      type: 'value',
      splitNumber: 4,
      axisLabel: { color: '#98a2b3', fontSize: 11 },
      splitLine: { lineStyle: { color: '#eef3f9' } },
    },
    {
      type: 'value',
      splitNumber: 4,
      axisLabel: {
        color: '#98a2b3',
        fontSize: 11,
        formatter: '{value}%',
      },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '资金规模（亿元）',
      type: 'bar',
      barWidth: 12,
      data: props.points.map((item) => item.amount),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#7dd3fc' },
            { offset: 1, color: '#d7f3ff' },
          ],
        },
      },
    },
    {
      name: '同比增速',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: props.points.map((item) => item.growth),
      lineStyle: { width: 2, color: '#fb923c' },
      itemStyle: { color: '#fb923c' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(251, 146, 60, 0.28)' },
            { offset: 1, color: 'rgba(251, 146, 60, 0.02)' },
          ],
        },
      },
    },
  ],
}))
</script>

<template>
  <VChart class="fund-chart" :option="option" autoresize />
</template>

<style scoped lang="scss">
.fund-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
