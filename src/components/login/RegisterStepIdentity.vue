<script setup lang="ts">
import type { PolicyUserType } from '@/api/auth'

defineOptions({ name: 'RegisterStepIdentity' })

defineProps<{
  identity: PolicyUserType | ''
  identityError: string
  roles: {
    key: PolicyUserType
    title: string
    desc: string
    icon: string
  }[]
}>()

const emit = defineEmits<{
  'update:identity': [value: PolicyUserType]
  prev: []
  next: []
}>()
</script>

<template>
  <div class="identity-head">
    <h3>您主要如何使用平台？</h3>
    <p>身份必选，会员价格和核心权益保持一致</p>
  </div>

  <p v-if="identityError" class="login-error">{{ identityError }}</p>

  <div class="identity-list">
    <button
      v-for="role in roles"
      :key="role.key"
      type="button"
      class="identity-card"
      :class="{ selected: identity === role.key }"
      @click="emit('update:identity', role.key)"
    >
      <img :src="role.icon" :alt="role.title" class="identity-icon" />
      <div class="identity-meta">
        <strong>{{ role.title }}</strong>
        <span>{{ role.desc }}</span>
      </div>
      <span class="identity-check" />
    </button>
  </div>

  <div class="reg-actions">
    <button type="button" class="btn-ghost" @click="emit('prev')">
      上一步：账户验证
    </button>
    <button type="button" class="btn-primary" @click="emit('next')">
      下一步：身份认证
    </button>
  </div>
</template>
