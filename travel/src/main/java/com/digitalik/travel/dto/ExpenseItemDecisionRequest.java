package com.digitalik.travel.dto;

/** {@code decision}: {@code "APPROVED"} veya {@code "REJECTED"}. */
public record ExpenseItemDecisionRequest(String decision, String rejectionReason) {
}
