package com.digitalik.attendance.dto;

import java.time.OffsetDateTime;

public record AttendanceRecordRequest(Long employeeId, OffsetDateTime checkInAt, OffsetDateTime checkOutAt) {
}
