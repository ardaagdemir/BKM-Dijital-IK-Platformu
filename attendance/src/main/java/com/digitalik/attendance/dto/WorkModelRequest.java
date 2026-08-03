package com.digitalik.attendance.dto;

import java.time.LocalTime;

public record WorkModelRequest(String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
}
