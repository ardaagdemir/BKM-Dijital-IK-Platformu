package com.digitalik.auth.service;

import com.digitalik.auth.entity.Session;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.exception.InvalidSessionException;
import com.digitalik.auth.repository.SessionRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    private static final SecureRandom TOKEN_RANDOM = new SecureRandom();
    private static final SecureRandom STEP_UP_CODE_RANDOM = new SecureRandom();

    private final SessionRepository sessionRepository;
    private final long ttlMinutes;
    private final long stepUpCodeTtlMinutes;

    public SessionService(
            SessionRepository sessionRepository,
            @Value("${app.session.ttl-minutes:30}") long ttlMinutes,
            @Value("${app.session.step-up-code-ttl-minutes:5}") long stepUpCodeTtlMinutes) {
        this.sessionRepository = sessionRepository;
        this.ttlMinutes = ttlMinutes;
        this.stepUpCodeTtlMinutes = stepUpCodeTtlMinutes;
    }

    public Session create(User user) {
        Instant expiresAt = Instant.now().plus(ttlMinutes, ChronoUnit.MINUTES);
        return sessionRepository.save(new Session(generateToken(), user.getId(), expiresAt));
    }

    public Session validate(String token) {
        if (token == null || token.isBlank()) {
            throw new InvalidSessionException();
        }
        Session session = sessionRepository.findByToken(token)
                .orElseThrow(InvalidSessionException::new);
        if (session.isExpired() || session.isRevoked()) {
            throw new InvalidSessionException();
        }
        return session;
    }

    public void invalidate(String token) {
        Session session = validate(token);
        session.revoke();
        sessionRepository.save(session);
    }

    /**
     * US-08D.1.4: Bordro modülüne erişim için altı haneli, tek kullanımlık
     * bir doğrulama kodu üretip mevcut oturuma işler — yeni bir oturum
     * AÇMAZ, var olanı "yükseltir" (step-up). Kodun kendisi e-posta ile
     * gönderilmek üzere çağırana ({@code AuthService}) döner (bkz. {@link
     * Session#getStepUpCode()}).
     */
    public Session requestStepUp(String token) {
        Session session = validate(token);
        String code = generateStepUpCode();
        Instant expiresAt = Instant.now().plus(stepUpCodeTtlMinutes, ChronoUnit.MINUTES);
        session.issueStepUpCode(code, expiresAt);
        return sessionRepository.save(session);
    }

    /**
     * Kod yanlışsa/süresi dolmuşsa {@link IllegalArgumentException} (400) —
     * bu, geçersiz bir TOKEN'dan (401, {@link InvalidSessionException})
     * kasıtlı olarak FARKLI bir hata sınıfı: oturumun kendisi geçerli,
     * yalnızca girilen kod hatalı/süresi dolmuş.
     */
    public Session verifyStepUp(String token, String code) {
        Session session = validate(token);
        if (session.getStepUpCode() == null) {
            throw new IllegalArgumentException("Önce bir doğrulama kodu istenmelidir.");
        }
        if (session.isStepUpCodeExpired()) {
            throw new IllegalArgumentException("Doğrulama kodunun süresi dolmuş.");
        }
        if (code == null || !session.getStepUpCode().equals(code)) {
            throw new IllegalArgumentException("Doğrulama kodu hatalı.");
        }
        session.markStepUpVerified();
        return sessionRepository.save(session);
    }

    /**
     * US-09.1.3: TOTP yoluyla doğrulama — {@link #verifyStepUp}'ın AKSİNE
     * e-posta koduna (stepUpCode) hiç bakmaz/gerektirmez. Kodun kendisinin
     * doğruluğu ({@code AuthService.verifyPayrollAccessTotp}) çağıran
     * tarafından ÖNCEDEN kontrol edilmiş olmalı — bu metot yalnızca oturumu
     * "yükseltir".
     */
    public Session markStepUpVerified(String token) {
        Session session = validate(token);
        session.markStepUpVerified();
        return sessionRepository.save(session);
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        TOKEN_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Altı haneli, baştan sıfır olabilen (ör. "004821") sayısal kod — e-posta ile okunması/girilmesi kolay. */
    private static String generateStepUpCode() {
        int code = STEP_UP_CODE_RANDOM.nextInt(1_000_000);
        return "%06d".formatted(code);
    }
}
