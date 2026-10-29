<script setup lang="ts">
import { computed } from 'vue'
import type { EnterprisePortrait } from '../../mock/enterpriseDb'

defineOptions({ name: 'EnterprisePortraitPanel' })

const props = defineProps<{
  portrait: EnterprisePortrait
}>()

const groups = computed(() => {
  const portrait = props.portrait
  return [
    {
      title: '基础信息',
      fields: [
        { label: '公司人数', value: portrait.staffCount, span: 3 },
        { label: '场地面积', value: portrait.siteArea, span: 3 },
        { label: '位置', value: portrait.location, span: 3 },
        { label: '行业', value: portrait.industry, span: 3 },
      ],
    },
    {
      title: '核心门槛',
      fields: [
        { label: '成立年限', value: portrait.yearsEstablished, span: 3 },
        { label: '营业收入', value: portrait.revenue, span: 3 },
        { label: '资产负债率', value: portrait.assetLiabilityRatio, span: 3 },
        { label: '研发占比', value: portrait.rdRatio, span: 3 },
      ],
    },
    {
      title: '重要能力',
      fields: [
        { label: '发明专利', value: portrait.inventionPatents, span: 2 },
        { label: '实用新型专利', value: portrait.utilityPatents, span: 2 },
        { label: '软件著作权', value: portrait.softwareCopyrights, span: 2 },
        { label: '商标', value: portrait.trademarks, span: 2 },
        { label: '研发设备原值', value: portrait.rdEquipmentValue, span: 4 },
      ],
    },
    {
      title: '待补信息',
      fields: [
        { label: '标准建设', value: portrait.standards, span: 3 },
        { label: '体系许可', value: portrait.systemLicenses, span: 3 },
        { label: '信息化软件', value: portrait.infoSoftware, span: 3 },
      ],
    },
  ]
})
</script>

<template>
  <div class="portrait">
    <section v-for="group in groups" :key="group.title" class="portrait-group">
      <h3 class="portrait-title">
        <i class="portrait-mark" aria-hidden="true" />
        {{ group.title }}
      </h3>
      <div class="portrait-grid">
        <div
          v-for="field in group.fields"
          :key="field.label"
          class="portrait-field"
          :style="{ '--span': field.span }"
        >
          <span class="portrait-label">{{ field.label }}</span>
          <span class="portrait-value">{{ field.value }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.portrait {
  margin: -20px;
  padding: 20px;
  background: white;
}

.portrait-group + .portrait-group {
  margin-top: 22px;
}

.portrait-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: #262626;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.portrait-mark {
  flex-shrink: 0;
  width: 4px;
  height: 16px;
  background: var(--pb-primary);
  border-radius: 2px;
}

.portrait-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px 16px;
}

.portrait-field {
  display: flex;
  align-items: center;
  gap: 12px;
  grid-column: span var(--span, 3);
  min-width: 0;
  min-height: 40px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 4px;
}

.portrait-label {
  flex-shrink: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 22px;
}

.portrait-value {
  min-width: 0;
  color: #262626;
  font-size: 14px;
  line-height: 22px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@include below-lg {
  .portrait {
    margin: -16px -16px -20px;
    padding: 12px 16px 20px;
  }

  .portrait-grid {
    grid-template-columns: 1fr;
  }

  .portrait-field {
    grid-column: auto;
  }
}
</style>
