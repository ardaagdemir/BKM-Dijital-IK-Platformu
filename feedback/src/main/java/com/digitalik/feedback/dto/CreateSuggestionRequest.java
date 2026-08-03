package com.digitalik.feedback.dto;

public record CreateSuggestionRequest(Long categoryId, String description, Long employeeId, boolean anonymous) {
}
