<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { policyTotalLabel, policyTypes } from '@/mock/insights'
import { chartMotion, ensureInsightCharts } from '../registerCharts'

defineOptions({ name: 'TypeDonut' })

const props = withDefaults(
  defineProps<{
    activeName?: string
  }>(),
  { activeName: 'all' },
)

ensureInsightCharts()

const active = computed(() =>
  props.activeName === 'all'
    ? null
    : policyTypes.find((item) => item.name === props.activeName),
)

const option = computed(() => ({
  ...chartMotion,
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>占比 {c}%',
  },
  legend: {
    orient: 'vertical',
    right: 0,
    top: 'middle',
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 12,
    formatter: (name: string) => {
      const item = policyTypes.find((row) => row.name === name)
      return `{n|${name}}{p|${item?.percent ?? 0}%}`
    },
    textStyle: {
      rich: {
        n: { width: 68, color: '#475467', fontSize: 12 },
        p: { color: '#1d2939', fontSize: 12, fontWeight: 600 },
      },
    },
  },
  series: [
    {
      name: '政策类型',
      type: 'pie',
      radius: ['58%', '78%'],
      center: ['30%', '52%'],
      padAngle: 2,
      animationType: 'expansion',
      itemStyle: { borderRadius: 6 },
      label: { show: false },
      data: policyTypes.map((item) => ({
        name: item.name,
        value: item.percent,
        itemStyle: {
          color: item.color,
          opacity:
            props.activeName === 'all' || props.activeName === item.name
              ? 1
              : 0.18,
        },
      })),
    },
  ],
}))
</script>

<template>
  <div class="donut-wrap">
    <VChart class="donut-chart" :option="option" autoresize />
    <div class="donut-center">
      <span>{{ active ? active.name : '政策总量' }}</span>
      <strong>{{ active ? `${active.percent}%` : policyTotalLabel }}</strong>
    </div>
  </div>
</template>

<style scoped lang="scss">
.donut-wrap {
  position: relative;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  top: 52%;
  left: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: none;

  span {
    color: #98a2b3;
    font-size: 12px;
    line-height: 18px;
  }

  strong {
    color: #1d2939;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    font-variant-numeric: tabular-nums;
  }
}
</style>
