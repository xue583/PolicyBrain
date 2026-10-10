<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  RightOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue'
import {
  declarePolicies,
  declareRequirements,
  levelGroups,
  serviceCompanyName,
  serviceGroups,
  type DeclarePolicy,
  type DeclareTag,
  type ServiceGroup,
} from '@/mock/declare'
import bannerImg from '@/assets/workbench/wb-declare-banner.png'
import WbPageBanner from './components/WbPageBanner.vue'

defineOptions({ name: 'DeclareList' })

const props = defineProps<{
  role: 'enterprise' | 'service'
}>()

const emit = defineEmits<{
  select: [policy: DeclarePolicy]
}>()

const tagIconMap: Record<DeclareTag, unknown> = {
  可申报: CheckOutlined,
  待评估: ClockCircleOutlined,
  待培育: FlagOutlined,
}

const tagClassMap: Record<DeclareTag, string> = {
  可申报: 'is-apply',
  待评估: 'is-evaluate',
  待培育: 'is-cultivate',
}

const chipIconMap: Record<ServiceGroup, string> = {
  可申报: 'dianzan',
  待评估: 'huangqi',
  待培育: 'shuhongqi',
}

const chipCountClass: Record<string, string> = {
  可申报: 'is-teal',
  待评估: 'is-orange',
  待培育: 'is-red',
}

const enterpriseSections = computed(() =>
  levelGroups.map((group) => ({
    ...group,
    policies: declarePolicies.filter((p) => p.level === group.level),
  })),
)

const serviceSections = computed(() =>
  serviceGroups.map((group) => ({
    group,
    policies: declarePolicies.filter((p) => p.serviceGroup === group),
  })),
)
</script>

<template>
  <div class="declare-list">
    <WbPageBanner
      title="政策申报"
      description="选择需要申报的政策，填写相关信息后在线提交"
      :image="bannerImg"
      offset="120px"
    />

    <section class="page-card">
      <template v-if="props.role === 'enterprise'">
        <div
          v-for="section in enterpriseSections"
          :key="section.level"
          class="level-section"
        >
          <div class="group-head">
            <span class="group-bar" />
            <span class="group-name">{{ section.level }}</span>
            <span class="group-count"
              >{{ section.policies.length }}<i>项</i></span
            >
          </div>
          <div class="policy-grid is-5">
            <div
              v-for="policy in section.policies"
              :key="policy.id"
              class="policy-card"
              @click="emit('select', policy)"
            >
              <span class="card-icon">
                <svg viewBox="0 0 24 24" class="book-svg" aria-hidden="true">
                  <path
                    d="M3.5 5c2.9-.4 5.8.1 8 1.6v12.9c-2.2-1.5-5.1-2-8-1.6V5z"
                    fill="#4285f4"
                  />
                  <path
                    d="M20.5 5c-2.9-.4-5.8.1-8 1.6v12.9c2.2-1.5 5.1-2 8-1.6V5z"
                    fill="#1a56db"
                  />
                  <path
                    d="M12 4.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 10l-2.4 1.4.5-2.6-1.9-1.8 2.6-.4L12 4.2z"
                    fill="#fff"
                  />
                </svg>
              </span>
              <span class="card-body">
                <span class="card-title-row">
                  <span class="card-title">{{ policy.name }}</span>
                  <span
                    v-if="policy.tag"
                    class="tag-pill"
                    :class="tagClassMap[policy.tag]"
                  >
                    <component :is="tagIconMap[policy.tag]" class="tag-icon" />
                    {{ policy.tag }}
                  </span>
                </span>
                <span class="card-sub">{{ policy.subtitle }}</span>
              </span>
              <RightOutlined class="card-arrow" />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="company-head">
          <span class="company-icon"><SwapOutlined /></span>
          <span class="company-name">{{ serviceCompanyName }}</span>
        </div>
        <div
          v-for="section in serviceSections"
          :key="section.group"
          class="service-section"
        >
          <div class="chip-head">
            <span class="chip">
              <span class="chip-inner">
                <IconFont
                  class="chip-icon"
                  :name="chipIconMap[section.group]"
                  :size="20"
                />
                <span class="chip-label">{{ section.group }}</span>
              </span>
            </span>
            <span class="chip-count" :class="chipCountClass[section.group]">
              {{ section.policies.length }}
            </span>
          </div>
          <div class="policy-grid is-3">
            <div
              v-for="(policy, index) in section.policies"
              :key="policy.id"
              class="policy-card has-pop"
              @click="emit('select', policy)"
            >
              <span class="card-icon">
                <svg viewBox="0 0 24 24" class="book-svg" aria-hidden="true">
                  <path
                    d="M3.5 5c2.9-.4 5.8.1 8 1.6v12.9c-2.2-1.5-5.1-2-8-1.6V5z"
                    fill="#4285f4"
                  />
                  <path
                    d="M20.5 5c-2.9-.4-5.8.1-8 1.6v12.9c2.2-1.5 5.1-2 8-1.6V5z"
                    fill="#1a56db"
                  />
                  <path
                    d="M12 4.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 10l-2.4 1.4.5-2.6-1.9-1.8 2.6-.4L12 4.2z"
                    fill="#fff"
                  />
                </svg>
              </span>
              <span class="card-body">
                <span class="card-title-row">
                  <span class="card-title">{{ policy.name }}</span>
                  <span
                    v-if="policy.tag"
                    class="tag-pill"
                    :class="tagClassMap[policy.tag]"
                  >
                    <component :is="tagIconMap[policy.tag]" class="tag-icon" />
                    {{ policy.tag }}
                  </span>
                </span>
                <span class="card-sub">{{ policy.subtitle }}</span>
              </span>
              <RightOutlined class="card-arrow" />
              <div class="req-pop" :class="{ 'is-left': index % 3 === 2 }">
                <h3>{{ policy.name }}</h3>
                <p class="req-label">申报要求</p>
                <ol>
                  <li v-for="(item, i) in declareRequirements" :key="i">
                    {{ item }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped lang="scss">
.declare-list {
  flex: 1;
  padding: 20px 24px 28px;
  overflow-y: auto;
}

.page-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
  padding: 24px 22px 28px;
  background: #fff;
  border-radius: 16px;
}

