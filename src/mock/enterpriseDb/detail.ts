import { buildContacts } from './contacts'
import {
  HERO_SCOPE,
  LEGAL_REPS,
  districtOf,
  honorTagsOf,
  ipCountsOf,
  shortNameOf,
} from './helpers'
import {
  buildPatents,
  buildSoftwareCopyrights,
  buildTrademarks,
  buildWorkCopyrights,
} from './ip'
import { getEnterpriseById } from './list'
import { buildPolicyRecords } from './policies'
import { buildProductIndustry } from './products'
import {
  buildQualPersonnel,
  buildQualReviews,
  buildQualifications,
} from './qualifications'
import type { EnterpriseDetail } from './types'

export const getEnterpriseDetail = (
  id: number,
): EnterpriseDetail | undefined => {
  const item = getEnterpriseById(id)
  if (!item) return undefined

  const legalRep = LEGAL_REPS[(item.id - 1) % LEGAL_REPS.length] ?? '李某某'
  const phone =
    item.id === 1
      ? '0371-86543210'
      : `0371-86${String(item.id).padStart(6, '0')}`
  const district = districtOf(item)
  const staffCount = item.id === 1 ? 42 : 20 + item.policyCount * 3
  const ipCounts = ipCountsOf(item)
  const foundedDate =
    item.id === 1
      ? '2016-10-24'
      : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`

  return {
    ...item,
    shortName: shortNameOf(item.name),
    district,
    staffCount,
    honorTags: honorTagsOf(item),
    publicityAmount:
      item.id === 1 ? 367.04 : Number((item.policyCount * 4.8).toFixed(2)),
    legalRep,
    registeredCapital:
      item.id === 1 ? '1050.00' : `${(item.policyCount * 80).toFixed(2)}`,
    creditCode: `91410100MA9G${String(item.id).padStart(4, '0')}1X`,
    enterpriseType: '有限责任公司',
    phone,
    email:
      item.id === 1 ? '345299876@163.com' : `contact${item.id}@example.com`,
    foundedDate,
    staffScale: item.id === 1 ? '0' : String(staffCount),
    website:
      item.id === 1
        ? 'revogene.cn, www.revogene.com'
        : `https://www.enterprise-${item.id}.com`,
    businessScope:
      item.id === 1
        ? HERO_SCOPE
        : `${item.businessIndustry}；技术开发、技术服务、技术咨询。（除依法须经批准的项目外，凭营业执照依法自主开展经营活动）`,
    businessInfo: {
      registrationNumber:
        item.id === 1
          ? '410195000027899'
          : `410195${String(item.id).padStart(9, '0')}`,
      organizationCode: `MA3X74Y${String(item.id).padStart(2, '0')}`,
      registrationAuthority: `${district}市场监督管理局`,
      businessTerm: `${item.id === 1 ? '2016-10-24' : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`}至无固定期限`,
      approvalDate:
        item.id === 1
          ? '2016-10-24'
          : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
      insuredCount: staffCount,
      formerName: '-',
      registeredAddress:
        item.id === 1
          ? '河南省郑州市航空港区黄海路与生物科技二街交叉口东北角郑州临空生物医药园11号楼'
          : item.address,
      addressChangeDate:
        item.id === 1
          ? '2019-04-16'
          : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
    },
    policyRecords: buildPolicyRecords(item),
    patents: buildPatents(item, ipCounts.patent),
    trademarks: buildTrademarks(item, ipCounts.trademark),
    softwareCopyrights: buildSoftwareCopyrights(item, ipCounts.software),
    workCopyrights: buildWorkCopyrights(item, ipCounts.work),
    qualifications: buildQualifications(item),
    qualificationPersonnel: buildQualPersonnel(item),
    qualificationReviews: buildQualReviews(item),
    contacts: buildContacts(item),
    ...buildProductIndustry(item),
    portrait: {
      staffCount: `${staffCount}人`,
      siteArea: '未知',
      location: [item.province, item.city, district].filter(Boolean).join('-'),
      industry: item.industry || item.businessIndustry || '未知',
      yearsEstablished: yearsSince(foundedDate),
      revenue: '未知',
      assetLiabilityRatio: '未知',
      rdRatio: '未知',
      inventionPatents: '未知',
      utilityPatents: '未知',
      softwareCopyrights: `${ipCounts.software}项`,
      trademarks: `${ipCounts.trademark}项`,
      rdEquipmentValue: '未知',
      standards: '未知',
      systemLicenses: '未知',
      infoSoftware: '未知',
    },
  }
}

const yearsSince = (foundedDate: string) => {
  const date = new Date(`${foundedDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '未知'
  const now = new Date()
  let years = now.getFullYear() - date.getFullYear()
  const month = now.getMonth() - date.getMonth()
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) years -= 1
  return years >= 0 ? `${years}年` : '未知'
}
