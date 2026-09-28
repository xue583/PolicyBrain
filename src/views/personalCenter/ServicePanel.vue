<script setup lang="ts">
import { CustomerServiceOutlined } from '@ant-design/icons-vue'
import serviceImg from '@/assets/personalCenter/service-agent.png'
import qrFrameImg from '@/assets/personalCenter/qr-frame.png'
import qrCodeImg from '@/assets/personalCenter/qr-service.png'

defineOptions({ name: 'ServicePanel' })

const SERVICE_PHONE = '18800091116'
</script>

<template>
  <div class="service-panel">
    <div class="service-header">
      <div class="header-text">
        <h2>HI, 我是您的<span>政策小助手</span></h2>
        <p>遇到任何问题都可以找我咨询哦～</p>
      </div>
      <img class="header-agent" :src="serviceImg" alt="政策小助手" />
    </div>

    <div class="service-card">
      <div class="qr-wrap">
        <img class="qr-frame" :src="qrFrameImg" alt="" />
        <img class="qr-code" :src="qrCodeImg" alt="客服微信二维码" />
      </div>
      <button type="button" class="qr-btn">扫码添加客服微信</button>
      <p class="service-phone">
        <CustomerServiceOutlined />
        联系客服电话：{{ SERVICE_PHONE }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.service-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 0 8px;
}

.header-text {
  padding-top: 24px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: var(--pb-title);

    span {
      color: var(--pb-primary);
    }
  }

  p {
    margin: 14px 0 0;
    font-size: 14px;
    color: var(--pb-sub);
  }
}

.header-agent {
  width: 220px;
  height: auto;
  flex-shrink: 0;
  margin-right: 8px;
  user-select: none;
}

.service-card {
  position: relative;
  padding: 52px 0 44px;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  background: linear-gradient(
    180deg,
    rgba(219, 233, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.4) 100%
  );

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background: linear-gradient(
      180deg,
      rgba(198, 220, 255, 0.5) 0%,
      rgba(219, 233, 255, 0.15) 100%
    );
    clip-path: polygon(0 0, 26% 0, 10% 100%, 0 100%);
  }

  &::after {
    background: linear-gradient(
      180deg,
      rgba(219, 233, 255, 0.1) 0%,
      rgba(198, 220, 255, 0.45) 100%
    );
    clip-path: polygon(100% 34%, 100% 100%, 66% 100%, 84% 34%);
  }
}

.qr-wrap {
  position: relative;
  z-index: 1;
  width: 210px;
  margin: 0 auto;

  .qr-frame {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
  }

  .qr-code {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150px;
    height: 150px;
    transform: translate(-50%, -50%);
    object-fit: contain;
  }
}

.qr-btn {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  height: 32px;
  padding: 0 22px;
  border: none;
  border-radius: 4px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--pb-primary-hover);
  }
}

.service-phone {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 16px 0 0;
  font-size: 14px;
  color: var(--pb-primary);
}
</style>
