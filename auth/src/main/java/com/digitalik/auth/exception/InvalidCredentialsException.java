package com.digitalik.auth.exception;

/**
 * US-02.1.1 kabul kriteri: "yanlış bilgiyle anlaşılır hata döner."
 *
 * <p>Mesaj kasıtlı olarak e-posta mı yoksa parolanın mı yanlış olduğunu
 * ayırt etmez (kullanıcı numaralandırma saldırılarına karşı iyi pratik).
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("E-posta veya parola hatalı.");
    }
}
