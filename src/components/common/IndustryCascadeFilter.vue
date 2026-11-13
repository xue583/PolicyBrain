<script setup lang="ts">
import { ref } from 'vue'
import { RightOutlined } from '@ant-design/icons-vue'
import type { IndustryNode } from '@/api/meta'

defineOptions({ name: 'IndustryCascadeFilter' })

const props = defineProps<{
  options: IndustryNode[]
  modelValue: string[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const openId = ref<string | null>(null)
const hoveredChild = ref(-1)

const checked = (id: string) => props.modelValue.includes(id)

const toggle = (id: string) => {
  const next = checked(id)
    ? props.modelValue.filter((item) => item !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
}

const selectedDescendants = (node: IndustryNode) => {
  const selected: IndustryNode[] = []
  const walk = (items: IndustryNode[]) => {
    for (const item of items) {
      if (checked(item.id)) selected.push(item)
      if (item.children.length) walk(item.children)
    }
  }
  walk(node.children)
  return selected
}

const onOpenChange = (id: string, open: boolean) => {
  if (open) {
    openId.value = id
    hoveredChild.value = -1
    return
  }
  if (openId.value === id) {
    openId.value = null
    hoveredChild.value = -1
  }
}

const pinOpen = (id: string) => {
  openId.value = id
}

const childColumn = (node: IndustryNode) =>
  node.children[hoveredChild.value]?.children ?? []

const getPopupContainer = () => document.body
</script>

<template>
  <template v-for="node in options" :key="node.id">
    <a-dropdown
      v-if="node.children.length"
      :open="openId === node.id"
      :trigger="['hover', 'click']"
      placement="bottomLeft"
      :get-popup-container="getPopupContainer"
      @open-change="onOpenChange(node.id, $event)"
    >
      <span class="industry-trigger">
        <a-checkbox
          :checked="checked(node.id)"
          @click.stop="pinOpen(node.id)"
          @change="toggle(node.id)"
        >
          {{ node.name }}
        </a-checkbox>
      </span>
      <template #overlay>
        <div class="industry-cascader" @click.stop>
          <div class="cascader-col">
            <div
              v-for="(child, index) in node.children"
              :key="child.id"
              class="cascader-item"
              :class="{ 'is-hover': hoveredChild === index }"
              @mouseenter="hoveredChild = index"
            >
              <a-checkbox
                :checked="checked(child.id)"
                @click.stop
                @change="toggle(child.id)"
              >
                {{ child.name }}
              </a-checkbox>
              <RightOutlined
                v-if="child.children.length"
                class="cascader-arrow"
              />
            </div>
          </div>
          <div v-if="childColumn(node).length" class="cascader-col is-sub">
            <div
              v-for="sub in childColumn(node)"
              :key="sub.id"
              class="cascader-item"
            >
              <a-checkbox
                :checked="checked(sub.id)"
                @click.stop
                @change="toggle(sub.id)"
              >
                {{ sub.name }}
              </a-checkbox>
            </div>
          </div>
        </div>
      </template>
    </a-dropdown>
    <a-checkbox v-else :checked="checked(node.id)" @change="toggle(node.id)">
      {{ node.name }}
    </a-checkbox>
    <a-checkbox
      v-for="child in selectedDescendants(node)"
      :key="`${node.id}-${child.id}`"
      :checked="true"
      @change="toggle(child.id)"
    >
      {{ child.name }}
    </a-checkbox>
  </template>
</template>

<style scoped lang="scss">
.industry-trigger {
  display: inline-flex;
  align-items: center;
}

.industry-cascader {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.cascader-col {
  min-width: 168px;
  max-height: 320px;
  padding: 6px 0;
  overflow: auto;

  &.is-sub {
    border-left: 1px solid #f0f0f0;
  }
}

.cascader-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  cursor: pointer;

  &.is-hover,
  &:hover {
    background: #f5f8ff;
  }

  :deep(.ant-checkbox-wrapper) {
    flex: 1;
    margin-inline-end: 0;
    font-size: 14px;
    color: #262626;
  }
}

.cascader-arrow {
  flex-shrink: 0;
  color: #bfbfbf;
  font-size: 12px;
}
</style>
