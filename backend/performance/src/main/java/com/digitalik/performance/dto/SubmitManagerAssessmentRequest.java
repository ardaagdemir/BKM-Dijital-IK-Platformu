package com.digitalik.performance.dto;

import java.util.List;

public record SubmitManagerAssessmentRequest(Long employeeId, String period, List<SelfAssessmentScoreRequest> scores) {
}
