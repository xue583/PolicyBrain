<script setup lang="ts">
import { ref } from 'vue'
import {
  ApartmentOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import { declareEnterprises } from '@/mock/declare'
import {
  manageFollowSummary,
  manageHero,
  manageProfile,
  manageTabs,
} from '@/mock/manage'
import ManageExtraTab from './manage/ManageExtraTab.vue'

defineProps<{ role: 'enterprise' | 'service' }>()

defineOptions({ name: 'ManageList' })

const activeTab = ref<string>('基本信息')

/** 企服左侧企业面板，卡头 ☰ 图标可收起/展开 */
const panelOpen = ref(true)
const companyId = ref<number | undefined>(declareEnterprises[0]?.id)
const companyOptions = declareEnterprises.map((e) => ({
  label: e.name,
  value: e.id,
}))

/** 企业概况的是/否选择（设计稿：上市=否，高新区=是） */
const overview = ref({ ...manageProfile.overview })

interface TextField {
  label: string
  value: string
}

const legalRepLeft: TextField[] = [
  { label: '姓名', value: manageProfile.legalRep.name },
  { label: '联系电话', value: manageProfile.legalRep.tel },
  { label: 'E-mail', value: manageProfile.legalRep.email },
]
const legalRepRight: TextField[] = [
  { label: '手机', value: manageProfile.legalRep.phone },
  { label: '传真', value: manageProfile.legalRep.fax },
]
const contactLeft: TextField[] = [
  { label: '姓名', value: manageProfile.contact.name },
  { label: '联系电话', value: manageProfile.contact.tel },
  { label: 'E-mail', value: manageProfile.contact.email },
]
const contactRight: TextField[] = [
  { label: '手机', value: manageProfile.contact.phone },
  { label: '传真', value: manageProfile.contact.fax },
]
</script>

<template>
  <div class="manage-list">
    <aside v-if="role === 'service' && panelOpen" class="manage-aside">
      <h3 class="aside-title">企业管理</h3>
      <p class="aside-sub">{{ manageFollowSummary }}</p>
      <a-select
        v-model:value="companyId"
        class="aside-select"
        :options="companyOptions"
      />
      <button type="button" class="add-btn">
        <PlusOutlined class="add-icon" />
        <span>新增企业</span>
      </button>
    </aside>

    <section class="company-card">
      <div class="card-head">
        <span
          v-if="role === 'service'"
          class="collapse-btn"
          @click="panelOpen = !panelOpen"
        >
          <MenuOutlined class="collapse-icon" />
        </span>
        <span class="hero-avatar">
          <ApartmentOutlined class="avatar-glyph" />
        </span>
        <div class="hero-info">
          <h2 class="hero-name">{{ manageHero.name }}</h2>
          <p class="hero-meta">{{ manageHero.meta }}</p>
        </div>
      </div>

      <div class="tabs-row">
        <span
          v-for="tab in manageTabs"
          :key="tab"
          class="tab"
          :class="{ 'is-active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </span>
      </div>

      <div v-if="activeTab === '基本信息'" class="tab-panel">
        <div class="field-grid">
          <div class="field-col">
            <div class="field-row">
              <span class="field-label">统一社会信用代码</span>
              <span class="field-value">{{ manageProfile.creditCode }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">经营状态</span>
              <span class="field-value is-tag">
                <span class="status-tag">{{ manageProfile.status }}</span>
              </span>
            </div>
            <div class="field-row">
              <span class="field-label">所属行业</span>
              <span class="field-value">{{ manageProfile.industry }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">注册时间</span>
              <span class="field-value">{{ manageProfile.foundedDate }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">注册地址</span>
              <span class="field-value">{{ manageProfile.regAddress }}</span>
            </div>
          </div>
          <div class="field-col">
            <div class="field-row">
              <span class="field-label">企业名称</span>
              <span class="field-value">{{ manageProfile.name }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">公司类型</span>
              <span class="field-value">{{ manageProfile.companyType }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">注册资本</span>
              <span class="field-value">{{
                manageProfile.registeredCapital
              }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">行政区域</span>
              <span class="field-value">{{ manageProfile.region }}</span>
            </div>
          </div>
        </div>

        <h3 class="sec-title"><span class="sec-bar" />企业法定代表人</h3>
        <div class="field-grid">
          <div class="field-col">
            <div v-for="f in legalRepLeft" :key="f.label" class="field-row">
              <span class="field-label">{{ f.label }}</span>
              <span
                class="field-value"
                :class="{ 'is-empty': f.value === '——' }"
              >
                {{ f.value }}
              </span>
            </div>
          </div>
          <div class="field-col">
            <div v-for="f in legalRepRight" :key="f.label" class="field-row">
              <span class="field-label">{{ f.label }}</span>
              <span
                class="field-value"
                :class="{ 'is-empty': f.value === '——' }"
              >
                {{ f.value }}
              </span>
            </div>
          </div>
        </div>

        <h3 class="sec-title"><span class="sec-bar" />联系人</h3>
        <div class="field-grid">
          <div class="field-col">
            <div v-for="f in contactLeft" :key="f.label" class="field-row">
              <span class="field-label">{{ f.label }}</span>
              <span
                class="field-value"
                :class="{ 'is-empty': f.value === '——' }"
              >
                {{ f.value }}
              </span>
            </div>
          </div>
          <div class="field-col">
            <div v-for="f in contactRight" :key="f.label" class="field-row">
              <span class="field-label">{{ f.label }}</span>
              <span
                class="field-value"
                :class="{ 'is-empty': f.value === '——' }"
              >
                {{ f.value }}
              </span>
            </div>
          </div>
        </div>

        <h3 class="sec-title"><span class="sec-bar" />企业概况信息</h3>
        <div class="field-grid overview-grid">
          <div class="field-row">
            <span class="field-label ov-label">企业是否上市</span>
            <span class="choice-group">
              <button
                type="button"
                class="choice-btn"
                :class="{ 'is-active': overview.listed }"
                @click="overview.listed = true"
              >
                是
              </button>
              <button
                type="button"
                class="choice-btn"
                :class="{ 'is-active': !overview.listed }"
                @click="overview.listed = false"
              >
                否
              </button>
            </span>
          </div>
          <div class="field-row">
            <span class="field-label ov-label">上市时间/股票代码/上市类型</span>
            <span class="field-value">{{ overview.listedInfo }}</span>
          </div>
          <div class="field-row">
            <span class="field-label ov-label">是否属于国家高新区内企业</span>
            <span class="choice-group">
              <button
                type="button"
                class="choice-btn"
                :class="{ 'is-active': overview.inHighTechZone }"
                @click="overview.inHighTechZone = true"
              >
                是
              </button>
              <button
                type="button"
                class="choice-btn"
                :class="{ 'is-active': !overview.inHighTechZone }"
                @click="overview.inHighTechZone = false"
              >
                否
              </button>
            </span>
          </div>
          <div class="field-row">
            <span class="field-label ov-label">高新区名称/技术领域</span>
            <span class="field-value">{{ overview.zoneInfo }}</span>
          </div>
        </div>
      </div>

      <div v-else class="tab-panel">
        <ManageExtraTab :tab="activeTab" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.manage-list {
  display: flex;
  flex: 1;
  gap: 16px;
  align-items: flex-start;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.manage-aside {
  flex-shrink: 0;
  width: 176px;
  padding-top: 4px;
}

.aside-title {
  margin: 0;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.aside-sub {
  margin: 8px 0 14px;
  color: #999;
  font-size: 12px;
}

.aside-select {
  width: 100%;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 12px;
  padding: 8px 0;
  color: #333;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e2e6ee;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
    border-color: var(--pb-primary);
  }
}

.add-icon {
  font-size: 12px;
}

.company-card {
  flex: 1;
  min-width: 0;
  padding: 24px 32px 36px;
  background: #fff;
  border-radius: 16px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  display: inline-flex;
  align-items: center;
  margin-right: 2px;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }
}

.collapse-icon {
  font-size: 16px;
}

.hero-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #5b9cf6 0%, #2e6ce5 100%);
  border-radius: 50%;
}

.avatar-glyph {
  color: #fff;
  font-size: 22px;
}

.hero-info {
  min-width: 0;
}

.hero-name {
  margin: 0;
  color: #1f1f1f;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.hero-meta {
  margin: 6px 0 0;
  color: #999;
  font-size: 12px;
}

.tabs-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  justify-content: space-between;
  margin-top: 22px;
  border-bottom: 1px solid #f0f1f5;
}

.tab {
  position: relative;
  padding: 14px 2px 12px;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }

  &.is-active {
    color: var(--pb-primary);
    font-weight: 500;

    &::after {
      position: absolute;
      right: 0;
      bottom: -1px;
      left: 0;
      height: 2px;
      background: var(--pb-primary);
      border-radius: 1px;
      content: '';
    }
  }
}

.tab-panel {
  margin-top: 24px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 80px;
  align-items: start;
}

.field-row {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 10px;
}

.field-label {
  flex-shrink: 0;
  width: 116px;
  margin-right: 12px;
  color: #999;
  font-size: 14px;
  line-height: 1.4;
  text-align: right;
}

.field-value {
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 0 12px;
  color: #333;
  font-size: 14px;
  line-height: 34px;
  background: #f8f9fb;
  border: 1px solid #eef0f4;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &.is-empty {
    color: #9aa3b0;
  }

  &.is-tag {
    flex: none;
    width: auto;
    padding: 0;
    background: none;
    border: none;
  }
}

.status-tag {
  display: inline-block;
  padding: 0 16px;
  color: #52c41a;
  font-size: 14px;
  line-height: 34px;
  background: #f2fbec;
  border: 1px solid #d9f2c8;
  border-radius: 4px;
}

.sec-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 30px 0 18px;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.sec-bar {
  width: 4px;
  height: 16px;
  background: var(--pb-primary);
  border-radius: 2px;
}

.overview-grid .field-label {
  width: 200px;
  white-space: nowrap;
}

.choice-group {
  display: inline-flex;
  gap: 6px;
}

.choice-btn {
  width: 64px;
  height: 34px;
  color: #606266;
  font-size: 14px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &.is-active {
    color: var(--pb-primary);
    border-color: var(--pb-primary);
  }
}

@include below-lg {
  .manage-list {
    flex-direction: column;
    align-items: stretch;
  }

  .manage-aside {
    width: 100%;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .overview-grid .field-label {
    width: 116px;
    white-space: normal;
  }
}
</style>
