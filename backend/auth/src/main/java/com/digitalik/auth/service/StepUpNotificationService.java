package com.digitalik.auth.service;

import com.digitalik.core.notification.EmailNotificationService;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * US-08D.1.4: Bordro modülü erişim doğrulama kodunu e-posta ile gönderir.
 * US-09.3.1 ile gönderim mekanizması (SMTP + şablon render) {@code
 * core.notification.EmailNotificationService}'e taşındı — bu sınıf artık
 * yalnızca şablon/alıcı/konu seçen ince bir sarmalayıcı; public API'si
 * ({@code sendStepUpCode}) ve dışa dönük davranışı DEĞİŞMEDİ.
 */
@Service
public class StepUpNotificationService {

    private final EmailNotificationService emailNotificationService;

    public StepUpNotificationService(EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    public void sendStepUpCode(String toAddress, String code) {
        emailNotificationService.send(
                toAddress, "Bordro Modülü Doğrulama Kodu", "step-up-code", Map.of("kod", code));
    }
}
