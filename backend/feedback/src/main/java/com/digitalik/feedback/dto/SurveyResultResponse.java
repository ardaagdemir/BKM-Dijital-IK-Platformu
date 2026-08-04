package com.digitalik.feedback.dto;

import java.util.List;

public record SurveyResultResponse(
        Long surveyId, String question, long totalResponses, List<SurveyOptionResultResponse> options) {
}
