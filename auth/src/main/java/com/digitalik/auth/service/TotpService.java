package com.digitalik.auth.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Service;

/**
 * US-09.1.3: RFC 6238 TOTP tabanlı MFA — sır üretimi ve kod doğrulaması
 * {@code dev.samstevens.totp} kütüphanesine (HMAC/zaman-penceresi mantığını
 * elle yeniden yazmamak için) delege edilir; {@code otpauth://} URI'si
 * (Google Authenticator/Authy gibi uygulamaların QR ile okuduğu standart
 * format) burada elle üretiliyor — yalnızca bir URI, QR görseli üretmek
 * için ekstra bir bağımlılık (zxing) GEREKMİYOR; frontend (henüz yok)
 * ilerde bu URI'den kendi QR'ını üretebilir.
 */
@Service
public class TotpService {

    private static final String ISSUER = "Dijital IK Platformu";

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String buildOtpAuthUri(String email, String secret) {
        String label = URLEncoder.encode(ISSUER + ":" + email, StandardCharsets.UTF_8);
        String issuer = URLEncoder.encode(ISSUER, StandardCharsets.UTF_8);
        return "otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30".formatted(label, secret, issuer);
    }

    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) {
            return false;
        }
        return codeVerifier.isValidCode(secret, code);
    }
}
