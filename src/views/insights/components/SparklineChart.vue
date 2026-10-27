<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { chartMotion, ensureInsightCharts } from '../registerCharts'

defineOptions({ name: 'SparklineChart' })

const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    height?: number
    variant?: 'line' | 'bar'
  }>(),
  { color: '#3b82f6', height: 48, variant: 'line' },
)

ensureInsightCharts()

const option = computed(() => {
  const bar = props.variant === 'bar'
  return {
    ...chartMotion,
    grid: { left: 0, right: 0, top: bar ? 2 : 6, bottom: 0 },
    tooltip: { show: false },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: bar,
      data: props.values.map((_, index) => index),
    },
    yAxis: {
      type: 'value',
      show: false,
      scale: !bar,
      min: bar ? 0 : undefined,
    },
    series: [
      bar
        ? {
            type: 'bar',
            data: props.values,
            barWidth: '46%',
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: props.color },
                  { offset: 1, color: hexAlpha(props.color, 0.28) },
                ],
              },
            },
          }
        : {
            type: 'line',
            data: props.values,
            smooth: 0.45,
            symbol: 'none',
            lineStyle: { width: 2, color: props.color },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: hexAlpha(props.color, 0.38) },
                  { offset: 1, color: hexAlpha(props.color, 0) },
                ],
              },
            },
          },
    ],
  }
})

function hexAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<template>
  <VChart
    class="sparkline"
    :style="{ height: `${height}px` }"
    :option="option"
    autoresize
  />
</template>

<style scoped lang="scss">
.sparkline {
  width: 100%;
}
</style>
