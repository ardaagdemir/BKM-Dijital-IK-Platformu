package com.digitalik.core.entity;

import com.digitalik.core.listener.AuditLogEntityListener;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * US-01.2.1: Tüm varlıklar için ortak taban alanlar.
 *
 * <p>Bu sınıfı miras alan her varlıkta id, oluşturulma/güncellenme zamanı ve
 * oluşturan/güncelleyen kullanıcı bilgisi Spring Data JPA auditing ile otomatik
 * doldurulur — çağıran kodun bu alanları elle set etmesi gerekmez.
 *
 * <p>{@link AuditLogEntityListener}, aynı oluşturma/güncelleme olaylarını
 * US-01.3.1 kapsamındaki {@code audit_log} tablosuna ayrıca kaydeder.
 */
@MappedSuperclass
@EntityListeners({AuditingEntityListener.class, AuditLogEntityListener.class})
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(nullable = false, updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(nullable = false)
    private String updatedBy;

    public Long getId() {
        return id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }
}
