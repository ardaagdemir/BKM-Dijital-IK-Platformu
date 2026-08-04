package com.digitalik.travel.dto;

import java.time.LocalDate;

public record TravelRequestResponse(
        Long id, Long employeeId, String location, LocalDate startDate, LocalDate endDate, String purpose) {
}
