package com.digitalik.performance.dto;

import java.util.List;

public record ManagerAssessmentResponse(
        Long id, Long employeeId, String period, List<SelfAssessmentScoreResponse> scores) {
}
