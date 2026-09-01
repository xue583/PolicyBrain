<script setup lang="ts">
import { ref } from 'vue'
import {
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons-vue'
import advertisementImg from '@/assets/api/advertisement.png'
import openImg from '@/assets/api/open.png'
import notOpenImg from '@/assets/api/notOpen.png'

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

const apiMainCategory = ref<ApiMainCategory>({
  name: '政策接口',
  count: 9,
  groups: [
    {
      name: '政策文件',
      count: 3,
      items: [
        {
          id: 1,
          name: '查询政策文件列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 2,
          name: '查询政策文件列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 3,
          name: '查询政策文件列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: false,
        },
      ],
    },
    {
      name: '政策资讯',
      count: 3,
      items: [
        {
          id: 4,
          name: '查询政策资讯',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 5,
          name: '查询政策资讯',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 6,
          name: '查询政策资讯',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: false,
        },
      ],
    },
    {
      name: '政策资讯',
      count: 3,
      items: [
        {
          id: 7,
          name: '查询政策资讯列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 8,
          name: '查询政策资讯列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
        {
          id: 9,
          name: '查询政策资讯列表',
          description:
            '针对区域政策的综合信息，包含：发布单位、发布地区、政策文号、发文标题、发文正文等信息。',
          code: '908001',
          returnData:
            '发布单位、发布地区、政策文号、发文标题、发文正文、标签、发文时间',
          isOpen: true,
        },
      ],
    },
  ],
})

const menuItems = [
  { key: '政策接口', label: '政策接口', count: 9, icon: FileTextOutlined },
  { key: '企业接口', label: '企业接口', count: 12, icon: TeamOutlined },
  { key: '财税接口', label: '财税接口', count: 5, icon: DollarOutlined },
  {
    key: '信用资质接口',
    label: '信用资质接口',
    count: 5,
    icon: SafetyCertificateOutlined,
  },
]
const totalApiCount = menuItems.reduce((sum, item) => sum + item.count, 0)
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
          {{ apiMainCategory.name }}
          <span class="main-count">({{ apiMainCategory.count }}个)</span>
        </h2>

        <div
          v-for="group in apiMainCategory.groups"
          :key="group.name"
          class="api-group"
        >
          <h3 class="group-title">
            {{ group.name }}
            <span class="group-count">{{ group.count }}</span>
          </h3>

          <div v-for="item in group.items" :key="item.id" class="api-card">
            <div class="card-icon">
              <FileTextOutlined />
            </div>
            <div class="card-body">
              <div class="card-header">
                <h4 class="card-title">{{ item.name }}</h4>
                <img
                  :src="item.isOpen ? openImg : notOpenImg"
                  :alt="item.isOpen ? '开放' : '未开放'"
                  class="status-badge"
                />
              </div>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">接口编号：{{ item.code }}</div>
              <div class="card-meta">返回数据：{{ item.returnData }}</div>
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
  gap: var(--pb-gap);
  margin-top: 50px;
  align-items: flex-start;
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  gap: var(--pb-gap);
  align-items: center;
}

/* Sidebar Card */
.sidebar-card {
  width: 340px;
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
  padding: 12px 0;

  :deep(.ant-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px 12px;
    padding-inline: 12px;
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
  color: var(--pb-muted);
  margin-right: 10px;
  font-size: 14px;

  .ant-menu-item-selected & {
    color: var(--pb-primary);
  }
}

.menu-text {
  flex: 1;
  font-size: 14px;
  color: var(--pb-text);
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
    width: 340px;
    height: 240px;
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
  padding: 28px 32px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* 隐藏滚动条但保留滚动功能 */
.content-card::-webkit-scrollbar {
  display: none;
}

.content-card {
  scrollbar-width: none; /* Firefox */
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--pb-title);
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--pb-line);

  .main-count {
    color: var(--pb-muted);
    font-weight: 400;
    margin-left: 4px;
  }
}

.api-group {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  font-size: 16px;
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
  display: flex;
  padding: 24px;
  border: 1px solid var(--pb-line);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s;

  &:hover {
    border-color: #d9d9d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.card-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #4a90e2 0%, #50c6ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  margin-right: 20px;
  font-size: 24px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--pb-title);
  margin: 0;
}

.status-badge {
  height: 22px;
}

.card-desc {
  font-size: 14px;
  color: var(--pb-sub);
  margin: 0 0 12px;
  line-height: 1.6;
}

.card-meta {
  font-size: 13px;
  color: var(--pb-text);
  margin-bottom: 4px;
  line-height: 1.8;

  &:last-child {
    margin-bottom: 0;
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
