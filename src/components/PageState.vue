<script setup lang="ts">
defineOptions({ name: 'PageState' })

withDefaults(
  defineProps<{
    loading?: boolean
    error?: string
    empty?: string
  }>(),
  {
    loading: false,
    error: '',
    empty: '',
  },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="loading" class="page-state-loading">
    <a-spin />
  </div>
  <a-result v-else-if="error" status="error" :title="error">
    <template #extra>
      <a-button type="primary" @click="$emit('retry')">重试</a-button>
    </template>
  </a-result>
  <a-empty v-else-if="empty" :description="empty" />
  <slot v-else />
</template>

<style scoped>
.page-state-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
</style>
