package com.digitalik.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.junit.jupiter.api.Test;

/**
 * US-09.1.3: {@link TotpService}, RFC 6238 kod üretimi/doğrulamasını
 * {@code dev.samstevens.totp}'a delege ediyor — bu testler kütüphanenin
 * KENDİ algoritmasını değil, {@code TotpService}'in onu doğru şekilde
 * kullandığını (sır üretimi, güncel kodun kabul edilmesi, yanlış kodun
 * reddedilmesi) doğruluyor. Bilinen bir sırla, {@code
 * DefaultCodeGenerator}'ın (gerçek bir authenticator uygulamasının
 * ÜRETECEĞİ AYNI kodu) hesapladığı GÜNCEL kod kullanılıyor.
 */
class TotpServiceTest {

    private final TotpService totpService = new TotpService();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();

    @Test
    void sirBosOlmayanBirDegerUretir() {
        String secret = totpService.generateSecret();

        assertThat(secret).isNotBlank();
    }

    @Test
    void herCagridaFarkliSirUretilir() {
        assertThat(totpService.generateSecret()).isNotEqualTo(totpService.generateSecret());
    }

    @Test
    void otpAuthUriSirriVeEPostayiIcerir() {
        String uri = totpService.buildOtpAuthUri("ahmet@dijitalik.local", "JBSWY3DPEHPK3PXP");

        assertThat(uri).startsWith("otpauth://totp/");
        assertThat(uri).contains("secret=JBSWY3DPEHPK3PXP");
        assertThat(uri).contains("ahmet%40dijitalik.local");
    }

    @Test
    void guncelKodKabulEdilir() throws Exception {
        String secret = totpService.generateSecret();
        String currentCode = codeGenerator.generate(secret, Math.floorDiv(timeProvider.getTime(), 30));

        assertThat(totpService.verifyCode(secret, currentCode)).isTrue();
    }

    @Test
    void yanlisKodReddedilir() {
        String secret = totpService.generateSecret();

        assertThat(totpService.verifyCode(secret, "000000")).isFalse();
    }

    @Test
    void nullSirVeKodReddedilir() {
        assertThat(totpService.verifyCode(null, "123456")).isFalse();
        assertThat(totpService.verifyCode("JBSWY3DPEHPK3PXP", null)).isFalse();
    }
}
