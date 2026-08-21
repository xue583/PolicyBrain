export interface ExportEnterprise {
  id: number
  name: string
  address: string
  province: string
  industry: string
  policyCount: number
  policies: string[]
  year: number
  ipTypes: string[]
  capitalRange: string
  ageRange: string
  economyType: string
}

export const exportEnterpriseTotal = 5_130_511

export const hotPolicies = [
  '高新技术企业',
  '国家科技型中小企业',
  '专精特新“小巨人”企业',
  '专精特新中小企业',
  '创新型中小企业',
  '技术先进型服务企业',
  '科技小巨人企业',
  '瞪羚企业',
  '制造业单项冠军',
  '隐形冠军企业',
]

export const policyYears = [2021, 2022, 2023, 2024, 2025, 2026]

export const provinces = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
]

export const electronicsIndustry = '计算机、通信和其他电子设备制造业'

export const exportIndustries = [
  electronicsIndustry,
  '软件和信息技术服务业',
  '科学研究和技术服务业',
  '专用设备制造业',
  '电气机械和器材制造业',
  '医药制造业',
  '汽车制造业',
  '非金属矿物制品业',
]

export const ipOptions = [
  '发明专利',
  '实用新型',
  '外观设计',
  '软件著作权',
  '无知识产权',
]

export const capitalOptions = [
  '100万以下',
  '100-500万',
  '500-1000万',
  '1000万-5000万',
  '5000万以上',
]

export const ageOptions = ['1年以内', '1-3年', '3-5年', '5-10年', '10年以上']

export const economyOptions = [
  '有限责任公司',
  '股份有限公司',
  '国有企业',
  '外商投资企业',
  '个体工商户',
  '其他',
]

const defaultMeta = {
  province: '河南省',
  industry: electronicsIndustry,
  policies: ['高新技术企业', '国家科技型中小企业'],
  year: 2026,
  ipTypes: ['发明专利'],
  capitalRange: '1000万-5000万',
  ageRange: '5-10年',
  economyType: '有限责任公司',
} as const

/** 截图第一页企业，顺序与设计稿一致 */
const featured: Array<Omit<ExportEnterprise, 'id'>> = [
  {
    ...defaultMeta,
    name: '河南瑞格卡电子有限公司',
    address: '许昌经济技术开发区阳光大道科技创业园',
    policyCount: 1,
    policies: ['国家科技型中小企业'],
    ipTypes: ['实用新型'],
    capitalRange: '100-500万',
    ageRange: '1-3年',
  },
  {
    ...defaultMeta,
    name: '河南宇芯精密科技有限公司',
    address: '郑州航空港经济综合实验区工业园区5号楼',
    policyCount: 12,
    policies: ['高新技术企业', '专精特新“小巨人”企业', '瞪羚企业'],
    ipTypes: ['发明专利', '实用新型'],
    capitalRange: '5000万以上',
    ageRange: '10年以上',
  },
  {
    ...defaultMeta,
    name: '河南巴拉斯光电科技有限公司',
    address: '开封市尉氏县姚庄村',
    policyCount: 2,
    policies: ['创新型中小企业'],
    ipTypes: ['外观设计'],
    capitalRange: '100-500万',
    ageRange: '3-5年',
  },
  {
    ...defaultMeta,
    name: '河南瑞光电子科技有限公司',
    address: '新乡市平原示范区平原路188号',
    policyCount: 5,
    policies: ['高新技术企业', '专精特新中小企业'],
    ipTypes: ['发明专利', '软件著作权'],
  },
  {
    ...defaultMeta,
    name: '河南中科光电有限公司',
    address: '洛阳市涧西区丽春路8号',
    policyCount: 1,
    policies: ['国家科技型中小企业'],
    ipTypes: ['无知识产权'],
    capitalRange: '100万以下',
    ageRange: '1年以内',
  },
  {
    ...defaultMeta,
    name: '河南华芯半导体有限公司',
    address: '郑州市高新区冬青街26号',
    policyCount: 8,
    policies: ['高新技术企业', '专精特新中小企业', '瞪羚企业'],
    ipTypes: ['发明专利', '实用新型'],
    capitalRange: '5000万以上',
    ageRange: '10年以上',
    economyType: '股份有限公司',
  },
  {
    ...defaultMeta,
    name: '河南星河显示科技有限公司',
    address: '开封市示范区汉兴路与昌盛路交叉口',
    policyCount: 3,
    policies: ['国家科技型中小企业', '创新型中小企业'],
    ipTypes: ['实用新型', '外观设计'],
    capitalRange: '500-1000万',
    ageRange: '3-5年',
  },
  {
    ...defaultMeta,
    name: '河南智联通信设备有限公司',
    address: '安阳市高新区长江大道',
    policyCount: 4,
    policies: ['高新技术企业', '创新型中小企业'],
    ipTypes: ['软件著作权'],
  },
  {
    ...defaultMeta,
    name: '河南精工电子装备有限公司',
    address: '南阳市高新区光电产业园B区',
    policyCount: 6,
    policies: ['高新技术企业', '专精特新中小企业'],
    ipTypes: ['发明专利', '实用新型'],
  },
  {
    ...defaultMeta,
    name: '河南光电显示材料有限公司',
    address: '濮阳市华龙区胜利路产业园3号',
    policyCount: 7,
    policies: ['高新技术企业', '科技小巨人企业'],
    ipTypes: ['发明专利'],
    capitalRange: '5000万以上',
    economyType: '外商投资企业',
  },
]

