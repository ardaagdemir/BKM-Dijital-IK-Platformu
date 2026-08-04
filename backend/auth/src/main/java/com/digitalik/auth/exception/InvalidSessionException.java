package com.digitalik.auth.exception;

/**
 * US-02.1.3 kabul kriteri: "Token/session süresi dolunca yeniden giriş istenir."
 * Eksik, tanınmayan, süresi dolmuş veya geçersiz kılınmış (revoked) token'lar
 * için tek, ayırt etmeyen bir hata — kimlik doğrulama hatalarında olduğu gibi
 * (bkz. {@link InvalidCredentialsException}) sebebi dışarı sızdırmaz.
 */
public class InvalidSessionException extends RuntimeException {

    public InvalidSessionException() {
        super("Oturum geçersiz veya süresi dolmuş.");
    }
}
