import type { IndustryNode } from '@/api/meta'

/** 接口行业树还没回来时，用名称列表垫一层。负 id 避免和真实行业撞号 */
export const toIndustryNodes = (names: string[]): IndustryNode[] =>
  names.map((name, index) => ({ id: -(index + 1), name, children: [] }))
