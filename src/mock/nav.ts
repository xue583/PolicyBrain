/** 全站导航配置 */
export type NavItem = {
  key: string
  label: string
  /** 新标签页打开，当前页保持不动 */
  newWindow?: boolean
}

export const navItems: NavItem[] = [
  { key: 'home', label: '首页' },
  { key: 'news', label: '政策资讯' },
  { key: 'policy-db', label: '政策数据库' },
  { key: 'enterprise-db', label: '企业数据库' },
  { key: 'invest-db', label: '投资项目库' },
  { key: 'export', label: '数据导出' },
  { key: 'api', label: 'API接口' },
  { key: 'insights', label: '数据洞察', newWindow: true },
]

/** 城市列表 */
export const cities = [
  '郑州市',
  '开封市',
  '洛阳市',
  '南阳市',
  '新乡市',
  '信阳市',
  '周口市',
  '许昌市',
  '平顶山市',
  '安阳市',
  '焦作市',
  '濮阳市',
  '鹤壁市',
  '漯河市',
  '三门峡市',
  '商丘市',
  '济源市',
]
