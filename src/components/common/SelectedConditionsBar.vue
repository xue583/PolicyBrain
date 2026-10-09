<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'SelectedConditionsBar' })

defineProps<{
  conditions: { key: string; label: string }[]
}>()

const emit = defineEmits<{ remove: [key: string]; clear: [] }>()
</script>

<template>
  <div class="selected-section">
    <div class="filter-row selected-row">
      <span class="filter-label">已选条件：</span>
      <div class="selected-tags">
        <template v-if="conditions.length">
          <a-tag
            v-for="item in conditions"
            :key="item.key"
            closable
            class="condition-tag"
            @close="emit('remove', item.key)"
          >
            {{ item.label }}
          </a-tag>
        </template>
        <span v-else class="empty-selected">暂无筛选条件</span>
      </div>
      <a v-if="conditions.length" class="clear-link" @click="emit('clear')">
        <DeleteOutlined />
        删除
      </a>
    </div>
  </div>
</template>
