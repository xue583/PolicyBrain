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
    foundedDate:
      item.id === 1
        ? '2016-10-24'
        : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
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
      formerName: '—',
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
  }
}
