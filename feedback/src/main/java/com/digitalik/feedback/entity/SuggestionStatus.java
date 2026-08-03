package com.digitalik.feedback.entity;

/**
 * US-08F.1.2: Roadmap kabul kriterinin AÇIKÇA listelediği üç durum
 * (Değerlendirmede/Onaylandı/Tamamlandı) — FR-802'nin dört aşamalı akışı
 * ("Değerlendirmede → Onaylandı/Reddedildi → Uygulamaya Alındı →
 * Tamamlandı") BİLİNÇLİ OLARAK taşınmadı; roadmap yalnızca bu üçünü istiyor.
 */
public enum SuggestionStatus {
    PENDING,
    APPROVED,
    COMPLETED
}
