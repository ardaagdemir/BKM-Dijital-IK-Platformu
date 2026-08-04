package com.digitalik.attendance.dto;

import java.time.OffsetDateTime;

public record AttendanceRecordResponse(
        Long id, Long employeeId, OffsetDateTime checkInAt, OffsetDateTime checkOutAt) {
}
