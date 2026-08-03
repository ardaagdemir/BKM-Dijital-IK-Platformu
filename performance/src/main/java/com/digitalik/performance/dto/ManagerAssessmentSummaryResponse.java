package com.digitalik.performance.dto;

/**
 * US-06.3.1: Geçmiş değerlendirme sonuçları listesi için özet satır —
 * {@code finalScore}, ağırlıklandırma (US-06.2.3) henüz tanımlanmamışsa
 * {@code null} olabilir (bkz. {@code ManagerAssessmentController}).
 */
public record ManagerAssessmentSummaryResponse(Long id, Long employeeId, String period, Double finalScore) {
}
