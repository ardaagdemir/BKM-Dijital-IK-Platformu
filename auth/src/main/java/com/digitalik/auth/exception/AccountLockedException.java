package com.digitalik.auth.exception;

import java.time.Instant;

/**
 * US-02.1.4 kabul kriteri: "N başarısız denemeden sonra hesap kısa süreliğine
 * kilitlenir." Bu istisna, {@code InvalidCredentialsException}'ın aksine
 * kasıtlı olarak bilgilendiricidir (ne zaman açılacağını söyler) — hesabın var
 * olduğu zaten e-posta/parola adımından önce belli olduğu için burada gizlenecek
 * bir şey yoktur.
 */
public class AccountLockedException extends RuntimeException {

    private final Instant lockedUntil;

    public AccountLockedException(Instant lockedUntil) {
        super("Hesap çok sayıda başarısız giriş denemesi nedeniyle geçici olarak kilitlendi.");
        this.lockedUntil = lockedUntil;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }
}
