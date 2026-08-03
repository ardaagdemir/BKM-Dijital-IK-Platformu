package com.digitalik.feedback.dto;

import com.digitalik.feedback.entity.SuggestionStatus;

public record SuggestionResponse(
        Long id, Long categoryId, Long employeeId, String description, SuggestionStatus status) {
}
