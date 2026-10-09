<script setup lang="ts">
import deleteIcon from '@/assets/workbench/wb-delete.png'
import editIcon from '@/assets/workbench/wb-edit.png'
import pinIcon from '@/assets/workbench/wb-pin.png'

defineOptions({ name: 'WbTaskMenu' })

const emit = defineEmits<{ action: [action: string] }>()

const onMenuClick = ({ key }: { key: string | number }) => {
  emit('action', String(key))
}
</script>

<template>
  <a-dropdown :trigger="['click']" placement="bottomRight">
    <slot />
    <template #overlay>
      <a-menu class="task-menu" @click="onMenuClick">
        <a-menu-item key="pin">
          <img :src="pinIcon" alt="" class="menu-icon" />
          <span>置顶任务</span>
        </a-menu-item>
        <a-menu-item key="rename">
          <img :src="editIcon" alt="" class="menu-icon" />
          <span>重命名</span>
        </a-menu-item>
        <a-menu-item key="delete" class="is-danger">
          <img :src="deleteIcon" alt="" class="menu-icon" />
          <span>删除任务</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<style scoped lang="scss">
.task-menu {
  .menu-icon {
    width: 15px;
    height: 15px;
    margin-right: 8px;
    vertical-align: -2px;
  }

  &.ant-menu .ant-menu-item.is-danger {
    color: #ff4d4f;
  }
}
</style>
