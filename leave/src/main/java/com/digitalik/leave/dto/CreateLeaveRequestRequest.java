package com.digitalik.leave.dto;

import java.time.LocalDate;

public record CreateLeaveRequestRequest(Long employeeId, Long leaveTypeId, LocalDate startDate, LocalDate endDate) {
}
