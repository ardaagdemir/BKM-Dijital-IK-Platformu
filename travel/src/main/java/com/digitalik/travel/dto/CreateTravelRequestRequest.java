package com.digitalik.travel.dto;

import java.time.LocalDate;

public record CreateTravelRequestRequest(Long employeeId, String location, LocalDate startDate, LocalDate endDate, String purpose) {
}
