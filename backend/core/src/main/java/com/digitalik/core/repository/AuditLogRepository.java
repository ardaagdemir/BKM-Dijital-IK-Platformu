package com.digitalik.core.repository;

import com.digitalik.core.entity.AuditLogEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * {@code JpaSpecificationExecutor}, Bölüm 13.8/9.6'nın filtrelenebilir/
 * sayfalanmış okuma ucu için eklendi (bkz. {@link AuditLogSpecifications}) —
 * {@code findByEntityTypeAndEntityId} tekil-varlık geçmişi sorgusu için
 * korunur, GENEL listeleme için yeterli değildir (rijit imza, sayfalama YOK).
 */
public interface AuditLogRepository
        extends JpaRepository<AuditLogEntry, Long>, JpaSpecificationExecutor<AuditLogEntry> {

    List<AuditLogEntry> findByEntityTypeAndEntityId(String entityType, String entityId);
}
