import { registerMap, use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  BarChart,
  EffectScatterChart,
  LineChart,
  LinesChart,
  MapChart,
  PieChart,
} from 'echarts/charts'
import {
  GeoComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import chinaGeo from '@/assets/maps/china-full.json'

let ready = false

type GeoFeature = {
  properties?: { name?: string }
}

type GeoCollection = {
  features?: GeoFeature[]
}

/** 按需注册 ECharts 模块，并载入省级地图。 */
export const ensureInsightCharts = () => {
  if (ready) return
  use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    LinesChart,
    MapChart,
    EffectScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    GeoComponent,
  ])

  const geo = structuredClone(chinaGeo) as GeoCollection
  for (const feature of geo.features ?? []) {
    if (feature.properties && !feature.properties.name) {
      feature.properties.name = '南海诸岛'
    }
  }
  registerMap('china', geo as never)
  ready = true
}

export const chartMotion = {
  animationDuration: 1400,
  animationEasing: 'cubicOut',
  animationDurationUpdate: 800,
  animationEasingUpdate: 'cubicInOut',
} as const
