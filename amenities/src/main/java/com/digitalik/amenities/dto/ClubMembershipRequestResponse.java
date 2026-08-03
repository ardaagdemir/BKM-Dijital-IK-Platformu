package com.digitalik.amenities.dto;

import com.digitalik.amenities.entity.ClubMembershipRequestStatus;

public record ClubMembershipRequestResponse(
        Long id, Long clubId, Long employeeId, ClubMembershipRequestStatus status, String rejectionReason) {
}
