package com.digitalik.leave.dto;

import java.time.LocalDate;

public record LeaveRequestResponse(
        Long id,
        Long employeeId,
        Long leaveTypeId,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        long requestedDays,
        String balanceWarning,
        String rejectionReason,
        String employeeEmail) {
}
