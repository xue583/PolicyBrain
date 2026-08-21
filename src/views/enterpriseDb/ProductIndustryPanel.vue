<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue'
import type {
  EnterpriseIndustryChain,
  EnterpriseProduct,
  ProductCredibility,
} from '../../mock/enterpriseDb'
import titleStyleBg from '../../assets/home/title-style.png'
import emptyIllustration from '../../assets/enterpriseDb/empty-illustration.png'

defineOptions({ name: 'EnterpriseProductIndustryPanel' })

defineProps<{
  products: EnterpriseProduct[]
  industryChains: EnterpriseIndustryChain[]
  basis: string
  credibility: ProductCredibility
}>()
</script>

<template>
  <section
    class="product-panel"
    :style="{ '--section-title-bg': `url(${titleStyleBg})` }"
  >
    <template v-if="!products.length">
      <div class="tab-empty">
        <img :src="emptyIllustration" alt="" />
        <p>暂无产品/产业信息</p>
      </div>
    </template>

    <template v-else>
      <h2 class="section-title">产品/服务</h2>
      <div class="product-tags">
        <span v-for="item in products" :key="item.id" class="product-tag">
          <svg
            class="product-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <g v-if="item.icon === 'pharma'" transform="rotate(45 8 8)">
              <rect x="5.1" y="1.8" width="5.8" height="12.4" rx="2.9" />
              <path d="M5.1 8h5.8" />
            </g>
            <g v-else-if="item.icon === 'packaging'">
              <path d="M2.4 6.1 8 3.2l5.6 2.9L8 9 2.4 6.1Z" />
              <path d="M2.4 6.1V11L8 13.8V9" />
              <path d="M13.6 6.1V11L8 13.8" />
            </g>
            <g v-else-if="item.icon === 'software'">
              <rect x="1.6" y="2.4" width="12.8" height="8.2" rx="1.4" />
              <path d="M5.2 13.6h5.6M8 10.6v3" />
            </g>
            <g v-else-if="item.icon === 'electronics'">
              <rect x="3.2" y="3.6" width="9.6" height="8" rx="1" />
              <path
                d="M6 13.6h4M5.6 2.4v1.2M10.4 2.4v1.2M5.6 11.6v1.2M10.4 11.6v1.2"
              />
            </g>
            <g v-else-if="item.icon === 'material'">
              <path d="M8 2.4 13.6 8 8 13.6 2.4 8 8 2.4Z" />
              <path d="M5.2 8h5.6" />
            </g>
            <g v-else-if="item.icon === 'logistics'">
              <path d="M2 5h8.2v6.4H2V5Z" />
              <path d="M10.2 6.6H14l1.2 2.2v2.6h-5" />
              <circle cx="4.6" cy="12.4" r="1.2" />
              <circle cx="12.2" cy="12.4" r="1.2" />
            </g>
            <g v-else-if="item.icon === 'ai'">
              <circle cx="8" cy="8" r="2.6" />
              <path
                d="M8 2.6v1.4M8 12v1.4M2.6 8h1.4M12 8h1.4M4.3 4.3l1 1M10.7 10.7l1 1M11.7 4.3l-1 1M5.3 10.7l-1 1"
              />
            </g>
            <g v-else-if="item.icon === 'research'">
              <circle cx="7.2" cy="7" r="3.4" />
              <path d="M9.6 9.6 13.4 13.4" />
            </g>
            <g v-else>
              <rect x="2.4" y="2.4" width="4.8" height="4.8" rx="0.8" />
              <rect x="8.8" y="2.4" width="4.8" height="4.8" rx="0.8" />
              <rect x="2.4" y="8.8" width="4.8" height="4.8" rx="0.8" />
              <rect x="8.8" y="8.8" width="4.8" height="4.8" rx="0.8" />
            </g>
          </svg>
          {{ item.name }}
        </span>
      </div>

      <h2 class="section-title industry-title">产业归属</h2>
      <div class="industry-grid">
        <template v-for="chain in industryChains" :key="chain.id">
          <div
            v-for="(level, index) in chain.levels"
            :key="`${chain.id}-${index}`"
            class="industry-cell"
          >
            {{ level }}
          </div>
        </template>
      </div>

      <div class="product-footer">
        <p class="basis">
          <FileTextOutlined />
          判断依据：{{ basis }}
        </p>
        <p class="credibility">
          可信度：<em>{{ credibility }}</em>
        </p>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: #262626;
  background: var(--section-title-bg) no-repeat left center;
  background-size: 94px 26px;
}

.industry-title {
  margin-top: 28px;
}

.tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 16px;
  color: #8c8c8c;

  img {
    width: min(420px, 100%);
    height: auto;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
  }
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.product-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px 0 12px;
  border: 1px solid #d9e4f5;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  line-height: 1;
  color: #262626;
}

.product-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--pb-primary);
}

.industry-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
}

.industry-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f5f6f8;
  font-size: 14px;
  line-height: 1.4;
  color: #262626;
  text-align: center;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 28px;
  font-size: 13px;
  color: #8c8c8c;
}

.basis,
.credibility {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.basis :deep(.anticon) {
  font-size: 15px;
}

.credibility em {
  font-style: normal;
  color: var(--pb-primary);
}

@media (max-width: 768px) {
  .industry-grid {
    grid-template-columns: 1fr;
  }

  .product-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
