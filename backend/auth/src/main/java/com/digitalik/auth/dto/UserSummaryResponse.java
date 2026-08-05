package com.digitalik.auth.dto;

import java.util.List;

public record UserSummaryResponse(Long id, String email, String fullName, List<String> roles) {
}
