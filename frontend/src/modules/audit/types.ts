// Backend DTO'suyla BİREBİR eşleşir (bkz. core.dto.AuditLogResponse).
export type AuditOperation = 'CREATE' | 'UPDATE'

export type AuditLogEntry = {
  id: number
  entityType: string
  entityId: string
  operation: AuditOperation
  performedBy: string
  performedAt: string
}

// GET /api/core/audit-log'un filtre parametreleri (bkz.
// core.controller.AuditLogController#search) — from/to 'YYYY-MM-DD'
// formatında (backend LocalDate olarak çözer, o günün TAMAMINI kapsar).
export type AuditLogSearchParams = {
  entityType?: string
  performedBy?: string
  from?: string
  to?: string
}
