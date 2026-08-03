package com.digitalik.amenities.dto;

import java.time.LocalDate;

public record ClubEventResponse(Long id, Long clubId, String name, LocalDate date) {
}
