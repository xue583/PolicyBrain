<script setup lang="ts">
import { computed } from 'vue'
import { PaperClipOutlined } from '@ant-design/icons-vue'
import type { PolicyDbApplyInfo } from '../../mock/policyDb'
import { sanitizeHtml } from '@/utils/sanitize'

defineOptions({ name: 'PolicyDbApplyInfoPanel' })

const props = defineProps<{
  applyInfo: PolicyDbApplyInfo
}>()

const CLAUSE_MARKS = ['一', '二', '三', '四', '五', '六', '七', '八'] as const

// Admin 原文为富文本；消毒后 v-html，避免页面露出 <p>/<span> 标签字面量
const safeFields = computed(() => sanitizeHtml(props.applyInfo.fields))
const safeApplyHtml = computed(() => sanitizeHtml(props.applyInfo.applyHtml))
</script>

<template>
  <div class="apply-info">
    <section class="apply-section">
      <h2 class="apply-title">支持领域</h2>
      <!-- eslint-disable-next-line vue/no-v-html -- HTML 已通过 DOMPurify 消毒 -->
      <div v-if="safeFields" class="apply-html" v-html="safeFields" />
      <p v-else class="apply-text">—</p>
    </section>

    <section class="apply-section">
      <h2 class="apply-title">申报条件</h2>
      <!-- eslint-disable-next-line vue/no-v-html -- HTML 已通过 DOMPurify 消毒 -->
      <div v-if="safeApplyHtml" class="apply-html" v-html="safeApplyHtml" />
      <template v-else>
        <ol v-if="applyInfo.conditions.length" class="apply-conditions">
          <li v-for="(item, index) in applyInfo.conditions" :key="index">
            {{ index + 1 }}．{{ item }}
          </li>
        </ol>
        <p v-else class="apply-text">—</p>
      </template>
      <p v-if="applyInfo.regulationNote" class="apply-note">
        {{ applyInfo.regulationNote }}
      </p>
      <ol v-if="applyInfo.regulationClauses.length" class="apply-clauses">
        <li v-for="(item, index) in applyInfo.regulationClauses" :key="item">
          （{{ CLAUSE_MARKS[index] ?? index + 1 }}）{{ item }}
        </li>
      </ol>
    </section>

    <section class="apply-section">
      <h2 class="apply-title">依据文件</h2>
      <div v-if="applyInfo.files.length" class="basis-files">
        <a
          v-for="file in applyInfo.files"
          :key="file.name"
          class="basis-file"
          :href="file.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <PaperClipOutlined />
          <span>{{ file.name }}</span>
        </a>
      </div>
      <p v-else class="apply-text">—</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.apply-info {
  padding: 8px 0 12px;
}

.apply-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.apply-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #1f1f1f;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    border-radius: 1px;
    background: var(--pb-primary);
  }
}

.apply-text,
.apply-conditions,
.apply-clauses,
.apply-note {
  margin: 0;
  color: #434343;
  font-size: 15px;
  line-height: 1.9;
  text-align: justify;
}

.apply-html {
  color: #434343;
  font-size: 15px;
  line-height: 1.9;
  text-align: justify;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(a) {
    color: var(--pb-primary);
    word-break: break-all;

    &:hover {
      color: #4096ff;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
    padding-left: 1.5em;
  }
}

.apply-conditions,
.apply-clauses {
  padding: 0;
  list-style: none;
}

.apply-conditions li,
.apply-clauses li {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.apply-note {
  margin: 16px 0 12px;
}

.basis-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.basis-file {
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
    color: #8c8c8c;
  }

  span {
    word-break: break-all;
  }

  &:hover {
    color: #4096ff;
  }
}
</style>
