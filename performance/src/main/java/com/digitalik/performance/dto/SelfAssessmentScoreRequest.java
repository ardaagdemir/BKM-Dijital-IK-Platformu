package com.digitalik.performance.dto;

/** {@code itemType}: {@code "GOAL"} veya {@code "COMPETENCY"}. */
public record SelfAssessmentScoreRequest(String itemType, Long itemId, Integer score) {
}
