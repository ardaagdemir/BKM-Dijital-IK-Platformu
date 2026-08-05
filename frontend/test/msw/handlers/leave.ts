import { HttpResponse, http } from 'msw'
import type { LeaveRequest, LeaveType } from '../../../src/modules/leave/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// organization.ts'teki createOrganizationHandlers'la AYNI desen: her testin
// kendi izole (mutasyona AÇIK) senaryosunu kurabilmesi için bir FABRİKA.
export function createLeaveHandlers(initialLeaveTypes: LeaveType[] = [], initialRequests: LeaveRequest[] = []) {
  const leaveTypes = [...initialLeaveTypes]
  const requests = [...initialRequests]
  let nextLeaveTypeId = leaveTypes.reduce((max, type) => Math.max(max, type.id), 0) + 1
  let nextRequestId = requests.reduce((max, request) => Math.max(max, request.id), 0) + 1

  function requestedDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  return [
    http.get(`${BASE_URL}/api/leave/types`, () => HttpResponse.json(leaveTypes)),
    http.post(`${BASE_URL}/api/leave/types`, async ({ request }) => {
      const body = (await request.json()) as { name: string; code: string }
      const created: LeaveType = { id: nextLeaveTypeId++, name: body.name, code: body.code }
      leaveTypes.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/leave/types/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = leaveTypes.findIndex((type) => type.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'İzin türü bulunamadı', status: 404, detail: 'İzin türü bulunamadı.' },
          { status: 404 },
        )
      }
      const body = (await request.json()) as { name: string; code: string }
      leaveTypes[index] = { id, name: body.name, code: body.code }
      return HttpResponse.json(leaveTypes[index])
    }),
    http.delete(`${BASE_URL}/api/leave/types/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = leaveTypes.findIndex((type) => type.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'İzin türü bulunamadı', status: 404, detail: 'İzin türü bulunamadı.' },
          { status: 404 },
        )
      }
      leaveTypes.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    // Bölüm 14.3 — backend'in GERÇEK formülünü taklit eder (bkz.
    // LeaveBalanceService): remainingDays = entitlement - used - pending.
    http.get(`${BASE_URL}/api/leave/balance`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const hireDate = url.searchParams.get('hireDate') ?? ''
      const asOfDate = url.searchParams.get('asOfDate') ?? new Date().toISOString().slice(0, 10)
      const employeeRequests = requests.filter((r) => r.employeeId === employeeId)
      const usedDays = employeeRequests.filter((r) => r.status === 'APPROVED').reduce((sum, r) => sum + r.requestedDays, 0)
      const pendingDays = employeeRequests.filter((r) => r.status === 'PENDING').reduce((sum, r) => sum + r.requestedDays, 0)
      const entitlementDays = 14
      return HttpResponse.json({
        employeeId,
        hireDate,
        asOfDate,
        yearsOfService: 1,
        entitlementDays,
        usedDays,
        pendingDays,
        remainingDays: entitlementDays - usedDays - pendingDays,
      })
    }),

    http.post(`${BASE_URL}/api/leave/requests`, async ({ request }) => {
      const url = new URL(request.url)
      const hireDate = url.searchParams.get('hireDate')
      const employeeEmail = url.searchParams.get('employeeEmail')
      const body = (await request.json()) as {
        employeeId: number
        leaveTypeId: number
        startDate: string
        endDate: string
      }
      const days = requestedDays(body.startDate, body.endDate)

      let balanceWarning: string | null = null
      if (hireDate) {
        const existing = requests.filter((r) => r.employeeId === body.employeeId)
        const used = existing.filter((r) => r.status === 'APPROVED').reduce((sum, r) => sum + r.requestedDays, 0)
        const pending = existing.filter((r) => r.status === 'PENDING').reduce((sum, r) => sum + r.requestedDays, 0)
        const remaining = 14 - used - pending
        if (days > remaining) {
          balanceWarning = `Bakiye yetersiz: kalan ${remaining} gün, talep edilen ${days} gün.`
        }
      }

      const created: LeaveRequest = {
        id: nextRequestId++,
        employeeId: body.employeeId,
        leaveTypeId: body.leaveTypeId,
        startDate: body.startDate,
        endDate: body.endDate,
        status: 'PENDING',
        requestedDays: days,
        balanceWarning,
        rejectionReason: null,
        employeeEmail,
      }
      requests.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/leave/requests`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const content = requests
        .filter((r) => r.employeeId === employeeId)
        .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
      return HttpResponse.json(content)
    }),

    http.put(`${BASE_URL}/api/leave/requests/:id/decision`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = requests.findIndex((r) => r.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'İzin talebi bulunamadı', status: 404, detail: 'İzin talebi bulunamadı.' },
          { status: 404 },
        )
      }
      if (requests[index].status !== 'PENDING') {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Geçersiz istek',
            status: 400,
            detail: 'Bu talep zaten karara bağlanmış.',
          },
          { status: 400 },
        )
      }
      const body = (await request.json()) as { decision: 'APPROVED' | 'REJECTED'; rejectionReason: string | null }
      if (body.decision === 'REJECTED' && (!body.rejectionReason || !body.rejectionReason.trim())) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail: 'Ret gerekçesi zorunludur.' },
          { status: 400 },
        )
      }
      requests[index] = {
        ...requests[index],
        status: body.decision,
        rejectionReason: body.decision === 'REJECTED' ? body.rejectionReason : null,
      }
      return HttpResponse.json(requests[index])
    }),

    http.get(`${BASE_URL}/api/leave/requests/export`, ({ request }) => {
      const url = new URL(request.url)
      const format = url.searchParams.get('format') ?? 'csv'
      const isXlsx = format === 'xlsx'
      return new HttpResponse('id,calisan_id,izin_turu_id,baslangic,bitis,durum,talep_edilen_gun,ret_gerekcesi\n', {
        status: 200,
        headers: {
          'Content-Type': isXlsx
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv;charset=UTF-8',
          'Content-Disposition': `attachment; filename="izin-gecmisi.${format}"`,
        },
      })
    }),
  ]
}
