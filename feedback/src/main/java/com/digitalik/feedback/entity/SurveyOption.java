package com.digitalik.feedback.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08E.1.1: Bir {@link Survey}'in seçeneklerinden biri. {@code surveyId},
 * {@code training.TrainingEnrollment.trainingId}'deki AYNI gerekçeyle AYNI
 * modül içindeki bir varlığa bağlandığından normal bir DB FK ile tutulur
 * (bkz. V48 migration) — {@code employeeId} gibi modüller-arası alanlardan
 * FARKLI olarak.
 */
@Entity
@Table(name = "survey_options")
public class SurveyOption extends BaseEntity {

    @Column(nullable = false)
    private Long surveyId;

    @Column(nullable = false)
    private String text;

    protected SurveyOption() {
        // JPA için
    }

    public SurveyOption(Long surveyId, String text) {
        this.surveyId = surveyId;
        this.text = text;
    }

    public Long getSurveyId() {
        return surveyId;
    }

    public String getText() {
        return text;
    }
}
