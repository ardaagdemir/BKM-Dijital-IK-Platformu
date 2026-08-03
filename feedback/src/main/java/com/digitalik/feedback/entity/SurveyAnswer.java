package com.digitalik.feedback.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08E.1.2: Bir çalışanın bir {@link Survey}'e verdiği yanıt. {@code
 * employeeId} NULLABLE — anket {@link Survey#isAnonymous()} ise {@code
 * SurveyAnswerService.submit}, bu alanı BİLİNÇLİ OLARAK {@code null}
 * bırakır (kabul kriteri: "anonim seçeneği varsa kullanıcı bilgisi
 * tutulmaz").
 *
 * <p>{@code surveyId}/{@code surveyOptionId}, {@code
 * SurveyOption.surveyId}'deki AYNI gerekçeyle AYNI modül içi varlıklara
 * bağlandığından normal DB FK ile tutulur.
 */
@Entity
@Table(name = "survey_answers")
public class SurveyAnswer extends BaseEntity {

    @Column(nullable = false)
    private Long surveyId;

    @Column(nullable = false)
    private Long surveyOptionId;

    private Long employeeId;

    protected SurveyAnswer() {
        // JPA için
    }

    public SurveyAnswer(Long surveyId, Long surveyOptionId, Long employeeId) {
        this.surveyId = surveyId;
        this.surveyOptionId = surveyOptionId;
        this.employeeId = employeeId;
    }

    public Long getSurveyId() {
        return surveyId;
    }

    public Long getSurveyOptionId() {
        return surveyOptionId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }
}
