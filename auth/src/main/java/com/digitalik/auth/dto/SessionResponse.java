package com.digitalik.auth.dto;

import java.time.Instant;

public record SessionResponse(Long userId, String email, Instant expiresAt) {
}
