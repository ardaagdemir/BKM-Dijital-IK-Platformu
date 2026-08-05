import { HttpResponse, http } from 'msw'
import type { AuditLogEntry } from '../../../src/modules/audit/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Bölüm 13.8 — organization.ts'teki createOrganizationHandlers'la AYNI
// desen: her testin kendi izole senaryosunu kurabilmesi için bir FABRİKA.
export function createAuditLogHandlers(initialEntries: AuditLogEntry[] = []) {
  const entries = [...initialEntries]

  return [
    http.get(`${BASE_URL}/api/core/audit-log`, ({ request }) => {
      const url = new URL(request.url)
      const entityType = url.searchParams.get('entityType')
      const performedBy = url.searchParams.get('performedBy')?.toLowerCase() ?? ''
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')
      const page = Number(url.searchParams.get('page') ?? '0')
      const size = Number(url.searchParams.get('size') ?? '20')

      let filtered = entries
      if (entityType) {
        filtered = filtered.filter((entry) => entry.entityType === entityType)
      }
      if (performedBy) {
        filtered = filtered.filter((entry) => entry.performedBy.toLowerCase().includes(performedBy))
      }
      if (from) {
        filtered = filtered.filter((entry) => entry.performedAt.slice(0, 10) >= from)
      }
      if (to) {
        filtered = filtered.filter((entry) => entry.performedAt.slice(0, 10) <= to)
      }

      const start = page * size
      const content = filtered.slice(start, start + size)

      return HttpResponse.json({
        content,
        page: { size, number: page, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size) },
      })
    }),
  ]
}
