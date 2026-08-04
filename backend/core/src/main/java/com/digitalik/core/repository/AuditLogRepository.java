package com.digitalik.core.repository;

import com.digitalik.core.entity.AuditLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLogEntry, Long> {

    java.util.List<AuditLogEntry> findByEntityTypeAndEntityId(String entityType, String entityId);
}
