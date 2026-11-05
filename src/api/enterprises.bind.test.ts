import { describe, expect, it } from 'vitest'
import { mapEnterpriseBindOption } from '@/api/enterprises'

describe('mapEnterpriseBindOption', () => {
  it('keeps the id, name, and credit code used to fill the bind form', () => {
    expect(
      mapEnterpriseBindOption({
        id: 367740240010885,
        name: '郑州西亚斯学院',
        creditCode: '52410000415806671e',
      }),
    ).toEqual({
      id: 367740240010885,
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
      id: 18,
      name: '甲公司',
      creditCode: '91410100MA9G00018X',
    })
  })
})
