package com.digitalik.performance.dto;

/** US-06.2.3: "Sonuç izlenebilir" — yalnızca {@code finalScore} değil, kategori bazlı ara sonuçlar da döner. */
public record FinalScoreResponse(
        Long managerAssessmentId,
        Double goalScore,
        Double competencyScore,
        Integer goalWeight,
        Integer competencyWeight,
        Double finalScore) {
}
