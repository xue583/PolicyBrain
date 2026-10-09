<script setup lang="ts">
import { SearchOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'WbSearchBar' })

const keyword = defineModel<string>({ required: true })

defineEmits<{ search: [] }>()
</script>

<template>
  <div class="wb-search">
    <a-input
      v-model:value="keyword"
      class="search-input"
      placeholder="请输入企业或产品或服务"
    >
      <template #prefix>
        <SearchOutlined class="search-icon" />
      </template>
    </a-input>
    <a-config-provider :auto-insert-space-in-button="false">
      <a-button type="primary" class="search-btn" @click="$emit('search')">
        <slot>搜索</slot>
      </a-button>
    </a-config-provider>
  </div>
</template>

<style scoped lang="scss">
.wb-search {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 264px;
  height: 36px;
  border-color: #dcdfe6;
  border-radius: 6px;

  &:hover {
    border-color: #dcdfe6;
  }

  &.ant-input-affix-wrapper-focused,
  &:focus-within {
    border-color: var(--pb-primary);
    box-shadow: none;
  }

  .search-icon {
    color: #bfbfbf;
    font-size: 14px;
  }

  :deep(input) {
    height: 100%;
    font-size: 13px;
  }
}

.search-btn.ant-btn {
  height: 36px;
  padding: 0 18px;
  font-size: 14px;
  border-radius: 6px;

  &:not(:disabled):hover {
    opacity: 0.85;
  }
}
</style>
