package com.digitalik.performance.exception;

import com.digitalik.performance.controller.GoalController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-06.1.1: {@link GoalNotFoundException}/{@link CompetencyNotFoundException}
 * → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code GoalController} ile AYNI PAKETTEKİ
 * ({@code com.digitalik.performance.controller}) tüm controller'lara
 * uygulanır (bkz. {@code organization.OrganizationExceptionHandler}'daki
 * aynı gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = GoalController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class PerformanceExceptionHandler {

    @ExceptionHandler(GoalNotFoundException.class)
    ProblemDetail handleGoalNotFound(GoalNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Hedef bulunamadı");
        return problem;
    }

    @ExceptionHandler(CompetencyNotFoundException.class)
    ProblemDetail handleCompetencyNotFound(CompetencyNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Yetkinlik bulunamadı");
        return problem;
    }

    /** US-06.1.2: Skala henüz tanımlanmadan {@code GET} çağrıldığında. */
    @ExceptionHandler(RatingScaleNotFoundException.class)
    ProblemDetail handleRatingScaleNotFound(RatingScaleNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Puanlama skalası bulunamadı");
        return problem;
    }

    /**
     * US-06.2.2: {@code leave.LeaveExceptionHandler}'daki (US-04.2.2) aynı
     * ders — {@code @PreAuthorize} reddi bu modülün kendi advice'ı
     * tarafından yakalanmazsa 500'e düşer.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }

    /** US-06.2.3: Ağırlıklandırma henüz tanımlanmadan nihai not hesaplanmaya çalışıldığında. */
    @ExceptionHandler(AssessmentWeightConfigNotFoundException.class)
    ProblemDetail handleAssessmentWeightConfigNotFound(AssessmentWeightConfigNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Ağırlıklandırma bulunamadı");
        return problem;
    }

    /** US-06.2.3: Olmayan bir yönetici değerlendirmesi için nihai not istendiğinde. */
    @ExceptionHandler(ManagerAssessmentNotFoundException.class)
    ProblemDetail handleManagerAssessmentNotFound(ManagerAssessmentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Yönetici değerlendirmesi bulunamadı");
        return problem;
    }
}
