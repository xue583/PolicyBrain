<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { applyStatuses } from '@/mock/insights'

defineOptions({ name: 'ApplyStatus' })

const ringStyle = (item: (typeof applyStatuses)[number]): CSSProperties => ({
  background: `conic-gradient(${item.color} ${item.percent}%, #e7f0fa 0)`,
})
</script>

<template>
  <ul class="status-list">
    <li v-for="item in applyStatuses" :key="item.key">
      <div class="ring" :style="ringStyle(item)">
        <div class="ring-core">
          <strong>{{ item.percent.toFixed(1) }}%</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <p>{{ item.count.toLocaleString('zh-CN') }} 项</p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.status-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  flex: 1;
  gap: 8px;
  align-content: center;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 12px;
    line-height: 16px;
  }
}

.ring {
  display: grid;
  width: min(68px, 100%);
  aspect-ratio: 1;
  height: auto;
  padding: 5px;
  place-items: center;
  border-radius: 50%;
}

.ring-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;

  strong {
    color: #1d2939;
    font-size: 14px;
    font-weight: 700;
    line-height: 18px;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: #98a2b3;
    font-size: 11px;
    line-height: 16px;
  }
}
</style>
