package com.digitalik.performance.dto;

import java.util.List;

public record SelfAssessmentResponse(Long id, Long employeeId, List<SelfAssessmentScoreResponse> scores) {
}
