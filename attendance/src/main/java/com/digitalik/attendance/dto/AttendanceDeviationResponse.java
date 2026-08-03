package com.digitalik.attendance.dto;

import java.time.LocalTime;
import java.time.OffsetDateTime;

/** US-07.2.2: {@code earlyDepartureMinutes}, çıkış kaydı henüz yoksa {@code null}. */
public record AttendanceDeviationResponse(
        Long attendanceRecordId,
        Long employeeId,
        OffsetDateTime checkInAt,
        OffsetDateTime checkOutAt,
        LocalTime plannedStartTime,
        LocalTime plannedEndTime,
        Long lateMinutes,
        Long earlyDepartureMinutes) {
}
