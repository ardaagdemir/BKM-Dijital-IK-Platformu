package com.digitalik.organization.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSalaryRecordRequest(BigDecimal amount, LocalDate effectiveDate, String reason) {
}
