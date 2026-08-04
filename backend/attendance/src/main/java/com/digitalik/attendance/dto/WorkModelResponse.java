package com.digitalik.attendance.dto;

import java.time.LocalTime;

public record WorkModelResponse(Long id, String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
}
