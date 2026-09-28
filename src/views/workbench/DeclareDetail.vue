<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  CheckOutlined,
  CloseOutlined,
  ExclamationOutlined,
  LeftOutlined,
} from '@ant-design/icons-vue'
import {
  declareConditions,
  declareEnterprises,
  declareYears,
  type DeclareCondition,
  type DeclarePolicy,
} from '@/mock/declare'
import emptySearchImg from '@/assets/workbench/wb-empty-search.png'

defineOptions({ name: 'DeclareDetail' })

const props = defineProps<{
  policy: DeclarePolicy
  role: 'enterprise' | 'service'
}>()

const emit = defineEmits<{
  back: []
}>()

const companyOptions = declareEnterprises.map((e) => ({
  label: e.name,
  value: e.id,
}))

const companyId = ref<number | undefined>(
  props.role === 'service' ? declareEnterprises[0]?.id : undefined,
)
const year = ref(declareYears[0])

const companySelected = computed(() => companyId.value != null)

const statusClassMap: Record<DeclareCondition['status'], string> = {
  符合: 'is-pass',
  不符合: 'is-fail',
  待核查: 'is-check',
}

const onEnter = () => {
  message.info('演示环境：申报流程暂未开通')
}
</script>

<template>
  <div class="declare-detail">
    <div class="crumb-bar">
      <button type="button" class="back-btn" @click="emit('back')">
        <LeftOutlined />
      </button>
      <div class="crumb-pill">
        <a class="crumb-link" @click="emit('back')">政策列表</a>
        <LeftOutlined class="crumb-sep" />
        <span class="crumb-current">政策选择</span>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-left">
        <h2 class="detail-title">{{ props.policy.name }}</h2>
        <p class="detail-sub">
          {{
            props.role === 'service' ? `${props.policy.name}申报` : '申报要求'
          }}
        </p>

        <div class="field-label">选择企业</div>
        <a-select
          v-model:value="companyId"
          class="detail-select"
          :options="companyOptions"
          placeholder="搜索并选择企业名称"
          show-search
          option-filter-prop="label"
        />

        <div class="field-label">选择年份</div>
        <a-select
          v-model:value="year"
          class="detail-select"
          :options="declareYears.map((y) => ({ label: y, value: y }))"
        />

        <a-button type="primary" class="enter-btn" @click="onEnter">
          进入申报
        </a-button>
      </div>

      <div class="detail-right">
        <h2 class="detail-title">申报条件与数据对比</h2>
        <p class="detail-sub">请先选择企业，查看该企业数据与政策条件的对比</p>

        <div v-if="!companySelected" class="empty-state">
          <img :src="emptySearchImg" alt="" class="empty-img" />
          <p class="empty-text">请选择筛选条件后点击“查看结果”</p>
        </div>

        <div v-else class="condition-list">
          <div
            v-for="(condition, i) in declareConditions"
            :key="i"
            class="condition-row"
            :class="statusClassMap[condition.status]"
          >
            <div class="row-head">
              <span class="status-pill">
                <CheckOutlined
                  v-if="condition.status === '符合'"
                  class="pill-icon"
                />
                <CloseOutlined
                  v-else-if="condition.status === '不符合'"
                  class="pill-icon"
                />
                <ExclamationOutlined v-else class="pill-icon" />
                {{ condition.status }}
              </span>
              <span class="row-title">{{ condition.title }}</span>
            </div>
            <p class="row-line">{{ condition.dataText }}</p>
            <p class="row-line">{{ condition.addressText }}</p>
            <svg viewBox="0 0 24 24" class="shield-mark" aria-hidden="true">
              <path
                d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
              />
              <path
                v-if="condition.status === '符合'"
                d="M8 12.2l2.6 2.6L16 9.4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else-if="condition.status === '不符合'"
                d="M9 9l6 6M15 9l-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                v-else
                d="M12 7.5v5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <circle
                v-if="condition.status === '待核查'"
                cx="12"
                cy="15.6"
                r="1"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.declare-detail {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 16px 28px 28px;
  overflow-y: auto;
}

.crumb-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #333;
  font-size: 14px;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(31, 56, 88, 0.06);
  cursor: pointer;

  &:hover {
    color: var(--pb-primary);
  }
}

.crumb-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(31, 56, 88, 0.06);
}

.crumb-link {
  color: #333;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: var(--pb-primary);
  }
}

.crumb-sep {
  color: #8ab6f5;
  font-size: 12px;
}

.crumb-current {
  color: var(--pb-primary);
  font-size: 14px;
}

.detail-card {
  display: flex;
  flex: 1;
  min-height: 560px;
  background: #fff;
  border-radius: 16px;
}

.detail-left {
  flex-shrink: 0;
  width: 400px;
  padding: 28px 32px;
  border-right: 1px solid #eef0f4;
}

.detail-right {
  flex: 1;
  min-width: 0;
  padding: 28px 32px;
}

.detail-title {
  margin: 0;
  color: #1f1f1f;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
}

.detail-sub {
  margin: 8px 0 0;
  color: #999;
  font-size: 13px;
  line-height: 1.5;
}

.field-label {
  margin: 22px 0 10px;
  color: #333;
  font-size: 14px;
}

.detail-select {
  width: 100%;
}

.enter-btn {
  margin-top: 26px;
  padding-inline: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 110px;
}

.empty-img {
  width: 220px;
  height: auto;
  object-fit: contain;
}

.empty-text {
  margin: 18px 0 0;
  color: #999;
  font-size: 13px;
}

.condition-list {
  margin-top: 20px;
}

.condition-row {
  position: relative;
  padding: 14px 18px;
  margin-bottom: 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-pass {
    background: linear-gradient(90deg, #f3fbf0 0%, #fdfffd 100%);
    border-color: #6ccf6f;
  }

  &.is-fail {
    background: linear-gradient(90deg, #fff2f0 0%, #fffdfd 100%);
    border-color: #ff4d4f;
  }

  &.is-check {
    background: linear-gradient(90deg, #fff8ee 0%, #fffdf9 100%);
    border-color: #ffa940;
  }
}

.row-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 2px 10px;
  color: #fff;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 6px;

  .is-pass & {
    background: #52c41a;
  }

  .is-fail & {
    background: #ff4d4f;
  }

  .is-check & {
    background: #ffa940;
  }
}

.pill-icon {
  font-size: 11px;
}

.row-title {
  color: #1f1f1f;
  font-size: 15px;
  font-weight: 600;
}

.row-line {
  margin: 5px 0 0;
  color: #666;
  font-size: 13px;
  line-height: 1.8;
}

.shield-mark {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 96px;
  height: 96px;
  pointer-events: none;
  opacity: 0.22;
  transform: translateY(-50%);

  .is-pass & {
    color: #52c41a;
  }

  .is-fail & {
    color: #ff4d4f;
  }

  .is-check & {
    color: #ffa940;
  }
}
</style>
