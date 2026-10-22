<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/request'

defineOptions({ name: 'NicknameModal' })

const open = defineModel<boolean>('open', { default: false })

const auth = useAuthStore()
const draft = ref('')
const submitting = ref(false)
const inputRef = ref<{ focus: () => void } | null>(null)

const close = () => {
  open.value = false
}

watch(
  open,
  async (visible) => {
    if (!visible) return
    draft.value = auth.user?.nickname || ''
    submitting.value = false
    await nextTick()
    inputRef.value?.focus?.()
  },
  { immediate: true },
)

const submit = async () => {
  if (submitting.value) return
  const nickname = draft.value.trim()
  if (!nickname) {
    message.warning('请输入用户名')
    return
  }
  if (nickname === (auth.user?.nickname || '').trim()) {
    close()
    return
  }
  submitting.value = true
  try {
    await auth.updateProfile({ nickname })
    message.success('用户名已更新')
    close()
  } catch (err) {
    message.error(
      err instanceof ApiError ? err.message : '用户名更新失败，请稍后重试',
    )
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :width="440"
    :footer="null"
    wrap-class-name="nickname-modal"
    @cancel="close"
  >
    <template #title>
      <span class="modal-title">修改用户名</span>
    </template>
    <template #closeIcon>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <path
          d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
    </template>

    <label class="field">
      <span class="field-label">用户名</span>
      <a-input
        ref="inputRef"
        v-model:value="draft"
        class="name-input"
        aria-label="用户名"
        placeholder="请输入用户名"
        :disabled="submitting"
        @press-enter="submit"
      />
    </label>

    <div class="action-row">
      <a-button class="cancel-btn" :disabled="submitting" @click="close">
        取消
      </a-button>
      <a-button
        type="primary"
        class="confirm-btn"
        :loading="submitting"
        @click="submit"
      >
        更新
      </a-button>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
}

.field-label {
  font-size: 14px;
  color: var(--pb-sub);
}

.name-input {
  height: 40px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 28px 0 4px;
}

.cancel-btn,
.confirm-btn {
  min-width: 88px;
  height: 36px;
  border-radius: 4px;
}
</style>
