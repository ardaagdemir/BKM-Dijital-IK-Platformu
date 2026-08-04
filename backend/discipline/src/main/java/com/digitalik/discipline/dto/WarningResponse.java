package com.digitalik.discipline.dto;

import java.time.LocalDate;

public record WarningResponse(Long id, Long employeeId, LocalDate date, String reason, String description) {
}
