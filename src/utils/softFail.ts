import { message } from 'ant-design-vue'

/**
 * 可选元数据子请求的统一软降级：返回回退值让页面其余部分可用，
 * 但以警告提示 + 诊断日志暴露失败，不再静默伪装成「无数据」。
 * 主列表请求不适用本工具——主请求失败必须显式报错并清空（见 utils/request.ts）。
 */
export const softFail =
  <T>(fallback: T, scope: string): ((error: unknown) => T) =>
  (error: unknown) => {
    console.warn(`[softFail:${scope}] 可选数据加载失败`, error)
    message.warning(`${scope}加载失败，相关内容暂不可用`)
    return fallback
  }
