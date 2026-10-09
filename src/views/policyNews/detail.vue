<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ClockCircleOutlined,
  ExportOutlined,
  PaperClipOutlined,
} from '@ant-design/icons-vue'
import { getPolicyById } from '../../mock/policyNews'
import { sanitizeHtml } from '@/utils/sanitize'
import DetailCard from '@/components/common/DetailCard.vue'
import DetailPageShell from '@/components/common/DetailPageShell.vue'

defineOptions({ name: 'PolicyNewsDetail' })

const route = useRoute()

const policyId = computed(() => Number(route.params.id))
const policy = computed(() => getPolicyById(policyId.value))
const safeContent = computed(() => sanitizeHtml(policy.value?.content ?? ''))

const openOriginal = () => {
  const url = policy.value?.originalUrl
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <DetailPageShell
    list-label="政策资讯"
    list-route="news"
    detail-label="资讯详情"
    :empty="policy ? '' : '未找到该政策资讯'"
  >
    <template v-if="policy">
      <DetailCard
        variant="header"
        style="
          --detail-header-bg: linear-gradient(180deg, #dbe9ff 0%, #ffffff 50%);
        "
      >
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
      </DetailCard>

      <DetailCard variant="content">
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
      </DetailCard>
    </template>
  </DetailPageShell>
</template>

<style scoped lang="scss">
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--pb-gap);
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
  gap: var(--pb-gap);
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
