import { describe, expect, it, vi } from 'vitest'
import { fetchEnterpriseRaw, mapEnterpriseBindOption } from '@/api/enterprises'
import { request } from '@/utils/request'

vi.mock('@/utils/request', () => ({ request: vi.fn() }))

describe('mapEnterpriseBindOption', () => {
  it('keeps the id, name, and credit code used to fill the bind form', () => {
    expect(
      mapEnterpriseBindOption({
        id: '1987654321012345678',
        name: '郑州西亚斯学院',
        creditCode: '52410000415806671e',
      }),
    ).toEqual({
      id: '1987654321012345678',
      name: '郑州西亚斯学院',
      creditCode: '52410000415806671E',
    })
  })

  it('reads a nested enterprise record', () => {
    expect(
      mapEnterpriseBindOption({
        enterprise: {
          enterpriseId: 18,
          enterpriseName: '甲公司',
          unifiedSocialCreditCode: '91410100MA9G00018X',
        },
      }),
    ).toEqual({
      id: '18',
      name: '甲公司',
      creditCode: '91410100MA9G00018X',
    })
  })

  it('requests enterprise detail with the original 19-digit id', async () => {
    const id = '1987654321012345678'
    vi.mocked(request).mockResolvedValue({})

    await fetchEnterpriseRaw(id)

    expect(request).toHaveBeenCalledWith({
      url: `/enterprises/${id}`,
      method: 'get',
      hideError: true,
    })
  })
})
