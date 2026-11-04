<script setup lang="ts">
import { LeftOutlined } from '@ant-design/icons-vue'

export type BreadcrumbItem = {
  label: string
  onClick?: () => void
}

defineOptions({ name: 'BreadcrumbNav' })

defineProps<{
  items: BreadcrumbItem[]
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <a-config-provider :wave="{ disabled: true }">
    <nav class="breadcrumb">
      <a-button
        type="text"
        class="back-btn"
        aria-label="返回"
        @click="emit('back')"
      >
        <LeftOutlined />
      </a-button>
      <a-breadcrumb class="breadcrumb-trail" separator=">">
        <a-breadcrumb-item
          v-for="(item, index) in items"
          :key="`${item.label}-${index}`"
        >
          <a v-if="item.onClick" @click="item.onClick">{{ item.label }}</a>
          <span v-else class="current">{{ item.label }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </nav>
  </a-config-provider>
</template>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.back-btn.ant-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #595959;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &:hover,
  &:focus {
    color: var(--pb-primary);
    background: #fff;
    border-color: transparent;
  }
}

.breadcrumb-trail.ant-breadcrumb {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  min-width: 0;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  :deep(ol) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
  }

  :deep(.ant-breadcrumb-separator) {
    margin-inline: 8px;
    color: #bfbfbf;
  }

  :deep(a) {
    color: var(--pb-primary);

    &:hover {
      color: #4096ff;
      background: transparent;
    }
  }

  :deep(.current) {
    color: #595959;
  }
}
</style>
