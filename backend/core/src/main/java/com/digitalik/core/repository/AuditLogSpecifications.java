package com.digitalik.core.repository;

import com.digitalik.core.entity.AuditLogEntry;
import java.time.Instant;
import org.springframework.data.jpa.domain.Specification;

/**
 * Bölüm 13.8/9.6: audit_log listesi için isteğe bağlı filtreler — desen
 * {@code organization.EmployeeSpecifications}'la AYNI: her metot, karşılık
 * gelen parametre boş/null ise {@code null} döner ({@code Specification.
 * where(...).and(...)} zincirinde "kısıtlama yok" anlamına gelir).
 */
public final class AuditLogSpecifications {

    private AuditLogSpecifications() {
    }

    public static Specification<AuditLogEntry> hasEntityType(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("entityType"), entityType);
    }

    public static Specification<AuditLogEntry> hasEntityId(String entityId) {
        if (entityId == null || entityId.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("entityId"), entityId);
    }

    public static Specification<AuditLogEntry> performedByContains(String performedBy) {
        if (performedBy == null || performedBy.isBlank()) {
            return null;
        }
        String pattern = "%" + performedBy.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("performedBy")), pattern);
    }

    public static Specification<AuditLogEntry> performedAtFrom(Instant from) {
        if (from == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("performedAt"), from);
    }

    /** {@code toExclusive}: gün bazlı bir "bitiş" filtresinin, o günün TAMAMINI kapsaması için ÜST SINIR HARİÇ. */
    public static Specification<AuditLogEntry> performedAtBefore(Instant toExclusive) {
        if (toExclusive == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThan(root.get("performedAt"), toExclusive);
    }
}
