package com.digitalik.training.dto;

/** {@code decision}: {@code "APPROVED"} veya {@code "REJECTED"}. */
public record TrainingEnrollmentDecisionRequest(String decision, String rejectionReason) {
}
