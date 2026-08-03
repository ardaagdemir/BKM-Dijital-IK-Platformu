package com.digitalik.organization.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalaryRecordResponse(Long id, Long employeeId, BigDecimal amount, LocalDate effectiveDate, String reason) {
}
