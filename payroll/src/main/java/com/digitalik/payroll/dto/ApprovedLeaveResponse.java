package com.digitalik.payroll.dto;

import java.time.LocalDate;

public record ApprovedLeaveResponse(
        Long id, Long leaveTypeId, LocalDate startDate, LocalDate endDate, long requestedDays) {
}
