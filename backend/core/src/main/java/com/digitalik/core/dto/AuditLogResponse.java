package com.digitalik.core.dto;

import com.digitalik.core.entity.AuditOperation;
import java.time.Instant;

public record AuditLogResponse(
        Long id, String entityType, String entityId, AuditOperation operation, String performedBy,
        Instant performedAt) {
}
