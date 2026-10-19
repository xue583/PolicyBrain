<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FileTextOutlined,
  TeamOutlined,
  DesktopOutlined,
  ContainerOutlined,
  FolderOpenFilled,
} from '@ant-design/icons-vue'
import advertisementImg from '@/assets/api/advertisement.png'
import openImg from '@/assets/api/open.png'
import notOpenImg from '@/assets/api/notOpen.png'
import { useRouteKeyword } from '@/composables/useRouteKeyword'

defineOptions({ name: 'ComingSoon' })

interface ApiItem {
  id: number
  name: string
  description: string
  code: string
  returnData: string
  isOpen: boolean
}

const selectedKeys = ref<string[]>(['政策接口'])
const keyword = useRouteKeyword()

interface ApiSubGroup {
  name: string
  count: number
  items: ApiItem[]
}

interface ApiMainCategory {
  name: string
  count: number
  groups: ApiSubGroup[]
}

const fileReturn = '发布单位、发布科室、文件等级、联系方式、发布时间、标题'
const fileDesc =
  '根据区域查询政策文件，包含：发布单位、发布科室、原文链接、联系方式等'

const makeItem = (
  id: number,
  name: string,
  isOpen: boolean,
  description = fileDesc,
  returnData = fileReturn,
): ApiItem => ({
  id,
  name,
  description,
  code: '100011',
  returnData,
  isOpen,
})

const apiMainCategory = ref<ApiMainCategory>({
  name: '政策接口',
  count: 9,
  groups: [
    {
      name: '政策文件',
      count: 3,
      items: [
        makeItem(1, '查询政策文件列表', true),
        makeItem(2, '查询政策文件列表', true),
        makeItem(3, '查询政策文件列表', false),
      ],
    },
    {
      name: '政策数据',
      count: 9,
      items: Array.from({ length: 9 }, (_, index) =>
        makeItem(index + 4, '查询政策资讯', true),
      ),
    },
  ],
})

const visibleCategory = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return apiMainCategory.value
  const groups = apiMainCategory.value.groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.name.includes(kw) || item.code.includes(kw),
      ),
    }))
    .filter((group) => group.items.length > 0)
  return {
    ...apiMainCategory.value,
    count: groups.reduce((sum, group) => sum + group.items.length, 0),
    groups,
  }
})

const menuItems = [
  { key: '政策接口', label: '政策接口', count: 9, icon: ContainerOutlined },
  { key: '企业接口', label: '企业接口', count: 12, icon: TeamOutlined },
  { key: '功能接口', label: '功能接口', count: 5, icon: DesktopOutlined },
  {
    key: '投资项目接口',
    label: '投资项目接口',
    count: 5,
    icon: FileTextOutlined,
  },
]
const totalApiCount = 45
</script>

<template>
  <PageState>
    <div class="api-page">
      <!-- Left Sidebar Card -->
      <div class="sidebar-container">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <h3>API接口目录 ({{ totalApiCount }})</h3>
          </div>
          <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="inline"
            class="sidebar-menu"
          >
            <a-menu-item v-for="item in menuItems" :key="item.key">
              <div class="menu-item">
                <component :is="item.icon" class="menu-icon" />
                <span class="menu-text">{{ item.label }}</span>
                <span class="menu-count">{{ item.count }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- Advertisement Card -->
        <div class="sidebar-ad">
          <img :src="advertisementImg" alt="场景化定制解决方案" />
        </div>
      </div>

      <!-- Right Content Card -->
      <div class="content-card">
        <h2 class="main-title">
          {{ visibleCategory.name }}（{{ visibleCategory.count }}个）
        </h2>

        <p v-if="!visibleCategory.groups.length" class="empty-tip">
          未找到相关接口
        </p>

        <div
          v-for="group in visibleCategory.groups"
          :key="group.name"
          class="api-group"
        >
          <h3 class="group-title">
            {{ group.name }}
            <span class="group-count">{{ group.items.length }}</span>
          </h3>

          <div v-for="item in group.items" :key="item.id" class="api-card">
            <img
              :src="item.isOpen ? openImg : notOpenImg"
              :alt="item.isOpen ? '开放' : '未开放'"
              class="status-badge"
            />
            <div class="card-title-row">
              <div class="card-icon">
                <FolderOpenFilled />
              </div>
              <h4 class="card-title">{{ item.name }}</h4>
            </div>
            <p class="card-desc">{{ item.description }}</p>
            <div class="card-meta-container">
              <div class="card-meta">接口编号：{{ item.code }}</div>
              <div class="card-meta">返回结果：{{ item.returnData }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.api-page {
  display: flex;
  gap: 16px;
  margin-top: -200px;
  align-items: flex-start;
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 16px;
  width: 260px;
}

/* Sidebar Card */
.sidebar-card {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: var(--pb-radius-lg);
  box-shadow: var(--pb-shadow-card);
  overflow: hidden;
  position: sticky;
  top: 80px;
}

.sidebar-header {
  background: linear-gradient(135deg, #4a90e2 0%, #50c6ff 100%);
  padding: 20px;

  h3 {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

.sidebar-menu {
  background: transparent;
  border-inline-end: none;
  padding: 12px 12px;

  :deep(.ant-menu-item) {
    height: 48px;
    line-height: 48px;
    border-radius: var(--pb-radius);
  }

  :deep(.ant-menu-item-selected) {
    background: var(--pb-primary-soft);

    &::after {
      display: none;
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-icon {
  color: #333333;
  margin-right: 10px;
  font-size: 18px;

  .ant-menu-item-selected & {
    color: var(--pb-primary);
  }
}

.menu-text {
  flex: 1;
  font-size: 14px;
  color: #333333;
}

.menu-count {
  font-size: 14px;
  color: var(--pb-muted);
}

.sidebar-ad {
  margin: auto 16px 16px;
  border-radius: var(--pb-radius);
  overflow: hidden;

  img {
    width: 260px;
    height: auto;
    display: block;
  }
}

/* Content Card */
.content-card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: var(--pb-radius-lg);
  box-shadow: var(--pb-shadow-card);
  padding: 20px 24px 28px;
}

.empty-tip {
  margin: 24px 0 0;
  color: var(--pb-muted);
}

.main-title {
  display: inline-block;
  margin: 0 0 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1677ff;
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
  line-height: 1.4;
}

.api-group {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--pb-title);
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 3px solid var(--pb-primary);

  .group-count {
    color: var(--pb-muted);
    font-weight: 400;
    margin-left: 4px;
  }
}

.api-card {
  position: relative;
  padding: 16px 20px 18px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #fff;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding-right: 72px;
}

.card-icon {
  width: 36px;
  height: 36px;
  background: #1677ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  font-size: 18px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  height: 26px;
}

.card-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1.6;
}

.card-meta-container {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px 16px;

  .card-meta {
    font-size: 13px;
    color: #595959;
    margin-bottom: 4px;
    line-height: 1.7;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

@include below-lg {
  .api-page {
    flex-direction: column;
  }

  .sidebar-container,
  .sidebar-card {
    width: 100%;
  }

  .sidebar-card {
    position: static;
  }

  .sidebar-ad img {
    width: 100%;
    height: auto;
  }
}
</style>
