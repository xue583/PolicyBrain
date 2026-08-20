<script setup lang="ts">
defineOptions({ name: 'ExportEmptyState' })

defineProps<{
  title: string
  description: string
  note?: string
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none">
        <rect
          x="28"
          y="22"
          width="52"
          height="68"
          rx="6"
          fill="#E6F4FF"
          stroke="#91CAFF"
          stroke-width="2"
        />
        <path
          d="M40 40h28M40 52h20M40 64h24"
          stroke="#69B1FF"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="78" cy="78" r="18" fill="var(--pb-primary, #1677FF)" />
        <circle cx="78" cy="78" r="8" stroke="#fff" stroke-width="3" />
        <path
          d="M84 84l10 10"
          stroke="#fff"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <p v-if="note" class="empty-note">{{ note }}</p>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  text-align: center;
  color: #8c8c8c;

  h3 {
    margin: 8px 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #434343;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.empty-icon {
  width: 120px;
  height: 120px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty-note {
  margin-top: 8px !important;
  color: #bfbfbf;
}
</style>
