<script setup lang="ts">
import type { Component } from 'vue'
import {
  CustomerServiceOutlined,
  ExperimentOutlined,
  LaptopOutlined,
  MedicineBoxOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue'

defineOptions({ name: 'IndustryBars' })

defineProps<{
  items: { name: string; percent: number; label: string }[]
}>()

const industryIcons: Record<string, Component> = {
  高新技术企业: ExperimentOutlined,
  先进制造业: ToolOutlined,
  新能源: ThunderboltOutlined,
  电子信息: LaptopOutlined,
  生物医药: MedicineBoxOutlined,
  现代农业: ShoppingOutlined,
  现代服务业: CustomerServiceOutlined,
}
</script>

<template>
  <ol class="industry-list">
    <li v-for="item in items" :key="item.name">
      <component
        :is="industryIcons[item.name] ?? ExperimentOutlined"
        class="industry-icon"
      />
      <span class="industry-name">{{ item.name }}</span>
      <span class="industry-track">
        <span class="industry-fill" :style="{ width: `${item.percent}%` }" />
      </span>
      <span class="industry-value">{{ item.label }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.industry-list {
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
    grid-template-columns: 16px 84px minmax(0, 1fr) 64px;
    align-items: center;
    gap: 8px;
    min-height: 0;
  }
}

.industry-icon {
  color: #1677ff;
  font-size: 14px;
}

.industry-name {
  color: #344054;
  font-size: 13px;
}

.industry-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(22, 119, 255, 0.08);
}

.industry-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #9fd4ff 0%, #1677ff 100%);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.industry-value {
  color: #1d2939;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
