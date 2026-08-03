package com.digitalik.performance.dto;

import java.util.List;

/** US-06.2.1 kabul kriteri: "Form, tanımlı hedef/yetkinlik setini gösterir." */
public record SelfAssessmentFormResponse(
        List<GoalResponse> goals, List<CompetencyResponse> competencies, RatingScaleResponse scale) {
}
