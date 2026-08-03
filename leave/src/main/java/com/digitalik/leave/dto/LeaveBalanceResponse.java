package com.digitalik.leave.dto;

import java.time.LocalDate;

public record LeaveBalanceResponse(
        Long employeeId,
        LocalDate hireDate,
        LocalDate asOfDate,
        long yearsOfService,
        int entitlementDays,
        int usedDays,
        int pendingDays,
        int remainingDays) {
}
