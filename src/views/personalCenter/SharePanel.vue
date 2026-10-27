<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  ExportOutlined,
  PictureOutlined,
  RollbackOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue'
import { exportAccountShares, fetchAccountShares } from '@/api/account'
import { ApiError } from '@/utils/request'
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
const exportOpen = ref(false)
const exporting = ref(false)
const startPage = ref(1)
const endPage = ref(1)
const exportPageSize = ref<number | null>(pageSize)

const positiveInt = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) return null
  const parsed = Math.trunc(value)
  return parsed >= 1 ? parsed : null
}

/** 按用户填写的每页大小估算可导出页数 */
const exportPageCount = computed(() => {
  const size = positiveInt(exportPageSize.value)
  if (!size || total.value <= 0) return 1
  return Math.max(1, Math.ceil(total.value / size))
})

watch([exportPageCount, startPage], () => {
  const count = exportPageCount.value
  if (startPage.value > count) startPage.value = count
  if (endPage.value > count) endPage.value = count
  if (endPage.value < startPage.value) endPage.value = startPage.value
})

const openExport = () => {
  const size = pageSize
  exportPageSize.value = size
  startPage.value = 1
  endPage.value = Math.max(
    1,
    total.value > 0 ? Math.ceil(total.value / size) : 1,
  )
  exportOpen.value = true
}

const closeExport = () => {
  if (exporting.value) return
  exportOpen.value = false
}

const openExportFile = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const submitExport = async () => {
  if (exporting.value) return
  const size = positiveInt(exportPageSize.value)
  const start = positiveInt(startPage.value)
  const end = positiveInt(endPage.value)
  if (!start) {
    message.warning('请选择开始页')
    return
  }
  if (!end) {
    message.warning('请选择结束页')
    return
  }
  if (!size) {
    message.warning('请填写每页大小')
    return
  }
  if (end < start) {
    message.warning('结束页不能小于开始页')
    return
  }
  exporting.value = true
  try {
    const url = await exportAccountShares({
      startPage: start,
      endPage: end,
      pageSize: size,
    })
    if (!url) {
      message.error('未获取到导出文件')
      return
    }
    openExportFile(url)
    message.success('导出文件已生成')
    exportOpen.value = false
  } catch (err) {
    message.error(
      err instanceof ApiError ? err.message : '导出失败，请稍后重试',
    )
  } finally {
    exporting.value = false
  }
}

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

    <a-modal
      :open="exportOpen"
      :width="440"
      :footer="null"
      :mask-closable="!exporting"
      :keyboard="!exporting"
      wrap-class-name="share-export-modal"
      @cancel="closeExport"
    >
      <template #title>
        <span class="export-title">导出Excel</span>
      </template>
      <div class="export-form">
        <label class="export-field">
          <span>开始页</span>
          <a-input-number
            v-model:value="startPage"
            class="export-control"
            :min="1"
            :max="exportPageCount"
            :precision="0"
            :disabled="exporting"
          />
        </label>
        <label class="export-field">
          <span>结束页</span>
          <a-input-number
            v-model:value="endPage"
            class="export-control"
            :min="startPage"
            :max="exportPageCount"
            :precision="0"
            :disabled="exporting"
          />
        </label>
        <label class="export-field">
          <span>每页大小</span>
          <a-input-number
            v-model:value="exportPageSize"
            class="export-control"
            :min="1"
            :precision="0"
            :disabled="exporting"
            placeholder="请填写每页大小"
            @press-enter="submitExport"
          />
        </label>
        <p class="export-hint">
          当前共 {{ total }} 条，按每页
          {{ positiveInt(exportPageSize) || '-' }} 条计算，共
          {{ exportPageCount }} 页
        </p>
        <div class="export-actions">
          <a-button :disabled="exporting" @click="closeExport">取消</a-button>
          <a-button type="primary" :loading="exporting" @click="submitExport">
            确认导出
          </a-button>
        </div>
      </div>
    </a-modal>

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
        <a-button class="export-btn" :disabled="loading" @click="openExport">
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

.export-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.export-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--pb-sub);
}

.export-control {
  width: 100%;
}

.export-hint {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--pb-sub);
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
