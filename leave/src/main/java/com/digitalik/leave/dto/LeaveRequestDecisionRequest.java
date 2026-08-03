package com.digitalik.leave.dto;

/** {@code decision}: {@code "APPROVED"} veya {@code "REJECTED"}. */
public record LeaveRequestDecisionRequest(String decision, String rejectionReason) {
}
