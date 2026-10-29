<script setup lang="ts">
defineOptions({ name: 'RenewMembershipModal' })

const open = defineModel<boolean>('open', { default: false })

const close = () => {
  open.value = false
}
</script>

<template>
  <a-modal
    :open="open"
    :width="480"
    :footer="null"
    wrap-class-name="renew-membership-modal"
    @cancel="close"
  >
    <template #title>
      <span class="modal-title">会员续费</span>
    </template>
  </a-modal>
</template>

<style scoped lang="scss">
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-text);
}
</style>
