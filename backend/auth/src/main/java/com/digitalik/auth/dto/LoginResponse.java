package com.digitalik.auth.dto;

import java.time.Instant;

public record LoginResponse(Long userId, String email, String token, Instant expiresAt) {
}
