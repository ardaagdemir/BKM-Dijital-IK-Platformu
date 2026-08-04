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

    /**
     * US-09.1.3: {@code Session}'daki e-posta step-up koduna (V60) EK bir
     * ALTERNATİF — {@code auth.security.PayrollStepUpFilter} hangi
     * yöntemle doğrulandığını umursamıyor, yalnızca {@code
     * Session.isStepUpVerified()}'a bakıyor. Sır burada (Session'da DEĞİL)
     * çünkü kalıcı olmalı — oturum logout'ta silinir, TOTP kaydı kalmalı.
     */
    @Column(name = "totp_secret")
    private String totpSecret;

    /** {@code totp_enabled=false} + {@code totp_secret != null}: kayıt BAŞLATILDI ama ilk kodla henüz DOĞRULANMADI. */
    @Column(nullable = false)
    private boolean totpEnabled = false;

    @Column
    private Instant totpEnrolledAt;

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

    /** Yeni bir sır üretilip kayıt BAŞLATILDIĞINDA — henüz {@link #confirmTotp()} ile DOĞRULANMADI. */
    public void enrollTotp(String secret) {
        this.totpSecret = secret;
        this.totpEnabled = false;
        this.totpEnrolledAt = null;
    }

    /** İlk kod başarıyla doğrulandığında TOTP GERÇEKTEN aktif hale gelir. */
    public void confirmTotp() {
        this.totpEnabled = true;
        this.totpEnrolledAt = Instant.now();
    }

    public String getTotpSecret() {
        return totpSecret;
    }

    public boolean isTotpEnabled() {
        return totpEnabled;
    }

    public Instant getTotpEnrolledAt() {
        return totpEnrolledAt;
    }
}
