/** 科技金融模块 mock 数据（数字按设计稿硬编码） */

export interface FinanceBank {
  id: number
  name: string
  /** 最新贷款额度（万元） */
  amount: number
  /** 最新贷款利率（%） */
  rate: string
  branch: string
  manager: string
  phone: string
  address: string
}

export const financeBanks: FinanceBank[] = [
  {
    id: 1,
    name: '中国银行',
    amount: 500,
    rate: '3.45%',
    branch: '中国银行郑州高新区支行',
    manager: '李明',
    phone: '13803710001',
    address: '郑州市高新区科学大道100号',
  },
  {
    id: 2,
    name: '建设银行',
    amount: 300,
    rate: '3.65%',
    branch: '建设银行郑州高新支行',
    manager: '王强',
    phone: '13803710002',
    address: '郑州市高新区瑞达路66号',
  },
  {
    id: 3,
    name: '工商银行',
    amount: 300,
    rate: '3.65%',
    branch: '工商银行郑州高新区支行',
    manager: '赵敏',
    phone: '13803710003',
    address: '郑州市高新区梧桐街50号',
  },
  {
    id: 4,
    name: '中国银行',
    amount: 500,
    rate: '3.45%',
    branch: '中国银行郑州中原支行',
    manager: '陈静',
    phone: '13803710004',
    address: '郑州市中原区建设西路11号',
  },
  {
    id: 5,
    name: '建设银行',
    amount: 300,
    rate: '3.65%',
    branch: '建设银行郑州金水支行',
    manager: '刘洋',
    phone: '13803710005',
    address: '郑州市金水区花园路39号',
  },
  {
    id: 6,
    name: '建设银行',
    amount: 300,
    rate: '3.65%',
    branch: '建设银行郑州二七支行',
    manager: '张伟',
    phone: '13803710006',
    address: '郑州市二七区大学中路8号',
  },
  {
    id: 7,
    name: '工商银行',
    amount: 300,
    rate: '3.65%',
    branch: '工商银行郑州郑东新区支行',
    manager: '孙丽',
    phone: '13803710007',
    address: '郑州市郑东新区商务内环27号',
  },
  {
    id: 8,
    name: '中国银行',
    amount: 500,
    rate: '3.45%',
    branch: '中国银行郑州金水支行',
    manager: '周涛',
    phone: '13803710008',
    address: '郑州市金水区农业路72号',
  },
]
