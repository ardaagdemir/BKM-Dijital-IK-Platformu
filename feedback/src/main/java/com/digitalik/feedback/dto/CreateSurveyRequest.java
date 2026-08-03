package com.digitalik.feedback.dto;

import java.util.List;

public record CreateSurveyRequest(String question, List<String> options, boolean anonymous) {
}
