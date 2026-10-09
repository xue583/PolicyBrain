<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ExportOutlined,
  FileTextOutlined,
  PictureOutlined,
  RollbackOutlined,
  TrophyOutlined,
} from '@ant-design/icons-vue'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import { mockChangedAt } from '@/mock/personalCenter'
import bannerImg from '@/assets/personalCenter/share-banner.png'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'SharePanel' })

const router = useRouter()

/** 视觉还原用 Mock 数据，接入后端后替换 */
const registerCount = ref(0)
const consumeCount = ref(0)
const registerRecords: Array<Record<string, unknown>> = []

type InviteRole = '企服' | '企业'
type InviteReward = '赠送一个月' | '超额无赠送'

type InviteRecord = {
  id: number
  inviteePhone: string
  inviteeRole: InviteRole
  createdAt: string
  inviterPhone: string
  inviterRole: InviteRole
  reward: InviteReward
}

const rolePattern: InviteRole[] = [
  '企服',
  '企服',
  '企服',
  '企业',
  '企服',
  '企服',
  '企服',
  '企业',
  '企服',
  '企业',
]
const phonePattern = [
  '15981866547',
  '18981866597',
  '18881866546',
  '15681866533',
  '15981866540',
]

const inviteRecords: InviteRecord[] = Array.from({ length: 15 }, (_, i) => {
  const phone = phonePattern[i % phonePattern.length]!
  return {
    id: i + 1,
    inviteePhone: phone,
    inviteeRole: rolePattern[i % rolePattern.length]!,
    createdAt: mockChangedAt,
    inviterPhone: phone,
    inviterRole: '企服',
    reward: i < 4 ? '赠送一个月' : '超额无赠送',
  }
})

const activeTab = ref<'register' | 'invite'>('register')

const phoneOptions = [
  ...new Set(
    inviteRecords.flatMap((item) => [item.inviteePhone, item.inviterPhone]),
  ),
].map((phone) => ({ value: phone }))

const selectedPhone = ref<string | undefined>()
const filteredInvites = computed(() =>
  selectedPhone.value
    ? inviteRecords.filter(
        (item) =>
          item.inviteePhone === selectedPhone.value ||
          item.inviterPhone === selectedPhone.value,
      )
    : inviteRecords,
)

const { currentPage, pageSize, total, pagedList, resetPage } = usePagination(
  () => filteredInvites.value,
)

const switchTab = (tab: 'register' | 'invite') => {
  activeTab.value = tab
  resetPage()
}

const goHome = () => {
  void router.push({ name: 'home' })
}

const rewardTagClass = (reward: InviteReward) =>
  reward === '赠送一个月' ? 'reward-gift' : 'reward-exceed'
</script>

<template>
  <div class="share-panel">
    <PanelTabs
      :tabs="[
        { key: 'register', label: '注册用户' },
        { key: 'invite', label: '邀请情况' },
      ]"
      :active-key="activeTab"
      @update:active-key="switchTab"
    />

    <div class="share-banner">
      <img class="banner-bg" :src="bannerImg" alt="" />
      <span class="banner-text">最新福利来袭，邀请好友领会员！</span>
      <button type="button" class="banner-btn">
        <PictureOutlined />
        生成分享海报
      </button>
    </div>

    <!-- 注册用户 -->
    <template v-if="activeTab === 'register'">
      <div class="share-stats">
        <div class="stat-item">
          <span class="stat-label">分享注册用户数：</span>
          <span class="stat-num">{{ registerCount }}</span>
          <span class="stat-label">人</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">分享消费用户数：</span>
          <span class="stat-num">{{ consumeCount }}</span>
          <span class="stat-label">人</span>
        </div>
        <a class="activity-link" @click.prevent>
          <FileTextOutlined />
          查看活动说明
        </a>
      </div>

      <a-table
        class="invite-table"
        :class="{ 'with-frame': registerRecords.length === 0 }"
        :columns="[
          { title: '佣金金额', dataIndex: 'commission', width: '21%' },
          { title: '会员类型', dataIndex: 'memberType', width: '30%' },
          { title: '用户手机号', dataIndex: 'phone', width: '30%' },
          { title: '注册时间', dataIndex: 'createdAt' },
        ]"
        :data-source="registerRecords"
        :pagination="false"
      >
        <template #emptyText>
          <EmptyState :image="emptyImg" />
        </template>
      </a-table>
    </template>

    <!-- 邀请情况 -->
    <template v-else>
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

      <a-table
        class="invite-table"
        :class="{ 'with-frame': filteredInvites.length === 0 }"
        :columns="[
          { title: '序号', dataIndex: 'id', width: 50 },
          { title: '被邀用户', dataIndex: 'inviteePhone', width: 106 },
          { title: '被邀身份', dataIndex: 'inviteeRole', width: 90 },
          { title: '创建时间', dataIndex: 'createdAt', width: 160 },
          { title: '邀请人', dataIndex: 'inviterPhone', width: 106 },
          { title: '邀请人身份', dataIndex: 'inviterRole', width: 90 },
          { title: '赠送情况', dataIndex: 'reward', width: 100 },
        ]"
        :data-source="pagedList"
        :pagination="false"
        :scroll="{ x: 702 }"
      >
        <template #bodyCell="{ column, record }">
          <template
            v-if="
              column.dataIndex === 'inviteeRole' ||
              column.dataIndex === 'inviterRole'
            "
          >
            <span
              class="role-tag"
              :class="
                (record as InviteRecord).inviteeRole === '企业'
                  ? 'role-org'
                  : 'role-service'
              "
            >
              {{
                (record as InviteRecord)[
                  column.dataIndex as 'inviteeRole' | 'inviterRole'
                ]
              }}
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
    </template>
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

/* 统计行 */
.share-stats {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 18px 4px 16px;
}

.stat-item {
  display: flex;
  align-items: baseline;
}

.stat-label {
  font-size: 14px;
  color: var(--pb-text);
}

.stat-num {
  margin: 0 2px;
  font-size: 20px;
  font-weight: 600;
  color: var(--pb-primary);
}

.activity-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 14px;
  color: var(--pb-primary);
  cursor: pointer;
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

.reward-tag.reward-gift {
  background: #fff2e5;
  color: #f68817;
}

.reward-tag.reward-exceed {
  background: #f3f3f3;
  color: #8c8c8c;
}
</style>
