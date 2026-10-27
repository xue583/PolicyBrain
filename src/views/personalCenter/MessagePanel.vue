<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  fetchAccountMessages,
  markAllMessagesRead,
  markMessageRead,
  type UserNotification,
} from '@/api/account'
import { useServerPage } from '@/composables/useServerPage'
import { useMessageBadge } from '@/composables/useMessageBadge'
import { toErrorMessage } from '@/utils/apiError'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import msgIcon from '@/assets/personalCenter/msg-icon.png'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'MessagePanel' })

const { unreadCount, refreshMessageUnread } = useMessageBadge()

const activeTab = ref<'all' | 'unread'>('all')
const allTotal = ref(0)
const initialized = ref(false)
const readingAll = ref(false)
const detailOpen = ref(false)
const detail = ref<UserNotification | null>(null)

const loadMessages = async (pageIndex: number, size: number) => {
  const unreadOnly = activeTab.value === 'unread'
  const page = await fetchAccountMessages({
    pageIndex,
    pageSize: size,
    isRead: unreadOnly ? false : undefined,
  })
  if (!unreadOnly) allTotal.value = page.totalElements
  return page
}

const { currentPage, pageSize, items, total, loading, error, reload } =
  useServerPage(loadMessages, () => activeTab.value)

watch(loading, (value, prev) => {
  if (prev && !value) initialized.value = true
})

const tabs = computed(() => [
  { key: 'all' as const, label: `全部（${allTotal.value}）` },
  { key: 'unread' as const, label: `未读（${unreadCount.value}）` },
])

const showEmpty = computed(
  () => initialized.value && !loading.value && items.value.length === 0,
)

const messageTypeLabel = (type?: number | null) => {
  if (type === 1) return '待办'
  if (type === 2) return '抄送'
  if (type === 3) return '结果'
  return ''
}

const formatMessageTime = (value?: string | null) => {
  if (!value) return ''
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : value
}

const switchTab = (tab: 'all' | 'unread') => {
  activeTab.value = tab
}

const openDetail = async (item: UserNotification) => {
  detail.value = item
  detailOpen.value = true
  if (item.isRead) return
  try {
    await markMessageRead(item.id)
    item.isRead = true
    if (unreadCount.value > 0) unreadCount.value -= 1
    void refreshMessageUnread()
    if (activeTab.value === 'unread') void reload()
  } catch (err) {
    message.error(toErrorMessage(err, '标记已读失败'))
  }
}

const readAll = async () => {
  if (readingAll.value || unreadCount.value <= 0) return
  readingAll.value = true
  try {
    await markAllMessagesRead()
    unreadCount.value = 0
    message.success('已全部标为已读')
    await reload()
    void refreshMessageUnread()
  } catch (err) {
    message.error(toErrorMessage(err, '操作失败'))
  } finally {
    readingAll.value = false
  }
}

onMounted(() => {
  void refreshMessageUnread()
})
</script>

<template>
  <div class="message-panel">
    <div class="msg-toolbar">
      <PanelTabs
        variant="filled"
        :tabs="tabs"
        :active-key="activeTab"
        @update:active-key="switchTab"
      />
      <button
        v-if="unreadCount > 0"
        type="button"
        class="msg-read-all"
        :disabled="readingAll"
        @click="readAll"
      >
        全部已读
      </button>
    </div>

    <a-alert
      v-if="error"
      class="msg-error"
      type="error"
      show-icon
      :message="error"
    >
      <template #action>
        <a-button size="small" @click="reload">重试</a-button>
      </template>
    </a-alert>

    <a-spin class="msg-spin" :spinning="loading">
      <EmptyState
        v-if="showEmpty"
        class="msg-empty"
        :image="emptyImg"
        :image-width="110"
        :text="activeTab === 'unread' ? '暂无未读消息' : '暂无消息通知'"
      />

      <template v-else>
        <div v-if="items.length" class="msg-list">
          <div v-for="item in items" :key="item.id" class="msg-card">
            <img class="msg-icon" :src="msgIcon" alt="" />
            <div class="msg-main">
              <div class="msg-title">
                <span v-if="!item.isRead" class="msg-unread-dot" />
                {{ item.title || '系统消息' }}
              </div>
              <div class="msg-detail-row">
                <span class="msg-detail">{{ item.summary || '暂无摘要' }}</span>
                <a class="msg-link" @click.prevent="openDetail(item)">
                  查看详情-&gt;
                </a>
              </div>
            </div>
            <span class="msg-time">{{
              formatMessageTime(item.createTime)
            }}</span>
          </div>
        </div>

        <PaginationBar
          v-if="total > 0"
          class="msg-pagination"
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
        />
      </template>
    </a-spin>

    <a-modal
      v-model:open="detailOpen"
      :title="detail?.title || '消息详情'"
      :footer="null"
      width="520px"
      destroy-on-close
    >
      <p v-if="detail" class="msg-modal-meta">
        <span v-if="messageTypeLabel(detail.messageType)">
          {{ messageTypeLabel(detail.messageType) }}
        </span>
        <span>{{ formatMessageTime(detail.createTime) }}</span>
      </p>
      <p class="msg-modal-body">{{ detail?.summary || '暂无摘要' }}</p>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.message-panel {
  display: flex;
  flex-direction: column;
}

.msg-toolbar {
  position: relative;
}

.msg-read-all {
  position: absolute;
  top: 50%;
  right: 24px;
  padding: 0;
  border: none;
  background: none;
  transform: translateY(-50%);
  color: var(--pb-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.msg-error {
  margin-top: 12px;
}

.msg-spin {
  min-height: 180px;
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

.msg-modal-meta {
  display: flex;
  gap: 12px;
  margin: 0 0 12px;
  color: var(--pb-muted);
  font-size: 13px;
}

.msg-modal-body {
  margin: 0;
  white-space: pre-wrap;
  color: var(--pb-text);
  font-size: 14px;
  line-height: 22px;
}
</style>
