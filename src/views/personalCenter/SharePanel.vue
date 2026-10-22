<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import {
  ExportOutlined,
  PictureOutlined,
  RollbackOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue'
import { fetchAccountShares } from '@/api/account'
import { useServerPage } from '@/composables/useServerPage'
import { useAuthStore } from '@/stores/auth'
import { identityLabel, maskPhone } from '@/utils/userDisplay'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import bannerImg from '@/assets/personalCenter/share-banner.png'
import emptyImg from '@/assets/personalCenter/empty-message.png'
import SharePosterModal from './SharePosterModal.vue'

defineOptions({ name: 'SharePanel' })

const router = useRouter()
const { user } = storeToRefs(useAuthStore())

type InviteRecord = {
  id: string
  index: number
  inviteePhone: string
  createdAt: string
  inviterPhone: string
  inviterRole: string
  reward: string
}

const {
  currentPage,
  pageSize,
  items: shareItems,
  total,
  loading,
  error,
  reload,
} = useServerPage(
  (pageIndex, size) => fetchAccountShares({ pageIndex, pageSize: size }),
  () => 'shares',
)

const inviterPhone = computed(() => maskPhone(user.value?.phone) || '-')
const inviterRole = computed(
  () => identityLabel(user.value?.identity) || '未认证',
)

const formatInviteTime = (value?: string | null) => {
  if (!value) return '-'
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY/M/D HH:mm:ss') : value
}

/** rewardDays 为 0 表示已达赠送上限 */
const rewardLabel = (days?: number) => {
  const value = Number(days) || 0
  if (value <= 0) return '超额无赠送'
  if (value % 30 === 0) {
    const months = value / 30
    return months === 1 ? '赠送一个月' : `赠送${months}个月`
  }
  return `赠送${value}天`
}

const inviteRecords = computed<InviteRecord[]>(() =>
  shareItems.value.map((item, index) => ({
    id: `${item.inviteePhone || 'invite'}-${item.createTime || index}`,
    index: (currentPage.value - 1) * pageSize + index + 1,
    inviteePhone: item.inviteePhone || '-',
    createdAt: formatInviteTime(item.createTime),
    inviterPhone: inviterPhone.value,
    inviterRole: inviterRole.value,
    reward: rewardLabel(item.rewardDays),
  })),
)

const phoneOptions = computed(() =>
  [
    ...new Set(
      inviteRecords.value.flatMap((item) => [
        item.inviteePhone,
        item.inviterPhone,
      ]),
    ),
  ]
    .filter((phone) => phone && phone !== '-')
    .map((phone) => ({ value: phone })),
)

const selectedPhone = ref<string | undefined>()
const filteredInvites = computed(() =>
  selectedPhone.value
    ? inviteRecords.value.filter(
        (item) =>
          item.inviteePhone === selectedPhone.value ||
          item.inviterPhone === selectedPhone.value,
      )
    : inviteRecords.value,
)

const posterOpen = ref(false)

const goHome = () => {
  void router.push({ name: 'home' })
}

const roleTagClass = (role: string) => {
  if (role.includes('企服')) return 'role-service'
  if (role.includes('企业')) return 'role-org'
  return 'role-none'
}

const rewardTagClass = (reward: string) =>
  reward.startsWith('赠送') ? 'reward-gift' : 'reward-exceed'
</script>

<template>
  <div class="share-panel">
    <PanelTabs
      :tabs="[{ key: 'invite', label: '邀请情况' }]"
      active-key="invite"
    />

    <div class="share-banner">
      <img class="banner-bg" :src="bannerImg" alt="" />
      <span class="banner-text">最新福利来袭，邀请好友领会员！</span>
      <button type="button" class="banner-btn" @click="posterOpen = true">
        <PictureOutlined />
        生成分享海报
      </button>
    </div>

    <SharePosterModal v-model:open="posterOpen" />

    <div class="invite-toolbar">
      <span class="invite-tip">
        <TrophyOutlined />
        前三位成功被邀请用户赠送一个月，后续记录不再赠送。
      </span>
      <div class="toolbar-actions">
        <a-select
          v-model:value="selectedPhone"
          class="phone-search"
          show-search
          allow-clear
          placeholder="搜索被邀请人或邀请人手机号"
          :options="phoneOptions"
        />
        <a-button class="export-btn" @click.prevent>
          <template #icon><ExportOutlined /></template>
          导出Excel
        </a-button>
        <a-button class="back-btn" @click="goHome">
          <template #icon><RollbackOutlined /></template>
          返回前台
        </a-button>
      </div>
    </div>

    <a-alert
      v-if="error"
      class="invite-error"
      type="error"
      show-icon
      :message="error"
    >
      <template #action>
        <a-button size="small" @click="reload">重试</a-button>
      </template>
    </a-alert>

    <a-table
      class="invite-table"
      :class="{ 'with-frame': !loading && filteredInvites.length === 0 }"
      :loading="loading"
      row-key="id"
      :columns="[
        { title: '序号', dataIndex: 'index', width: 50 },
        { title: '被邀用户', dataIndex: 'inviteePhone', width: 120 },
        { title: '创建时间', dataIndex: 'createdAt', width: 160 },
        { title: '邀请人', dataIndex: 'inviterPhone', width: 120 },
        { title: '邀请人身份', dataIndex: 'inviterRole', width: 100 },
        { title: '赠送情况', dataIndex: 'reward', width: 110 },
      ]"
      :data-source="filteredInvites"
      :pagination="false"
      :scroll="{ x: 660 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'inviterRole'">
          <span
            class="role-tag"
            :class="roleTagClass((record as InviteRecord).inviterRole)"
          >
            {{ (record as InviteRecord).inviterRole }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'reward'">
          <span
            class="role-tag reward-tag"
            :class="rewardTagClass((record as InviteRecord).reward)"
          >
            {{ (record as InviteRecord).reward }}
          </span>
        </template>
      </template>
      <template #emptyText>
        <EmptyState :image="emptyImg" />
      </template>
    </a-table>

    <PaginationBar
      v-if="total > 0"
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
    />
  </div>
</template>

<style scoped lang="scss">
.share-banner {
  position: relative;
  margin-top: 20px;
  aspect-ratio: 2076 / 116;
  border-radius: 4px;
  overflow: hidden;

  .banner-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 2px;
    text-shadow: 0 1px 4px rgba(21, 76, 195, 0.4);
  }

  .banner-btn {
    position: absolute;
    right: 2%;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 4px;
    background: linear-gradient(180deg, #ffa53d 0%, #f68817 100%);
    color: #fff;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(246, 136, 23, 0.4);

    &:hover {
      filter: brightness(1.05);
    }
  }
}

/* 邀请情况工具行 */
.invite-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 16px 4px;
}

