import { request } from '@/utils/request'

export type UserContextPayload = {
  provinceId?: number | null
  cityId?: number | null
  districtId?: number | null
}

export const fetchUserContext = () => {
  return request({
    url: '/account/users/me/context',
    method: 'get',
    hideError: true,
  })
}

export const updateUserContext = (data: UserContextPayload) => {
  return request({
    url: '/account/users/me/context',
    method: 'put',
    data,
    hideError: true,
  })
}
