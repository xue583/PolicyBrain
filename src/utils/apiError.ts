/** API 错误类型，供请求层与解密等工具模块共用 */
export class ApiError extends Error {
  status: number
  path?: string

  constructor(message: string, status = 500, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}
