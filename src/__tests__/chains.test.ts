import { describe, expect, it } from 'vitest'
import { getChainIdByName } from '@/constants/chains'

describe('getChainIdByName', () => {
  it('returns the correct chain id regardless of case', () => {
    expect(getChainIdByName('Berachain')).toBe(80094)
    expect(getChainIdByName('berachain')).toBe(80094)
  })

  it('returns undefined for unknown chains', () => {
    expect(getChainIdByName('UnknownChain')).toBeUndefined()
  })
})
