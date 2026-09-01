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
  <nav class="breadcrumb">
    <button type="button" class="back-btn" @click="emit('back')">
      <LeftOutlined />
    </button>
    <div class="breadcrumb-trail">
      <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
        <span v-if="index > 0" class="sep">&gt;</span>
        <a v-if="item.onClick" @click="item.onClick">{{ item.label }}</a>
        <span v-else class="current">{{ item.label }}</span>
      </template>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.back-btn {
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
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: color 0.2s;

  &:hover {
    color: var(--pb-primary);
  }
}

.breadcrumb-trail {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
  min-width: 0;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  a {
    color: var(--pb-primary);
    cursor: pointer;

    &:hover {
      color: #4096ff;
    }
  }

  .sep {
    color: #bfbfbf;
  }

  .current {
    color: #595959;
  }
}
</style>