const extraSites = [
  { city: '郑州', address: '郑州市高新技术产业开发区长椿路11号' },
  { city: '洛阳', address: '洛阳市涧西区丽春西路8号' },
  { city: '新乡', address: '新乡市红旗区新飞大道1789号' },
  { city: '南阳', address: '南阳市高新区光电产业园B区' },
  { city: '开封', address: '开封市示范区汉兴路与昌盛路交叉口' },
  { city: '安阳', address: '安阳市文峰区高新区长江大道' },
  { city: '濮阳', address: '濮阳市华龙区胜利路产业园3号' },
  { city: '商丘', address: '商丘市梁园区南京路88号' },
  { city: '周口', address: '周口市川汇区开元大道66号' },
  { city: '许昌', address: '许昌市建安区尚集产业集聚区' },
  { city: '焦作', address: '焦作市解放区工业园区纬三路' },
  { city: '平顶山', address: '平顶山市新华区建设路南段' },
  { city: '鹤壁', address: '鹤壁市淇滨区金山工业园区' },
  { city: '驻马店', address: '驻马店市驿城区开源大道19号' },
  { city: '三门峡', address: '三门峡市陕州区产业集聚区经三路' },
  { city: '信阳', address: '信阳市羊山新区新五大道' },
  { city: '济源', address: '济源市虎岭产业集聚区' },
  { city: '漯河', address: '漯河市召陵区珠江路与金山路交叉口' },
]

const extraKinds = [
  '芯联电子科技',
  '瑞光电器件',
  '智控通信设备',
  '光电显示科技',
  '精工电子',
  '半导体材料',
  '电路科技',
  '智能终端',
  '传感技术',
  '精密电子',
]

const policyPool = [
  ['高新技术企业'],
  ['国家科技型中小企业'],
  ['创新型中小企业'],
  ['高新技术企业', '专精特新中小企业'],
  ['科技小巨人企业'],
  ['高新技术企业', '瞪羚企业'],
  ['专精特新“小巨人”企业'],
  ['技术先进型服务企业'],
]

const ipPool = [
  ['发明专利'],
  ['实用新型'],
  ['软件著作权'],
  ['发明专利', '实用新型'],
  ['外观设计'],
  ['无知识产权'],
]

