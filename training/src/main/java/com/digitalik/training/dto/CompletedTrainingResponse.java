package com.digitalik.training.dto;

import java.time.LocalDate;

/** US-08A.1.3: Kabul kriteri — "çalışan+eğitim+tarih gösterir". */
public record CompletedTrainingResponse(Long employeeId, Long trainingId, String trainingName, LocalDate completedDate) {
}
