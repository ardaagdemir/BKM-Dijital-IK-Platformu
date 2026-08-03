package com.digitalik.feedback.dto;

import java.util.List;

public record SurveyResponse(Long id, String question, List<SurveyOptionResponse> options, boolean anonymous) {
}