function buildElectronicsExtras(
  count: number,
): Array<Omit<ExportEnterprise, 'id'>> {
  const featuredNames = new Set(featured.map((item) => item.name))
  const rows: Array<Omit<ExportEnterprise, 'id'>> = []

  for (let i = 0; rows.length < count; i++) {
    const site = extraSites[i % extraSites.length]
    const kind =
      extraKinds[Math.floor(i / extraSites.length) % extraKinds.length]
    const round = Math.floor(i / (extraSites.length * extraKinds.length))
    const name =
      round === 0
        ? `${site.city}${kind}有限公司`
        : `${site.city}${kind}${round + 1}有限公司`
    if (featuredNames.has(name)) continue

    rows.push({
      ...defaultMeta,
      name,
      address: site.address,
      policyCount: (i % 12) + 1,
      policies: policyPool[i % policyPool.length],
      year: policyYears[i % policyYears.length],
      ipTypes: ipPool[i % ipPool.length],
      capitalRange: capitalOptions[i % capitalOptions.length],
      ageRange: ageOptions[i % ageOptions.length],
      economyType: economyOptions[i % economyOptions.length],
    })
  }

  return rows
}

const otherIndustrySeeds: Array<Omit<ExportEnterprise, 'id'>> = [
  {
    ...defaultMeta,
    name: '郑州云智软件科技有限公司',
    address: '郑州市金水区杨金路牛顿国际A座',
    industry: '软件和信息技术服务业',
    policyCount: 9,
    policies: ['高新技术企业', '技术先进型服务企业', '瞪羚企业'],
    ipTypes: ['软件著作权', '发明专利'],
  },
  {
    ...defaultMeta,
    name: '洛阳先进材料研究院有限公司',
    address: '洛阳市洛龙区开元大道与关林路交叉口',
    industry: '科学研究和技术服务业',
    policyCount: 6,
    policies: ['高新技术企业', '科技小巨人企业'],
    year: 2025,
    capitalRange: '5000万以上',
    ageRange: '10年以上',
    economyType: '国有企业',
  },
  {
    ...defaultMeta,
    name: '许昌智能装备有限公司',
    address: '许昌市建安区尚集产业集聚区',
    industry: '专用设备制造业',
    policyCount: 5,
    policies: ['专精特新“小巨人”企业', '制造业单项冠军'],
    ipTypes: ['发明专利', '实用新型'],
    capitalRange: '5000万以上',
    ageRange: '10年以上',
    economyType: '股份有限公司',
  },
  {
    ...defaultMeta,
    name: '新乡生物医药有限公司',
    address: '新乡市平原示范区生命科学园',
    industry: '医药制造业',
    policyCount: 4,
    policies: ['高新技术企业', '瞪羚企业'],
    year: 2024,
  },
  {
    ...defaultMeta,
    name: '焦作汽车电子有限公司',
    address: '焦作市解放区工业园区纬三路',
    industry: '汽车制造业',
    policyCount: 2,
    policies: ['国家科技型中小企业'],
    year: 2023,
    ipTypes: ['实用新型'],
    capitalRange: '500-1000万',
    ageRange: '3-5年',
  },
  {
    ...defaultMeta,
    name: '平顶山光电陶瓷有限公司',
    address: '平顶山市新华区建设路南段',
    industry: '非金属矿物制品业',
    policyCount: 1,
    policies: ['创新型中小企业'],
    year: 2022,
    ipTypes: ['外观设计'],
    capitalRange: '100-500万',
    ageRange: '1-3年',
  },
  {
    ...defaultMeta,
    name: '济源新能源电子有限公司',
    address: '济源市虎岭产业集聚区',
    industry: '电气机械和器材制造业',
    policyCount: 4,
    policies: ['高新技术企业'],
    year: 2024,
    ipTypes: ['发明专利', '实用新型'],
  },
]

const seeds: Array<Omit<ExportEnterprise, 'id'>> = [
  ...featured,
  ...buildElectronicsExtras(80),
  ...otherIndustrySeeds,
]

export const mockExportEnterprises: ExportEnterprise[] = seeds.map(
  (item, index) => ({
    id: index + 1,
    ...item,
  }),
)
