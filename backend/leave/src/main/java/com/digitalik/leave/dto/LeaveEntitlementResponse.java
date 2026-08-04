package com.digitalik.leave.dto;

import java.time.LocalDate;

public record LeaveEntitlementResponse(
        LocalDate hireDate, LocalDate asOfDate, long yearsOfService, int entitlementDays) {
}
