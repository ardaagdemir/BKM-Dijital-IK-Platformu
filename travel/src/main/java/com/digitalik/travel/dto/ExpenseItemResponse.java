package com.digitalik.travel.dto;

import java.math.BigDecimal;

public record ExpenseItemResponse(
        Long id,
        Long travelRequestId,
        BigDecimal amount,
        String documentFileName,
        String documentContentType,
        String status,
        String rejectionReason) {
}
