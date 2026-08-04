package com.digitalik.attendance.dto;

import java.util.List;

public record ImportAttendanceRecordsRequest(List<AttendanceRecordRequest> records) {
}
