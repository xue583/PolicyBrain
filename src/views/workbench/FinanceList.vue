<script setup lang="ts">
import { ref } from 'vue'
import {
  BankFilled,
  DownOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UpOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { financeBanks, type FinanceBank } from '@/mock/finance'
import bannerImg from '@/assets/workbench/wb-finance-banner.png'

defineOptions({ name: 'FinanceList' })

/** 默认展开第一家银行，与设计稿一致 */
const selectedId = ref<number | null>(financeBanks[0]?.id ?? null)

const toggleBank = (bank: FinanceBank) => {
  selectedId.value = selectedId.value === bank.id ? null : bank.id
}
</script>

<template>
  <div class="finance-list">
    <section
      class="page-banner"
      :style="{ backgroundImage: `url(${bannerImg})` }"
    >
      <div class="banner-text">
        <h2>科技金融</h2>
        <p>郑州本地合作银行，为科技企业提供专属贷款支持</p>
      </div>
    </section>

    <section class="page-card">
      <div class="bank-grid">
        <div
          v-for="bank in financeBanks"
          :key="bank.id"
          class="bank-item"
          :class="{ 'is-expanded': selectedId === bank.id }"
        >
          <div class="bank-card" @click="toggleBank(bank)">
            <div class="bank-head">
              <span class="bank-icon">
                <BankFilled class="bank-icon-glyph" />
              </span>
              <span class="bank-name">{{ bank.name }}</span>
              <span class="bank-toggle">
                <UpOutlined v-if="selectedId !== bank.id" class="toggle-icon" />
                <DownOutlined v-else class="toggle-icon" />
              </span>
            </div>
            <div class="bank-stats">
              <div class="stat">
                <span class="stat-label">最新贷款</span>
                <div class="stat-value">
                  {{ bank.amount }}<span class="stat-unit">万元</span>
                </div>
              </div>
              <div class="stat">
                <span class="stat-label">最新贷款</span>
                <div class="stat-value">{{ bank.rate }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedId === bank.id" class="bank-detail">
            <p class="detail-row">
              <EnvironmentOutlined class="detail-icon" />
              <span>{{ bank.branch }}</span>
            </p>
            <p class="detail-row">
              <span class="detail-cell">
                <UserOutlined class="detail-icon" />
                <span>客户经理:{{ bank.manager }}</span>
              </span>
              <span class="detail-cell">
                <PhoneOutlined class="detail-icon" />
                <span>{{ bank.phone }}</span>
              </span>
            </p>
            <p class="detail-row">
              <EnvironmentOutlined class="detail-icon" />
              <span>{{ bank.address }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.finance-list {
  flex: 1;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.page-banner {
  display: flex;
  align-items: center;
  min-height: 100px;
  padding: 18px 26px 18px 90px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  border-radius: 16px;
}

.banner-text {
  h2 {
    margin: 0;
    color: #1f1f1f;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    margin: 6px 0 0;
    color: #999;
    font-size: 14px;
    line-height: 1.5;
  }
}

.page-card {
  margin-top: 20px;
  padding: 24px 22px 28px;
  background: #fff;
  border-radius: 16px;
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  align-items: start;
}

.bank-item {
  min-width: 0;

  &.is-expanded {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(31, 86, 168, 0.14);
  }
}

.bank-card {
  padding: 14px 15px 16px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: #c9dff9;
    box-shadow: 0 4px 12px rgba(31, 86, 168, 0.08);
  }
}

.bank-item.is-expanded .bank-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(100deg, #d8e9fe 0%, #e9f3ff 46%, #f7fbff 100%);
  border-color: #2e7cf6;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        110px 80px at 84% 18%,
        rgba(255, 255, 255, 0.85),
        transparent 70%
      ),
      radial-gradient(
        150px 100px at 72% 120%,
        rgba(178, 208, 246, 0.5),
        transparent 72%
      );
    pointer-events: none;
  }

  &:hover {
    border-color: #2e7cf6;
    box-shadow: none;
  }
}

.bank-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bank-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: linear-gradient(180deg, #eaf4ff 0%, #d7e9ff 100%);
  border-radius: 9px;
}

.bank-icon-glyph {
  color: #2e7cf6;
  font-size: 19px;
}

.bank-name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.bank-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-left: auto;
  background: #ccd3dc;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.toggle-icon {
  color: #fff;
  font-size: 11px;
}

.bank-item.is-expanded .bank-toggle {
  background: var(--pb-primary);
}

.bank-stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 34px;
  padding-left: 44px;
  margin-top: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: #999;
  font-size: 12px;
  line-height: 1.2;
}

.stat-value {
  color: var(--pb-primary);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}

.stat-unit {
  margin-left: 3px;
  color: #8fa8c8;
  font-size: 12px;
  font-weight: 400;
}

.bank-detail {
  padding: 14px 15px 6px;
  font-size: 13px;
  line-height: 1.5;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 12px;
  color: #333;
  word-break: break-all;
}

.detail-cell {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-icon {
  margin-top: 1px;
  color: #555;
  font-size: 14px;
}

@include below-lg {
  .bank-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: $bp-sm) {
  .bank-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-banner {
    padding-left: 26px;
  }
}
</style>
