package com.digitalik.auth.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * US-02.1.3: Bir kullanıcının başarılı girişiyle oluşturulan oturum. Fiziksel
 * silme yerine {@code revokedAt} ile "geçersiz kılma" (soft-invalidate) tercih
 * edilmiştir — hem çıkış işleminin audit_log'a bir güncelleme (UPDATE) olarak
 * yansımasını sağlar hem de geçmiş oturumların izini korur.
 *
 * <p>US-08D.1.4: {@code stepUpCode}/{@code stepUpCodeExpiresAt}/{@code
 * stepUpVerifiedAt} — bordro modülüne özel, BASİT bir ek doğrulama (2FA)
 * adımı için (bkz. V60 migration'ındaki gerekçe). Genel bir "step-up"
 * çerçevesi İCAT EDİLMEDİ — bugün tek bir tüketicisi (bordro) var; alanlar
 * {@code Session} üzerinde çünkü doğrulama, VAR OLAN oturuma bağlı bir
 * durum (yeni bir oturum açmıyor, mevcut olanı "yükseltiyor").
 */
@Entity
@Table(name = "sessions")
public class Session extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column
    private Instant revokedAt;

    @Column(name = "step_up_code")
    private String stepUpCode;

    @Column(name = "step_up_code_expires_at")
    private Instant stepUpCodeExpiresAt;

    @Column(name = "step_up_verified_at")
    private Instant stepUpVerifiedAt;

    protected Session() {
        // JPA için
    }

    public Session(String token, Long userId, Instant expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }

    public void revoke() {
        this.revokedAt = Instant.now();
    }

    /** Yeni bir kod istendiğinde önceki (varsa) doğrulama durumu KORUNUR — yeni kod, henüz doğrulanmamışsa istendi demektir. */
    public void issueStepUpCode(String code, Instant expiresAt) {
        this.stepUpCode = code;
        this.stepUpCodeExpiresAt = expiresAt;
    }

    public boolean isStepUpCodeExpired() {
        return stepUpCodeExpiresAt == null || Instant.now().isAfter(stepUpCodeExpiresAt);
    }

    public void markStepUpVerified() {
        this.stepUpVerifiedAt = Instant.now();
        this.stepUpCode = null;
        this.stepUpCodeExpiresAt = null;
    }

    public boolean isStepUpVerified() {
        return stepUpVerifiedAt != null;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getStepUpCode() {
        return stepUpCode;
    }

    public Instant getStepUpCodeExpiresAt() {
        return stepUpCodeExpiresAt;
    }

    public Instant getStepUpVerifiedAt() {
        return stepUpVerifiedAt;
    }
}
