package com.digitalik.feedback.exception;

import com.digitalik.feedback.controller.SurveyController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * {@code feedback} modülünün tüm {@code NotFoundException}/{@code @RestControllerAdvice}'ı —
 * eskiden ayrı {@code survey.SurveyExceptionHandler} (US-08E.1.2) ve {@code
 * suggestion.SuggestionExceptionHandler} (US-08F.1.1/1.2) idi; modül birleşince tek sınıfa
 * indirgendi (aynı pakette tek bir advice yeterli — {@code organization.OrganizationExceptionHandler}'daki
 * "birden çok controller, tek handler" deseninin AYNISI).
 *
 * <p>{@code basePackageClasses}, {@code SurveyController} ile AYNI PAKETTEKİ ({@code
 * com.digitalik.feedback.controller}) TÜM controller'lara (hem anket hem talep/fikir) uygulanır.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan çıkarılan ders — her
 * modül bunu tekrarlamalı, aksi halde platform geneli {@code GlobalExceptionHandler}'ın genel
 * {@code Exception.class} yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = SurveyController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class FeedbackExceptionHandler {

    @ExceptionHandler(SurveyNotFoundException.class)
    ProblemDetail handleSurveyNotFound(SurveyNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Anket bulunamadı");
        return problem;
    }

    @ExceptionHandler(SurveyOptionNotFoundException.class)
    ProblemDetail handleSurveyOptionNotFound(SurveyOptionNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Seçenek bulunamadı");
        return problem;
    }

    @ExceptionHandler(SuggestionCategoryNotFoundException.class)
    ProblemDetail handleSuggestionCategoryNotFound(SuggestionCategoryNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Kategori bulunamadı");
        return problem;
    }

    @ExceptionHandler(SuggestionNotFoundException.class)
    ProblemDetail handleSuggestionNotFound(SuggestionNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Talep bulunamadı");
        return problem;
    }
}
