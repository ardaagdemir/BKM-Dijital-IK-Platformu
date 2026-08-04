package com.digitalik.discipline.dto;

import java.time.LocalDate;

public record CreateWarningRequest(Long employeeId, LocalDate date, String reason, String description) {
}
