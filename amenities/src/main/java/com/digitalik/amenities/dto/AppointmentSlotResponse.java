package com.digitalik.amenities.dto;

import java.time.OffsetDateTime;

public record AppointmentSlotResponse(Long id, Long serviceOfferingId, OffsetDateTime startTime, OffsetDateTime endTime) {
}
