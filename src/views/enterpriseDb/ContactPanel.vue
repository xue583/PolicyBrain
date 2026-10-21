<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  EnvironmentFilled,
  MailFilled,
  UserOutlined,
} from '@ant-design/icons-vue'
import type { EnterpriseContact } from '../../mock/enterpriseDb'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import emptyNews from '@/assets/home/empty-news.png'
import vipLockBg from '../../assets/enterpriseDb/vip-upgrade@2x.png'
import phoneIcon from '../../assets/enterpriseDb/phone.png'
import linkIcon from '../../assets/enterpriseDb/container.png'

defineOptions({ name: 'EnterpriseContactPanel' })

const props = defineProps<{
  contacts: EnterpriseContact[]
  email: string
  website: string
  address: string
  /** 企业管理等自有数据场景直接展示，不走会员解锁 */
  unlocked?: boolean
}>()

const { isLoggedIn } = storeToRefs(useAuthStore())
const locked = computed(() => !props.unlocked && !isLoggedIn.value)

const onUnlock = () => {
  if (!isLoggedIn.value) triggerNeedLogin()
}
</script>

<template>
  <section class="contact-panel">
    <SectionTitle title="联系方式" />

    <div v-if="locked" class="contact-lock">
      <button type="button" class="vip-lock" @click="onUnlock">
        <img :src="vipLockBg" alt="升级VIP，即可解锁全部会员" />
      </button>
    </div>

    <EmptyState
      v-else-if="!contacts.length"
      class="tab-empty"
      :image="emptyNews"
      text="暂无联系方式"
      :image-width="202"
    />

    <div v-else class="contact-body">
      <div class="person-grid">
        <article v-for="item in contacts" :key="item.id" class="person-card">
          <span class="person-avatar">
            <UserOutlined />
          </span>
          <div class="person-meta">
            <p class="person-name">
              {{ item.name }}
              <span>{{ item.title }}</span>
            </p>
            <p class="person-phone">
              <img :src="phoneIcon" alt="" />
              {{ item.phone }}
            </p>
          </div>
        </article>
      </div>

      <ul class="meta-list">
        <li>
          <span class="meta-icon mail">
            <MailFilled />
          </span>
          <div>
            <p class="meta-label">电子邮箱</p>
            <p class="meta-value">{{ email || '-' }}</p>
          </div>
        </li>
        <li>
          <img :src="linkIcon" alt="" class="meta-icon-img" />
          <div>
            <p class="meta-label">官方网站</p>
            <p class="meta-value">{{ website || '-' }}</p>
          </div>
        </li>
        <li>
          <span class="meta-icon pin">
            <EnvironmentFilled />
          </span>
          <div>
            <p class="meta-label">注册地址</p>
            <p class="meta-value">{{ address || '-' }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.contact-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 48px 16px;
}

.vip-lock {
  display: block;
  padding: 0;
  border: none;
  background: transparent;
  line-height: 0;
  cursor: pointer;

  img {
    display: block;
    width: 346px;
    max-width: 100%;
    height: auto;
  }
}

.tab-empty {
  --empty-gap: 12px;
  --empty-padding: 24px 0 16px;
  --empty-text-size: 16px;
  --empty-text-weight: 400;
  --empty-text-color: #8c8c8c;
}

.contact-body {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 40px 48px;
  align-items: center;
}

.person-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.person-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 88px;
  padding: 16px 18px;
  border: 1px solid #c5dcff;
  border-radius: 8px;
  background: #f3f8ff;
}

.person-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--pb-primary);
  color: #fff;
  font-size: 22px;
}

.person-meta {
  min-width: 0;
}

.person-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  color: #1f3b66;

  span {
    margin-left: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #8c8c8c;
  }
}

.person-phone {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
  color: #1f3b66;

  img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.meta-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.meta-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--pb-primary);
  color: #fff;
  font-size: 16px;
}

.meta-icon.pin {
  border-radius: 8px;
}

.meta-icon-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: contain;
}

.meta-label {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  color: #262626;
}

.meta-value {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #595959;
  word-break: break-all;
}

@include below-lg {
  .contact-body,
  .person-grid {
    grid-template-columns: 1fr;
  }
}
</style>
