import { padDate } from './helpers'
import type {
  EnterpriseItem,
  EnterprisePatent,
  EnterpriseSoftwareCopyright,
  EnterpriseTrademark,
  EnterpriseWorkCopyright,
} from './types'

const PATENT_NAME_SEEDS = [
  '一种干细胞诱导分化方法及其应用',
  '一种核酸检测试剂盒及检测方法',
  '一种基因编辑载体及其构建方法',
  '一种细胞培养装置',
  '一种蛋白质纯化工艺',
  '一种生物样本保存容器',
  '一种高通量基因测序方法',
  '一种细胞分选芯片',
  '一种重组蛋白表达系统',
  '一种免疫组化检测试剂',
  '一种微流控反应装置',
  '一种核酸提取试剂盒',
]

const PATENT_TYPES = ['发明专利', '实用新型', '外观设计'] as const
const PATENT_STATUSES = [
  '专利权维持',
  '实质审查的生效',
  '专利权终止',
  '驳回失效',
]

const TRADEMARK_SEEDS = [
  { mark: '源创', name: '源创基因', intlClass: '第5类' },
  { mark: 'YUANCHUANG', name: 'YUANCHUANG', intlClass: '第42类' },
  { mark: '源创基因', name: '源创基因', intlClass: '第44类' },
  { mark: 'YCGene', name: 'YCGene', intlClass: '第10类' },
  { mark: '源创生物', name: '源创生物', intlClass: '第5类' },
  { mark: 'CELLORIGIN', name: 'CELLORIGIN', intlClass: '第42类' },
]

const TRADEMARK_STATUSES = [
  '注册公告',
  '等待实质审查',
  '商标注册申请完成',
  '等待驳回通知发文',
]

const SOFTWARE_SEEDS = [
  { fullName: '源创基因实验室信息管理系统', shortName: 'LIMS系统' },
  { fullName: '源创基因数据分析软件', shortName: '基因分析软件' },
  { fullName: '源创细胞培养过程监控系统', shortName: '培养监控系统' },
  { fullName: '源创生物样本库管理系统', shortName: '样本库系统' },
  { fullName: '源创基因检测报告生成系统', shortName: '报告生成系统' },
  { fullName: '源创高通量测序数据质控软件', shortName: '测序质控软件' },
]

const WORK_SEEDS = [
  { fullName: '商标', category: '美术' },
  { fullName: '细胞分裂图', category: '美术' },
  { fullName: '原图', category: '美术' },
]

const buildPatents = (
  item: EnterpriseItem,
  count: number,
): EnterprisePatent[] =>
  Array.from({ length: count }, (_, index) => {
    const year = 2024 - (index % 4)
    const seq = String(100000 + item.id * 137 + index).slice(-6)
    const seed =
      PATENT_NAME_SEEDS[index % PATENT_NAME_SEEDS.length] ??
      PATENT_NAME_SEEDS[0]!
    return {
      id: item.id * 10000 + index + 1,
      name: index < PATENT_NAME_SEEDS.length ? seed : `${seed}（${index + 1}）`,
      applyDate: padDate(year, (index % 12) + 1, (index % 27) + 1),
      applyNo: `CN${year}${seq}.${(index % 9) + 1}`,
      publishDate: padDate(year + (index % 2), ((index + 6) % 12) + 1, 15),
      publishNo: `CN${118 + (index % 10)}${seq}${index % 3 === 1 ? 'U' : 'A'}`,
      legalStatus:
        PATENT_STATUSES[index % PATENT_STATUSES.length] ?? '专利权维持',
      patentType: PATENT_TYPES[index % PATENT_TYPES.length] ?? '发明专利',
    }
  })

const buildTrademarks = (
  item: EnterpriseItem,
  count: number,
): EnterpriseTrademark[] =>
  Array.from({ length: count }, (_, index) => {
    const seed =
      TRADEMARK_SEEDS[index % TRADEMARK_SEEDS.length] ?? TRADEMARK_SEEDS[0]!
    const year = 2023 - (index % 5)
    return {
      id: item.id * 20000 + index + 1,
      mark: seed.mark,
      name: seed.name,
      applyDate: padDate(year, (index % 12) + 1, ((index * 3) % 27) + 1),
      registerNo: String(40_000_000 + item.id * 1000 + index),
      intlClass: seed.intlClass,
      status:
        TRADEMARK_STATUSES[index % TRADEMARK_STATUSES.length] ?? '注册公告',
    }
  })

const buildSoftwareCopyrights = (
  item: EnterpriseItem,
  count: number,
): EnterpriseSoftwareCopyright[] =>
  Array.from({ length: count }, (_, index) => {
    const seed =
      SOFTWARE_SEEDS[index % SOFTWARE_SEEDS.length] ?? SOFTWARE_SEEDS[0]!
    const year = 2024 - (index % 3)
    const seq = String(1000000 + item.id * 80 + index).slice(-7)
    return {
      id: item.id * 30000 + index + 1,
      fullName:
        index < SOFTWARE_SEEDS.length
          ? seed.fullName
          : `${seed.fullName}V${index + 1}`,
      shortName: seed.shortName,
      approveDate: padDate(year, ((index + 2) % 12) + 1, 18),
      registerNo: `${year}SR${seq}`,
      classNo: `${30000 + (index % 9) * 100}-0000`,
      version: `V${1 + (index % 3)}.${index % 2}`,
      firstPublishDate:
        index % 7 === 0 ? '未发表' : padDate(year - 1, (index % 12) + 1, 10),
    }
  })

const buildWorkCopyrights = (
  item: EnterpriseItem,
  count: number,
): EnterpriseWorkCopyright[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = WORK_SEEDS[index % WORK_SEEDS.length] ?? WORK_SEEDS[0]!
    const year = 2022 + (index % 3)
    return {
      id: item.id * 40000 + index + 1,
      fullName: seed.fullName,
      registerNo: `国作登字-202${year % 10}-F-${String(10000000 + item.id * 10 + index).slice(-8)}`,
      category: seed.category,
      completeDate: padDate(year, (index % 12) + 1, 8),
      registerDate: padDate(year, ((index + 3) % 12) + 1, 20),
      firstPublishDate: padDate(year, ((index + 1) % 12) + 1, 12),
    }
  })

export {
  buildPatents,
  buildSoftwareCopyrights,
  buildTrademarks,
  buildWorkCopyrights,
}
