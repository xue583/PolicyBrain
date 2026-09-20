import type {
  EnterpriseIndustryChain,
  EnterpriseItem,
  EnterpriseProduct,
  ProductCredibility,
  ProductIconKind,
} from './types'

const PRODUCT_CATALOG: Record<
  string,
  { icon: ProductIconKind; chain: [string, string, string] }
> = {
  药品制剂: { icon: 'pharma', chain: ['医药健康', '化学制药', '化学制剂'] },
  包装材料与制品: {
    icon: 'packaging',
    chain: ['轻工制造', '造纸包装', '包装印刷'],
  },
  软件开发与信息技术服务: {
    icon: 'software',
    chain: ['信息技术', '软件服务', '应用软件'],
  },
  集成电路: { icon: 'electronics', chain: ['电子信息', '半导体', '集成电路'] },
  电子元器件: {
    icon: 'electronics',
    chain: ['电子信息', '电子器件', '元器件'],
  },
  工业软件: { icon: 'software', chain: ['信息技术', '软件服务', '工业软件'] },
  云计算: { icon: 'software', chain: ['信息技术', '云计算', '云服务'] },
  智能终端: {
    icon: 'electronics',
    chain: ['电子信息', '智能硬件', '智能终端'],
  },
  电子信息: {
    icon: 'electronics',
    chain: ['电子信息', '电子制造', '电子设备'],
  },
  新材料: { icon: 'material', chain: ['先进制造', '新材料', '功能材料'] },
  科研服务: {
    icon: 'research',
    chain: ['科学研究', '专业技术服务', '研发服务'],
  },
  生物医药: { icon: 'pharma', chain: ['医药健康', '生物制药', '生物制品'] },
  人工智能: { icon: 'ai', chain: ['信息技术', '人工智能', '智能算法'] },
  算力服务: { icon: 'ai', chain: ['信息技术', '云计算', '算力服务'] },
  现代物流: { icon: 'logistics', chain: ['交通运输', '物流仓储', '现代物流'] },
  跨境电商: { icon: 'logistics', chain: ['商贸流通', '电子商务', '跨境电商'] },
  数字化转型: {
    icon: 'software',
    chain: ['信息技术', '软件服务', '数字化服务'],
  },
}

const CREDIBILITY_LEVELS: ProductCredibility[] = ['高', '中', '低']
const PRODUCT_BASIS_OPTIONS = [
  '专利 · 软著',
  '专利 · 标准',
  '软著 · 认证',
  '专利 · 软著 · 认证',
  '专利 · 标准 · 软著',
]

const buildProductIndustry = (item: EnterpriseItem) => {
  const products: EnterpriseProduct[] = item.tags.map((name, index) => ({
    id: index + 1,
    name,
    icon: PRODUCT_CATALOG[name]?.icon ?? 'default',
  }))
  const industryChains: EnterpriseIndustryChain[] = item.tags.map(
    (name, index) => ({
      id: index + 1,
      levels: PRODUCT_CATALOG[name]?.chain ?? [
        item.industry,
        item.businessIndustry,
        name,
      ],
    }),
  )
  // 根据企业 ID 确定性地选择可信度和产品依据
  const credibility = CREDIBILITY_LEVELS[item.id % CREDIBILITY_LEVELS.length]
  const basis = PRODUCT_BASIS_OPTIONS[item.id % PRODUCT_BASIS_OPTIONS.length]
  return {
    products,
    industryChains,
    productBasis: basis,
    productCredibility: credibility,
  }
}

export { buildProductIndustry }
