import benefitSearch from '@/assets/membership/benefit-search.png'
import benefitExport from '@/assets/membership/benefit-export.png'
import benefitBatch from '@/assets/membership/benefit-batch.png'
import benefitMatch from '@/assets/membership/benefit-match.png'
import benefitQuery from '@/assets/membership/benefit-query.png'
import svipData from '@/assets/membership/svip-data.png'
import svipMatch from '@/assets/membership/svip-match.png'
import svipTech from '@/assets/membership/svip-tech.png'
import svipIndustry from '@/assets/membership/svip-industry.png'
import entBenefitSearch from '@/assets/membership/enterprise/benefit-search.png'
import entBenefitDeclare from '@/assets/membership/enterprise/benefit-declare.png'
import entBenefitBatch from '@/assets/membership/enterprise/benefit-batch.png'
import entBenefitMatch from '@/assets/membership/enterprise/benefit-match.png'
import entBenefitNurture from '@/assets/membership/enterprise/benefit-nurture.png'
import entBenefitRecommend from '@/assets/membership/enterprise/benefit-recommend.png'
import entSvipBenefitSearch from '@/assets/membership/enterprise/svip-benefit-search.png'
import entSvipBenefitDeclare from '@/assets/membership/enterprise/svip-benefit-declare.png'
import entSvipBenefitBatch from '@/assets/membership/enterprise/svip-benefit-batch.png'
import entSvipBenefitMatch from '@/assets/membership/enterprise/svip-benefit-match.png'
import entSvipBenefitNurture from '@/assets/membership/enterprise/svip-benefit-nurture.png'
import entSvipBenefitRecommend from '@/assets/membership/enterprise/svip-benefit-recommend.png'
import perkDiscount from '@/assets/membership/enterprise/perk-discount.png'
import perkConvenient from '@/assets/membership/enterprise/perk-convenient.png'
import perkFlexible from '@/assets/membership/enterprise/perk-flexible.png'
import perkCustom from '@/assets/membership/enterprise/perk-custom.png'

export type BenefitTone = 'vip' | 'svip' | 'org'

const personalVipIcons = [
  benefitSearch,
  benefitExport,
  benefitBatch,
  benefitMatch,
  benefitQuery,
]
const personalSvipIcons = [svipData, svipMatch, svipTech, svipIndustry]
const enterpriseIcons = {
  vip: [
    entBenefitSearch,
    entBenefitDeclare,
    entBenefitBatch,
    entBenefitMatch,
    entBenefitNurture,
    entBenefitRecommend,
  ],
  svip: [
    entSvipBenefitSearch,
    entSvipBenefitDeclare,
    entSvipBenefitBatch,
    entSvipBenefitMatch,
    entSvipBenefitNurture,
    entSvipBenefitRecommend,
  ],
  org: [perkDiscount, perkConvenient, perkFlexible, perkCustom],
}

const fromPool = (pool: string[], index: number, fallback: string) =>
  pool[index % pool.length] ?? fallback

/** 个人会员板和续费弹窗的个人视角 */
export const personalBenefitIcon = (
  tone: Exclude<BenefitTone, 'org'>,
  name: string,
  index: number,
) => {
  if (/导出/.test(name)) return benefitExport
  if (/批量/.test(name)) return benefitBatch
  if (/匹配/.test(name)) return benefitMatch
  if (/科技|成果/.test(name)) return svipTech
  if (/产业|上下游/.test(name)) return svipIndustry
  if (/申报|材料/.test(name)) return svipMatch
  if (/数据/.test(name)) return svipData
  if (/查询|搜索/.test(name)) return benefitSearch
  const pool = tone === 'svip' ? personalSvipIcons : personalVipIcons
  return fromPool(pool, index, benefitSearch)
}

/** 企业会员板和续费弹窗的企业视角 */
export const enterpriseBenefitIcon = (
  tone: BenefitTone,
  name: string,
  index: number,
) => {
  const pool = enterpriseIcons[tone]
  if (/申报/.test(name)) {
    return tone === 'svip' ? entSvipBenefitDeclare : entBenefitDeclare
  }
  if (/批量/.test(name)) {
    return tone === 'svip' ? entSvipBenefitBatch : entBenefitBatch
  }
  if (/匹配/.test(name)) {
    return tone === 'svip' ? entSvipBenefitMatch : entBenefitMatch
  }
  if (/培育/.test(name)) {
    return tone === 'svip' ? entSvipBenefitNurture : entBenefitNurture
  }
  if (/推荐/.test(name)) {
    return tone === 'svip' ? entSvipBenefitRecommend : entBenefitRecommend
  }
  if (/搜索|查询/.test(name)) {
    return tone === 'svip' ? entSvipBenefitSearch : entBenefitSearch
  }
  if (/优惠/.test(name)) return perkDiscount
  if (/便捷|发票/.test(name)) return perkConvenient
  if (/灵活|成员/.test(name)) return perkFlexible
  if (/定制/.test(name)) return perkCustom
  return fromPool(pool, index, entBenefitSearch)
}
