/**
 * 页码从第 2 页被打回第 1 页时，非本地模式由 currentPage 的 watcher 加载。
 * 这里再加载会把企业名单请求打两次。
 * 本地模式下那个 watcher 直接返回，所以仍要在这里加载。
 * page 取重置前的页码，localMode 取本次变更之后的值。
 */
export const shouldLoadEnterprises = (page: number, localMode: boolean) =>
  page === 1 || localMode
