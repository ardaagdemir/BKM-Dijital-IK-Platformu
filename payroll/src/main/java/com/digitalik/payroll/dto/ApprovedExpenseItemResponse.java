package com.digitalik.payroll.dto;

import java.math.BigDecimal;

public record ApprovedExpenseItemResponse(Long id, Long travelRequestId, BigDecimal amount) {
}
