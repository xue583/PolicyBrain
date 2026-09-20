<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { triggerNeedLogin } from '@/utils/auth'
import promoBg from '@/assets/home/vip-promo-bg.png'

defineOptions({ name: 'VipPromoModal' })

const open = defineModel<boolean>('open', { default: false })

const close = () => {
  open.value = false
}

const explore = () => {
  close()
  triggerNeedLogin()
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

watch(
  open,
  (visible) => {
    if (visible) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="vip-promo-fade">
      <div v-if="open" class="vip-promo-overlay">
        <div
          class="vip-promo-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-promo-title"
        >
          <button
            type="button"
            class="vip-promo-close"
            aria-label="关闭"
            @click="close"
          >
            ×
          </button>

          <div class="vip-promo-card">
            <img class="vip-promo-bg" :src="promoBg" alt="" />
            <span class="vip-promo-tag tag-a">高阶政策检索</span>
            <span class="vip-promo-tag tag-b">合规智能研判</span>

            <div class="vip-promo-body">
              <h2 id="vip-promo-title" class="vip-promo-title">
                解锁会员权益
                <span>尊享智能政策服务</span>
              </h2>
              <p class="vip-promo-desc">
                <span class="vip-promo-desc-pill">欢迎入驻政策大脑！</span>
                <span class="vip-promo-desc-text"
                  >会员专属开放大数据智能政策服务体系</span
                >
              </p>
            </div>
          </div>

          <button type="button" class="vip-promo-cta" @click="explore">
            立即探索功能
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.vip-promo-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 96px 40px;
  background: rgba(33, 33, 33, 0.4);
}

.vip-promo-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(512px, 78vw);
}

.vip-promo-close {
  position: absolute;
  top: -36px;
  right: -4px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #6b7280;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(15, 40, 90, 0.25);

  &:hover,
  &:focus-visible {
    color: #374151;
    opacity: 0.92;
    outline: none;
  }
}

.vip-promo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 904 / 1066;
  overflow: visible;
  background: transparent;
}

.vip-promo-bg {
  position: absolute;
  width: 136.28%;
  height: 114.17%;
  left: -9.51%;
  top: -14.07%;
  max-width: none;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 22px 48px rgba(8, 30, 80, 0.32));
}

.vip-promo-tag {
  position: absolute;
  z-index: 1;
  color: #5b6b86;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-a {
  top: 20.5%;
  left: 0%;
}

.tag-b {
  top: 52.5%;
  left: 26%;
}

.vip-promo-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 36%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 36px 28px;
  text-align: center;
}

.vip-promo-title {
  margin: 0;
  color: #16357c;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: 2px;

  span {
    display: block;
  }
}

.vip-promo-desc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 0;
  max-width: 100%;
  line-height: 1.5;
}

.vip-promo-desc-pill {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fffdf3 0%, #ffedbd 100%);
  border: 1px solid #ffd98e;
  box-shadow: 0 0 0 3px rgba(255, 216, 138, 0.22);
  color: #e0562e;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.vip-promo-desc-text {
  color: #8a97ad;
  font-size: 13px;
  white-space: nowrap;
}

.vip-promo-cta {
  position: relative;
  z-index: 2;
  margin-top: 22px;
  min-width: 184px;
  height: 46px;
  padding: 0 32px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #4d97ff 0%, #1677ff 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  font-family: inherit;
  box-shadow:
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.55),
    0 10px 22px rgba(22, 119, 255, 0.42);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;

  &:hover {
    filter: brightness(1.06);
    box-shadow:
      inset 0 0 0 1.5px rgba(255, 255, 255, 0.55),
      0 12px 26px rgba(22, 119, 255, 0.5);
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }
}

@media (max-width: 576px) {
  .vip-promo-overlay {
    padding: 56px 48px 24px 32px;
  }

  .vip-promo-close {
    top: -38px;
    right: -2px;
    width: 24px;
    height: 24px;
    font-size: 17px;
  }

  .vip-promo-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .vip-promo-desc {
    gap: 6px;
    margin-top: 10px;
  }

  .vip-promo-desc-pill {
    height: 22px;
    padding: 0 9px;
    font-size: 11px;
  }

  .vip-promo-desc-text {
    font-size: 11px;
  }

  .vip-promo-tag {
    height: 26px;
    padding: 0 12px;
    font-size: 11px;
  }

  .vip-promo-cta {
    margin-top: 16px;
    min-width: 156px;
    height: 40px;
    font-size: 14px;
  }

  .vip-promo-body {
    padding: 8px 20px 20px;
  }
}

.vip-promo-fade-enter-active,
.vip-promo-fade-leave-active {
  transition: opacity 0.22s ease;

  .vip-promo-dialog {
    transition:
      transform 0.22s ease,
      opacity 0.22s ease;
  }
}

.vip-promo-fade-enter-from,
.vip-promo-fade-leave-to {
  opacity: 0;

  .vip-promo-dialog {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vip-promo-fade-enter-active,
  .vip-promo-fade-leave-active,
  .vip-promo-cta {
    transition: none;
  }
}
</style>
