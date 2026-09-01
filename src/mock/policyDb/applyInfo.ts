import type { PolicyDbApplyInfo, PolicyDbItem, PolicyDbTag } from './types'

const industryToTag = (item: PolicyDbItem): string => {
  if (
    ['科技企业', '企业', '孵化器', '众创空间', '加速器', '服务业'].includes(
      item.industryTag,
    )
  ) {
    return '信息技术'
  }
  if (item.industryTag === '制造业') return '制造业'
  if (
    ['高等院校', '科研院所', '新型研发机构', '创新联合体'].includes(
      item.industryTag,
    )
  ) {
    return '教育科研'
  }
  return item.industryTag
}

const buildTags = (item: PolicyDbItem): PolicyDbTag[] => {
  const tags: PolicyDbTag[] = [
    { text: `${item.city} - ${item.department}`, color: 'blue' },
    { text: industryToTag(item), color: 'cyan' },
  ]
  if (
    item.name.includes('研究') ||
    item.name.includes('实验室') ||
    ['高等院校', '科研院所', '新型研发机构'].includes(item.industryTag)
  ) {
    tags.push({ text: '教育科研', color: 'orange' })
  } else if (item.name.includes('专精特新') || item.name.includes('制造')) {
    tags.push({ text: '财政扶持', color: 'purple' })
  } else {
    tags.push({ text: '产业培育', color: 'green' })
  }
  return tags
}

const dateFor = (id: number): string => {
  if (id === 1) return '2026-07-28'
  const month = String(((id - 1) % 8) + 1).padStart(2, '0')
  const day = String((id % 27) + 1).padStart(2, '0')
  return `2026-${month}-${day}`
}

const DEFAULT_FIELDS =
  '新一代信息技术、高端装备、新能源及智能网联汽车、生物医药、新材料、低空经济等战略性新兴产业，人工智能、氢能与新型储能、生物制造、量子科技、新一代信息网络、前沿新材料等未来产业。'

const buildApplyInfo = (item: PolicyDbItem): PolicyDbApplyInfo => {
  const methodName = `《${item.name}管理办法》`
  const docNo =
    item.id === 1 ? '郑发改高技〔2016〕559号' : `郑科〔2024〕${100 + item.id}号`

  return {
    fields:
      item.industryTag === '制造业'
        ? '智能工厂、工业互联网、高端装备、新材料、绿色制造、数字化转型等重点方向。'
        : DEFAULT_FIELDS,
    conditions: [
      '依托优势企业、科研单位、高校共同建设，需明确牵头单位和共建单位，申报单位需在我市注册成立并具有独立法人资格。',
      `符合${methodName}有关规定，研究方向符合我市产业发展规划和总体布局，发展思路清晰，任务和目标符合产业和技术发展趋势，建立规范的管理体制和运行机制，具备按期建设、正常运行和持续创新的各项支撑条件，且相同行业细分领域和方向上无已认定或命名的同类平台。建设期一般不超过2年。`,
    ],
    regulationNote: `注释：${methodName}规定：`,
    regulationClauses: [
      '在该领域中具有坚实的工程技术开发与成果转化工作基础、突出的科研特色和业绩；',
      '具有一批有待工程化开发、具有自主知识产权和良好市场前景的重大科技成果；',
      '具有科研成果工程化所需要的部分装备和基础设施，并能够为工程中心的建设、运行提供必要的配套保障，必须有资金、资产、技术、人才等实质性投入；',
      '在该领域中具有国内先进水平的研究开发和技术集成能力及相应的人才队伍，管理团队和技术带头人具有较强市场意识和科技成果转化的管理能力，在该领域有一支结构合理、工程化研究开发与转化素质较高的技术创新团队。',
    ],
    files: [
      {
        name: `${methodName}(${docNo})`,
        url: 'https://fgw.zhengzhou.gov.cn/',
      },
    ],
  }
}

export { buildApplyInfo, buildTags, dateFor }
