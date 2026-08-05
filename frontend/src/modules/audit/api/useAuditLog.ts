import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { auditKeys } from '../queryKeys'
import type { AuditLogSearchParams } from '../types'
import * as auditApi from './auditApi'

export function useAuditLog(params: AuditLogSearchParams & { page: number }, enabled = true) {
  return useQuery({
    queryKey: auditKeys.logs.list(params),
    queryFn: () => auditApi.searchAuditLog(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}
