<script setup lang="ts">
import { computed, ref } from 'vue'
import msgIcon from '@/assets/personalCenter/msg-icon.png'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'MessagePanel' })

type NoticeMessage = {
  id: number
  title: string
  summary: string
  time: string
  read: boolean
}

/** 视觉还原用 Mock 数据，接入后端后替换 */
const mockMessages: NoticeMessage[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: '系统消息标题',
  summary: '站内通知详情站内通知详情站内通知详情站内通知详情站内通知详情',
  time: '2026-08-14 18:45',
  read: i >= 3,
}))

const activeTab = ref<'all' | 'unread'>('all')
const current = ref(1)
const pageSize = 10

const unreadCount = computed(
  () => mockMessages.filter((item) => !item.read).length,
)

const filteredMessages = computed(() =>
  activeTab.value === 'all'
    ? mockMessages
    : mockMessages.filter((item) => !item.read),
)

const pagedMessages = computed(() =>
  filteredMessages.value.slice(
    (current.value - 1) * pageSize,
    current.value * pageSize,
  ),
)

const switchTab = (tab: 'all' | 'unread') => {
  activeTab.value = tab
  current.value = 1
}
</script>

<template>
  <div class="message-panel">
    <div class="msg-tabs">
      <button
        type="button"
        class="msg-tab"
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >
        全部（{{ mockMessages.length }}）
      </button>
      <button
        type="button"
        class="msg-tab"
        :class="{ active: activeTab === 'unread' }"
        @click="switchTab('unread')"
      >
        未读（{{ unreadCount }}）
      </button>
    </div>

    <div v-if="filteredMessages.length === 0" class="msg-empty">
      <img :src="emptyImg" alt="" />
      <p class="msg-empty-text">暂无数据</p>
    </div>

    <template v-else>
      <div class="msg-list">
        <div v-for="item in pagedMessages" :key="item.id" class="msg-card">
          <img class="msg-icon" :src="msgIcon" alt="" />
          <div class="msg-main">
            <div class="msg-title">
              <span v-if="!item.read" class="msg-unread-dot" />
              {{ item.title }}
            </div>
            <div class="msg-detail-row">
              <span class="msg-detail">{{ item.summary }}</span>
              <a class="msg-link" @click.prevent>查看详情-&gt;</a>
            </div>
          </div>
          <span class="msg-time">{{ item.time }}</span>
        </div>
      </div>

      <div class="msg-pagination">
        <span class="msg-total">共{{ filteredMessages.length }}条</span>
        <a-pagination
          v-model:current="current"
          :total="filteredMessages.length"
          :page-size="pageSize"
          :show-size-changer="false"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.message-panel {
  display: flex;
  flex-direction: column;
}

.msg-tabs {
  display: flex;
  align-items: center;
  gap: 36px;
  padding: 12px 24px;
  background: #ecf3ff;
  border-radius: 8px;
}

.msg-tab {
  padding: 0;
  border: none;
  background: none;
  font-size: 15px;
  font-family: inherit;
  color: #8c8c8c;
  cursor: pointer;

  &.active {
    color: var(--pb-title);
    font-weight: 600;
  }
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.msg-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #ececf1;
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--pb-primary-soft);
    box-shadow: var(--pb-shadow);
  }
}

.msg-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
}

.msg-main {
  flex: 1;
  min-width: 0;
}

.msg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: var(--pb-text);
}

.msg-unread-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--pb-primary);
}

.msg-detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.msg-detail {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 20px;
  color: var(--pb-muted);
}

.msg-link {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--pb-primary);
  cursor: pointer;
}

.msg-time {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: #7f7f7f;
}

.msg-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.msg-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--pb-text);
}

.msg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  padding: 60px 0;

  img {
    width: 110px;
    height: auto;
    user-select: none;
  }
}

.msg-empty-text {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--pb-primary);
}
</style>
