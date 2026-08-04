package com.digitalik.training.exception;

import com.digitalik.training.controller.TrainingController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-08A.1.1: {@link TrainingNotFoundException} → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code TrainingController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.training.controller}) tüm controller'lara
 * uygulanır (bkz. {@code organization.OrganizationExceptionHandler}'daki
 * aynı gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = TrainingController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class TrainingExceptionHandler {

    @ExceptionHandler(TrainingNotFoundException.class)
    ProblemDetail handleTrainingNotFound(TrainingNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Eğitim bulunamadı");
        return problem;
    }

    /** US-08A.1.2: Olmayan bir eğitim talebi için işlem yapıldığında. */
    @ExceptionHandler(TrainingEnrollmentNotFoundException.class)
    ProblemDetail handleTrainingEnrollmentNotFound(TrainingEnrollmentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Eğitim talebi bulunamadı");
        return problem;
    }

    /**
     * US-08A.1.2: {@code leave.LeaveExceptionHandler}'daki (US-04.2.2) aynı
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
}
