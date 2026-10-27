<script setup lang="ts">
import type { PolicyFeedItem } from '@/mock/insights'

defineOptions({ name: 'PolicyFeed' })

defineProps<{
  items: PolicyFeedItem[]
}>()
</script>

<template>
  <p v-if="!items.length" class="feed-empty">暂无动态</p>
  <ul v-else class="feed-list">
    <li v-for="item in items" :key="item.id">
      <span
        class="feed-tag"
        :style="{ color: item.color, backgroundColor: `${item.color}1a` }"
      >
        {{ item.category }}
      </span>
      <span class="feed-title">{{ item.title }}</span>
      <time>{{ item.time }}</time>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.feed-empty {
  margin: 24px 0 0;
  color: #98a2b3;
  font-size: 13px;
  text-align: center;
}

.feed-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  margin: 2px 0 0;
  padding: 0;
  overflow: auto;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) 78px;
    align-items: center;
    gap: 8px;
  }

  time {
    color: #98a2b3;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
}

.feed-tag {
  justify-self: start;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.feed-title {
  overflow: hidden;
  color: #344054;
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
