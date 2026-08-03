package com.digitalik.discipline.dto;

import com.digitalik.discipline.entity.DisciplinaryCaseStatus;

public record DisciplinaryCaseResponse(
        Long id, Long employeeId, String reason, String defense, DisciplinaryCaseStatus status) {
}
