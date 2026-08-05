package com.digitalik.discipline.dto;

import com.digitalik.discipline.entity.DisciplinaryCaseStatus;
import java.time.Instant;

/**
 * Bölüm 14.7/8C: {@code DisciplinaryCaseResponse}'un AKSİNE, buradaki {@code
 * id} sürecin KÖK id'si DEĞİL, BU REVİZYONUN kendi id'sidir — istemcinin
 * (frontend {@code AccordionList}) her revizyonu AYIRT edebilmesi için.
 */
public record DisciplinaryCaseRevisionResponse(
        Long id, String reason, String defense, DisciplinaryCaseStatus status, Instant createdAt) {
}
