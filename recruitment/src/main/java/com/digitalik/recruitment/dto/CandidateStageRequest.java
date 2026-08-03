package com.digitalik.recruitment.dto;

/** {@code stage}: {@code "APPLICATION"}, {@code "INTERVIEW"}, {@code "OFFER"}, {@code "HIRED"} veya {@code "REJECTED"}. */
public record CandidateStageRequest(String stage) {
}