.company-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--pb-line);
}

.company-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: #fff;
  font-size: 18px;
  background: #2f7bf5;
  border-radius: 9px;
}

.company-name {
  color: #1f1f1f;
  font-size: 20px;
  font-weight: 600;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.group-bar {
  width: 5px;
  height: 16px;
  background: var(--pb-primary);
  border-radius: 2px;
  transform: skewX(-12deg);
}

.group-name {
  color: #1f1f1f;
  font-size: 15px;
  font-weight: 600;
}

.group-count {
  color: #fa8c16;
  font-size: 18px;
  font-weight: 600;

  i {
    margin-left: 3px;
    color: #999;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
  }
}

.service-section {
  margin-top: 0;
}

.chip-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.chip {
  display: inline-flex;
  padding: 7px 20px;
  background: #fbfcfe;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 56, 88, 0.08);
  transform: skewX(-10deg);
}

.chip-inner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transform: skewX(10deg);
}

.chip-icon {
  font-size: 20px;
}

.chip-label {
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.chip-count {
  color: #0fb5ba;
  font-size: 27px;
  font-style: italic;
  font-weight: 700;
  line-height: 1;

  &.is-teal {
    color: transparent;
    -webkit-text-stroke: 1.5px #0fb5ba;
  }

  &.is-orange {
    color: transparent;
    -webkit-text-stroke: 1.5px #ff9c2e;
  }

  &.is-red {
    color: transparent;
    -webkit-text-stroke: 1.5px #ff4d4f;
  }
}

.policy-grid {
  display: grid;
  gap: 14px;

  &.is-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  &.is-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.policy-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8ebf1;
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--pb-primary);
    box-shadow: 0 4px 14px rgba(22, 119, 255, 0.1);

    .req-pop {
      display: block;
    }
  }
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #e8f3ff;
  border-radius: 9px;

  .book-svg {
    width: 24px;
    height: 24px;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.card-title {
  overflow: hidden;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 6px;
  color: #fff;
  font-size: 11px;
  line-height: 1.8;
  border-radius: 8px;

  &.is-apply {
    background: linear-gradient(90deg, #22c7c9, #0eb6ba);
  }

  &.is-evaluate {
    background: linear-gradient(90deg, #ffb03a, #ff8a1e);
  }

  &.is-cultivate {
    background: linear-gradient(90deg, #ff6b5e, #ff4d4f);
  }
}

.tag-icon {
  font-size: 9px;
}

.card-sub {
  overflow: hidden;
  color: #999;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-arrow {
  flex-shrink: 0;
  margin-left: auto;
  color: #333;
  font-size: 13px;
}

.req-pop {
  position: absolute;
  top: -12px;
  left: calc(100% + 12px);
  display: none;
  width: 252px;
  padding: 16px 18px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(31, 56, 88, 0.16);
  z-index: 30;

  &.is-left {
    left: auto;
    right: calc(100% + 12px);
  }

  h3 {
    margin: 0;
    color: #1f1f1f;
    font-size: 15px;
    font-weight: 600;
  }

  .req-label {
    margin: 6px 0 10px;
    color: #999;
    font-size: 13px;
  }

  ol {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  li {
    color: #555;
    font-size: 13px;
    line-height: 1.7;
  }
}

@include below-lg {
  .policy-grid.is-5,
  .policy-grid.is-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
