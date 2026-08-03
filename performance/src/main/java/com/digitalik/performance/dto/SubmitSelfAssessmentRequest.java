package com.digitalik.performance.dto;

import java.util.List;

public record SubmitSelfAssessmentRequest(Long employeeId, List<SelfAssessmentScoreRequest> scores) {
}
