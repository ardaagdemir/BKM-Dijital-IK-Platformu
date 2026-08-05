package com.digitalik.core.service;

import com.digitalik.core.entity.AuditLogEntry;
import com.digitalik.core.repository.AuditLogRepository;
import com.digitalik.core.repository.AuditLogSpecifications;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

/**
 * Bölüm 13.8/9.6: audit_log tablosunun OKUMA tarafı — yazma tarafı
 * ({@link com.digitalik.core.listener.AuditLogEntityListener}) US-01.3.1'den
 * beri var, ama listeleyen/okuyan bir uç bu ana kadar YOKTU (bkz. roadmap'in
 * kendi notu). BKM İstanbul merkezli olduğundan tarih aralığı filtresi sabit
 * bir dilimde (Europe/Istanbul) günün BAŞLANGICI/bir SONRAKİ günün başlangıcı
 * olarak yorumlanır (ör. {@code to=2026-01-15}, o günün TAMAMINI kapsar).
 */
@Service
public class AuditLogService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public Page<AuditLogEntry> search(
            String entityType,
            String entityId,
            String performedBy,
            LocalDate from,
            LocalDate to,
            Pageable pageable) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new IllegalArgumentException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        Instant fromInstant = from != null ? from.atStartOfDay(ZONE).toInstant() : null;
        Instant toExclusiveInstant = to != null ? to.plusDays(1).atStartOfDay(ZONE).toInstant() : null;

        Specification<AuditLogEntry> spec = Specification.where(AuditLogSpecifications.hasEntityType(entityType))
                .and(AuditLogSpecifications.hasEntityId(entityId))
                .and(AuditLogSpecifications.performedByContains(performedBy))
                .and(AuditLogSpecifications.performedAtFrom(fromInstant))
                .and(AuditLogSpecifications.performedAtBefore(toExclusiveInstant));

        return auditLogRepository.findAll(spec, pageable);
    }
}
