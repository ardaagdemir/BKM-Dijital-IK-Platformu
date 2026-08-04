package com.digitalik.amenities.dto;

import java.time.LocalDate;

public record CreateClubEventRequest(Long clubId, Long employeeId, String name, LocalDate date) {
}
