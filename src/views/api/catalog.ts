export interface ApiItem {
  id: number
  name: string
  description: string
  code: string
  returnData: string
  isOpen: boolean
}

export interface ApiSubGroup {
  name: string
  count: number
  items: ApiItem[]
}

export interface ApiMainCategory {
  name: string
  count: number
  groups: ApiSubGroup[]
}

const fileReturn = '发布单位、发布科室、文件等级、联系方式、发布时间、标题'
const fileDesc =
  '根据区域查询政策文件，包含：发布单位、发布科室、原文链接、联系方式等'

const makeItem = (
  id: number,
  name: string,
  isOpen: boolean,
  description = fileDesc,
  returnData = fileReturn,
): ApiItem => ({
  id,
  name,
  description,
  code: '100011',
  returnData,
  isOpen,
})

export const apiMainCategory: ApiMainCategory = {
  name: '政策接口',
  count: 9,
  groups: [
    {
      name: '政策文件',
      count: 3,
      items: [
        makeItem(1, '查询政策文件列表', true),
        makeItem(2, '查询政策文件列表', true),
        makeItem(3, '查询政策文件列表', false),
      ],
    },
    {
      name: '政策数据',
      count: 9,
      items: Array.from({ length: 9 }, (_, index) =>
        makeItem(index + 4, '查询政策资讯', true),
      ),
    },
  ],
}

export const findApiItem = (id: number) => {
  for (const group of apiMainCategory.groups) {
    const found = group.items.find((item) => item.id === id)
    if (found) return found
  }
  return undefined
}
