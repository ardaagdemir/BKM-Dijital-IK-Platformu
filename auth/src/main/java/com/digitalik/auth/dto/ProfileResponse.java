package com.digitalik.auth.dto;

import java.util.Set;

public record ProfileResponse(Long userId, String email, String fullName, Set<String> roles) {
}
