<script setup lang="ts">
import { computed, ref } from 'vue'
import { HeartFilled } from '@ant-design/icons-vue'
import {
  enterpriseStatusText,
  type EnterpriseDetail,
} from '../../mock/enterpriseDb'
import followHeartIcon from '../../assets/icon-follow-heart.png'
import vipMatchImg from '../../assets/enterpriseDb/container-229.png'
import phoneIcon from '../../assets/enterpriseDb/phone.png'
import linkIcon from '../../assets/enterpriseDb/container.png'
import expandIcon from '../../assets/enterpriseDb/container-alt.png'

defineOptions({ name: 'EnterpriseProfileCard' })

const props = defineProps<{
  enterprise: EnterpriseDetail
  followed: boolean
}>()

const emit = defineEmits<{
  follow: []
  match: []
}>()

const scopeExpanded = ref(false)

const regionLine = computed(
  () =>
    `${props.enterprise.province}·${props.enterprise.city}·${props.enterprise.district}`,
)

const openWebsite = () => {
  const raw = props.enterprise.website
  if (!raw) return
  const first = raw.split(',')[0]?.trim()
  if (!first) return
  const url = /^https?:\/\//i.test(first) ? first : `https://${first}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <a-card class="detail-card header-card" :bordered="false">
    <div class="profile-top">
      <div class="ent-logo">{{ enterprise.shortName }}</div>
      <div class="profile-main">
        <h1 class="ent-title">{{ enterprise.name }}</h1>
        <div class="honor-tags">
          <span
            v-for="tag in enterprise.honorTags"
            :key="tag.text"
            class="honor-tag"
            :class="tag.tone"
          >
            {{ tag.text }}
          </span>
        </div>
        <p class="sub-line">
          {{ regionLine }}
          <span class="dot">|</span>
          {{ enterprise.businessIndustry }}
          <span class="dot">|</span>
          {{ enterprise.staffCount }}人
        </p>
      </div>

      <div class="profile-aside">
        <div class="action-row">
          <a-button
            class="follow-btn"
            :class="{ followed }"
            type="primary"
            ghost
            @click="emit('follow')"
          >
            <template #icon>
              <HeartFilled v-if="followed" />
              <img v-else :src="followHeartIcon" alt="" class="follow-icon" />
            </template>
            {{ followed ? '已关注' : '关注企业' }}
          </a-button>
          <button type="button" class="vip-match-btn" @click="emit('match')">
            <img :src="vipMatchImg" alt="VIP 政策匹配" />
          </button>
        </div>

        <div class="stats-box">
          <div class="stat">
            <span class="stat-label">已获政策：</span>
            <em>{{ enterprise.policyCount }}</em>
            <span class="stat-unit">项</span>
          </div>
          <div class="stat">
            <span class="stat-label">公示金额：</span>
            <em>{{ enterprise.publicityAmount }}</em>
            <span class="stat-unit">万元</span>
          </div>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <p class="info-item">
        <span class="info-label">法定代表人：</span>
        <span class="info-value">{{ enterprise.legalRep }}</span>
      </p>
      <p class="info-item">
        <span class="info-label">统一社会信用代码：</span>
        <span class="info-value">{{ enterprise.creditCode }}</span>
      </p>
      <p class="info-item">
        <span class="info-label">成立日期：</span>
        <span class="info-value">{{ enterprise.foundedDate }}</span>
      </p>
      <p class="info-item">
        <span class="info-label">注册资本：</span>
        <span class="info-value">{{ enterprise.registeredCapital }}万元</span>
      </p>
      <p class="info-item">
        <span class="info-label">企业类型：</span>
        <span class="info-value">{{ enterprise.enterpriseType }}</span>
      </p>
      <p class="info-item">
        <span class="info-label">人员规模：</span>
        <span class="info-value">{{ enterprise.staffScale }}</span>
      </p>
      <p class="info-item">
        <span class="info-label">经营状态：</span>
        <span class="info-value status" :class="enterprise.status">
          {{ enterpriseStatusText[enterprise.status] }}
        </span>
      </p>
      <p class="info-item">
        <span class="info-label">电话：</span>
        <span class="info-value phone-value">
          <img :src="phoneIcon" alt="" class="field-icon" />
          {{ enterprise.phone }}
        </span>
      </p>
      <p class="info-item">
        <span class="info-label">网站：</span>
        <span class="info-value">
          <a v-if="enterprise.website" class="site-link" @click="openWebsite">
            <img :src="linkIcon" alt="" class="field-icon link-icon" />
            {{ enterprise.website }}
          </a>
          <span v-else>—</span>
        </span>
      </p>
      <p class="info-item scope-item">
        <span class="info-label">经营范围：</span>
        <span class="info-value scope-value">
          <span :class="{ clamped: !scopeExpanded }">
            {{ enterprise.businessScope }}
          </span>
          <a class="expand-link" @click="scopeExpanded = !scopeExpanded">
            {{ scopeExpanded ? '收起' : '展开' }}
            <img :src="expandIcon" alt="" :class="{ rotated: scopeExpanded }" />
          </a>
        </span>
      </p>
    </div>
  </a-card>
</template>

<style scoped lang="scss">
.detail-card {
  border-radius: 16px;
  box-shadow: var(--pb-shadow-card);

  :deep(.ant-card-body) {
    padding: 28px 32px;
  }

  &.header-card {
    margin-bottom: 16px;
  }
}

.profile-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ent-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: var(--pb-primary);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.ent-title {
  margin: 0 0 14px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
  color: #1f1f1f;
}

.honor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.honor-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;

  &.blue {
    color: var(--pb-primary);
    background: #e6f4ff;
    border: 1px solid #91caff;
  }

  &.orange {
    color: #d46b08;
    background: #fff7e6;
    border: 1px solid #ffd591;
  }
}

.sub-line {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
  line-height: 1.6;

  .dot {
    margin: 0 8px;
    color: #d9d9d9;
  }
}

.profile-aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.stats-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 36px;
  width: 438px;
  height: 56px;
  padding: 0 28px 0 48px;
  background: url('../../assets/enterpriseDb/container-599.png') no-repeat
    center / 100% 100%;
}

.stat {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
}

.stat-label,
.stat-unit {
  color: #262626;
  font-size: 14px;
  line-height: 1;
}

.stat em {
  margin: 0 2px;
  font-style: normal;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--pb-primary);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.follow-btn {
  height: 40px;
  padding-inline: 18px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .follow-icon {
    width: 16px;
    height: 16px;
    display: block;
  }
}

.vip-match-btn {
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    height: 40px;
    width: auto;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px 24px;
  margin-top: 22px;
  padding: 22px 26px;
  border-top: 1px solid #f0f0f0;
  background: #f4f7fc;
}

.info-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.info-label {
  flex-shrink: 0;
  width: 120px;
  color: #8c8c8c;
}

.info-value {
  min-width: 0;
  color: #262626;
  word-break: break-all;

  &.status.active {
    color: #52c41a;
  }
}

.phone-value,
.site-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.field-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.link-icon {
  width: 16px;
  height: 16px;
}

.site-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}

.scope-item {
  grid-column: 1 / -1;
}

.scope-value {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;

  .clamped {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }
}

.expand-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--pb-primary);
  white-space: nowrap;

  img {
    width: 14px;
    height: 14px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

@include below-lg {
  .profile-top,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-top {
    flex-direction: column;
  }

  .profile-aside,
  .stats-box {
    width: 100%;
  }

  .info-label {
    width: 110px;
  }
}
</style>
