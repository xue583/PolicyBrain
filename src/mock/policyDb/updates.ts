import type { PolicyDbItem, PolicyDbUpdate } from './types'

type UpdateTemplate = {
  title: (name: string) => string
  grade: string
  department: string
  date: string
  endDate: string
  daysRemaining: number
  expired: boolean
  phone: string
}

const updateTemplates: UpdateTemplate[] = [
  {
    title: (name) => `中央引导地方科技发展专项（${name}配套）`,
    grade: '河南省',
    department: '科学技术厅',
    date: '2026-06-20',
    endDate: '2026-10-15',
    daysRemaining: 56,
    expired: false,
    phone: '0371-65901111',
  },
  {
    title: (name) => `关于组织申报${name}的通知`,
    grade: '郑州市',
    department: '科学技术局',
    date: '2026-07-28',
    endDate: '2026-08-30',
    daysRemaining: 10,
    expired: false,
    phone: '0371-67180000',
  },
  {
    title: (name) => `${name}管理办法`,
    grade: '国家级',
    department: '国家发展改革委',
    date: '2024-03-12',
    endDate: '2025-12-31',
    daysRemaining: 0,
    expired: true,
    phone: '010-68500000',
  },
  {
    title: (name) => `河南省${name}建设实施方案`,
    grade: '河南省',
    department: '发展和改革委员会',
    date: '2026-05-08',
    endDate: '2026-09-30',
    daysRemaining: 41,
    expired: false,
    phone: '0371-65902222',
  },
  {
    title: (name) => `金水区${name}配套奖补通知`,
    grade: '金水区',
    department: '科学技术局',
    date: '2026-07-01',
    endDate: '2026-08-25',
    daysRemaining: 5,
    expired: false,
    phone: '0371-66680001',
  },
  {
    title: (name) => `郑东新区科技创新平台培育办法（${name}）`,
    grade: '郑东新区',
    department: '管委会',
    date: '2025-04-10',
    endDate: '2025-12-31',
    daysRemaining: 0,
    expired: true,
    phone: '0371-89990001',
  },
  {
    title: (name) => `高新技术开发区${name}认定细则`,
    grade: '高新技术开发区',
    department: '科学技术局',
    date: '2026-08-01',
    endDate: '2026-11-30',
    daysRemaining: 102,
    expired: false,
    phone: '0371-67980001',
  },
  {
    title: (name) => `关于开展${name}绩效评价的通知`,
    grade: '郑州市',
    department: '发展和改革委员会',
    date: '2026-08-10',
    endDate: '2026-09-10',
    daysRemaining: 21,
    expired: false,
    phone: '0371-67181111',
  },
  {
    title: (name) => `经济技术开发区${name}申报通知`,
    grade: '经济技术开发区',
    department: '经济发展局',
    date: '2024-09-01',
    endDate: '2025-03-01',
    daysRemaining: 0,
    expired: true,
    phone: '0371-66780001',
  },
]

const buildUpdates = (item: PolicyDbItem): PolicyDbUpdate[] =>
  updateTemplates.map((tpl, index) => ({
    id: item.id * 100 + index + 1,
    title:
      item.id === 1 && index === 0
        ? '中央引导地方科技发展专项（河南省补贴）'
        : tpl.title(item.name),
    grade: tpl.grade,
    department: tpl.department,
    date: tpl.date,
    endDate: tpl.endDate,
    year: Number(tpl.date.slice(0, 4)),
    daysRemaining: tpl.daysRemaining,
    expired: tpl.expired,
    phone: tpl.phone,
    newsId: (index % 9) + 1,
  }))

export { buildUpdates }
