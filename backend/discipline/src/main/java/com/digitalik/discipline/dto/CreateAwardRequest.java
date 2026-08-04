package com.digitalik.discipline.dto;

public record CreateAwardRequest(Long employeeId, String type, String description) {
}
