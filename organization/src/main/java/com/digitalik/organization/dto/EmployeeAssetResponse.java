package com.digitalik.organization.dto;

import java.time.LocalDate;

public record EmployeeAssetResponse(
        Long id, Long employeeId, String itemName, LocalDate deliveredAt, LocalDate returnedAt) {
}
