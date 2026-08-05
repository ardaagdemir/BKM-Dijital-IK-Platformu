import { describe, expect, it } from 'vitest'
import { expandLeaveDates } from './expandLeaveDates'
import type { LeaveRequest } from '../leave/types'

function makeRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: 1,
    employeeId: 1,
    leaveTypeId: 1,
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    status: 'APPROVED',
    requestedDays: 3,
    balanceWarning: null,
    rejectionReason: null,
    employeeEmail: null,
    ...overrides,
  }
}

describe('expandLeaveDates', () => {
  it('onaylı bir talebin başlangıç-bitiş aralığındaki TÜM günleri döner', () => {
    expect(expandLeaveDates([makeRequest()])).toEqual(['2026-03-10', '2026-03-11', '2026-03-12'])
  })

  it('tek günlük bir talep TEK tarih döner', () => {
    expect(expandLeaveDates([makeRequest({ startDate: '2026-03-10', endDate: '2026-03-10' })])).toEqual([
      '2026-03-10',
    ])
  })

  it('PENDING/REJECTED talepleri HARİÇ tutar', () => {
    expect(
      expandLeaveDates([
        makeRequest({ id: 2, status: 'PENDING' }),
        makeRequest({ id: 3, status: 'REJECTED' }),
      ]),
    ).toEqual([])
  })

  it('birden fazla onaylı talebi BİRLEŞTİRİR', () => {
    expect(
      expandLeaveDates([
        makeRequest({ id: 1, startDate: '2026-01-01', endDate: '2026-01-02' }),
        makeRequest({ id: 2, startDate: '2026-02-01', endDate: '2026-02-01' }),
      ]),
    ).toEqual(['2026-01-01', '2026-01-02', '2026-02-01'])
  })
})
