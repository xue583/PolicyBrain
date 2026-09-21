<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { PolicyUserType } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import EnterpriseMemberBoard from './EnterpriseMemberBoard.vue'
import PersonalMemberBoard from './PersonalMemberBoard.vue'
import bgImg from '@/assets/membership/bg.png'
import heroPush from '@/assets/membership/hero-push.png'
import heroReport from '@/assets/membership/hero-report.png'
import heroRecommend from '@/assets/membership/hero-recommend.png'
import heroLibrary from '@/assets/membership/hero-library.png'

defineOptions({ name: 'MembershipPage' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const isEnterpriseView = computed(
  () => Number(user.value?.identity) === PolicyUserType.EnterpriseService,
)

const heroFeatures = [
  { icon: heroPush, label: '政策实时推送' },
  { icon: heroReport, label: '月度数据报告' },
  { icon: heroRecommend, label: '智能匹配推荐' },
  { icon: heroLibrary, label: '基础政策库访问' },
]
</script>

<template>
  <div class="membership-page">
    <div class="page-bg" :style="{ backgroundImage: `url(${bgImg})` }" />

    <div class="page-inner">
      <section class="hero">
        <h1 class="hero-title">尊享<span>会员特权</span>，畅享无限可能!</h1>
        <p class="hero-sub">升级会员，体验更多独家优惠与专属服务</p>
        <ul class="hero-features">
          <li v-for="item in heroFeatures" :key="item.label">
            <img :src="item.icon" alt="" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <PersonalMemberBoard v-if="isEnterpriseView" />
      <EnterpriseMemberBoard v-else />
    </div>
  </div>
</template>

<style scoped lang="scss">
.membership-page {
  min-height: calc(100vh - 64px);
  padding: 88px 0 56px;
  overflow-x: hidden;
  background: #03183f;
  color: #1d2b3a;
}

.page-bg {
  position: absolute;
  left: 0;
  top: -20px;
  width: 100%;
  height: min(720px, 60vh);
  background-repeat: no-repeat;
  background-position: right top;
  background-size: cover;
  pointer-events: none;
  z-index: 0;
}

.page-inner {
  position: relative;
  z-index: 1;
  width: 75%;
  max-width: calc(100% - 32px);
  margin: 0 auto;
}

.hero {
  padding: 28px 0 81px;
  color: #fff;
}

.hero-title {
  margin: 20px 0 14px;
  font-size: 48px;
  font-weight: 700;
  letter-spacing: 0.2em;
  line-height: 1.25;

  span {
    color: #f2c36b;
    font-size: 60px;
  }
}

.hero-sub {
  margin: 25px 0 50px;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.82);
}

.hero-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  max-width: 460px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
    color: rgba(255, 255, 255, 0.92);
  }

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
}

@include below-lg {
  .page-inner {
    width: calc(100% - 32px);
  }

  .hero-title {
    font-size: 28px;
  }
}
</style>
