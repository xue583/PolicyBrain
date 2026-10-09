<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
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

const unreadCount = computed(
  () => mockMessages.filter((item) => !item.read).length,
)

const filteredMessages = computed(() =>
  activeTab.value === 'all'
    ? mockMessages
    : mockMessages.filter((item) => !item.read),
)

const { currentPage, pageSize, total, pagedList, resetPage } = usePagination(
  () => filteredMessages.value,
)

const tabs = computed(() => [
  { key: 'all' as const, label: `全部（${mockMessages.length}）` },
  { key: 'unread' as const, label: `未读（${unreadCount.value}）` },
])

const switchTab = (tab: 'all' | 'unread') => {
  activeTab.value = tab
  resetPage()
}
</script>

<template>
  <div class="message-panel">
    <PanelTabs
      variant="filled"
      :tabs="tabs"
      :active-key="activeTab"
      @update:active-key="switchTab"
    />

    <EmptyState
      v-if="filteredMessages.length === 0"
      class="msg-empty"
      :image="emptyImg"
      :image-width="110"
    />

    <template v-else>
      <div class="msg-list">
        <div v-for="item in pagedList" :key="item.id" class="msg-card">
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

      <PaginationBar
        class="msg-pagination"
        v-model:current="currentPage"
        :total="total"
        :page-size="pageSize"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.message-panel {
  display: flex;
  flex-direction: column;
}

.msg-empty {
  --empty-gap: 36px;
  --empty-padding: 60px 0;
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
  --pagination-space: 0;

  margin-top: 24px;
}
</style>
