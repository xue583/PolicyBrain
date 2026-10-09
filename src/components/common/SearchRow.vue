<script setup lang="ts">
import { ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'SearchRow' })

withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: '请输入内容',
})

const emit = defineEmits<{ search: [keyword: string]; reset: [] }>()

const keyword = ref('')

const onSearch = () => {
  emit('search', keyword.value)
}

const onReset = () => {
  keyword.value = ''
  emit('reset')
}

/** 供父级在整体重置时清空输入框 */
defineExpose({
  clearKeyword: () => {
    keyword.value = ''
  },
})
</script>

<!-- display: contents：输入框与按钮直接成为外层 .filter-row 的 flex 子项 -->
<template>
  <div class="search-row">
    <a-input
      v-model:value="keyword"
      class="search-input"
      allow-clear
      :placeholder="placeholder"
      @press-enter="onSearch"
    >
      <template #prefix>
        <SearchOutlined />
      </template>
    </a-input>
    <a-button type="primary" @click="onSearch">查询</a-button>
    <a-button class="search-reset" @click="onReset">重置</a-button>
  </div>
</template>

<style scoped lang="scss">
.search-row {
  display: contents;
}

.search-input {
  width: var(--search-input-width, 320px);
  max-width: 100%;
}
</style>
