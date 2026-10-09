<script setup lang="ts">
defineOptions({ name: 'MemberCrownIcon' })

withDefaults(
  defineProps<{
    /** true 时为单色 currentColor 皇冠（企业套餐子切换使用） */
    mono?: boolean
  }>(),
  { mono: false },
)
</script>

<template>
  <svg class="crown" viewBox="0 0 24 24" aria-hidden="true">
    <template v-if="!mono">
      <path
        fill="#e2b45a"
        d="M3.2 16.6 5.6 8.2l4.2 4.6L12 5.1l2.2 7.7 4.2-4.6 2.4 8.4H3.2z"
      />
      <path fill="#f0d27a" d="M12 5.1 9.8 12.8 5.6 8.2 3.2 16.6h8.8V5.1z" />
      <rect
        x="4.2"
        y="16.4"
        width="15.6"
        height="2.2"
        rx="0.6"
        fill="#d4a24c"
      />
      <rect x="5" y="18.8" width="14" height="2.1" rx="0.5" fill="#c4923e" />
      <circle cx="12" cy="5.1" r="1.15" fill="#f6e7a8" />
      <circle cx="5.6" cy="8.2" r="1.05" fill="#f6e7a8" />
      <circle cx="18.4" cy="8.2" r="1.05" fill="#f6e7a8" />
    </template>
    <path
      v-else
      fill="currentColor"
      d="M3.2 16.6 5.6 8.2l4.2 4.6L12 5.1l2.2 7.7 4.2-4.6 2.4 8.4H3.2z"
    />
  </svg>
</template>
