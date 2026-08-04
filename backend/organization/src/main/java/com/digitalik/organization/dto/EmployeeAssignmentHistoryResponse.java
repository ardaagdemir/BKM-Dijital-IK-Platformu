package com.digitalik.organization.dto;

import java.time.LocalDate;

public record EmployeeAssignmentHistoryResponse(
        Long id, Long employeeId, Long organizationUnitId, Long jobTitleId, LocalDate startDate, LocalDate endDate) {
}
