package com.digitalik.attendance.dto;

import java.util.List;

public record TimesheetResponse(Long employeeId, Integer year, Integer month, List<TimesheetDayResponse> days) {
}