.invite-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 14px;
  color: var(--pb-text);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.phone-search {
  width: 240px;

  &:deep(.ant-select-selector) {
    border-color: var(--pb-primary) !important;
    border-radius: 4px;
  }
}

:deep(.export-btn) {
  color: var(--pb-primary);
  border-color: var(--pb-primary);
  border-radius: 4px;
}

:deep(.back-btn) {
  color: #f68817;
  border-color: #f0a94b;
  border-radius: 4px;
}

/* 表格 */
.invite-table {
  @include pc-table(
    $padding: 12px 8px,
    $font-size: 14px,
    $header-dividers: true,
    $framed: false
  );

  :deep(.ant-table-thead > tr > th:first-child) {
    border-start-start-radius: 8px;
    border-start-end-radius: 0;
  }

  &.with-frame {
    :deep(.ant-table-container) {
      border: 1px solid #dce7f9;
      border-radius: 8px;
      overflow: hidden;
    }
  }
}

.role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 20px;
}

.role-service {
  background: #eef4ff;
  color: #3b7cff;
}

.role-org {
  background: #f0faeb;
  color: #52c41a;
}

.role-none {
  background: #f3f3f3;
  color: #8c8c8c;
}

.invite-error {
  margin-bottom: 12px;
}

.reward-tag.reward-gift {
  background: #fff2e5;
  color: #f68817;
}

.reward-tag.reward-exceed {
  background: #f3f3f3;
  color: #8c8c8c;
}
</style>
