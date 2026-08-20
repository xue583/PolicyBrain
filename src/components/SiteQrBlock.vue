<script setup lang="ts">
import qrMini from '@/assets/home/qr-miniprogram.png'
import qrWechat from '@/assets/home/qr-wechat.png'

defineOptions({ name: 'SiteQrBlock' })

withDefaults(
  defineProps<{
    variant?: 'footer' | 'sidebar'
  }>(),
  { variant: 'footer' },
)
</script>

<template>
  <div class="qr-block" :class="`is-${variant}`">
    <div class="qr-item">
      <img
        :src="qrWechat"
        alt="关注微信公众号"
        loading="lazy"
        decoding="async"
      />
      <span v-if="variant === 'footer'">关注微信公众号</span>
      <a-button v-else type="primary" class="qr-btn">政策宝公众号</a-button>
    </div>
    <div class="qr-item">
      <img :src="qrMini" alt="政策大脑小程序" loading="lazy" decoding="async" />
      <span v-if="variant === 'footer'">政策大脑小程序</span>
      <a-button v-else type="primary" class="qr-btn">关注微信小程序</a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qr-block {
  display: flex;
  gap: 16px;
}

.is-footer {
  justify-content: flex-end;

  .qr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    img {
      width: 88px;
      height: 88px;
      object-fit: contain;
      border-radius: 4px;
      background: #fff;
    }
  }
}

.is-sidebar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;

  .qr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    img {
      width: 92px;
      height: 92px;
      object-fit: contain;
      border-radius: 4px;
      background: #fff;
    }
  }

  .qr-btn {
    height: 26px;
    padding: 0 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
}

@media (max-width: 992px) {
  .is-footer {
    justify-content: flex-start;
  }
}
</style>
