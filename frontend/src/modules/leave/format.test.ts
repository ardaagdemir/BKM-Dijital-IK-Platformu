import { describe, expect, it } from 'vitest'
import { formatDays } from './format'

describe('formatDays', () => {
  it('gün sayısını "N gün" olarak formatlar', () => {
    expect(formatDays(14)).toBe('14 gün')
  })

  it('sıfırı da doğru formatlar', () => {
    expect(formatDays(0)).toBe('0 gün')
  })
})
