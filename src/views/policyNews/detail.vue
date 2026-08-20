<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ClockCircleOutlined,
  ExportOutlined,
  LeftOutlined,
  PaperClipOutlined,
} from '@ant-design/icons-vue'
import { getPolicyById } from '../../mock/policyNews'
import { sanitizeHtml } from '@/utils/sanitize'

defineOptions({ name: 'PolicyNewsDetail' })

const route = useRoute()
const router = useRouter()

const policyId = computed(() => Number(route.params.id))
const policy = computed(() => getPolicyById(policyId.value))
const safeContent = computed(() => sanitizeHtml(policy.value?.content ?? ''))

const goHome = () => {
  void router.push({ name: 'home' })
}

const goList = () => {
  void router.push({ name: 'news' })
}

const openOriginal = () => {
  const url = policy.value?.originalUrl
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="policy-detail">
    <nav class="breadcrumb">
      <button type="button" class="back-btn" @click="goList">
        <LeftOutlined />
      </button>
      <div class="breadcrumb-trail">
        <a @click="goHome">首页</a>
        <span class="sep">&gt;</span>
        <a @click="goList">政策资讯</a>
        <span class="sep">&gt;</span>
        <span class="current">资讯详情</span>
      </div>
    </nav>

    <a-empty v-if="!policy" description="未找到该政策资讯" />

    <template v-else>
      <a-card class="detail-card header-card" :bordered="false">
        <div class="title-row">
          <h1 class="detail-title">{{ policy.title }}</h1>
          <div class="status-area">
            <span
              class="status-badge"
              :class="policy.status === 'expired' ? 'expired' : 'applying'"
            >
              {{ policy.status === 'expired' ? '已过期' : '申报中' }}
            </span>
            <p class="status-tip">请关注公示期及政府原文文件</p>
          </div>
        </div>

        <div class="meta-row">
          <span>发布日期：{{ policy.date }}</span>
          <span>发文机构：{{ policy.department }}</span>
          <span class="remain">
            <ClockCircleOutlined />
            剩余天数：{{ policy.daysRemaining }}天
          </span>
        </div>

        <div class="tags-row">
          <div class="tags">
            <a-tag
              v-for="tag in policy.tags"
              :key="tag.text"
              :color="tag.color"
            >
              {{ tag.text }}
            </a-tag>
          </div>
          <a-button type="primary" class="origin-btn" @click="openOriginal">
            <template #icon><ExportOutlined /></template>
            查看原文
          </a-button>
        </div>
      </a-card>

      <a-card class="detail-card content-card" :bordered="false">
        <!-- eslint-disable-next-line vue/no-v-html -- HTML 已通过 DOMPurify 消毒 -->
        <div class="detail-body" v-html="safeContent" />

        <div v-if="policy.attachments.length" class="attachments">
          <a
            v-for="file in policy.attachments"
            :key="file.name"
            class="attachment-item"
            :href="file.url"
            target="_blank"
            rel="noopener noreferrer"
            @click.prevent
          >
            <PaperClipOutlined />
            <span>{{ file.name }}</span>
          </a>
        </div>
      </a-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
.policy-detail {
  min-height: 480px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #595959;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: color 0.2s;

  &:hover {
    color: var(--pb-primary);
  }
}

.breadcrumb-trail {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  a {
    color: var(--pb-primary);
    cursor: pointer;

    &:hover {
      color: #4096ff;
    }
  }

  .sep {
    color: #bfbfbf;
  }

  .current {
    color: #595959;
  }
}

.detail-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  :deep(.ant-card-body) {
    padding: 28px 36px;
  }

  &.header-card {
    margin-bottom: 16px;
    background: linear-gradient(180deg, #dbe9ff 0%, #ffffff 50%);
  }
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.detail-title {
  flex: 1;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f1f1f;
}

.status-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding-top: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 4px 16px;
  border-radius: 999px;
  font-size: 14px;
  line-height: 22px;
  color: #fff;

  &.applying {
    background: #ed7901;
  }

  &.expired {
    background: #bfbfbf;
  }
}

.status-tip {
  margin: 0;
  font-size: 12px;
  color: #bfbfbf;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #8c8c8c;

  .remain {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.tags-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.ant-tag) {
    margin-inline-end: 0;
  }
}

.origin-btn {
  flex-shrink: 0;
}

.detail-body {
  color: #262626;
  font-size: 16px;
  line-height: 1.9;

  :deep(p) {
    margin: 0 0 16px;
  }

  :deep(strong) {
    font-weight: 600;
    color: #1f1f1f;
  }

  :deep(a) {
    color: var(--pb-primary);
  }
}

.attachments {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
  padding-top: 8px;
}

.attachment-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
  color: var(--pb-primary);
  font-size: 15px;
  line-height: 1.6;

  .anticon {
    flex-shrink: 0;
    color: var(--pb-primary);
  }

  span {
    word-break: break-all;
  }

  &:hover {
    color: #4096ff;
  }
}

@media (max-width: 768px) {
  .detail-card {
    :deep(.ant-card-body) {
      padding: 20px 16px;
    }
  }

  .title-row {
    flex-direction: column;
    gap: 12px;
  }

  .status-area {
    align-items: flex-start;
  }

  .detail-title {
    font-size: 22px;
  }
}
</style>
