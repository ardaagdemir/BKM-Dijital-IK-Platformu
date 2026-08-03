package com.digitalik.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * US-01.3.1: "Bir kaydın kim tarafından, ne zaman, hangi işlemle değiştirildiğini"
 * tutan basit, salt-ekleme (append-only) satır.
 *
 * <p>Kasıtlı olarak {@link com.digitalik.core.entity.BaseEntity}'yi miras almaz — bu
 * sınıf zaten kendi audit bilgisidir; {@code BaseEntity}'yi miras alsaydı kendi
 * kaydını denetlemeye çalışan bir döngü oluşurdu. Önce/sonra değer diff'i ve
 * merkezi bir görüntüleme arayüzü kasıtlı olarak yoktur (bkz. Bölüm 9.6 —
 * Merkezi Audit ve Uyum Logu, ihtiyaç netleşince genişletilecek).
 */
@Entity
@Table(name = "audit_log")
public class AuditLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String entityType;

    @Column(nullable = false, updatable = false)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private AuditOperation operation;

    @Column(nullable = false, updatable = false)
    private String performedBy;

    @Column(nullable = false, updatable = false)
    private Instant performedAt;

    protected AuditLogEntry() {
        // JPA için
    }

    public AuditLogEntry(String entityType, String entityId, AuditOperation operation,
            String performedBy, Instant performedAt) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
    }

    public Long getId() {
        return id;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public AuditOperation getOperation() {
        return operation;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public Instant getPerformedAt() {
        return performedAt;
    }
}
