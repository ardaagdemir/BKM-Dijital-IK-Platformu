package com.digitalik.recruitment.dto;

public record CandidateResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String appliedPosition,
        String cvFileName,
        String stage) {
}
