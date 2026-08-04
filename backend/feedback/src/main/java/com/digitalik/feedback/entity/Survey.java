package com.digitalik.feedback.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08E.1.1: Basit bir anket — yalnızca bir soru metni tutar; seçenekleri
 * {@link SurveyOption} (ayrı tablo, {@code surveyId} ile bağlı) taşır.
 * Kabul kriteri yalnızca "Soru+seçenek listesiyle anket oluşturulur" diyor
 * — FR-700'ün "hedef kitle (departman/lokasyon)/anlık-planlı yayınlama"
 * zenginliği BİLİNÇLİ OLARAK taşınmadı; ayrı bir "yayınlandı" durumu da
 * YOK — oluşturma, roadmap'in "oluşturup yayınlamak" ifadesini tek adımda
 * karşılıyor (kabul kriteri bir taslak/yayın ayrımı istemiyor).
 *
 * <p>US-08E.1.2: {@code anonymous} (V49) — FR-704'ün "opsiyonel, aktif
 * edilebilir" anonimlik bayrağı; İK, anketi oluştururken işaretler.
 * {@code true} ise {@code SurveyAnswerService}, bu ankete verilen
 * yanıtlarda kullanıcı bilgisini HİÇ KAYDETMEZ.
 */
@Entity
@Table(name = "surveys")
public class Survey extends BaseEntity {

    @Column(nullable = false)
    private String question;

    @Column(nullable = false)
    private boolean anonymous;

    protected Survey() {
        // JPA için
    }

    public Survey(String question, boolean anonymous) {
        this.question = question;
        this.anonymous = anonymous;
    }

    public String getQuestion() {
        return question;
    }

    public boolean isAnonymous() {
        return anonymous;
    }
}
