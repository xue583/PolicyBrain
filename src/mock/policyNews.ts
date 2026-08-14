export interface PolicyTag {
  text: string
  color: string
}

export interface PolicyItem {
  id: number
  title: string
  status: 'normal' | 'expired'
  tags: PolicyTag[]
  description: string
  date: string
  department: string
  daysRemaining: number
}

export const navItems = [
  { key: 'home', label: '首页' },
  { key: 'news', label: '政策资讯' },
  { key: 'policy-db', label: '政策数据库' },
  { key: 'enterprise-db', label: '企业数据库' },
  { key: 'invest-db', label: '投资项目库' },
  { key: 'export', label: '数据导出' },
  { key: 'api', label: 'API接口' },
]

export const regions = [
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
]

export const industries = [
  '采矿业',
  '电力、热力、燃气及水生产和供应业',
  '房地产业',
  '建筑业',
  '交通运输、仓储和邮政业',
  '教育',
  '金融业',
  '居民服务、修理和其他服务业',
]

export const policyLevels = [
  { label: '国家级', value: 'national' },
  { label: '省级', value: 'provincial' },
  { label: '市级', value: 'municipal' },
  { label: '区级', value: 'district' },
]

export const infoTypes = [
  { label: '申报中', value: 'applying' },
  { label: '公示中', value: 'publicizing' },
  { label: '新发文', value: 'new' },
]

export const cities = ['郑州市', '洛阳市', '开封市', '新乡市', '许昌市']

export const mockPolicies: PolicyItem[] = [
  {
    id: 1,
    title: '关于印发郑州市推进人工智能创新发展若干措施的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '信息技术', color: 'green' },
      { text: '教育科研', color: 'orange' },
    ],
    description:
      '为深入贯彻落实党中央、国务院关于加快发展新一代人工智能的决策部署，抢抓人工智能发展重大战略机遇，推动人工智能与经济社会深度融合，培育壮大新质生产力，结合我市实际，制定本措施。重点支持人工智能核心技术攻关、场景应用示范、产业生态培育等方面。',
    date: '2026-07-28',
    department: '郑州市科学技术局',
    daysRemaining: 0,
  },
  {
    id: 2,
    title: '郑州市关于支持高新技术企业高质量发展的若干政策',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '高新技术', color: 'green' },
      { text: '财政扶持', color: 'purple' },
    ],
    description:
      '为进一步优化营商环境，激发企业创新活力，对我市新认定的高新技术企业给予一次性奖励，对复审通过的高新技术企业给予持续支持。同时配套研发费用加计扣除辅导、知识产权托管等服务措施。',
    date: '2026-06-15',
    department: '郑州市工业和信息化局',
    daysRemaining: 0,
  },
  {
    id: 3,
    title: '关于开展2026年度市级科技计划项目申报工作的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '科技计划', color: 'cyan' },
      { text: '项目申报', color: 'orange' },
    ],
    description:
      '现启动2026年度市级科技计划项目申报工作，申报方向包括重大科技专项、重点研发计划、科技成果转化等。请各申报单位认真组织，按时通过线上系统提交材料，逾期不予受理。',
    date: '2026-05-20',
    department: '郑州市科学技术局',
    daysRemaining: 0,
  },
  {
    id: 4,
    title: '郑州市促进软件和信息技术服务业发展专项资金管理办法',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '软件服务', color: 'green' },
      { text: '专项资金', color: 'gold' },
    ],
    description:
      '为规范专项资金使用管理，提高资金使用效益，支持软件和信息技术服务业做大做强，本办法明确了支持范围、申报条件、评审程序及监督管理要求，适用于在本市依法注册的相关企业。',
    date: '2026-04-08',
    department: '郑州市发展和改革委员会',
    daysRemaining: 0,
  },
  {
    id: 5,
    title: '关于印发郑州市数字经济核心产业统计监测实施办法的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '数字经济', color: 'geekblue' },
      { text: '统计监测', color: 'lime' },
    ],
    description:
      '为准确反映我市数字经济发展状况，建立健全数字经济核心产业统计监测体系，现将《郑州市数字经济核心产业统计监测实施办法》印发给你们，请认真贯彻执行。',
    date: '2026-03-22',
    department: '郑州市统计局',
    daysRemaining: 0,
  },
  {
    id: 6,
    title: '郑州市加快推进制造业数字化转型行动方案（2026—2028年）',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '制造业', color: 'volcano' },
      { text: '数字化转型', color: 'green' },
    ],
    description:
      '行动方案围绕智能工厂建设、工业互联网平台培育、关键环节数字化改造等重点任务，提出三年行动目标和具体举措，鼓励企业申报数字化转型示范项目并享受相应政策支持。',
    date: '2026-08-01',
    department: '郑州市工业和信息化局',
    daysRemaining: 45,
  },
  {
    id: 7,
    title: '关于组织申报河南省科技型中小企业技术创新基金的通知',
    status: 'normal',
    tags: [
      { text: '河南省', color: 'blue' },
      { text: '科技型中小企业', color: 'green' },
      { text: '创新基金', color: 'orange' },
    ],
    description:
      '为支持科技型中小企业开展技术创新活动，现组织申报河南省科技型中小企业技术创新基金。符合条件的企业可通过市级科技管理部门推荐申报，具体要求详见申报指南。',
    date: '2026-08-05',
    department: '河南省科学技术厅',
    daysRemaining: 28,
  },
  {
    id: 8,
    title: '郑州市关于进一步支持专精特新中小企业发展的若干措施',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '专精特新', color: 'purple' },
      { text: '中小企业', color: 'cyan' },
    ],
    description:
      '从梯度培育、融资支持、人才引进、市场开拓等方面提出系列措施，对新认定的国家级、省级专精特新“小巨人”企业分别给予奖励，并优先推荐参与重大项目和政府采购。',
    date: '2026-08-10',
    department: '郑州市工业和信息化局',
    daysRemaining: 60,
  },
  {
    id: 9,
    title: '关于公开征集2026年郑州市重点领域科技攻关需求的通知',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '科技攻关', color: 'orange' },
      { text: '需求征集', color: 'green' },
    ],
    description:
      '面向全市企事业单位、高校院所公开征集人工智能、先进材料、生物医药、现代农业等重点领域科技攻关需求，征集结果将作为编制市级科技计划指南的重要依据。',
    date: '2026-08-12',
    department: '郑州市科学技术局',
    daysRemaining: 15,
  },
]
