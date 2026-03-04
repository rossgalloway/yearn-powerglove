import { describe, expect, it } from 'vitest'
import { hasAllocatedDebt } from '@/hooks/useStrategiesData'

describe('hasAllocatedDebt', () => {
  it('treats funded non-active strategies as allocated', () => {
    expect(hasAllocatedDebt({ status: 'not_active', debtRatio: 2500 })).toBe(true)
    expect(hasAllocatedDebt({ status: 'unallocated', debtRatio: 100 })).toBe(true)
  })

  it('returns false when debt ratio is zero', () => {
    expect(hasAllocatedDebt({ status: 'active', debtRatio: 0 })).toBe(false)
  })
})
