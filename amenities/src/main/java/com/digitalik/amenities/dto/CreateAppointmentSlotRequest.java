package com.digitalik.amenities.dto;

import java.time.OffsetDateTime;

public record CreateAppointmentSlotRequest(Long serviceOfferingId, OffsetDateTime startTime, OffsetDateTime endTime) {
}
