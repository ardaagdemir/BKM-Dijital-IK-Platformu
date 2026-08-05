import { apiClient } from '../../../shared/api/apiClient'
import type { PageResponse } from '../../../shared/types/PageResponse'
import type { AuditLogEntry, AuditLogSearchParams } from '../types'

function buildAuditLogQuery(params: AuditLogSearchParams): URLSearchParams {
  const query = new URLSearchParams()
  if (params.entityType) {
    query.set('entityType', params.entityType)
  }
  if (params.performedBy) {
    query.set('performedBy', params.performedBy)
  }
  if (params.from) {
    query.set('from', params.from)
  }
  if (params.to) {
    query.set('to', params.to)
  }
  return query
}

export function searchAuditLog(
  params: AuditLogSearchParams & { page: number; size?: number },
): Promise<PageResponse<AuditLogEntry>> {
  const query = buildAuditLogQuery(params)
  query.set('page', String(params.page))
  query.set('size', String(params.size ?? 20))
  return apiClient.get<PageResponse<AuditLogEntry>>(`/api/core/audit-log?${query.toString()}`)
}
