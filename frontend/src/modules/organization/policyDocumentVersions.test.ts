import { describe, expect, it } from 'vitest'
import { groupPolicyDocumentVersions } from './policyDocumentVersions'
import type { PolicyDocument } from './types'

function makeDoc(overrides: Partial<PolicyDocument>): PolicyDocument {
  return {
    id: 1,
    title: 'Doküman',
    version: 1,
    fileName: 'doc.pdf',
    status: 'ACTIVE',
    previousVersionId: null,
    ...overrides,
  }
}

describe('groupPolicyDocumentVersions', () => {
  it('tek versiyonlu dokümanı tek grup olarak döner', () => {
    const groups = groupPolicyDocumentVersions([makeDoc({ id: 1 })])
    expect(groups).toHaveLength(1)
    expect(groups[0].current.id).toBe(1)
    expect(groups[0].history).toHaveLength(0)
  })

  it('birden çok versiyonu AYNI gruba toplar, güncel (ACTIVE) versiyonu current yapar', () => {
    const v1 = makeDoc({ id: 1, version: 1, status: 'ARCHIVED', previousVersionId: null })
    const v2 = makeDoc({ id: 2, version: 2, status: 'ARCHIVED', previousVersionId: 1 })
    const v3 = makeDoc({ id: 3, version: 3, status: 'ACTIVE', previousVersionId: 2 })

    const groups = groupPolicyDocumentVersions([v1, v2, v3])
    expect(groups).toHaveLength(1)
    expect(groups[0].current.id).toBe(3)
    expect(groups[0].history.map((v) => v.id)).toEqual([2, 1])
  })

  it('farklı doküman ailelerini AYRI gruplara ayırır', () => {
    const a1 = makeDoc({ id: 1, title: 'A', version: 1, previousVersionId: null })
    const b1 = makeDoc({ id: 2, title: 'B', version: 1, previousVersionId: null })

    const groups = groupPolicyDocumentVersions([a1, b1])
    expect(groups).toHaveLength(2)
  })
})
