package com.digitalik.feedback.dto;

public record SurveyOptionResultResponse(Long optionId, String text, long voteCount, double percentage) {
}
