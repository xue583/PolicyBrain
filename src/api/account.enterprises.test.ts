import { describe, expect, it } from 'vitest'
import {
  buildBindEnterprisePayload,
  normalizeUserEnterpriseList,
  readBoundEnterpriseId,
} from '@/api/account'

describe('user enterprise binding', () => {
  it('reads the bound list, quota, and current enterprise', () => {
    expect(
      normalizeUserEnterpriseList({
        items: [
          {
            enterpriseId: '18',
            name: '郑州源创基因科技有限公司',
            creditCode: '91410100MA9G00018X',
            provinceName: '河南省',
            cityName: '郑州市',
            legalPerson: '郭峰',
            isCurrent: true,
            bindTime: '2026-11-05T10:00:00',
          },
        ],
        identity: 2,
        currentEnterpriseId: 18,
        canBindMore: true,
        maxBindings: 0,
      }),
    ).toEqual({
      items: [
        {
          enterpriseId: 18,
          name: '郑州源创基因科技有限公司',
          creditCode: '91410100MA9G00018X',
          provinceName: '河南省',
          cityName: '郑州市',
          legalPerson: '郭峰',
          isCurrent: true,
          bindTime: '2026-11-05T10:00:00',
        },
      ],
      identity: 2,
      currentEnterpriseId: 18,
      canBindMore: true,
      maxBindings: 0,
    })
  })

  it('accepts a bare enterprise array', () => {
    expect(
      normalizeUserEnterpriseList([{ enterpriseId: 3, name: '甲公司' }]),
    ).toEqual({
      items: [
        {
          enterpriseId: 3,
          name: '甲公司',
          creditCode: null,
          provinceName: null,
          cityName: null,
          legalPerson: null,
          isCurrent: false,
          bindTime: null,
        },
      ],
    })
  })

  it('submits enterprise id when both fields are filled', () => {
    expect(
      buildBindEnterprisePayload({
        creditCode: ' 91410100ma9g00018x ',
        enterpriseId: 18,
      }),
    ).toEqual({ enterpriseId: 18 })
    expect(
      buildBindEnterprisePayload({ creditCode: '91410100ma9g00018x' }),
    ).toEqual({ creditCode: '91410100MA9G00018X' })
    expect(buildBindEnterprisePayload({ creditCode: '  ' })).toBeNull()
  })

  it('reads the id returned by bind', () => {
    expect(readBoundEnterpriseId({ enterpriseId: 18, name: '甲公司' })).toBe(18)
    expect(readBoundEnterpriseId({})).toBeNull()
  })
})
