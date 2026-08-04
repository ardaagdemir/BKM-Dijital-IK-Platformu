package com.digitalik.auth.dto;

/** {@code otpAuthUri}: Google Authenticator/Authy gibi uygulamaların QR ile okuduğu standart {@code otpauth://} formatı. */
public record MfaEnrollResponse(String secret, String otpAuthUri) {
}
