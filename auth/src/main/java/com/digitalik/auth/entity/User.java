package com.digitalik.auth.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * US-02.1.1: Giriş yapabilen kullanıcı hesabı.
 *
 * <p>US-02.1.4 kapsamında başarısız giriş sayacı ve kilit alanları,
 * US-02.2.4 kapsamında {@code fullName} (profilde gösterilen ad) eklendi.
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column
    private String fullName;

    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    @Column
    private Instant lockedUntil;

    protected User() {
        // JPA için
    }

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public User(String email, String passwordHash, String fullName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }

    /** Başarısız bir giriş denemesini işaretler; kilitleme kararı {@code LoginAttemptService}'e aittir. */
    public void incrementFailedAttempts() {
        this.failedLoginAttempts++;
    }

    public void lock(Instant until) {
        this.lockedUntil = until;
        this.failedLoginAttempts = 0;
    }

    public void resetLockout() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }
}
