<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import {
  getRegionShare,
  regionLinks,
  regionNodes,
  type InsightMetric,
} from '@/mock/insights'
import { chartMotion, ensureInsightCharts } from '../registerCharts'

defineOptions({ name: 'RegionMap' })

const props = defineProps<{
  metric: InsightMetric
}>()

ensureInsightCharts()

const nodeByKey = Object.fromEntries(
  regionNodes.map((node) => [node.key, node]),
)

const option = computed(() => {
  const points = regionNodes.map((node) => {
    const percent = getRegionShare(props.metric, node.key)
    const lead = percent >= 30
    return {
      name: node.name,
      percent,
      value: [...node.coord, percent],
      symbolSize: lead ? 16 : 10,
      label: { position: node.labelPosition },
      itemStyle: { color: lead ? '#1677ff' : '#5aa9ff' },
    }
  })

  return {
    ...chartMotion,
    tooltip: {
      trigger: 'item',
      formatter: (params: {
        seriesType?: string
        name?: string
        data?: { percent?: number }
      }) => {
        if (params.seriesType !== 'effectScatter') return ''
        return `${params.name}<br/>占比 ${params.data?.percent ?? 0}%`
      },
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.06,
      layoutCenter: ['48%', '54%'],
      layoutSize: '102%',
      itemStyle: {
        areaColor: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#f3faff' },
            { offset: 0.55, color: '#c5e4ff' },
            { offset: 1, color: '#7eb6f6' },
          ],
        },
        borderColor: 'rgba(255,255,255,0.95)',
        borderWidth: 1.2,
        shadowColor: 'rgba(64, 140, 220, 0.28)',
        shadowBlur: 16,
        shadowOffsetY: 8,
      },
      emphasis: {
        itemStyle: { areaColor: '#9dceff' },
        label: { show: false },
      },
      label: { show: false },
      regions: [
        {
          name: '南海诸岛',
          label: { show: false },
          itemStyle: {
            areaColor: 'rgba(255,255,255,0.01)',
            borderColor: 'rgba(90, 156, 220, 0.55)',
          },
        },
      ],
    },
    series: [
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        silent: true,
        effect: {
          show: true,
          period: 5,
          trailLength: 0.35,
          symbol: 'circle',
          symbolSize: 4,
          color: '#ffffff',
        },
        lineStyle: {
          color: 'rgba(90, 169, 255, 0.55)',
          width: 1.2,
          curveness: 0.22,
        },
        data: regionLinks.flatMap(([from, to]) => {
          const start = nodeByKey[from]
          const end = nodeByKey[to]
          if (!start || !end) return []
          return [{ coords: [start.coord, end.coord] }]
        }),
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: { scale: 4.2, brushType: 'stroke', period: 3.6 },
        label: {
          show: true,
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderRadius: 12,
          padding: [5, 8],
          shadowBlur: 8,
          shadowColor: 'rgba(40, 100, 180, 0.16)',
          formatter: (params: { name: string; data: { percent: number } }) =>
            `{name|${params.name}}\n{val|${params.data.percent}%}`,
          rich: {
            name: {
              color: '#667085',
              fontSize: 12,
              align: 'center',
              lineHeight: 16,
            },
            val: {
              color: '#1677ff',
              fontSize: 13,
              fontWeight: 700,
              align: 'center',
              lineHeight: 18,
            },
          },
        },
        data: points,
      },
    ],
  }
})
</script>

<template>
  <div class="map-wrap">
    <VChart class="map-chart" :option="option" autoresize />
    <div class="sea-box" aria-hidden="true">
      <svg viewBox="0 0 64 72" class="sea-shape">
        <circle cx="28" cy="22" r="3.2" />
        <circle cx="40" cy="34" r="2.2" />
        <circle cx="24" cy="42" r="2.6" />
        <circle cx="36" cy="50" r="1.8" />
        <path d="M14 58h36" />
      </svg>
      <span>南海诸岛</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.map-wrap {
  position: relative;
  flex: 1;
  height: 100%;
  min-height: 0;
  border-radius: 16px;
  background:
    radial-gradient(
      ellipse 68% 22% at 50% 86%,
      rgba(120, 186, 255, 0.55),
      rgba(120, 186, 255, 0) 72%
    ),
    radial-gradient(
      420px 260px at 50% 48%,
      rgba(150, 205, 255, 0.5),
      rgba(255, 255, 255, 0) 72%
    );

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 7%;
    width: 62%;
    height: 14%;
    border: 1px solid rgba(110, 176, 245, 0.55);
    border-radius: 50%;
    transform: translateX(-50%);
    box-shadow:
      0 0 0 10px rgba(150, 200, 255, 0.12),
      0 16px 28px rgba(70, 140, 220, 0.16);
    pointer-events: none;
  }
}

.map-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.sea-box {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 76px;
  padding: 6px 0 4px;
  border: 1px dashed rgba(90, 156, 220, 0.55);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  color: #8aa0b8;
  font-size: 12px;
  line-height: 16px;
  pointer-events: none;
}

.sea-shape {
  width: 48px;
  height: 52px;
  fill: #7eb6f6;
  stroke: #8ebbe8;
  stroke-width: 1.4;
  stroke-dasharray: 2 2;
}
</style>
