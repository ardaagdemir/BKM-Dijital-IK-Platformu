package com.digitalik.training.dto;

import java.time.LocalDate;

public record TrainingEnrollmentResponse(
        Long id, Long employeeId, Long trainingId, String status, String rejectionReason, LocalDate completedDate) {
}
