package com.digitalik.auth.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * US-02.2.2: Bir kullanıcıya bir rolün atanması. {@link Session} ile aynı
 * gerekçeyle (bkz. o sınıftaki not) fiziksel silme yerine {@code revokedAt}
 * ile "kaldırma" (soft-invalidate) tercih edilmiştir — rol geçmişi korunur ve
 * kaldırma işlemi {@code BaseEntity}'nin audit_log mekanizmasına (UPDATE) yansır.
 */
@Entity
@Table(name = "user_roles")
public class UserRole extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long roleId;

    @Column
    private Instant revokedAt;

    protected UserRole() {
        // JPA için
    }

    public UserRole(Long userId, Long roleId) {
        this.userId = userId;
        this.roleId = roleId;
    }

    public void revoke() {
        this.revokedAt = Instant.now();
    }

    public Long getUserId() {
        return userId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }
}
